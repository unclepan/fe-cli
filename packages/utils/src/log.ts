import log from 'npmlog'

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'

log.heading = 'ccub' // 自定义头部

log.addLevel('success', 2000, { fg: 'green', bold: true }) // 自定义success日志
log.addLevel('notice', 2000, { fg: 'blue', bg: 'black' }) // 自定义notice日志

export default log

// log.silly(prefix, message, ...)
// log.verbose(prefix, message, ...)
// log.info(prefix, message, ...)
// log.http(prefix, message, ...)
// log.warn(prefix, message, ...)
// log.error(prefix, message, ...)
