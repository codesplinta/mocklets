import timekeeper from 'timekeeper';

import { fakeReactJSTransitionGroupFactory } from "./src/jest/react-transition-group";
import { fakePinoLoggerPackageFactory } from "./src/jest/pino";
import { fakeNextJSRouterPackageFactory } from "./src/jest/next/router";
import { fakeStorageInstanceFactory } from "./src/jest/browserStorage";

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
 * @param {*} fakeOrMock
 *
 * @returns void
 */
const provisionFakeNodeJSObject = (packageOrModuleName, fakeOrMock) => {

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

/**
 * 
 * 
 * @param {() => number} callback 
 * 
 * @return void
 * @api public
 */
export const provisionMockedDateForTests = (callback = () => 1487076708000) => {
	/* @CHECK: https://stackoverflow.com/a/47781245 */
	let dateSpy;
	let dateNowSpy;

	beforeAll(() => {
	  jest
		.useFakeTimers()

	  // Lock Time
	  dateSpy = jest
  		.spyOn(!!window ? window : global, 'Date')
  		  .mockImplementationOnce(() => new Date(callback()));
	  dateNowSpy = jest
	  	.spyOn(Date, 'now')
		  .mockImplementation(callback);
	});

	afterAll(() => {
	  jest.useRealTimers()

	  // Unlock Time
	  dateSpy.mockRestore();
	  dateNowSpy.mockRestore();
	});
	
}

/**
 * 
 * 
 * @param {Date} dateObject 
 * 
 * @return void
 * @api public
 */
export const provisionFakeDateForTests = (dateObject = new Date('2007-01-01')) => {
	beforeAll(() => {
	  // Lock Time
	  timekeeper.freeze(dateObject);
	});
	
	afterAll(() => {
	  // Unlock Time
	  timekeeper.reset();
	});
};

/**
 * 
 * @return void
 * @api public
 */
export const provisionFakeBrowserLocalStorageForTests = () => {
	provisionFakeWebPageWindowObject('localStorage', fakeStorageInstanceFactory())
};

/**
 * 
 * @return void
 * @api public
 */
export const provisionFakeBrowserSessionStorageForTests = () => {
	provisionFakeWebPageWindowObject('sessionStorage', fakeStorageInstanceFactory())
};


/**
 * 
 * @return void
 * @api public
 */
export const provisionMockedNextJSRouterForTests = () => {
	provisionFakeNodeJSObject('next/router', fakeNextJSRouterPackageFactory())
};

/**
 * 
 * @return void
 * @api public
 */
export const provisionMockedPinoLoggerForTests = () => {
	provisionFakeNodeJSObject('pino', fakePinoLoggerPackageFactory())
};


/**
 * 
 * @return void
 * @api public
 */
export const provisionMockedReactTransitionGroupForTests = () => {
	provisionFakeNodeJSObject('reatc-transition-group', fakeReactJSTransitionGroupFactory())
};
