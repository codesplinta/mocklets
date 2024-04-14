export function fakePinoLoggerFactory () {
  const $pino = function () {
    const os = global && typeof require === "function" ? require('os') : { hostname: () => "" };
    const logger =  {
      info: jest.fn(function info (message = '') {
        return Object.assign(
          {
            "level":30,
            "time": Date.now(),
            "msg": message,
            "pid": process.pid,
            "timestamp": false,
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

  return  $pino;
}

export function mockPackageImport () {
  jest.mock('pino', fakePinoLoggerFactory());
}

