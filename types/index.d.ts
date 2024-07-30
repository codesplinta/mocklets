/// <reference types="./express-http-custom" />
/// <reference types="./next-router-custom" />
/// <reference types="./next-api-custom" />
/// <reference types="./next-auth-custom" />
/// <reference types="./react-hook-form-custom" />

// Type definitions for mocklets v0.0.6
// Project: https://github.com/codesplinta/mocklets

import { VirtualConsole } from 'jsdom';

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

// support TS under 3.5
type _Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

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
 * @return void
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
 * A helper utility that enables the use of `window.WebSocket` and a mock server for test cases
 *
 * @param {String} webSocketServerUrl
 * @param {Function} mockFactoryCallback
 *
 * @return {{ webSocketServerMock: Object }}
 * @api public
 */
  export function provisionMockedWebSocketClientAndServerForTests(
    webSocketServerUrl: string,
    mockFactoryCallback: (server: WebSocketServer) => void
  ): { webSocketServerMock: WebSocketServer | null };
/**
 * A helper utility that enables the use of fake browser API: `window.IntersectionObserver` within tests
 *
 * @return void
 * @api public
 */
  export function provisionFakeBrowserIntersectionObserverForTests(): void;
/**
 * A helper utility that enables the use of fake browser API: `window.ResizeObserver` within tests
 *
 * @return void
 * @api public
 */
  export function provisionFakeBrowserResizeObserverForTests(): void;
/**
 * A helper utility that enables the use of fake browser API: `window.matchMedia` within tests
 *
 * @return void
 * @api public
 */
  export function provisionFakeBrowserMatchMediaForTests(): void;
/**
 * A helper utility that enables the use of fake browser API: `window.alert()`, `window.confirm()`
 * & `window.prompt()` within tests 
 * 
 * @returns void
 * @api public
 */
  export function provisionFakeBrowserDialogForTests(
    type: 'alert' | 'confirm' | 'prompt',
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
 * @return void
 * @api public
 */
  export function provisionMockedReacti18NextForTests(
    translationMapCallback: () => Record<string, string>
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
 * @return void
 * @api public
 */
  export function provisionMockedMaterialUIKitForTests(): void;
/**
 * A helper utility that enables the use of mock NextJS router package within tests that returns addons
 *
 * @param {1 | 0} clearAfterEach
 * 
 * @return {{ $getAllRouterEventsMap: Function, $setSpyOn_useRouter: Function, $setSpyOn_useRouter_WithReturnValueOnce: Function }}
 * @api public
 */
  export function provisionMockedNextJSRouterForTests_withAddons(clearAfterEach?: 1 | 0): {
    $getAllRouterEventsMap(): Record<import('.next/router').RouterEvent, -1 | 1>;
    $setSpyOn_useRouter(nextRouter: {
      useRouter(): import('.next/router').NextRouter,
      withRouter(): {}
    }): () => import('.next/router').NextRouter;
    $setSpyOn_useRouter_withReturnValueOnce(
      options: {
        pathname: string,
        locale?: string,
        isPreview?: boolean,
        basePath?: string,
        query?: Record<string, string | string[]>
      },
      nextRouter?: {
        useRouter(): import('.next/router').NextRouter,
        withRouter(): {}
      },
      nextNavigation?: {}
    ): import('.next/router').NextRouter
  }
/**
 * A helper utility that enables the use of mock react-hook-form package within tests that returns addons
 *
 * @return {{ $setSpyOn_useForm: Function, $setSpyOn_useFrom_withReturnValueOnce: Function }}
 * @api public
 */
  export function provisionMockedReactHookFormForTests_withAddons():{
    $setSpyOn_useForm(): import('.react-hook-form').UseFormReturn,
    $setSpyOn_useFrom_withReturnValueOnce(
      options: {
        formStateErrors?: {},
        values?: {}
      }
    ): import('.react-hook-form').UseFormReturn
  }
/**
 * A helper utility that enables the use of mock `cloudinary.v2` package : require('cloudinary').v2 within tests
 * 
 * @return void
 * @api public
 */
 export function provisionMockedNodeJSCloudinaryForTests(): void;
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
 * @return void
 * @api public
 */
  export function provisionMockedWinstonLoggerForTests(): void;
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
 * @return Timekeeper | null
 * @api public
 */
  export function provisionFakeDateForTests(
    date: Date,
    resetAfterEach?: 1 | 0
  ): Timekeeper | null;

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
      fixtureKey?: 'expressHttpRequest' | 'expressHttpResponse' |  'expressNext' | 'nextApiRequest' | 'nextApiResponse' | & string,
      extraFixturesState?: Partial<F>
    ): F,
    mutateTestFixture<F extends Record<string, unknown>>(
      fixtureKey: string,
      currentFixtureState?: Partial<F>
    ): void
  }

/**
 * A helper utility that enables the use of environmental variables loaded only for test cases
 *
 * @return {{ $setEnv_forThisTestSuite: Function }}
 * @api public
 */
  export function  provisionEnvironmentalVariablesForTests_withAddons(): {
    $setEnv_forThisTestSuite(variableName: string, variableValue: string): void;
  }

/**
 * A helper utility that enables the use of mock filesystem targeting the 'node:fs' package only for test cases
 * 
 * @param {Function} mockFactoryCallback
 * 
 * @return {{ nodeFileSystemMock: Object }}
 * @api public
 */
  export function provisionMockedNodeJSFileSystemForTests(
    mockFactoryCallback: (
      mock: typeof import('mock-fs'),
      path: import('path').PlatformPath
    ) => void
  ): { nodeFileSystemMock: typeof import('mock-fs') | null }

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