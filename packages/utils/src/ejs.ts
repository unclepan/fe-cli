import path from 'path';
import { glob } from 'glob';
import ejs from 'ejs';
import fse from 'fs-extra';
import get from 'lodash/get';

import log from './log';

function renderFile(filepath: string, options = {}, diableFormatDotFile = false) {
  let filename = path.basename(filepath);

  if (filename.indexOf('.png') !== -1 || filename.indexOf('.jpg') !== -1) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    ejs.renderFile(filepath, options, (err, result) => {
      if (err) {
        return reject(err);
      }

      if (/^_package.json/.test(filename)) {
        filename = filename.replace('_package.json', 'package.json');
        fse.removeSync(filepath);
      }

      if (/\.ejs$/.test(filepath)) {
        filename = filename.replace(/\.ejs$/, '');
        fse.removeSync(filepath);
      }

      if (!diableFormatDotFile && /^_/.test(filename)) {
        filename = filename.replace(/^_/, '.');
        fse.removeSync(filepath);
      }

      const newFilepath = path.join(filepath, '../', filename);
      fse.writeFileSync(newFilepath, result);
      resolve(newFilepath);
    });
  });
}

const ejsRender = async (dir: string, options = {}, extraOptions = {}, diableFormatDotFile = false) => {
  const ignore = get(extraOptions, 'ignore') || [];
  log.verbose('ignore', JSON.stringify(ignore));

  const fileList = await glob('**', {
    // 执行匹配的当前工作目录
    cwd: dir,
    // 只需要文件，不需要目录
    nodir: true,
    ignore: ignore || '**/node_modules/**',
  });

  log.verbose('render files:', JSON.stringify(fileList));

  fileList.forEach((file: string) => {
    const filepath = path.join(dir, file);
    return renderFile(filepath, options, diableFormatDotFile);
  });
};

export default ejsRender;
