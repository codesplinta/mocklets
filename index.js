/**
 * Validates  properties on the `window` object that can be overriden.
 *
 * @param {String} property
 * @throws {Error}
 *
 * @returns void
 */
function assertReadonlyGlobalsNotMutable(property) {
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
			`Cannot override sensitive readonly global object: "${property}"`
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
		if (Boolean(originalProperty)) {
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
 * @param {*} value
 *
 * @returns void
 */
export const provisionFakeNodeJSObject = (packageOrModuleName, fakeOrMock, global = true) => {
  beforeEach(() => {
    if (typeof fakeOrMock === "function") {
      if (fakeOrMock.length === 0) {
        jest.mock(packageOrModuleName, fakeOrMock);
      }
    } else {
      const packageOrModule = global && typeof require === "function"
      	? require(packageOrModuleName)
      	: { default: null };
      packageOrModule.default = jest.fn(
        () => fakeOrMock
      );
    }
  });

  afterEach(() => {
    jest.resetModules();
  });
}
