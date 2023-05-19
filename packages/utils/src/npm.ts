import axios from 'axios';
import urlJoin from "url-join";
import semver from "semver";

// 获取 registry 信息
function getNpmRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org' :
    'https://registry.npm.taobao.org';
}

// 从 registry 获取 npm 的信息
async function getNpmInfo(npm: string, registry?: string)  {
  const register = registry || getNpmRegistry(true);
  const url = urlJoin(register, npm);
  const response = await axios.get(url);
  try {
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    return Promise.reject(error);
  }
  return null
}

// 获取某个 npm 的最新版本号
async function getLatestVersion(npm: string, registry?: string) {
  const data = await getNpmInfo(npm, registry);
  if (!data['dist-tags'] || !data['dist-tags'].latest) {
    // eslint-disable-next-line no-console
    console.error('没有 latest 版本号', data);
    return Promise.reject(new Error('Error: 没有 latest 版本号'));
  }
  const latestVersion = data['dist-tags'].latest;
  return latestVersion;
}

// 获取某个 npm 的所有版本号
async function getVersions(npm: string, registry?: string) {
  const body = await getNpmInfo(npm, registry);
  const versions = Object.keys(body.versions);
  return versions;
}

// 根据指定 version 获取符合 semver 规范的最新版本号
function getLatestSemverVersion(baseVersion: string, versions: string[]) {
  const _versions = versions
    .filter((version) => semver.satisfies(version, `>=${baseVersion}`))
    .sort((a, b) => semver.gt(b, a) ? 1 : -1);
  return _versions[0];
}

// 根据指定 version 和包名获取符合 semver 规范的最新版本号
async function getNpmLatestSemverVersion(npm: string, baseVersion: string, registry?: string) {
  const versions = await getVersions(npm, registry);
  return getLatestSemverVersion(baseVersion, versions);
}

export default {
  getNpmRegistry,
  getNpmInfo,
  getLatestVersion,
  getNpmLatestSemverVersion,
};
