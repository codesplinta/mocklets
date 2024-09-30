/// <reference types="./msw-custom" />
/// <reference types="./express-http-custom" />
/// <reference types="./next-router-custom" />
/// <reference types="./next-api-custom" />
/// <reference types="./next-auth-custom" />
/// <reference types="./react-hook-form-custom" />

// Type definitions for mocklets v0.0.7
// Project: https://github.com/codesplinta/mocklets

import { VirtualConsole } from 'jsdom';
import { SetupServerApi } from 'msw/lib/node';

declare global {
  interface Window {
    _virtualConsole: VirtualConsole;
  }

  interface File extends Blob {
    readonly lastModified: number;
    readonly name: string;
  }
  
  interface FileList {
    readonly length: number;
    item(index: number): File | null;
    [index: number]: File;
  }
}

type JSObject = { [key: string]: unknown };

type JSONObject<D = JSObject> = object | Record<keyof D, string | boolean | number | null | undefined>;

// support TS under 3.5
type _Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Represents the result of a single call to a mock function with a return value.
 */
 interface MockResultReturn<T> {
  type: "return";
  value: T;
}
/**
* Represents the result of a single incomplete call to a mock function.
*/
interface MockResultIncomplete {
  type: "incomplete";
  value: undefined;
}
/**
* Represents the result of a single call to a mock function with a thrown error.
*/
interface MockResultThrow {
  type: "throw";
  value: any;
}

type MockResult<T> = MockResultReturn<T> | MockResultThrow | MockResultIncomplete;

interface MockContext<T, Y extends any[], C = any> {
  /**
   * List of the call arguments of all calls that have been made to the mock.
   */
  calls: Y[];
  /**
   * List of the call contexts of all calls that have been made to the mock.
   */
  contexts: C[];
  /**
   * List of all the object instances that have been instantiated from the mock.
   */
  instances: T[];
  /**
   * List of the call order indexes of the mock. Jest is indexing the order of
   * invocations of all mocks in a test file. The index is starting with `1`.
   */
  invocationCallOrder: number[];
  /**
   * List of the call arguments of the last call that was made to the mock.
   * If the function was not called, it will return `undefined`.
   */
  lastCall?: Y;
  /**
   * List of the results of all calls that have been made to the mock.
   */
  results: Array<MockResult<T>>;
}

type RejectedValue<T> = T extends PromiseLike<any> ? any : never;
type ResolvedValue<T> = T extends PromiseLike<infer U> ? U | T : never;

