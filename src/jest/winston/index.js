export const fakeWinstonLoggerPackageFactory = () => {
  const logger = {
    debug: jest.fn(),
    log: jest.fn(),
    add: jest.fn()
  }

  const $winston = {
    format: {
      colorize: jest.fn(),
      combine: jest.fn(),
      label: jest.fn(),
      timestamp: jest.fn(),
      printf: jest.fn(),
      json: jest.fn()
    },
    createLogger: jest.fn().mockReturnValue(logger),
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    }
  }

  return () => $winston
}
