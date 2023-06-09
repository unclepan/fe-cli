import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import utils from '@ccub/cli-utils';
// const { log, inquirer, spinner, Package, sleep, exec, formatName, formatClassName, ejs } = require('@imooc-cli/utils');
import getProjectTemplate from './getProjectTemplate';

const { log, inquirer, formatName, formatClassName, Package, spinner, sleep, ejs, exec } = utils;

const COMPONENT_FILE = '.componentrc';

// 项目
const TYPE_PROJECT = 'project';
// 组件
const TYPE_COMPONENT = 'component';
// 标准项目模板
const TEMPLATE_TYPE_NORMAL = 'normal';
// 自定义安装项目模板
const TEMPLATE_TYPE_CUSTOM = 'custom';
const DEFAULT_TYPE = TYPE_PROJECT;

interface Options {
    force: boolean;
    targetPath: string; 
    debug: boolean;
    cliHome: string;
}

interface TemplateList {
    name: string;
    npmName: string;
    version: string;
    type: 'normal' | 'custom';
    installCommand: string;
    startCommand: string;
    ignore: string[];
    tag: [('component' | 'project')];
    buildPath: string;
}

function execCustomTemplate(rootFile: string, options = {}) {
    const code = `require('${rootFile}')(${JSON.stringify(options)})`;
    return new Promise((resolve, reject) => {
        const p = exec('node', ['-e', code], { 'stdio': 'inherit' });
        p.on('error', (e: string) => {
            reject(e);
        });
        p.on('exit', (c: number) => {
            resolve(c);
        });
    });
}

// 自定义安装项目模板
async function installCustomTemplate(
    template: TemplateList & { path: string; sourcePath: string; }, 
    ejsData: { name: string; className: string; version: string; description: string; }, 
    options: Options
) 
{
    const pkgPath = path.resolve(template.sourcePath, 'package.json');
    const pkg = fse.readJsonSync(pkgPath);
    const rootFile = path.resolve(template.sourcePath, pkg.main);
    if (!fs.existsSync(rootFile)) {
        throw new Error('入口文件不存在！');
    }
    log.notice('ccub', '开始执行自定义模板');
    const {targetPath} = options;
    try {
        await execCustomTemplate(rootFile, {
            targetPath,
            data: ejsData,
            template,
        });
        log.success('ccub', '自定义模板执行成功');
    } catch (error) {
        log.error('ccub', '自定义模板执行失败');
    }
}

async function npminstall(targetPath: string) {
  return new Promise((resolve, reject) => {
    const p = exec('npm', ['install', '--registry=https://registry.npm.taobao.org'], { stdio: 'inherit', cwd: targetPath });
    p.on('error', (e: string) => {
      reject(e);
    });
    p.on('exit', (c: number) => {
      resolve(c);
    });
  });
}

async function execStartCommand(targetPath: string, startCommand: string[]) {
  return new Promise((resolve, reject) => {
    const p = exec(startCommand[0], startCommand.slice(1), { stdio: 'inherit', cwd: targetPath });
    p.on('error', (e: string) => {
      reject(e);
    });
    p.on('exit', (c: number) => {
      resolve(c);
    });
  });
}

// 如果是组件项目，则创建组件相关文件
async function createComponentFile(
    template: TemplateList & { path: string; sourcePath: string;examplePath?: string; }, 
    data: { name: string; className: string; version: string; description: string; }, 
    dir: string
) {
  if (template.tag.includes(TYPE_COMPONENT)) {
    const componentData = {
      ...data,
      buildPath: template.buildPath,
      examplePath: template.examplePath,
      npmName: template.npmName,
      npmVersion: template.version,
    }
    const componentFile = path.resolve(dir, COMPONENT_FILE);
    fs.writeFileSync(componentFile, JSON.stringify(componentData));
  }
}


async function installTemplate(
    template: TemplateList & { path: string; sourcePath: string; }, 
    ejsData: { name: string; className: string; version: string; description: string; }, 
    options: Options
) {
    // 安装模板
    const spinnerStart = spinner(`正在安装模板...`);
    await sleep(1000);
    const sourceDir = template.path;
    const targetDir = options.targetPath;
    // 确保目录的存在。如果目录结构不存在
    fse.ensureDirSync(sourceDir);
    fse.ensureDirSync(targetDir);
    fse.copySync(sourceDir, targetDir);
    spinnerStart.stop(true);
    log.success('模板安装成功');
    // ejs 模板渲染
    const ejsIgnoreFiles = [
        '**/node_modules/**',
        '**/.git/**',
        '**/.vscode/**',
        '**/.DS_Store',
    ];
    if (template.ignore) {
        ejsIgnoreFiles.push(...template.ignore);
    }
    log.verbose('ejsData', JSON.stringify(ejsData));
    await ejs(targetDir, ejsData, {
        ignore: ejsIgnoreFiles,
    });
    // 如果是组件，则进行特殊处理
    await createComponentFile(template, ejsData, targetDir);
    // 安装依赖文件
    log.notice('ccub', '开始安装依赖');
    await npminstall(targetDir);
    log.success('依赖安装成功');
    // 启动代码
    if (template.startCommand) {
        log.notice('ccub', '开始执行启动命令');
        const startCommand = template.startCommand.split(' ');
        await execStartCommand(targetDir, startCommand);
    }
}

function createTemplateChoice(list: TemplateList[]) {
    return list.map(item => ({
        value: item.npmName,
        name: item.name,
    }));
}

