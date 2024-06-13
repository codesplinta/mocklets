

  /* @HINT: Jest v27.x+ no longer supports `jasmine` so check before proceeding */
  if  (global.jasmine) {
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
