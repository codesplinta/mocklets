// Type definitions for mocklets v0.0.1
// Project: https://github.com/codesplinta/mocklets

interface Timekeeper {
    freeze(date?: Date | number | string): void;
    travel(date?: Date | number | string): void;
    reset(): void;
    isKeepingTime(): boolean;
    withFreeze<T>(date: Date | number | string | undefined, callback: ()=>T): T;
}

declare module 'mocklets' {
/**
 * A helper utility that enables the use of static mock dates within tests
 *
 * @param {() => number | Date} callback
 * @param {1 | 0} resetAfterEach
 *
 * @return void
 * @api public
 */
  export function provisionMockedDateForTests(callback: (() => number | Date), resetAfterEach?: 1 | 0): void;
/**
 * A helper utility that enables the use of fake browser API: `window.sessionStorage` within tests
 *
 * @param {1 | 0} clearAfterEach
 * 
 * @return void
 * @api public
 */
  export function provisionFakeBrowserSessionStorageForTests(clearAfterEach?: 1 | 0): void;
/**
 * A helper utility that enables the use of fake browser API: `window.localStorage` within tests
 * 
 * @param {1 | 0} clearAfterEach
 *
 * @return void
 * @api public
 */
  export function provisionFakeBrowserLocalStorageForTests(clearAfterEach?: 1 | 0): void;
/**
 * A helper utility that enables the use of fake browser API: `window.Intersection` within tests
 *
 * @param {1 | 0} resetAfterEach
 *
 * @return void
 * @api public
 */
 export function provisionFakeBrowserIntersectionObserverForTests(resetAfterEach?: 1 | 0): void;
/**
 * A helper utility that enables the use of mock NextJS router hook: `useRouter()` within tests
 *
 * @return void
 * @api public
 */
  export function provisionMockedNextJSRouterForTests(): void;
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
 * @return Timekeeper
 * @api public
 */
  export function provisionFakeDateForTests(date: Date, resetAfterEach?: 1 | 0): Timekeeper;
}