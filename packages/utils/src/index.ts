

// import path from 'path';
import log from './log';
// import request from './request';
import npm from './npm';
// import inquirer from './inquirer';
// import spinner from './spinner';
// import ejs from './ejs';
// import terminalLink from './terminalLink';

// import Package from './Package';
// import Git from './Git/Git';
// import file from './file';
import locale from './locale/loadLocale';
// import formatPath from './formatPath';

// function sleep(timeout) {
//   return new Promise((resolve => {
//     setTimeout(resolve, timeout);
//   }));
// }

// function exec(command, args, options) {
//   const win32 = process.platform === 'win32';

//   const cmd = win32 ? 'cmd' : command;
//   const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

//   return require('child_process').spawn(cmd, cmdArgs, options || {});
// }

// function firstUpperCase(str) {
//   return str.replace(/^\S/, s => s.toUpperCase());
// }

// function camelTrans(str, isBig) {
//   let i = isBig ? 0 : 1;
//   str = str.split('-');
//   for (; i < str.length; i += 1) {
//     str[i] = firstUpperCase(str[i]);
//   }
//   return str.join('');
// }

// function formatName(name) {
//   if (name) {
//     name = `${name}`.trim();
//     if (name) {
//       if (/^[.*_\/\\()&^!@#$%+=?<>~`\s]/.test(name)) {
//         name = name.replace(/^[.*_\/\\()&^!@#$%+=?<>~`\s]+/g, '');
//       }
//       if (/^[0-9]+/.test(name)) {
//         name = name.replace(/^[0-9]+/, '');
//       }
//       if (/[.*_\/\\()&^!@#$%+=?<>~`\s]/.test(name)) {
//         name = name.replace(/[.*_\/\\()&^!@#$%+=?<>~`\s]/g, '-');
//       }
//       return camelTrans(name, true);
//     } 
//       return name;
    
//   } 
//     return name;
  
// }

// function formatClassName(name) {
//   return require('kebab-case')(name).replace(/^-/, '');
// }

export default {
  log,
//   request,
  npm,
//   inquirer,
//   spinner,
//   ejs,
//   Package,
//   Git,
//   sleep,
//   exec,
//   formatName,
//   formatClassName,
//   terminalLink,
//   ...file,
  locale,
//   formatPath,
};
