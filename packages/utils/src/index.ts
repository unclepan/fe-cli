

import childProcess from 'child_process';
// import path from 'path';
import kebabCase from 'kebab-case';
import log from './log';
import request from './request';
import npm from './npm';
import inquirer from './inquirer';
import spinner from './spinner';
import ejs from './ejs';
// import terminalLink from './terminalLink';

import Package from './Package';
// import Git from './Git/Git';
// import file from './file';
import locale from './locale/loadLocale';
// import formatPath from './formatPath';


function sleep(timeout: number) {
  return new Promise((resolve => {
    setTimeout(resolve, timeout);
  }));
}

function exec(command: string, args: string[], options: {}) {
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

  return childProcess.spawn(cmd, cmdArgs, options || {});
}

function firstUpperCase(str: string) {
  return str.replace(/^\S/, s => s.toUpperCase());
}

function camelTrans(str: string, isBig: boolean) {
  let i = isBig ? 0 : 1;
  const _str = str.split('-');
  for (; i < _str.length; i += 1) {
    _str[i] = firstUpperCase(_str[i]);
  }
  return _str.join('');
}

function formatName(name: string) {
  let _name = name
  if (_name) {
    _name = `${_name}`.trim();
    if (_name) {
      if (/^[.*_\/\\()&^!@#$%+=?<>~`\s]/.test(_name)) {
        _name = _name.replace(/^[.*_\/\\()&^!@#$%+=?<>~`\s]+/g, '');
      }
      if (/^[0-9]+/.test(_name)) {
        _name = _name.replace(/^[0-9]+/, '');
      }
      if (/[.*_\/\\()&^!@#$%+=?<>~`\s]/.test(_name)) {
        _name = _name.replace(/[.*_\/\\()&^!@#$%+=?<>~`\s]/g, '-');
      }
      return camelTrans(_name, true);
    } 
      return _name;
  } 
    return _name;
}

function formatClassName(name: string) {
  return kebabCase(name).replace(/^-/, '');
}

export default {
  log,
  request,
  npm,
  inquirer,
  spinner,
  ejs,
  Package,
//   Git,
  sleep,
  exec,
  formatName,
  formatClassName,
//   terminalLink,
//   ...file,
  locale,
//   formatPath,
};
