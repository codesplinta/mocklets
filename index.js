import { fakeReactJSTransitionGroupPackageFactory } from './src/jest/react-transition-group'
import { fakeReactHookFormPackageFactory } from './src/jest/react-hook-form'
import { fakeReacti18NextPackageFactory } from './src/jest/react-i18next'
import { fakePinoLoggerPackageFactory } from './src/jest/pino'
import { fakeWinstonLoggerPackageFactory } from './src/jest/winston'
import { fakeCloudinaryUploaderInstanceFactory } from './src/jest/cloudinary'
import { fakeWebSocketFactory } from './src/jest/WebSocket'
import { fakeMaterialUIKitPackageFactory } from './src/jest/@mui/material'
import { fakeNextJSRouterPackageFactory } from './src/jest/next/router'
import { fakeAdonisJSCachePackageFactory } from './src/jest/adonisjs-cache'
import { fakematchMediaFactory } from './src/jest/matchMedia'
import { fakeIntersectionObserverFactory } from './src/jest/IntersectionObserver'
import { fakeResizeObserverFactory } from './src/jest/ResizeObserver'
import { fakeStorageInstanceFactory } from './src/jest/browserStorage'

// import { afterEach, beforeEach, afterAll } from '@jest/globals'

const $fixtures = require('./src/jest/__fixtures__')
const {
  /* eslint-disable-next-line */
  make_nextApiRequest,
  /* eslint-disable-next-line */
  make_nextApiResponse
} = require('./src/jest/__mocks__/next/api')
const {
  /* eslint-disable-next-line */
  make_expressNext,
  /* eslint-disable-next-line */
  make_expressHttpRequest,
  /* eslint-disable-next-line */
  make_expressHttpResponse
} = require('./src/jest/__mocks__/express/http')

const $DELAYED_LOGGING = 2
const $NORMAL_LOGGING = -1
const $COMPACT_LOGGING = 3

/**
 * Helps as an assertion signature for ensureing that readonly members
 * are not overwritten by assignment on the `globalThis: Window` object
 *
 * @param {String} property
 * @throws {Error}
 *
 * @returns void
 * @private
 */
function assertReadonlyGlobalsNotMutable (property) {
  const readOnlyGlobalObjects = [
    'origin',
    'history',
    'clientInformation',
    'caches',
    'closed',
    'crypto'
  ]

  if (readOnlyGlobalObjects.includes(property)) {
    throw new Error(
      `Cannot override sensitive readonly global (window) object: "${property}"`
    )
  }
}

/**
 * A helper utility for replacing native object and BOM APIs in web browsers
 * with a fake implementation/replica so as to make testing a lot easier.
 *
 * @param {String | keyof Window} property
 * @param {*} fakeOrMock
 *
 * @returns void
 * @private
 */
