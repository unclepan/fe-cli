import locale from './getEnvLocale'
import zh from './zh_cn';
import en from './en_us';

// 字段扩展声明
interface LOCALEMAP {
  [key: string]: {
    welcome: string
  },
};

// 枚举
const localeMap: LOCALEMAP = {
  zh_cn: zh,
  en_us: en
};

function loadLocale() {
  if (locale) {
    const localeShortName = locale.split('.')[0].toLocaleLowerCase();
    return localeMap[localeShortName];
  } 
    return localeMap.zh_cn;
}

export default loadLocale();
