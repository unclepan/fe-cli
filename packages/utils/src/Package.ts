import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import npminstall from 'npminstall';
import log from './log';
import npm from './npm';
import formatPath from './formatPath';

const useOriginNpm = true;

/**
 * Package 类，用于管理动态下载的库文件
 */
class Package {
  // package的目标路径
  targetPath: string;

  // 缓存package的路径
  storePath: string;

  // package的name
  packageName: string;

  // package的version
  packageVersion: string;

  // package的缓存目录前缀
  // npmFilePathPrefix: string;

  constructor(options: {
    targetPath: string;
    storePath: string;
    name: string;
    version: string;
  }) {
    log.verbose('Package:', JSON.stringify(options));
    this.targetPath = options.targetPath;
    this.storePath = options.storePath;
    this.packageName = options.name;
    this.packageVersion = options.version;
    // this.npmFilePathPrefix = this.packageName.replace('/', '_');
  }

  get npmFilePath() {
    return path.resolve(this.storePath, `${this.packageName}`);
  }

  getSpecificCacheFilePath(packageVersion: string) {
    return packageVersion === this.getPackage().version;
  }

  async prepare() {
    if (!fs.existsSync(this.targetPath)) {
      fse.mkdirpSync(this.targetPath);
    }
    if (!fs.existsSync(this.storePath)) {
      fse.mkdirpSync(this.storePath);
    }
    const latestVersion = await npm.getLatestVersion(this.packageName);
    if (latestVersion) {
      this.packageVersion = latestVersion;
    }
  }

  // 安装Package
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

  // 判断当前Package是否存在
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

  // 更新Package
  async update() {
    const latestVersion: string = await this.getLatestVersion() || '';
    // 查询最新版本号对应的包是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestVersion);
    
    if(latestFilePath) return Promise.resolve();
    fse.emptyDirSync(this.npmFilePath)
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
