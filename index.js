import { fakeReactJSTransitionGroupPackageFactory } from './src/jest/react-transition-group'
import { fakeReactHookFormPackageFactory } from './src/jest/react-hook-form'
//import { fakeReacti18NextPackageFactory } from './src/jest/react-i18next'
import { fakePinoLoggerPackageFactory } from './src/jest/pino'
import { fakeWinstonLoggerPackageFactory } from './src/jest/winston'
//import { fakeCloudinaryUploaderInstanceFactory } from './src/jest/cloudinary'
import { fakeNextJSRouterPackageFactory } from './src/jest/next/router'
import { fakeAdonisJSCachePackageFactory } from './src/jest/adonisjs-cache'
import { fakeIntersectionObserverFactory } from './src/jest/IntersectionObserver'
import { fakeResizeObserverFactory } from './src/jest/ResizeObserver'
import { fakeStorageInstanceFactory } from './src/jest/browserStorage'

const $fixtures = require('./src/jest/__fixtures__')
const { 
  make_nextApiRequest,
  make_nextApiResponse
} = require('./src/jest/__mocks__/next/api'),
const {
  make_expressNext, 
  make_expressHttpRequest,
  make_expressHttpResponse
} = require('./src/jest/__mocks__/express/http')

const $DELAYED_LOGGING = 2
const $NORMAL_LOGGING = -1
const $COMPACT_LOGGING = 3

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
 * Nodejs / browser packages  with a fake implementation replica so as to make
 * testing a lot easier.
 *
 * @param {String} property
 * @param {*} fakeOrMock
 *
 * @returns void
 */
