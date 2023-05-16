import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import npminstall from 'npminstall';
import log from './log';
import npm from './npm';
import formatPath from './formatPath';

const useOriginNpm = false;

/**
 * Package 类，用于管理动态下载的库文件
 */
class Package {
  targetPath: string;

  storePath: string;

  packageName: string;

  packageVersion: string;

  npmFilePathPrefix: string;

  constructor(options: {
    targetPath: string;
    storePath: string;
    name: string;
    version: string;
  }) {
    log.verbose('options', JSON.stringify(options));
    this.targetPath = options.targetPath;
    this.storePath = options.storePath;
    this.packageName = options.name;
    this.packageVersion = options.version;
    this.npmFilePathPrefix = this.packageName.replace('/', '_');
  }

  get npmFilePath() {
    return path.resolve(this.storePath, `_${this.npmFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
  }

  async prepare() {
    if (!fs.existsSync(this.targetPath)) {
      fse.mkdirpSync(this.targetPath);
    }
    if (!fs.existsSync(this.storePath)) {
      fse.mkdirpSync(this.storePath);
    }
    log.verbose('ccub', this.targetPath);
    log.verbose('ccub', this.storePath);
    const latestVersion = await npm.getLatestVersion(this.packageName);
    log.verbose('latestVersion', this.packageName, latestVersion);
    if (latestVersion) {
      this.packageVersion = latestVersion;
    }
  }

  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: npm.getNpmRegistry(useOriginNpm),
      pkgs: [{
        name: this.packageName,
        version: this.packageVersion,
      }],
    });
  }

  async exists() {
    await this.prepare();
    return fs.existsSync(this.npmFilePath);
  }

  getPackage(isOriginal = false) {
    if (!isOriginal) {
      return fse.readJsonSync(path.resolve(this.npmFilePath, 'package.json'));
    }
    return fse.readJsonSync(path.resolve(this.storePath, 'package.json'));
  }

  getRootFilePath(isOriginal = false) {
    const pkg = this.getPackage(isOriginal);
    if (pkg) {
      if (!isOriginal) {
        return formatPath(path.resolve(this.npmFilePath, pkg.main));
      }
      return formatPath(path.resolve(this.storePath, pkg.main));
    }
    return null;
  }

  async getVersion() {
    await this.prepare();
    return await this.exists() ? this.getPackage().version : null;
  }

  async getLatestVersion() {
    const version = await this.getVersion();
    if (version) {
      const latestVersion = await npm.getNpmLatestSemverVersion(this.packageName, version);
      return latestVersion;
    }
    return null;
  }

  async update() {
    const latestVersion = await this.getLatestVersion();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: npm.getNpmRegistry(useOriginNpm),
      pkgs: [{
        name: this.packageName,
        version: latestVersion,
      }],
    });
  }
}

export default Package;
