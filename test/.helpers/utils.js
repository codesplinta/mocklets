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
 export const provisionFakeWebPageWindowObject = (property, fakeOrMock) => {
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