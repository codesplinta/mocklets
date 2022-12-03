const os = require('os')
const pino = function () {
  const logger =  {
    info: jest.fn(function info (message = '') {
      return Object.assign(
        {
          "level":30,
          "time": Date.now(),
          "msg": message,
          "pid": process.pid,
          "hostname": os.hostname()
        },
        this._ ? this._ : {}
      ) 
    })
  }

  logger.child = function (extraMessage) {
    const $logger = { _: extraMessage }
    $logger.info = logger.info.bind($logger)
    return $logger
  }

  return logger
}

try {
  jest.setMock('pino', pino)
} catch (_) {
  /* @HINT: ignore */
}
