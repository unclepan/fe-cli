function getEnvLocale(env?: NodeJS.ProcessEnv | undefined) {
  const selfEnv = env || process.env;
  return selfEnv.LC_ALL || selfEnv.LC_MESSAGES || selfEnv.LANG || selfEnv.LANGUAGE;
}

export default getEnvLocale();