async function downloadTemplate(templateList: TemplateList[], options: Options) {
    // 用户交互选择
    const templateName = await inquirer({
        choices: createTemplateChoice(templateList),
        message: '请选择项目模板',
    });
    log.verbose('template', templateName);

    const selectedTemplate = templateList.find(item => item.npmName === templateName);
    if (!selectedTemplate) {
        return;
    }
    log.verbose('selected template', JSON.stringify(selectedTemplate));

    const { cliHome } = options;
    const targetPath = path.resolve(cliHome, 'template');
    const storePath = path.resolve(targetPath, 'node_modules');
    // // 基于模板生成 Package 对象
    const templatePkg = new Package({
        targetPath,
        storePath,
        name: selectedTemplate.npmName,
        version: selectedTemplate.version,
    });
    // 如果模板不存在则进行下载
    if (!await templatePkg.exists()) {
        const spinnerStart = spinner(`正在下载模板...`);
        await sleep(1000);
        await templatePkg.install();
        spinnerStart.stop(true);
        log.success('下载模板成功');
    } else {
        log.notice('模板已存在', `${selectedTemplate.npmName}@${selectedTemplate.version}`);
        log.notice('模板路径', `${targetPath}`);
        const spinnerStart = spinner(`开始更新模板...`);
        await sleep(1000);
        await templatePkg.update();
        spinnerStart.stop(true);
        log.success('更新模板成功');
    }
    // 生成模板路径
    const templateSourcePath = templatePkg.npmFilePath;
    const templatePath = path.resolve(templateSourcePath, 'template');
    log.verbose('template path', templatePath);
    if (!fs.existsSync(templatePath)) {
        throw new Error(`[${templateName}]项目模板不存在！`);
    }
    const template = {
        ...selectedTemplate,
        path: templatePath,
        sourcePath: templateSourcePath,
    };
    return template;
}

function getInitType() {
    return inquirer({
        type: 'list',
        choices: [
            {
                name: '项目',
                value: TYPE_PROJECT,
            }, 
            {
                name: '组件',
                value: TYPE_COMPONENT,
            }
        ],
        message: '请选择初始化类型',
        defaultValue: DEFAULT_TYPE,
    });
}

function getProjectName(initType: string) {
    return inquirer({
        type: 'string',
        message: initType === TYPE_PROJECT ? '请输入项目名称' : '请输入组件名称',
        defaultValue: '',
    });
}

function getProjectVersion(defaultVersion: string, initType: string) {
    return inquirer({
      type: 'string',
      message: initType === TYPE_PROJECT ? '请输入项目版本号' : '请输入组件版本号',
      defaultValue: defaultVersion,
    });
}

function getComponentDescription() {
  return inquirer({
    type: 'string',
    message: '请输入组件的描述信息',
    defaultValue: '',
  });
}

async function prepare(options: Options) {
    let fileList = fs.readdirSync(process.cwd());
    fileList = fileList.filter(file => ['node_modules', '.git', '.DS_Store'].indexOf(file) < 0);
    log.verbose('fileList', JSON.stringify(fileList));
    let continueWhenDirNotEmpty = true;
    if (fileList && fileList.length > 0) {
        continueWhenDirNotEmpty = await inquirer({
            type: 'confirm',
            message: '当前文件夹不为空，是否继续创建项目？',
            defaultValue: false,
        });
    }
    if (!continueWhenDirNotEmpty) {
        return;
    }
    if (options.force) {
        const targetDir = options.targetPath;
        const confirmEmptyDir = await inquirer({
            type: 'confirm',
            message: '是否确认清空当下目录下的文件',
            defaultValue: false,
        });
        if (confirmEmptyDir) {
            fse.emptyDirSync(targetDir);
        }
    }

    const initType = await getInitType();
    log.verbose('initType', initType);

    let templateList = await getProjectTemplate() as unknown as TemplateList[];
    if (!templateList || templateList.length === 0) {
        throw new Error('项目模板列表获取失败');
    }
    let projectName = '';
    let className = '';
    while (!projectName) {
        projectName = await getProjectName(initType);
        if (projectName) {
            projectName = formatName(projectName);
            className = formatClassName(projectName);
        }
        log.verbose('name', projectName);
        log.verbose('className', className);
    }
    let version = '1.0.0';
    do {
        version = await getProjectVersion(version, initType);
        log.verbose('version', version);
    } while (!version);

    if (initType === TYPE_PROJECT) {
        templateList = templateList.filter(item => item.tag.includes('project'));
        return {
            templateList,
            project: {
                name: projectName,
                className,
                version,
            },
        }
    } 

    templateList = templateList.filter(item => item.tag.includes('component'));
    let description = '';
    while (!description) {
        description = await getComponentDescription();
        log.verbose('description', description);
    }
    return {
        templateList,
        project: {
            name: projectName,
            className,
            version,
            description,
        },
    };
  
}

async function init(options: Options) {
    const _options = options;
    try {
        // 设置targetPath
        const targetPath = process.cwd();
        if (!_options.targetPath) {
            _options.targetPath = targetPath;
        }
        log.verbose('init', JSON.stringify(_options));
        // 完成项目初始化的准备和校验工作
        const result: any = await prepare(_options);
        if (!result) {
            log.info('info','创建项目终止');
            return;
        }
        // 获取项目模板列表
        const { templateList, project } = result;
        // 缓存项目模板文件
        const template = await downloadTemplate(templateList, _options);
        log.verbose('template', JSON.stringify(template));
        if(!template) return;
        if (template.type === TEMPLATE_TYPE_NORMAL) {
            // 安装标准项目模板
            await installTemplate(template, project, _options);
        } else if (template.type === TEMPLATE_TYPE_CUSTOM) {
            // 自定义安装项目模板
            await installCustomTemplate(template, project, _options);
        } else {
            throw new Error('未知的模板类型！');
        }
    } catch (e: any) {
        if (_options.debug) {
            log.error('Error:', e.stack);
        } else {
            log.error('Error:', e.message);
        }
    } finally {
        process.exit(0);
    }
}

export default init;
