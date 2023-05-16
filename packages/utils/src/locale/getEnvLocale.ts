function getEnvLocale(env?: NodeJS.ProcessEnv | undefined) {
  const _env = env || process.env;
  return _env.LC_ALL || _env.LC_MESSAGES || _env.LANG || _env.LANGUAGE;
}

export default getEnvLocale();

