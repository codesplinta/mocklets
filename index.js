import { fakeReactJSTransitionGroupFactory } from './src/jest/react-transition-group'
import { fakePinoLoggerPackageFactory } from './src/jest/pino'
import { fakeWinstonLoggerPackageFactory } from './src/jest/winston'
import { fakeNextJSRouterPackageFactory } from './src/jest/next/router'
import { fakeIntersectionObserverFactory } from './src/jest/IntersectionObserver'
import { fakeStorageInstanceFactory } from './src/jest/browserStorage'

/**
 * Validates  properties on the `window` object that can be overriden.
 *
 * @param {String} property
 * @throws {Error}
 *
 * @returns void
 */
function assertReadonlyGlobalsNotMutable (property) {
  const readOnlyGlobalObjects = [
    'origin',
    'history',
    'clientInformation',
    'caches',
    'closed',
    'crypto',
    'fetch'
  ]

  if (readOnlyGlobalObjects.includes(property)) {
    throw new Error(
      `Cannot override sensitive readonly global (window) object: "${property}"`
    )
  }
}

/**
 * A helper utility for replacing native object and BOM APIs in web browsers
 * with a fake implementation replica so as to make testing a lot easier.
 *
 * @param {String} property
 * @param {*} fakeOrMock
 *
 * @returns void
 */
const provisionFakeWebPageWindowObject = (property, fakeOrMock) => {
  const { [property]: originalProperty } = window

  beforeAll(() => {
    assertReadonlyGlobalsNotMutable(property)
    delete window[property]

    Object.defineProperty(window, property, {
      configurable: true,
      writable: true,
      value: fakeOrMock
    })
  })

  afterAll(() => {
    if (originalProperty) {
      window[property] = originalProperty
    }
  })
}

/**
 * A helper utility for replacing global or exported object and APIs from
 * Nodejs packages  with a fake implementation replica so as to make
 * testing a lot easier.
 *
 * @param {String} property
 * @param {*} fakeOrMock
 *
 * @returns void
 */
const provisionFakeNodeJSObject = (packageOrModuleName, fakeOrMock) => {
  beforeEach(() => {
    if (typeof fakeOrMock === 'function') {
      if (fakeOrMock.length === 0) {
        jest.mock(packageOrModuleName, fakeOrMock)
      }
    } else {
      const packageOrModule = global && typeof require === 'function'
        ? /* jest.requireActual(...) */ require(packageOrModuleName)
        : { default: null }
      packageOrModule.default = jest.fn(
        () => fakeOrMock
      )
    }
  })

  afterEach(() => {
    jest.resetModules()
  })
}

/**
 * A helper utility that enables the use of static mock dates within tests
 *
 * @param {() => number | Date} callback
 * @param {1 | 0} resetAfterEach
 *
 * @return void
 * @api public
 */
export const provisionMockedDateForTests = (callback = () => Date.now(), resetAfterEach = 1) => {
  /* @CHECK: https://stackoverflow.com/a/47781245 */
  let dateSpy
  let dateNowSpy

  beforeAll(() => {
    jest.useFakeTimers()

    // Lock Time
    dateSpy = jest
      .spyOn(typeof window !== 'undefined' ? window : global, 'Date')
      .mockImplementationOnce(() => new Date(callback()))
    dateNowSpy = jest
      .spyOn(typeof window !== 'undefined' ? window.Date : global.Date, 'now')
      .mockImplementation(callback)
  })

  afterEach(() => {
    if (resetAfterEach) {
      dateSpy.mockRestore()
      dateNowSpy.mockRestore()

      // Lock Time
      dateSpy = jest
        .spyOn(typeof window !== 'undefined' ? window : global, 'Date')
        .mockImplementationOnce(() => new Date(callback()))
      dateNowSpy = jest
        .spyOn(typeof window !== 'undefined' ? window.Date : global.Date, 'now')
        .mockImplementation(callback)
    }
  })

  afterAll(() => {
    jest.useRealTimers()

    // Unlock Time
    dateSpy.mockRestore()
    dateNowSpy.mockRestore()
  })
}

