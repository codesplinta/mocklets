export const fakeWinstonLoggerPackageFactory = () => {
  const $winston = {
    __esModule: true,
    format: {
      colorize: jest.fn(),
      combine: jest.fn(),
      label: jest.fn(),
      timestamp: jest.fn(),
      printf: jest.fn(),
      json: jest.fn()
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    }
  }

  return () => $winston
}