interface MockInstance<T, Y extends any[], C = any> {
  /** Returns the mock name string set by calling `mockFn.mockName(value)`. */
  getMockName(): string;
  /** Provides access to the mock's metadata */
  mock: MockContext<T, Y, C>;
  /**
   * Resets all information stored in the mockFn.mock.calls and mockFn.mock.instances arrays.
   *
   * Often this is useful when you want to clean up a mock's usage data between two assertions.
   *
   * Beware that `mockClear` will replace `mockFn.mock`, not just `mockFn.mock.calls` and `mockFn.mock.instances`.
   * You should therefore avoid assigning mockFn.mock to other variables, temporary or not, to make sure you
   * don't access stale data.
   */
  mockClear(): this;
  /**
   * Resets all information stored in the mock, including any initial implementation and mock name given.
   *
   * This is useful when you want to completely restore a mock back to its initial state.
   *
   * Beware that `mockReset` will replace `mockFn.mock`, not just `mockFn.mock.calls` and `mockFn.mock.instances`.
   * You should therefore avoid assigning mockFn.mock to other variables, temporary or not, to make sure you
   * don't access stale data.
   */
  mockReset(): this;
  /**
   * Does everything that `mockFn.mockReset()` does, and also restores the original (non-mocked) implementation.
   *
   * This is useful when you want to mock functions in certain test cases and restore the original implementation in others.
   *
   * Beware that `mockFn.mockRestore` only works when mock was created with `jest.spyOn`. Thus you have to take care of restoration
   * yourself when manually assigning `jest.fn()`.
   *
   * The [`restoreMocks`](https://jestjs.io/docs/en/configuration.html#restoremocks-boolean) configuration option is available
   * to restore mocks automatically between tests.
   */
  mockRestore(): void;
  /**
   * Returns the function that was set as the implementation of the mock (using mockImplementation).
   */
  getMockImplementation(): ((...args: Y) => T) | undefined;
  /**
   * Accepts a function that should be used as the implementation of the mock. The mock itself will still record
   * all calls that go into and instances that come from itself – the only difference is that the implementation
   * will also be executed when the mock is called.
   *
   * Note: `jest.fn(implementation)` is a shorthand for `jest.fn().mockImplementation(implementation)`.
   */
  mockImplementation(fn?: (...args: Y) => T): this;
  /**
   * Accepts a function that will be used as an implementation of the mock for one call to the mocked function.
   * Can be chained so that multiple function calls produce different results.
   *
   * @example
   *
   * const myMockFn = jest
   *   .fn()
   *    .mockImplementationOnce(cb => cb(null, true))
   *    .mockImplementationOnce(cb => cb(null, false));
   *
   * myMockFn((err, val) => console.log(val)); // true
   *
   * myMockFn((err, val) => console.log(val)); // false
   */
  mockImplementationOnce(fn: (...args: Y) => T): this;
  /**
   * Temporarily overrides the default mock implementation within the callback,
   * then restores its previous implementation.
   *
   * @remarks
   * If the callback is async or returns a `thenable`, `withImplementation` will return a promise.
   * Awaiting the promise will await the callback and reset the implementation.
   */
  withImplementation(fn: (...args: Y) => T, callback: () => Promise<unknown>): Promise<void>;
  /**
   * Temporarily overrides the default mock implementation within the callback,
   * then restores its previous implementation.
   */
  withImplementation(fn: (...args: Y) => T, callback: () => void): void;
  /** Sets the name of the mock. */
  mockName(name: string): this;
  /**
   * Just a simple sugar function for:
   *
   * @example
   *
   *   jest.fn(function() {
   *     return this;
   *   });
   */
  mockReturnThis(): this;
  /**
   * Accepts a value that will be returned whenever the mock function is called.
   *
   * @example
   *
   * const mock = jest.fn();
   * mock.mockReturnValue(42);
   * mock(); // 42
   * mock.mockReturnValue(43);
   * mock(); // 43
   */
  mockReturnValue(value: T): this;
  /**
   * Accepts a value that will be returned for one call to the mock function. Can be chained so that
   * successive calls to the mock function return different values. When there are no more
   * `mockReturnValueOnce` values to use, calls will return a value specified by `mockReturnValue`.
   *
   * @example
   *
   * const myMockFn = jest.fn()
   *   .mockReturnValue('default')
   *   .mockReturnValueOnce('first call')
   *   .mockReturnValueOnce('second call');
   *
   * // 'first call', 'second call', 'default', 'default'
   * console.log(myMockFn(), myMockFn(), myMockFn(), myMockFn());
   */
  mockReturnValueOnce(value: T): this;
  /**
   * Simple sugar function for: `jest.fn().mockImplementation(() => Promise.resolve(value));`
   */
  mockResolvedValue(value: ResolvedValue<T>): this;
  /**
   * Simple sugar function for: `jest.fn().mockImplementationOnce(() => Promise.resolve(value));`
   *
   * @example
   *
   * test('async test', async () => {
   *  const asyncMock = jest
   *    .fn()
   *    .mockResolvedValue('default')
   *    .mockResolvedValueOnce('first call')
   *    .mockResolvedValueOnce('second call');
   *
   *  await asyncMock(); // first call
   *  await asyncMock(); // second call
   *  await asyncMock(); // default
   *  await asyncMock(); // default
   * });
   */
  mockResolvedValueOnce(value: ResolvedValue<T>): this;
  /**
   * Simple sugar function for: `jest.fn().mockImplementation(() => Promise.reject(value));`
   *
   * @example
   *
   * test('async test', async () => {
   *   const asyncMock = jest.fn().mockRejectedValue(new Error('Async error'));
   *
   *   await asyncMock(); // throws "Async error"
   * });
   */
  mockRejectedValue(value: RejectedValue<T>): this;

  /**
   * Simple sugar function for: `jest.fn().mockImplementationOnce(() => Promise.reject(value));`
   *
   * @example
   *
   * test('async test', async () => {
   *  const asyncMock = jest
   *    .fn()
   *    .mockResolvedValueOnce('first call')
   *    .mockRejectedValueOnce(new Error('Async error'));
   *
   *  await asyncMock(); // first call
   *  await asyncMock(); // throws "Async error"
   * });
   */
  mockRejectedValueOnce(value: RejectedValue<T>): this;
}

