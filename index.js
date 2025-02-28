import { fakeReactJSTransitionGroupPackageFactory } from './src/jest/react-transition-group'
import { fakeReactHookFormPackageFactory } from './src/jest/react-hook-form'
import { fakeReacti18NextPackageFactory } from './src/jest/react-i18next'
import { fakePinoLoggerPackageFactory } from './src/jest/pino'
import { fakeElectronPackageFactory } from './src/jest/electron'
import { fakeWinstonLoggerPackageFactory } from './src/jest/winston'
import { fakeCloudinaryUploaderInstanceFactory } from './src/jest/cloudinary'
import { fakeWebSocketFactory } from './src/jest/WebSocket'
import { fakeMaterialUIKitPackageFactory } from './src/jest/@mui/material'
import { fakeNextJSRouterPackageFactory } from './src/jest/next/router'
import { fakeAdonisJSCachePackageFactory } from './src/jest/adonisjs-cache'
import { fakeIntersectionObserverFactory } from './src/jest/IntersectionObserver'
import { fakeResizeObserverFactory } from './src/jest/ResizeObserver'
import { fakeStorageInstanceFactory } from './src/jest/browserStorage'

import {
  /* eslint-disable-next-line */
  nextjsFakesFactory
} from './src/jest/__mocks__/next/api'

import {
  /* eslint-disable-next-line */
  expressjsFakesFactory
} from './src/jest/__mocks__/express/http'

import { $fixtures } from './src/jest/__fixtures__'

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
 * with a fake implementation/replica so as to make testing a lot easier.
 *
 * @param {String | keyof Window} property
 * @param {*} fakeOrMock
 *
 * @returns void
 * @private
 */
