// see: https://github.com/jsdom/jsdom/blob/main/Changelog.md#1151
//import 'yet-another-abortcontroller-polyfill'

// see: https://github.com/jsdom/jsdom/issues/1724
import 'whatwg-fetch';

if (window.fetch) {
  const _fetch = window.fetch;

  window.fetch = function (url, options = {}) {
    // see: https://github.com/JakeChampion/fetch?tab=readme-ov-file#caveats
    return _fetch(url, Object.assign({}, {
      credentials: 'same-origin'
    }, options))
  }
}

// There should be a single listener which simply prints to the
// console. We will wrap that listener in our own listener.
const listeners = window._virtualConsole.listeners('jsdomError');
const originalListener = listeners && listeners[0];

window._virtualConsole.removeAllListeners('jsdomError');

// Add a new listener to swallow JSDOM errors that orginate from clicks on anchor tags.
window._virtualConsole.addListener('jsdomError', error => {
  if (
    error.type !== 'not implemented' &&
    error.message !== 'Not implemented: navigation (except hash changes)' &&
    originalListener
  ) {
    originalListener(error);
  }

  // swallow error
});

/* @HINT: Jest v27.x+ no longer supports `jasmine` so check before proceeding */
if (global.jasmine) {
  /* @NOTE: Patch tests to include their own name */
  jasmine.getEnv().addReporter({
    specStarted: result => jasmine.currentTest = result,
    specDone: result => jasmine.currentTest = result,
  });
} else {
  /* @NOTE: Create a useless matcher just to extract `this.currentTestName` */ 
  expect.extend({
    to_$et(actual, expected) {
      if (
        typeof actual === 'undefined' ||
        typeof expected === 'undefined'
      ) {
        throw new TypeError(this.currentTestName);
      }

      return { message: '...', pass: true };
    },
  });
}