type ArgsType<T> = T extends (...args: infer A) => any ? A : never;

interface SpyInstance<T = any, Y extends any[] = any, C = any> extends MockInstance<T, Y, C> {}

interface Timekeeper {
  freeze(date?: Date | number | string): void;
  travel(date?: Date | number | string): void;
  reset(): void;
  isKeepingTime(): boolean;
  withFreeze<T>(date: Date | number | string | undefined, callback: ()=>T): T;
}

interface EventTarget {
  listeners: any;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
  dispatchEvent(evt: Event): boolean;
  removeEventListener(type: string, listener?: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
}

interface WebSocketCallbackMap {
  close: () => void;
  error: (err: Error) => void;
  message: (message: string | Blob | ArrayBuffer | ArrayBufferView) => void;
}

interface CloseOptions {
  code: number;
  reason: string;
  wasClean: boolean;
}

interface EmitOptions {
  websockets: Client[];
}

interface ToReturnObject {
  to: (chainedRoom: any, chainedBroadcaster: any) => ToReturnObject;
  emit(event: Event, data: any): void;
}

interface ServerOptions {
  mock?: boolean;
  verifyClient?: () => boolean;
  selectProtocol?: (protocols: string[]) => string | null;
}

interface Client extends _Omit<WebSocket, 'close'> {
  target: WebSocket;
  close(options?: CloseOptions): void;
  on<K extends keyof WebSocketCallbackMap>(type: K, callback: WebSocketCallbackMap[K]): void;
  off<K extends keyof WebSocketCallbackMap>(type: K, callback: WebSocketCallbackMap[K]): void;
}

/* @CHECK: https://github.com/jestjs/jest/issues/7774#issuecomment-626217091 */
declare namespace jasmine {
  const currentTest: {
    id: string;
    description: string;
    fullName: string;
    failedExpectations: {
      actual: string;
      error: Error;
      expected: string;
      matcherName: string;
      message: string;
      passed: boolean;
      stack: string;
    }[];
    passedExpectations: unknown[];
    pendingReason: string;
    testPath: string;
  };
}

declare module 'mocklets' {
  function withRouter<P extends import('.next/router').WithRouterProps, C extends import('.next/router').BaseContext = import('.next/router').NextPageContext>(
    ComposedComponent: import('.next/router').NextComponentType<C, any, P>
  ): import('react').ComponentType<import('.next/router').ExcludeRouterProps<P>>;

  class WebSocketServer extends EventTarget {
    constructor(url: string, options?: ServerOptions);
  
    readonly options?: ServerOptions;
  
    stop(callback?: () => void): void;
    mockWebsocket(): void;
    restoreWebsocket(): void;
  
    on(type: string, callback: (socket: Client) => void): void;
    off(type: string, callback: (socket: Client) => void): void;
    close(options?: CloseOptions): void;
    emit(event: string, data: any, options?: EmitOptions): void;
  
    clients(): Client[];
    to(room: any, broadcaster: any, broadcastList?: object): ToReturnObject;
    in(any: any): ToReturnObject;
    simulate(event: string): void;
  
