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
 export const provisionFakeWebPageWindowObject = (property, fakeOrMock = null) => {
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
        ['localStorage', 'sessionStorage'].includes(property)) {
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
 * A helper utility for instantiating a constructor/class for use
 * in test cases
 *
 * @param {Function} constructor
 *
 * @returns void
 */
export const provisionLocalClassInstance = (constructor) => {
  let instance = null;

  instance = (new constructor())

  afterEach(() => {
    instance = null

    instance = (new constructor())
  })

  afterAll(() => {
    instance = null
  })

  return instance;
}