const provisionFakeWebPageWindowObject = (property, fakeOrMock = null) => {
  const isJSDOMLoaded = typeof window !== 'undefined' ? window.navigator.noUI : false

  if (!isJSDOMLoaded) {
    return
  }

  const { [property]: originalProperty } = window
  const isWindowLocation = property === 'location'

  const origLocation = window.document.location.href

  let parser = null
  let descriptors = null
  let location = ''

  if (isWindowLocation) {
    location = origLocation
  }

  beforeAll(() => {
    assertReadonlyGlobalsNotMutable(property)
    delete window[property]

    if (isWindowLocation) {
      /*! attribution */
      /* @CHECK: https://github.com/jestjs/jest/issues/890#issuecomment-347580414 */
      parser = window.document.createElement('a')
      descriptors = Object.getOwnPropertyDescriptors(originalProperty)

      window.location = {
        assign: jest.fn((url) => {
          location = url
          descriptors.assign.value.call(originalProperty, url)
        }),
        reload: jest.fn((forcedReload = false) => {
          if (forcedReload) {
            descriptors.reload.value.call(originalProperty, forcedReload)
          } else {
            descriptors.reload.value.call(originalProperty)
          }
        }),
        replace: jest.fn((url) => {
          location = url
          descriptors.replace.value.call(originalProperty, url)
        }),
        toString () {
          return location
        }
      };
      ['href', 'protocol', 'host', 'hostname', 'origin', 'port', 'pathname', 'search', 'hash'].forEach(prop => {
        Object.defineProperty(window.location, prop, {
          get: function () {
            parser.href = location

            if (prop === 'href') {
              return (parser[prop]).replace(/\/$/, '')
            }
            return parser[prop]
          },
          set: function (value) {
            let currentURL = new window.URL(location)

            if (prop === 'href') {
              location = value.indexOf('http') === 0
                ? value
                : `${currentURL.origin}${value.indexOf('/') === 0 ? value : '/' + value}`
              currentURL = null
              descriptors.href.set.call(originalProperty, value)
              return
            }

            if (prop === 'origin') {
              throw new window.TypeError('Cannot redefine property: origin')
            }

            currentURL[prop] = value
            location = currentURL.toString()
            currentURL = null
            // descriptors[prop].set.call(originalProperty, value)
          }
        })
      })
    } else {
      let clone = null

      if (typeof originalProperty === 'object' &&
        property !== 'localStorage' &&
          property !== 'sessionStorage') {
        clone = Object.create(Object.getPrototypeOf(originalProperty))
        const descriptors = Object.getOwnPropertyDescriptors(originalProperty)
        Object.defineProperties(clone, descriptors)
      }

      Object.defineProperty(window, property, {
        configurable: true,
        writable: true,
        value: clone || fakeOrMock
      })
    }
  })

  afterEach(() => {
    if (isWindowLocation) {
      location = origLocation
    } else {
      if (fakeOrMock &&
        ('mockClear' in fakeOrMock) &&
          typeof fakeOrMock.mockClear === 'function') {
        fakeOrMock.mockClear()
      }
    }
  })

  afterAll(() => {
    if (originalProperty) {
      if (!isWindowLocation) {
        window[property] = originalProperty
      } else {
        if (parser !== null) {
          parser = null
        }
        if (descriptors !== null) {
          descriptors = null
        }
      }
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
 * @private
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

  afterEach(() => {
    jest.clearAllMocks()

    if (typeof fakeOrMock === 'function') {
      if (fakeOrMock.length === 0) {
        /* @HINT: Silence automatic hoisting by Jest & Babel */
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
 * A helper utility that enables the use of fake browser API: `window.alert()`, `window.confirm()`
 * & `window.prompt()` within tests
 *
 * @returns void
 * @api public
 */
export const provisionFakeBrowserDialogForTests = (type, returnType) => {
  const dialogs = {
    alert: jest.fn(() => undefined),
    prompt: jest.fn(() => true),
    confirm: jest.fn(() => true)
  }

  switch (true) {
    case type === 'alert':
    case type === 'prompt':
    case type === 'confirm':
      if (typeof returnType === 'boolean') {
        (dialogs[type]).mockImplementationOnce(() => returnType)
      }
      provisionFakeWebPageWindowObject(type, dialogs[type])
      break
    default:
  }
}

/**
 * A helper utility that enables the use of fake browser API: `window` URI-based APIs within tests
 *
 * @return {{ $setWindowOrigin_forThisTestCase: Function }}
 * @api public
 */
/* eslint-disable-next-line */
export const provisionFakeBrowserURILocationForTests_withAddons = () => {

  provisionFakeWebPageWindowObject(
    'location'
  )

  return {
    /* eslint-disable-next-line */
    $setWindowOrigin_forThisTestCase (newOrigin) {
      if (typeof newOrigin !== 'string') {
        return
      }

      // jsdom.changeURL(window, newOrigin)
      const [protocol, hostname] = newOrigin.trim().split('//')

      window.location.protocol = protocol || 'http:'
      window.location.hostname = hostname
    }
  }
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
 * A helper utility that enables the use of fake browser API: `window.matchMedia` within tests
 *
 * @return void
 * @api public
 */
export const provisionFakeBrowserMatchMediaForTests = () => {
  provisionFakeWebPageWindowObject(
    'matchMedia',
    fakematchMediaFactory()
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
 * A helper utility that enables the use of mock `cloudinary.v2` package : require('cloudinary').v2 within tests
 *
 * @return void
 * @api public
 */
export const provisionMockedNodeJSCloudinaryForTests = () => {
  const cloudinary = fakeCloudinaryUploaderInstanceFactory()
  const v2 = jest.spyOn(require('cloudinary'), 'v2')

  v2.mockReturnValueOnce(cloudinary.v2)
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

  /* @NOTE: This doesn't work for now */
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
/* eslint-disable-next-line */
export const provisionMockedNextJSRouterForTests_withAddons = (clearAfterEach = 1) => {
  let ___eventsSubscribed = {}
  const routerFactory = fakeNextJSRouterPackageFactory(
    ___eventsSubscribed
  )

  /* @NOTE: This doesn't work for now */
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
        nextRouterExportObject || require('next/router'),
        'useRouter'
      )
    },
    $setSpyOn_useRouter_withReturnValueOnce: ({
      query = {},
      pathname = '/',
      locale = 'en-US',
      isPreview = false,
      basePath = '/'
    }, nextRouterExportObject, nextNavigationExportObject
    ) => {
      const useRouter = jest.spyOn(
        nextRouterExportObject || require('next/router'),
        'useRouter'
      )
      const usePathname = jest.spyOn(
        nextNavigationExportObject || require('next/naviagtion'),
        'usePathname'
      )
      const useSearchParams = jest.spyOn(
        nextNavigationExportObject || require('next/naviagtion'),
        'useSearchParams'
      )

      const $routerFields = (routerFactory().useRouter())

      $routerFields.query = query
      $routerFields.locale = locale
      $routerFields.asPath = pathname
      $routerFields.basePath = basePath
      $routerFields.isPreview = isPreview

      // const returnValue = {
      //   ...$routerFields
      // }

      useRouter.mockReturnValueOnce($routerFields)

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

      return $routerFields // returnValue
    }
  }
}

/**
 * A helper utility that enables the use of mock react-hook-form package within tests that returns addons
 *
 * @return {{ $setSpyOn_useFormContext: Function, $setSpyOn_useFromContext_WithReturnValueOnce: Function }}
 * @api public
 */
/* eslint-disable-next-line */
export const provisionMockedReactHookFormForTests_withAddons = () => {
  const hookFormFactory = fakeReactHookFormPackageFactory()

  /* @NOTE: This doesn't work for now */
  provisionFakeJSObject(
    'react-hook-form',
    hookFormFactory()
  )

  return {
    $setSpyOn_useForm: (reactHookFormExportObject) => {
      return jest.spyOn(
        reactHookFormExportObject || require('react-hook-form'), 'useForm'
      )
    },
    $setSpyOn_useFrom_withReturnValueOnce: ({
      formStateErrors = {},
      values = {}
    }, reactHookFormExportObject
    ) => {
      const useForm = jest.spyOn(
        reactHookFormExportObject || require('react-hook-form'),
        'useForm'
      )

      const $formContextFields = (hookFormFactory().useForm({ defaultValues: values }))

      $formContextFields.clearErrors()
      $formContextFields.reset(values)

      Object.keys(values).forEach((fieldName) => {
        if (fieldName in formStateErrors) {
          $formContextFields.setError(fieldName, formStateErrors[fieldName])
        }
      })

      // const returnValue = {
      //   ...$formContextFields
      // }

      useForm.mockReturnValueOnce($formContextFields)

      return $formContextFields // returnValue
    }
  }
}

/**
 * A helper utility that enables the use of mock Material UI kit: `@mui/material` within tests
 *
 * @return void
 * @api public
 */
export const provisionMockedMaterialUIKitForTests = () => {
  /* @HINT: This doesn't work for now */
  provisionFakeJSObject(
    '@mui/material',
    fakeMaterialUIKitPackageFactory()
  )
}

/**
 * A helper utility that enables the use of mock server-side logger: `pino` within tests
 *
 * @return void
 * @api public
 */
export const provisionMockedPinoLoggerForTests = () => {
  /* @NOTE: This doesn't work for now */
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
  /* @NOTE: This doesn't work for now */
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
  /* @HINT: This doesn't work for now */
  provisionFakeJSObject(
    'react-transition-group',
    fakeReactJSTransitionGroupPackageFactory()
  )
}

/**
 * A helper utility that enables the use of mock i18n for ReactJS: `react-i18next` within tests
 *
 * @return void
 * @api public
 */
export const provisionMockedReacti18NextForTests = (translationMapCallback = () => ({})) => {
  /* @HINT: This doesn't work for now */
  provisionFakeJSObject(
    'react-i18next',
    fakeReacti18NextPackageFactory(
      typeof translationMapCallback === 'function'
        ? translationMapCallback()
        : {}
    )
  )
}

/**
 * A helper utility that enables the use of mock filesystem targeting the 'node:fs' package only for test cases
 *
 * @param {Function} mockFactoryCallback
 *
 * @return {{ nodeFileSystemMock: Object }}
 * @api public
 */
export const provisionMockedNodeJSFileSystemForTests = (mockFactoryCallback = () => undefined) => {
  /* eslint-disable-next-line */
  const { Console } = global.console
  const $console = global.console
  /* eslint-disable-next-line */
  console = new Console(process.stdout, process.stderr)

  let mock = null

  mock = require('mock-fs')

  if (typeof mockFactoryCallback === 'function') {
    mockFactoryCallback(mock, require('path'), require)
  }

  afterEach(() => {
    if (mock) {
      mock.restore()
    }
  })

  beforeEach(() => {
    mock = require('mock-fs')

    if (typeof mockFactoryCallback === 'function') {
      mockFactoryCallback(mock, require('path'), require)
    }
  })

  afterAll(() => {
    if (mock) {
      mock.restore()
    }

    mock = null
    global.console = $console
  })

  return {
    get nodeFileSystemMock () {
      return mock
    }
  }
}

/**
 * A helper utility that enables the use of `window.WebSocket` and a mock server for test cases
 *
 * @param {String} webSocketServerUrl
 * @param {Function} mockFactoryCallback
 *
 * @return {{ webSocketServerMock: Object }}
 * @api public
 */
export const provisionMockedWebSocketClientAndServerForTests = (webSocketServerUrl, mockFactoryCallback) => {
  let server = null

  let [_server, WebSocket] = fakeWebSocketFactory(webSocketServerUrl)

  provisionFakeWebPageWindowObject(
    'WebSocket',
    WebSocket
  )

  if (typeof mockFactoryCallback === 'function') {
    server = _server
    mockFactoryCallback(server)
  }

  afterEach(() => {
    server = null
  })

  beforeEach(() => {
    if (typeof mockFactoryCallback === 'function') {
      [server] = fakeWebSocketFactory(webSocketServerUrl)
      mockFactoryCallback(server)
    }
  })

  afterAll(() => {
    server = null
    _server = null
  })

  return {
    get webSocketServerMock () {
      return server
    }
  }
}

/**
 * A helper utility that enables the use of fixtures loaded from this package and elsewhere
 *
 * @param {1 | 0} resetAfterEach
 *
 * @return {{ getTestFixtures: Function, mutateTestFixture: Function }}
 * @api public
 */
/* eslint-disable-next-line */
export const provisionFixturesForTests_withAddons = (resetAfterEach = 1) => {
  /* eslint-disable-next-line */
  const $__cachedExpressJSResponse = null

  const state = {
    allFixtures: {},
    __fixturesCache: {}
  }

  const getTestFixtures = (fixtureKey, extrasFixturesState) => {
    let fixtures = state.allFixtures

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
            /* eslint-disable-next-line */
            if ($__cachedExpressJSResponse !== null) {
              /* eslint-disable-next-line */
              state.allFixtures[fixtureKey] = $__cachedExpressJSResponse
              fixtures = mutateTestFixture(fixtureKey, extrasFixturesState)
            } else {
              fixtures = make_expressHttpResponse(
                mutateTestFixture(fixtureKey, extrasFixturesState)
              )
            }
            break
          case 'expressNext':
            if (typeof extrasFixturesState === 'function' ||
              ('mock' in extrasFixturesState)) {
              throw new TypeError(
                'second argument: `extraFixturesState` is not a Jest spy function'
              )
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

    return fixtures
  }
  const mutateTestFixture = (fixtureKey, currentFixtureState = {}) => {
    const formerFixtureState = state.allFixtures[fixtureKey]
    state.allFixtures[fixtureKey] = Object.assign(
      {},
      formerFixtureState,
      currentFixtureState || {}
    )
  }

  beforeAll(() => {
    state.__fixturesCache = Object.assign(
      {},
      $fixtures
    )
  })

  beforeEach(() => {
    const __fixturesCacheClone = Object.assign(
      {},
      state.__fixturesCache
    )

    let currentTestName = ''

    try {
      /* @HINT: Workaround for Jest v27.x and below */
      currentTestName = jasmine.currentTest.fullName
    } catch (_) {
      try {
        /* @HINT: Workaround for Jest v28.x and above */
        expect(undefined).to_$et(undefined)
      } catch (error) {
        if (error instanceof TypeError) {
          currentTestName = error.message
        }
      } finally {
        currentTestName = expect.getState().currentTestName
      }
    }

    /* eslint-disable-next-line */
    const [, fixtureKeys] = /\|(?:[ ]+)\[fixture\:([^\]]{1,}?)\](?:\s{0,})?$/.exec(
      currentTestName.trim()
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
    /* eslint-disable-next-line */
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
/* eslint-disable-next-line */
export const provisionMockedJSConsoleLoggingForTests = (
  loggingStrategy = -1,
  consoleAPIsToMock = ['log', 'info', 'error', 'assert']
) => {
  /* @CHECK: https://github.com/tschaub/mock-fs/issues/234 */

  function format (entry) {
    if (typeof entry === 'object') {
      try {
        return JSON.stringify(entry)
      } catch (_) {}
    }

    return entry
  }

  let _Console = null
  let logsBuffer = []

  function log (currentTestName, type, ...messages) {
    const _messages = messages.slice(0)

    if (loggingStrategy === $DELAYED_LOGGING) {
      /* @HINT: `loggingStrategy` as Delayed Logging means logs show up after all the tests run */
      logsBuffer.push({ type, testName: currentTestName, messages: _messages })
      return
    }

    process.stdout.write(
      /* @HINT: `loggingStrategy` as Compact Logging means logs are less verbose and mostly redacted */
      loggingStrategy === $COMPACT_LOGGING
        ? `${currentTestName} -> ${type}: [redacted]` + '\n'
        : _messages.map(format).join(' ') + '\n'
    )
  }

  beforeEach(() => {
    if (typeof window === 'undefined') {
      const { Console } = global.console
      _Console = Console

      let currentTestName = ''

      try {
        /* @HINT: Workaround for Jest v27.x and below */
        currentTestName = jasmine.currentTest.fullName
      } catch (_) {
        try {
          /* @HINT: Workaround for Jest v28.x and above */
          expect(undefined).to_$et(undefined)
        } catch (error) {
          if (error instanceof TypeError) {
            currentTestName = error.message
          }
        } finally {
          currentTestName = expect.getState().currentTestName
        }
      }

      consoleAPIsToMock.forEach((api) => {
        global.console[api] = jest.fn(
          log.bind(null, currentTestName, api)
        )
      })
    }
  })

  afterEach(() => {
    if (typeof window === 'undefined') {
      global.console = new _Console(process.stdout, process.stderr)

      if (logsBuffer.length > 0) {
        if (loggingStrategy === $DELAYED_LOGGING) {
          logsBuffer.forEach(({ type, messages }) => {
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
 * @return {{ $setEnv_forThisTestSuite: Function }}
 * @api public
 */
/* eslint-disable-next-line */
export const provisionEnvironmentalVariablesForTests_withAddons = (resetAfterEach = 1) => {
  /* @CHECK: https://jaketrent.com/post/mock-process-env-jest/ */
  const ORIGINAL_ENVS = process.env

  beforeEach(() => {
    if (resetAfterEach) {
      jest.resetModules()
      process.env = { ...ORIGINAL_ENVS }
    }
  })

  afterEach(() => {
    if (resetAfterEach) {
      process.env = ORIGINAL_ENVS
    }
  })

  afterAll(() => {
    if (!resetAfterEach) {
      process.env = ORIGINAL_ENVS
    }
  })

  return {
    $setEnv_forThisTestSuite: (variableName, variableValue) => {
      if ('replaceProperty' in jest) {
        jest.replaceProperty(
          process,
          'env',
          { [variableName.toUpperCase()]: variableValue }
        )
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