    static of(url: string): WebSocketServer;
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
  export function provisionMockedDateForTests(
    callback: (() => number | Date),
    resetAfterEach?: 1 | 0
  ): void;
/**
 * A helper utility that enables the use of fake browser API: `window.sessionStorage` within tests
 *
 * @param {1 | 0} clearAfterEach
 * 
 * @returns void
 * @api public
 */
  export function provisionFakeBrowserSessionStorageForTests(
    clearAfterEach?: 1 | 0
  ): void;
/**
 * A helper utility that enables the use of fake browser API: `window.localStorage` within tests
 * 
 * @param {1 | 0} clearAfterEach
 *
 * @return void
 * @api public
 */
  export function provisionFakeBrowserLocalStorageForTests(
    clearAfterEach?: 1 | 0
  ): void;
/**
 * A helper utility that enables the use of HTTP a mock server for test cases
 *
 * @param {Function} mockFactoryCallback
 * @param {String} type
 *
 * @returns void
 * @api public
 */
  export function provisionMockedHttpServerForTests(
    mockFactoryCallback: (router: import('.msw').router, passthrough?: typeof import('.msw').passthrough) => import('.msw').SetupServerApi,
    type?: 'http' | 'graphql'
  ): void;
/**
 * A helper utility that enables the use of `window.WebSocket` and a mock server for test cases
 *
 * @param {Function} mockFactoryCallback
 * @param {String} webSocketServerUrl
 *
 * @returns {{ webSocketServerMock: Object }}
 * @api public
 */
  export function provisionMockedWebSocketClientAndServerForTests(
    mockFactoryCallback: (server: WebSocketServer) => void,
    webSocketServerUrl: string
  ): { webSocketServerMock: WebSocketServer | null };
/**
 * A helper utility that enables the use of fake browser API: `window.IntersectionObserver` within tests
 *
 * @returns void
 * @api public
 */
  export function provisionFakeBrowserIntersectionObserverForTests(): void;
/**
 * A helper utility that enables the use of fake browser API: `window.ResizeObserver` within tests
 *
 * @returns void
 * @api public
 */
  export function provisionFakeBrowserResizeObserverForTests(): void;
/**
 * A helper utility that enables the use of fake browser API: `window.matchMedia` within tests
 *
 * @returns void
 * @api public
 */
  export function provisionFakeBrowserMatchMediaForTests(): void;
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
  export function provisionFakeBrowserDialogForTests(
    type: 'alert' | 'confirm' | 'prompt' | 'open',
    returnType?: boolean
  ): void;
/**
 * A helper utility that enables the use of fake browser API: `window` URI-based APIs within tests
 *
 * @return {{ $setWindowOrigin_forThisTestCase: Function }}
 * @api public
 */
 export function provisionFakeBrowserURILocationForTests_withAddons(): {
  $setWindowOrigin_forThisTestCase (newOrigin: string): void;
 }
/**
 * A helper utility that enables the use of mock i18n for ReactJS: `react-i18next` within tests
 *
 * @returns void
 * @api public
 */
  export function provisionMockedReacti18NextForTests(
    translationMapCallback: () => Record<string, Record<string, string>>
  ): void;
/**
 * A helper utility that enables the use of mock NextJS router package within tests
 *
 * @return void
 * @api public
 */
  export function provisionMockedNextJSRouterForTests(): void;
/**
 * A helper utility that enables the use of mock Material UI kit: `@mui/material` within tests
 * 
 * @return {{ $setSpyOn_useMediaQuery_withMockImplementation: Function }}
 * @api public
 */
  export function provisionMockedMaterialUIKitForTests(): {
    $setSpyOn_useMediaQuery_withMockImplementation (): void;
  };
/**
 * A helper utility that enables the use of mock NextJS router package within tests that returns addons
 *
 * @param {1 | 0} clearAfterEach
 * 
 * @return {{ $getAllRouterEventsMap: Function, $setSpyOn_useRouter: Function, $setSpyOn_withRouter: Function, $setSpyOn_useRouter_WithReturnValueOnce: Function }}
 * @api public
 */
  export function provisionMockedNextJSRouterForTests_withAddons(clearAfterEach?: 1 | 0): {
    $getAllRouterEventsMap(): Record<import('.next/router').RouterEvent, -1 | 1>;
    $setSpyOn_useRouter(): SpyInstance<import('.next/router').NextRouter, ArgsType<void>>;
    $setSpyOn_withRouter(): SpyInstance<ReturnType<typeof withRouter>, ArgsType<typeof withRouter>>
    $setSpyOn_useRouter_withReturnValueOnce(
      options: {
        pathname: string,
        locale?: string,
        isPreview?: boolean,
        basePath?: string,
        query?: Record<string, string | string[]>
      }
    ): import('.next/router').NextRouter
  }
/**
 * A helper utility that enables the use of mock react-hook-form package within tests that returns addons
 *
 * @return {{ $setSpyOn_useForm: Function, $setSpyOn_useForm_withMockImplementation: Function }}
 * @api public
 */
  export function provisionMockedReactHookFormForTests_withAddons():{
    $setSpyOn_useForm(): SpyInstance<import('.react-hook-form').UseFormReturn, ArgsType<import('.react-hook-form').UseFormProps>>,
    $setSpyOn_useForm_withMockImplementation<V>(
      options: {
        formStateErrors?: import('.react-hook-form').FormState<JSONObject<V>>,
        values?: JSONObject<V>
      }
    ): import('.react-hook-form').UseFormReturn<V>
  }
/**
 * A helper utility that enables the use of mock `cloudinary.v2` package : require('cloudinary').v2 within tests
 * 
 * @return void
 * @api public
 */
 export function provisionMockedNodeJSCloudinaryForTests(

 ): void;
/**
 * A helper utility that enables the use of mock AdonisJS v4 cache package : `require('adonis-cache')` within tests
 *
 * @return void
 * @api public
 */
  export function provisionMockedAdonisJSv4CacheForTests(): void;
/**
 * A helper utility that enables the use of mock server-side logger: `winston` within tests
 *
 * @return {{ $setSpyOn_winstonLogger_withMockImplementation: Function }}
 * @api public
 */
  export function provisionMockedWinstonLoggerForTests(): {
    $setSpyOn_winstonLogger_withMockImplementation(): void
  };
/**
 * A helper utility that enables the use of mock server-side logger: `pino` within tests
 *
 * @return void
 * @api public
 */
  export function provisionMockedPinoLoggerForTests(): void;
/**
 * A helper utility that enables the use of mock CSS transition for ReactJS: `react-transition-group` within tests
 *
 * @return void
 * @api public
 */
  export function provisionMockedReactTransitionGroupForTests(): void;
/**
 * A helper utility that enables the use of controllable fake dates within tests
 *
 * @param {Date} date
 * @param {1 | 0} resetAfterEach
 *
 * @see https://stackoverflow.com/a/47781245
 * 
 * @return `{ timePiece: Timekeeper | null }`
 * @api public
 */
  export function provisionFakeDateForTests(
    date: Date,
    resetAfterEach?: 1 | 0
  ): { readonly timePiece : Timekeeper | null };

/**
 * A helper utility that enables the use of fixtures loaded from this package and elsewhere
 *
 * @param {1 | 0} resetAfterEach
 * 
 * @return {{ getTestFixtures: Function, mutateTestFixture: Function }}
 * @api public
 */
  export function provisionFixturesForTests_withAddons(
    resetAfterEach?: 1 | 0
  ): {
    getTestFixtures<F extends Function | Record<string, unknown>>(
      fixtureKey?: 'nextApiRequest' | 'nextApiResponse' | 'expressHttpRequest' | 'expressHttpResponse' |  'expressNext' | (string & {}),
      extraFixturesState?: Partial<F>
    ): F
  }

/**
 * A helper utility that enables the use of environmental variables loaded only for test cases
 *
 * @return {{ $setEnv_forThisTestSuite: Function }}
 * @api public
 */
  export function  provisionEnvironmentalVariablesForTests_withAddons(): {
    $setEnv_forThisTestSuite(
      variableName: string,
      variableValue: string
    ): void;
  }

/**
 * A helper utility that enables the use of mock filesystem targeting the 'node:fs' package only for test cases
 * 
 * @param {Function} mockFactoryCallback
 * 
 * @return {{ nodeJsFileSystemMock: Object }}
 * @api public
 */
  export function provisionMockedNodeJSFileSystemForTests(
    mockFactoryCallback: (
      mock: typeof import('mock-fs'),
      path: import('path').PlatformPath
    ) => void
  ): { nodeJsFileSystemMock: typeof import('mock-fs') | null }

/**
 * A helper utility that enables the use of mock/fakes for `console` logging only for test cases
 * 
 * @param {(-1 | 2 | 3)=} loggingStrategy
 * @param {(Array.<String>)=} consoleAPIsToMock
 * 
 * @return void
 * @api public
 */
  export function provisionMockedJSConsoleLoggingForTests(
    loggingStrategy: -1 | 2 | 3,
    consoleAPIsToMock: ('log' | 'error' | 'info' | 'assert')[]
  ): void;

  export const enum $EXECUTION {
    DELAYED_LOGGING = 2,
    COMPACT_LOGGING = 3,
    NORMAL_LOGGING = -1,
    RESET_AFTER_EACH_TEST_CASE = 1,
    IGNORE_RESET_AFTER_EACH_TEST_CASE = 0
  }
}