const provisionFakeWebPageWindowObject = (property, fakeOrMock = null) => {
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
          window.dispatchEvent(new Event('beforeunload', { cancelable: true }));
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
              return;
            }

            if (prop === 'origin') {
              throw new window.TypeError('Cannot redefine property: origin')
            }
            
            currentURL[prop] = value
            location = currentURL.toString()
            currentURL = null

            if (prop === 'hash') {
              descriptors.hash.set.call(originalProperty, value)
            }
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
        location = ''
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
      /* @HINT: Silence automatic hoisting by Jest & Babel */
      jest.doMock(packageOrModuleName, fakeOrMock)

      if (typeof require === 'function') {
        require(packageOrModuleName)
      }
    }
  }

  afterEach(() => {
    if (typeof fakeOrMock === 'function') {
      if (fakeOrMock.length === 0) {
        /* @HINT: Silence automatic hoisting by Jest & Babel */
        jest.doMock(packageOrModuleName, fakeOrMock)

        if (typeof require === 'function') {
          require(packageOrModuleName)
        }
      }
    }
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
  /* @HINT: Lock Time */
  let timekeeper = require('timekeeper')

  beforeAll(() => {
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

  return {
    get timePiece () {
      return timekeeper
    }
  }
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
 * A helper utility that enables the use of fake browser API: `window.alert()`, `window.confirm()`,
 * `window.open()` & `window.prompt()` within tests
 *
 * @param {String} type
 * @param {Boolean} returnType
 *
 * @returns void
 * @api public
 */
export const provisionFakeBrowserDialogForTests = (type, returnType) => {
  const dialogs = {
    open: jest.fn(() => undefined),
    alert: jest.fn(() => undefined),
    prompt: jest.fn(() => true),
    confirm: jest.fn(() => true)
  }

  switch (true) {
    case type === 'open':
    case type === 'alert':
    case type === 'prompt':
    case type === 'confirm':
      if (/^(?:prompt|confirm)$/.test(type) &&
        typeof returnType === 'boolean') {
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

      const [protocol, hostname] = newOrigin.trim().split('//')
      const [, port] = (hostname || '').match(/\:([\d]{4})$/, '$1') || [null, ''];

      window.location.protocol = protocol || 'http:'
      window.location.hostname = (hostname || 'localhost').replace(/\:([\d]{4})$/, '')
      window.location.host = (hostname || `localhost${(port === '' ? port : ':'+port)}`)
      window.location.port = port
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
 * A helper utility that enables the use of fake browser API: `window.performance.navigation` within tests
 *
 * @return void
 * @api public
 */
export const provisionFakeBrowserPerformanceNavigationForTests = () => {
  /*
   * @HINT:
   *
   * JSDOM implements `window.performance` but not `window.performance.mark()` or `window.performance.navigation`
   */
  /* @CHECK: https://github.com/jsdom/jsdom/issues/2136 */
  return {

  }
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
    () => new Cache()
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
 * @return {{ $getAllRouterEventsMap: Function, $setSpyOn_useRouter: Function, $setSpyOn_withRouter: Function, $setSpyOn_useRouter_WithReturnValueOnce: Function }}
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
    $setSpyOn_useRouter: () => {
      return jest.spyOn(
        require('next/router'),
        'useRouter'
      )
    },
    $setSpyOn_withRouter: () => {
      return jest.spyOn(
        require('next/router'),
        'withRouter'
      )
    },
    $setSpyOn_useRouter_withReturnValueOnce: ({
      query = {},
      pathname = '/',
      locale = 'en_US',
      isPreview = false,
      basePath = '/'
    }) => {
      const useRouter = jest.spyOn(
        require('next/router'),
        'useRouter'
      )
      const usePathname = jest.spyOn(
        require('next/navigation'),
        'usePathname'
      )
      const useSearchParams = jest.spyOn(
        require('next/navigation'),
        'useSearchParams'
      )

      const $routerFields = (routerFactory().useRouter())

      $routerFields.query = query
      $routerFields.locale = locale
      $routerFields.asPath = pathname
      $routerFields.basePath = basePath
      $routerFields.isPreview = isPreview

      useRouter.mockReturnValueOnce($routerFields)

      usePathname.mockImplementationOnce(() => {
        return $routerFields.asPath
      }).mockImplementation(function () {
        const router = useRouter()
        return router.asPath
      })

      useSearchParams.mockImplementationOnce(() => {
        return new URLSearchParams($routerFields.query)
      }).mockImplementation(function () {
        const router = useRouter()
        return new URLSearchParams(router.query)
      })

      return $routerFields // returnValue
    }
  }
}

/**
 * A helper utility that enables the use of mock electron package within tests that returns addons
 *
 * @return {{ $setSpyOn_BrowserWindow: Function, $setSpyOn_app : Function }}
 * @api public
 */
/* eslint-disable-next-line */
export const provisionMockedElectronForTests_withAddons = () => {
  const electronFake = fakeElectronPackageFactory()

  /* @NOTE: This doesn't work for now */
  provisionFakeJSObject(
    'electron',
    () => electronFake
  )

  return {
    $setSpyOn_BrowserWindow: () => {
      return jest.spyOn(
        require('electron'),
        'BrowserWindow'
      )
    },
    $setSpyOn_app: () => {
      return jest.spyOn(
        require('electron'),
        'app'
      )
    }
  }
}

/**
 * A helper utility that enables the use of mock react-hook-form package within tests that returns addons
 *
 * @return {{ $setSpyOn_useForm: Function, $setSpyOn_useForm_withMockImplementation: Function }}
 * @api public
 */
/* eslint-disable-next-line */
export const provisionMockedReactHookFormForTests_withAddons = () => {
  const hookFormFactory = fakeReactHookFormPackageFactory()

  /* @NOTE: This doesn't work for now */
  provisionFakeJSObject(
    'react-hook-form',
    hookFormFactory
  )

  return {
    $setSpyOn_useForm: () => {
      return jest.spyOn(
        require('react-hook-form'),
        'useForm'
      )
    },
    $setSpyOn_useForm_withMockImplementation: (
      {
        formStateErrors = {},
        values = {}
      }
    ) => {
      const useForm = jest.spyOn(
        require('react-hook-form'),
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

      useForm.mockImplementationOnce(() => $formContextFields)

      return $formContextFields // returnValue
    }
  }
}

/**
 * A helper utility that enables the use of mock Material UI kit: `@mui/material` within tests
 *
 * @return {{ $setSpyOn_useMediaQuery_withMockImplementation: Function, $setWindowInnerWidth_forThisTestCase: Function }}
 * @api public
 */
export const provisionMockedMaterialUIKitForTests = () => {
  const muiFactory = fakeMaterialUIKitPackageFactory()

  /* @HINT: This doesn't work for now */
  provisionFakeJSObject(
    '@mui/material',
    muiFactory
  )

  return {
    $setWindowInnerWidth_forThisTestCase (newInnerWidth) {
      if (typeof newOrigin !== 'number') {
        return
      }

      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        writable: true,
        value: newInnerWidth
      })
    },
    $setSpyOn_useMediaQuery_withMockImplementation: () => {
      const useMediaQuery = jest.spyOn(
        require('@mui/material'),
        'useMediaQuery'
      )

      const $useMediaQuery = (muiFactory().useMediaQuery)

      useMediaQuery.mockImplementation((...args) => $useMediaQuery(...args))
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
  /* @NOTE: This doesn't work for now */
  provisionFakeJSObject(
    'pino',
    fakePinoLoggerPackageFactory()
  )
}

/**
 * A helper utility that enables the use of mock server-side logger: `winston` within tests
 *
 * @return {{ $setSpyOn_winstonLogger_withMockImplementation: Function }}
 * @api public
 */
export const provisionMockedWinstonLoggerForTests = () => {
  const winstonFactory = fakeWinstonLoggerPackageFactory()
  /* @NOTE: This doesn't work for now */
  provisionFakeJSObject(
    'winston',
    winstonFactory
  )

  return {
    $setSpyOn_winstonLogger_withMockImplementation () {
      const createLogger = jest.spyOn(
        require('winston'),
        'createLogger'
      )

      createLogger.mockImplementation(function () {
        return {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          debug: jest.fn(),
          log: jest.fn(),
          add: jest.fn()
        }
      })
    }
  }
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
 * @return {{ nodeJsFileSystemMock: Object }}
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
    get nodeJsFileSystemMock () {
      return mock
    }
  }
}

/**
 * A helper utility that enables the use of `window.WebSocket` and a mock server for test cases
 *
 * @param {Function} mockFactoryCallback
 * @param {String} webSocketServerUrl
 *
 * @return {{ webSocketServerMock: Object }}
 * @api public
 */
export const provisionMockedWebSocketClientAndServerForTests = (mockFactoryCallback, webSocketServerUrl) => {
  let server = null

  let [_server, WebSocket] = fakeWebSocketFactory(webSocketServerUrl)

  /* @NOTE:
   *
   * The `WebSocket` spec-complaint API was implemented by
   * JSDOM in 2018. So, here we check if it's available.
   *
   * However, we want to allow `mock-socket` to control the
   * faking of the `WebSocket` implementation
   */
  if (!('WebSocket' in window)) {
    provisionFakeWebPageWindowObject(
      'WebSocket',
      WebSocket
    )
  }

  if (typeof mockFactoryCallback === 'function') {
    server = _server
    mockFactoryCallback(server)
  }

  afterEach(() => {
    server.close()
    server = null
    _server = null
    WebSocket = null
  })

  beforeEach(() => {
    if (server === null) {
      if (typeof mockFactoryCallback === 'function') {
        [server] = fakeWebSocketFactory(webSocketServerUrl)
        mockFactoryCallback(server)
      }
    }
  })

  afterAll(() => {
    server.stop()
    server = null
    _server = null
    WebSocket = null
  })

  return {
    get webSocketServerMock () {
      return server
    }
  }
}

/**
 * A helper utility that enables the mocking of a HTTP server
 *
 * @param {Function} mockFactoryCallback
 * @param {String} type
 *
 * @returns void
 * @api public
 */
export const provisionMockedHttpServerForTests = (mockFactoryCallback, type = 'http') => {
  let server = {
    listen () {},
    resetHandlers () {},
    close () {}
  }

  // @CHECK: https://mswjs.io/docs/basics/mocking-responses
  const msw = require('msw')

  if (typeof mockFactoryCallback === 'function') {
    server = mockFactoryCallback(
      type === 'http' ? msw.http : msw.graphql,
      msw.passthrough
    ) || []
  }

  beforeAll(() => server.listen())

  /* @SEE: https://kentcdodds.com/blog/stop-mocking-fetch */

  // if you need to add a handler after calling setupServer for some specific test
  // this will remove that handler for the rest of them
  // (which is important for test isolation):
  afterEach(() => server.resetHandlers())

  afterAll(() => server.close())
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
  /* eslint-disable-next-line */
  const $__cachedExpressJSRequest = null

  const state = {
    allFixtures: {},
    __fixturesCache: {}
  }

  const getTestFixtures = (fixtureKey, extrasFixturesState) => {
    if (typeof fixtureKey !== 'undefined') {
      if (extrasFixturesState instanceof Object) {
        switch (fixtureKey) {
          case 'nextApiRequest':
            mutateTestFixture(
              fixtureKey,
              nextjsFakesFactory.make_nextApiRequest(
                extrasFixturesState
              )
            )
            break
          case 'nextApiResponse':
            mutateTestFixture(
              fixtureKey,
              nextjsFakesFactory.make_nextApiResponse(
                extrasFixturesState
              )
            )
            break
          case 'expressHttpRequest': {
            mutateTestFixture(
              fixtureKey,
              extrasFixturesState instanceof Object
                ? expressjsFakesFactory.make_expressHttpRequest(
                    extrasFixturesState
                  )
                : expressjsFakesFactory.make_expressHttpRequest()
            )

            const fixture = state.allFixtures[fixtureKey]

            /* eslint-disable-next-line */
            if ($__cachedExpressJSResponse) {
              /* eslint-disable-next-line */
              $__cachedExpressJSResponse.req = fixture;
            }

            /* eslint-disable-next-line */
            if ($__cachedExpressJSRequest === null) {
              /* eslint-disable-next-line */
              $__cachedExpressJSRequest = fixture;
            }

            break
          }
          case 'expressHttpResponse': {
            mutateTestFixture(
              fixtureKey,
              expressjsFakesFactory.make_expressHttpResponse(
                extrasFixturesState
              )
            )

            const fixture = state.allFixtures[fixtureKey]

            /* eslint-disable-next-line */
            if ($__cachedExpressJSRequest) {
              /* eslint-disable-next-line */
              fixture.req = $__cachedExpressJSRequest
            }

            /* eslint-disable-next-line */
            if ($__cachedExpressJSResponse === null) {
              /* eslint-disable-next-line */
              $__cachedExpressJSResponse = fixture;
            }
            break
          }
          case 'expressNext': {
            if (typeof extrasFixturesState === 'function' ||
              ('mock' in extrasFixturesState)) {
              throw new TypeError(
                'second argument: `extraFixturesState` is not a Jest spy function'
              )
            }

            mutateTestFixture(
              fixtureKey,
              expressjsFakesFactory.make_expressNext(
                extrasFixturesState
              )
            )
            break
          }
          default:
            return state.allFixtures[fixtureKey] || {}
        }
      }
    }

    return state.allFixtures[fixtureKey] || {}
  }
  const mutateTestFixture = (fixtureKey, currentFixtureState = {}) => {
    state.allFixtures[fixtureKey] = currentFixtureState
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
    const [, fixtureKeys] = /\|(?:[\s]+)\[fixture\:([^\]]{1,}?)\](?:\s{0,})$/.exec(
      currentTestName.trim()
    ) || ['', '']

    if (fixtureKeys.trim() !== '') {
      fixtureKeys.replace(/ /g, '').trim().split(',').forEach((fixtureKey) => {
        if (fixtureKey in $fixtures) {
          state.allFixtures[fixtureKey] = __fixturesCacheClone[fixtureKey]
        }
      })
    } else {
      state.allFixtures = __fixturesCacheClone
    }
  })

  afterEach(() => {
    state.allFixtures = {}
    /* eslint-disable-next-line */
    if ($__cachedExpressJSResponse) {
      /* eslint-disable-next-line */
      $__cachedExpressJSResponse.req = null
      /* eslint-disable-next-line */
      $__cachedExpressJSResponse = null

      $__cachedExpressJSResponse.app = null
    }
  })

  afterAll(() => {
    state.__fixturesCache = {}

    if (resetAfterEach) {
      jest.resetAllMocks()
    }
  })

  return {
    getTestFixtures
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

      if (loggingStrategy !== $NORMAL_LOGGING) {
        consoleAPIsToMock.forEach((api) => {
          global.console[api] = jest.fn(
            log.bind(null, currentTestName, api)
          )
        })
      }
    }
  })

  afterEach(() => {
    let _console

    if (typeof global !== 'undefined' &&
      Boolean(global.console)) {
      _console = global.console
      global.console = new _Console(
        process.stdout,
        process.stderr
      )
    }

    if (logsBuffer.length === 0) {
      return
    }

    if (loggingStrategy !== $NORMAL_LOGGING) {
      consoleAPIsToMock.forEach((api) => {
        if (typeof _console[api].mockClear === 'function') {
          _console[api].mockClear()
        }
      })

      _console = null

      if (loggingStrategy === $DELAYED_LOGGING) {
        logsBuffer.forEach(({ type, messages }) => {
          console[type](...messages)
        })
      }
      logsBuffer = []
    }
  })

  afterAll(() => {
    logsBuffer = null
    _Console = null
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