const provisionFakeJSObject = (packageOrModuleName, fakeOrMock) => {
  if (typeof fakeOrMock === 'function') {
    if (fakeOrMock.length === 0) {
      /* @HINT: Avoid automatic hoisting by Jest & Babel */
      jest.doMock(packageOrModuleName, fakeOrMock)
    }
  } else {
    const packageOrModule = global && typeof require === 'function'
      ? require(packageOrModuleName)
      : { default: null }
    packageOrModule.default = jest.fn(
      () => fakeOrMock
    )
  }

  /* @HINT: manual hoisting ... */
  require(packageOrModuleName)

  afterEach(() => {
    jest.clearAllMocks()

    if (typeof fakeOrMock === 'function') {
      if (fakeOrMock.length === 0) {
        /* @HINT: Avoid automatic hoisting by Jest & Babel */
        jest.doMock(packageOrModuleName, fakeOrMock)
      }
    } else {
      const packageOrModule = global && typeof require === 'function'
        ? require(packageOrModuleName)
        : { default: null }
      packageOrModule.default = jest.fn(
        () => fakeOrMock
      )
    }
  })

  beforeEach(() => {
    /* @HINT: manual hoisting ... */
    require(packageOrModuleName)
  })

  afterAll(() => {
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
    jest.useFakeTimers()/* .setSystemTime(new Date(callback())) */

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
 * A helper utility that enables the use of fake browser API: `window.IntersectionObserver` within tests
 *
 * @return void
 * @api public
 */
export const provisionFakeBrowserIntersectionObserverForTests = () => {
  provisionFakeWebPageWindowObject(
    'IntersectionObserver',
    fakeIntersectionObserverFactory()
  )
}

/**
 * A helper utility that enables the use of fake browser API: `window.ResizeObserver` within tests
 *
 * @return void
 * @api public
 */
export const provisionFakeBrowserResizeObserverForTests = () => {
  provisionFakeWebPageWindowObject(
    'ResizeObserver',
    fakeResizeObserverFactory()
  )
}

/**
 * A helper utility that enables the use of mock AdonisJS v4 cache package : `require('adonis-cache')` within tests
 *
 * @return void
 * @api public
 */
export const provisionMockedAdonisJSv4CacheForTests = () => {
  const Cache = fakeAdonisJSCachePackageFactory()
  provisionFakeJSObject(
    'adonis-cache',
    new Cache()
  )
}

/**
 * A helper utility that enables the use of mock NextJS router package within tests
 *
 * @return void
 * @api public
 */
export const provisionMockedNextJSRouterForTests = () => {
  let ___eventsSubscribed = {}
  const routerFactory = fakeNextJSRouterPackageFactory(
    ___eventsSubscribed
  )

  provisionFakeJSObject(
    'next/router',
    routerFactory
  )

  afterEach(() => {
    ___eventsSubscribed = {}
  })
}

/**
 * A helper utility that enables the use of mock NextJS router package within tests that returns addons
 *
 * @param {1 | 0} clearAfterEach
 *
 * @return {{ $getAllRouterEventsMap: Function, $setSpyOn_useRouter: Function, $setSpyOn_useRouter_WithReturnValueOnce: Function }}
 * @api public
 */
export const provisionMockedNextJSRouterForTests_withAddons = (clearAfterEach = 1) => {
  let ___eventsSubscribed = {}
  const routerFactory = fakeNextJSRouterPackageFactory(
    ___eventsSubscribed
  )

  provisionFakeJSObject(
    'next/router',
    routerFactory
  )

  afterEach(() => {
    ___eventsSubscribed = {}
    if (clearAfterEach) {
      jest.restoreAllMocks()
    }
  })

  return {
    $getAllRouterEventsMap: () => ___eventsSubscribed,
    $setSpyOn_useRouter: (nextRouterExportObject) => {
      return jest.spyOn(
        nextRouterExportObject
        ? nextRouterExportObject
        : require('next/router'), 
        'useRouter'
      )
    },
    $setSpyOn_useRouter_withReturnValueOnce: ({
      query = {},
      pathname = '/',
      locale = 'en-US',
      isPreview = false,
      basePath = '/'
    }) => {
      const useRouter = jest.spyOn(
        require('next/router'),
        'useRouter'
      )
      const usePathname = jest.spyOn(
        require('next/naviagtion'),
        'usePathname'
      )
      const useSearchParams = jest.spyOn(
        require('next/naviagtion'),
        'useSearchParams'
      )

      const $routerFields = (routerFactory().useRouter())

      $routerFields.query = query
      $routerFields.locale = locale
      $routerFields.asPath = pathname
      $routerFields.basePath = basePath
      $routerFields.isPreview = isPreview

      const returnValue = {
        ...$routerFields
      };

      useRouter.mockReturnValueOnce(returnValue)

      usePathname.mockImplementationOnce(() => {
        return $routerFields.asPath
      }).mockImplementation(() => {
        const router = useRouter()
        return router.asPath
      })

      useSearchParams.mockImplementationOnce(() => {
        return new URLSearchParams($routerFields.query)
      }).mockImplementation(() => {
        const router = useRouter()
        return new URLSearchParams(router.query)
      })

      return returnValue
    }
  }
}

/**
 * A helper utility that enables the use of mock react-hook-form package within tests that returns addons
 *
 * @return {{ $setSpyOn_useFormContext: Function, $setSpyOn_useFromContext_WithReturnValueOnce: Function }}
 * @api public
 */
export const provisionMockedReactHookFormForTests_withAddons = () => {
  const hookFormFactory = fakeReactHookFormPackageFactory()

  provisionFakeJSObject(
    'react-hook-form',
    hookFormFactory()
  )

  return {
    $setSpyOn_useFormContext: (reactHookFormExportObject) => {
      return jest.spyOn(
        reactHookFormExportObject
        ? reactHookFormExportObject
        : require('react-hook-form'), 'useFormContext')
    },
    $setSpyOn_useFromContext_withReturnValueOnce: ({
      formState = {},
      values = {}
    }) => {
      const useFormContext = jest.spyOn(
        require('react-hook-form'),
        'useFormContext'
      )
      // const useForm = jest.spyOn(
      //   require('react-hook-form'),
      //   'useForm'
      // )

      const $formContextFields = (hookFormFactory().useFormContext())

      $formContextFields.formState = formState
      $formContextFields._value = values

      const returnValue = {
        ...$formContextFields
      };

      useFormContext.mockReturnValueOnce(returnValue)

      return returnValue
    }
  }
}

/**
 * A helper utility that enables the use of mock server-side logger: `pino` within tests
 *
 * @return void
 * @api public
 */
export const provisionMockedPinoLoggerForTests = () => {

  provisionFakeJSObject(
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

  provisionFakeJSObject(
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
  provisionFakeJSObject(
    'react-transition-group',
    fakeReactJSTransitionGroupPackageFactory()
  )
}

/**
 * A helper utility that enables the use of mock filesystem targeting the 'node:fs' package only for test cases
 * 
 * @param {Function} mockFactoryCallback
 * 
 * @return typeof import('mock-fs')
 * @api public
 */
export const provisionMockedNodeJSFileSystemForTests = (mockFactoryCallback = () => undefined) => {
  const { Console } = global.console
  console = new Console(process.stdout, process.stderr)

  let mock = null
  
  mock = require('mock-fs');

  if (typeof mockFactoryCallback === 'function') {
    mockFactoryCallback(mock, require('path'), require)
  }

  afterEach(() => {
    mock.restore()

    if (typeof mockFactoryCallback === 'function') {
      mockFactoryCallback(mock, require('path'), require)
    }
  })

  afterAll(() => {
    mock.restore()
    mock = null
  })

  return mock;
}

/**
 * A helper utility that enables the use of fixtures loaded from this package and elsewhere
 *
 * @param {1 | 0} resetAfterEach
 * 
 * @return {{ getTestFixtures: Function, mutateTestFixture: Function }}
 * @api public
 */
export const provisionFixturesForTests_withAddons = (resetAfterEach = 1) => {

  const $__cachedExpressJSResponse = null;

  const state = {
    allFixtures: {},
    __fixturesCache: {}
  };

  const getTestFixtures = (fixtureKey, extrasFixturesState) => {
    let fixtures = state.allFixtures;

    if (typeof fixtureKey !== 'undefined') {
      if (extrasFixturesState instanceof Object) {
        switch (fixtureKey) {
          case 'nextApiRequest':
            fixtures = make_nextApiRequest(
              mutateTestFixture(fixtureKey, extrasFixturesState)
            )
            break
          case 'nextApiResponse':
            fixtures = make_nextApiResponse(
              mutateTestFixture(fixtureKey, extrasFixturesState)
            )
            break
          case 'expressHttpRequest':
            fixtures = make_expressHttpRequest(
              mutateTestFixture(fixtureKey, extrasFixturesState)
            )
            fixtures.res = make_expressHttpResponse(
              mutateTestFixture(fixtureKey, {})
            )
            break
          case 'expressHttpResponse':
            if ($__cachedExpressJSResponse !== null) {
              state.allFixtures[fixtureKey] = $__cachedExpressJSResponse
              fixtures = mutateTestFixture(fixtureKey, extrasFixturesState)
            } else {
              fixtures = make_expressHttpResponse(
                mutateTestFixture(fixtureKey, extrasFixturesState)
              )
            }
            break
          case 'expressNext':
            if (typeof extrasFixturesState === 'function'
              || ('mock' in extrasFixturesState)) {
              throw new TypeError(
                'second argument: `extraFixturesState` is not a Jest spy function'
              );
            }
            fixtures = make_expressNext(
              extrasFixturesState
            )
            break
          default:
            fixtures = mutateTestFixture(fixtureKey, extrasFixturesState)
        }
      } else {
        fixtures = state.allFixtures[fixtureKey]
      }
    }

    return fixtures;
  };
  const mutateTestFixture = (fixtureKey, currentFixtureState = {}) => {
    const formerFixtureState = state.allFixtures[fixtureKey];
    state.allFixtures[fixtureKey] = Object.assign(
      {},
      formerFixtureState,
      currentFixtureState || {},
    )
  };


  beforeAll(() => {
    state.__fixturesCache = Object.assign(
      {},
      $fixtures
    );
  })

  beforeEach(() => {
    const __fixturesCacheClone = Object.assign(
      {},
      state.__fixturesCache
    );
 
    let currentTestName = ""

    try {
      /* @HINT: Workaround for Jest v27.x and below */
      currentTestName = jasmine['currentTest'].fullName;
    } catch (_) {
      try {
        /* @HINT: Workaround for Jest v28.x and above */
        expect(undefined).to_$et(undefined)
      } catch (error) {
        if (error instanceof TypeError) {
          currentTestName = error.message;
        }
      } finally {
        currentTestName = expect.getState().currentTestName
      }
    }

    const [ , fixtureKeys ] = /\|(?:[ ]+)\[fixture\:([^\]]{1,}?)\](?:\s{0,})?$/.exec(
      currentTestName
    ) || ['', '']

    if (fixtureKeys.trim() !== '') {
      fixtureKeys.replace(/ /g, '').trim().split(',').forEach((fixtureKey) => {
        state.allFixtures[fixtureKey] = __fixturesCacheClone[fixtureKey]
      })
    } else {
      state.allFixtures = __fixturesCacheClone
    }
  })

  afterEach(() => {
    state.allFixtures = {}
    $__cachedExpressJSResponse = null

    if (resetAfterEach) {
      jest.resetAllMocks()
    }
  })

  afterAll(() => {
    state.__fixturesCache = {}
  })

  return {
    getTestFixtures,
    mutateTestFixture
  }
}

/**
 * A helper utility that enables the use of mock/fakes for `console` logging only for test cases
 * 
 * @param {(-1 | 2 | 3)=} loggingStrategy
 * @param {(Array.<String>)=} consoleAPIsToMock
 * 
 * @return void
 * @api public
 */
export const provisionMockedJSConsoleLoggingForTests = (
  loggingStrategy = -1,
  consoleAPIsToMock = ['log', 'warn', 'error', 'assert' ]
) => {
  /* @CHECK: https://github.com/tschaub/mock-fs/issues/234 */

  function format(entry) {
    if (typeof entry === "object") {
      try {
        return JSON.stringify(entry);
      } catch (_) {}
    }

    return entry;
  }

  let _Console = null
  let logsBuffer = [];

  function log(currentTestName, type, ...messages) {
    const _messages = messages.slice(0)

    if (loggingStrategy === $DELAYED_LOGGING) {
      /* @HINT: `loggingStrategy` as Delayed Logging means logs show up after all the tests run */
      logsBuffer.push({ type, testName: currentTestName, messages: _messages })
      return;
    }

    process.stdout.write(
      /* @HINT: `loggingStrategy` as Compact Logging means logs are less verbose and mostly redacted */
      loggingStrategy === $COMPACT_LOGGING
        ? `${currentTestName} -> ${type}: [reacted]` + "\n"
        : _messages.map(format).join(" ") + "\n"
    );
  }

  beforeEach(() => {
    if (typeof window === 'undefined') {
      const { Console } = global.console;
      _Console = Console;

      let currentTestName = ""

      try {
        /* @HINT: Workaround for Jest v27.x and below */
        currentTestName = jasmine['currentTest'].fullName;
      } catch (_) {
        try {
          /* @HINT: Workaround for Jest v28.x and above */
          expect(undefined).to_$et(undefined)
        } catch (error) {
          if (error instanceof TypeError) {
            currentTestName = error.message;
          }
        } finally {
          currentTestName = expect.getState().currentTestName
        }
      }

      consoleAPIsToMock.forEach((api) => {
        global.console[api] = jest.fn(
          log.bind(null, currentTestName, api)
        );
      });
    }
  })

  afterEach(() => {
    if (typeof window === 'undefined') {
      global.console = new _Console(process.stdout, process.stderr)

      if (logsBuffer.length > 0) {
        if (loggingStrategy === $DELAYED_LOGGING) {
          logsBuffer.map(({ type, messages }) => {
            console[type](...messages)
          })
        }
        logsBuffer = []
      }
    }
  })
}

/**
 * A helper utility that enables the use of environmental variables loaded only for test cases
 *
 * @return void
 * @api public
 */
export const provisionEnvironmentalVariablesForTests_withAddons = () => {
  /* @CHECK: https://jaketrent.com/post/mock-process-env-jest/ */
  const ORIGINAL_ENV = process.env

  beforeEach(() => { 
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  return {
    $setEnv_forThisTestCase: (variableName, variableValue) => {
      if ('replaceProperty' in jest) {
        jest.replaceProperty(
          process,
          'env',
          { [variableName.toUpperCase()]: variableValue }
        );
      } else {
        process.env[variableName.toUpperCase()] = variableValue
      }
    }
  }
}

export const $EXECUTION = {
  DELAYED_LOGGING: $DELAYED_LOGGING,
  COMPACT_LOGGING: $COMPACT_LOGGING,
  NORMAL_LOGGING: $NORMAL_LOGGING,
  RESET_AFTER_EACH_TEST_CASE: 1,
  IGNORE_RESET_AFTER_EACH_TEST_CASE: 0
}