/**
 * A helper utility that enables the use of controllable fake dates within tests
 *
 * @param {Date} date
 * @param {1 | 0} resetAfterEach
 *
 * @see https://stackoverflow.com/a/47781245
 *
 * @return Timekeeper
 * @api public
 */
export const provisionFakeDateForTests = (date = new Date(), resetAfterEach = 1) => {
  let timekeeper = null

  beforeAll(() => {
    /* @HINT: Lock Time */
    timekeeper = require('timekeeper')
    timekeeper.freeze(date)
  })

  afterEach(() => {
    if (resetAfterEach) {
      // Unlock and Lock again
      timekeeper.reset()
      timekeeper.freeze(date)
    }
  })

  afterAll(() => {
    // Unlock Time
    timekeeper.reset()
    timekeeper = null
  })

  return timekeeper
}

/**
 * A helper utility that enables the use of fake browser API: `window.localStorage` within tests
 *
 * @param {1 | 0} clearAfterEach
 *
 * @return void
 * @api public
 */
export const provisionFakeBrowserLocalStorageForTests = (clearAfterEach = 1) => {
  provisionFakeWebPageWindowObject(
    'localStorage',
    fakeStorageInstanceFactory()
  )

  afterEach(() => {
    if (clearAfterEach) {
      if (typeof window !== 'undefined') {
        window.localStorage.clear()
      }
    }
  })
}

/**
 * A helper utility that enables the use of fake browser API: `window.sessionStorage` within tests
 *
 * @param {1 | 0} clearAfterEach
 *
 * @return void
 * @api public
 */
export const provisionFakeBrowserSessionStorageForTests = (clearAfterEach = 1) => {
  provisionFakeWebPageWindowObject(
    'sessionStorage',
    fakeStorageInstanceFactory()
  )

  afterEach(() => {
    if (clearAfterEach) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.clear()
      }
    }
  })
}

/**
 * A helper utility that enables the use of fake browser API: `window.Intersection` within tests
 *
 * @param {1 | 0} resetAfterEach
 *
 * @return void
 * @api public
 */
export const provisionFakeBrowserIntersectionObserverForTests = (resetAfterEach = 1) => {
  provisionFakeWebPageWindowObject(
    'IntersectionObserver',
    fakeIntersectionObserverFactory()
  )

  afterEach(() => {
    if (resetAfterEach) {
      if (typeof window !== 'undefined') {
        window.IntersectionObserver.disconnect()
      }
    }
  })
}

/**
 * A helper utility that enables the use of mock NextJS router hook: `useRouter()` within tests
 *
 * @return void
 * @api public
 */
export const provisionMockedNextJSRouterForTests = () => {
  provisionFakeNodeJSObject(
    'next/router',
    fakeNextJSRouterPackageFactory()
  )
}

/**
 * A helper utility that enables the use of mock server-side logger: `pino` within tests
 *
 * @return void
 * @api public
 */
export const provisionMockedPinoLoggerForTests = () => {
  provisionFakeNodeJSObject(
    'pino',
    fakePinoLoggerPackageFactory()
  )
}

/**
 * A helper utility that enables the use of mock server-side logger: `winston` within tests
 *
 * @return void
 * @api public
 */
export const provisionMockedWinstonLoggerForTests = () => {
  provisionFakeNodeJSObject(
    'winston',
    fakeWinstonLoggerPackageFactory()
  )
}

/**
 * A helper utility that enables the use of mock CSS transition for ReactJS: `react-transition-group` within tests
 *
 * @return void
 * @api public
 */
export const provisionMockedReactTransitionGroupForTests = () => {
  provisionFakeNodeJSObject(
    'react-transition-group',
    fakeReactJSTransitionGroupFactory()
  )
}

export const $EXECUTION = {
  RESET_AFTER_EACH_TEST_CASE: 1,
  IGNORE_RESET_AFTER_EACH_TEST_CASE: 0
}
