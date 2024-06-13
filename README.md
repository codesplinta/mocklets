[![Generic badge](https://img.shields.io/badge/Jest-Yes-lightgreen.svg)](https://shields.io/) ![@isocroft](https://img.shields.io/badge/@isocroft-CodeSplinta-blue) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![Made in Nigeria](https://img.shields.io/badge/made%20in-nigeria-008751.svg?style=flat-square)](https://github.com/acekyd/made-in-nigeria)

# mocklets

Reusable standard mocks and fakes for popular browser and Node.js APIs, framework/library objects for [**Jest**](https://jestjs.io/).

## Motivation

Everyone knows how hard software testing setup can be. When it comes to the [testing pyramid](https://www.perfecto.io/blog/testing-pyramid) or [testing polygon](https://example.com), the most amount of work to be done is in creating fixtures (like mocks and fakes) and it can be quite daunting.

The very popular testing frameworks for unit testing and e-to-e tests are good at providing certain building blocks for creating mocks/fakes but how often do we have to rebuild/reconstruct the same building blocks to create the same exact [test doubles](https://en.wikipedia.org/wiki/Test_double#:~:text=In%20test%20automation%2C%20a%20test,the%20rest%20of%20the%20codebase.) (e.g. mocks/stubs(spies)/fakes) for different JavaScript software projects ?

This is where **mocklets** come in.

This project provides re-usable and standard mocks/stubs/fakes for _Jest_ only.

## Installation
>Install using `npm`

```bash
   npm install mocklets
```

Or install using `yarn`

```bash
   yarn add mocklets
```

## Support

>**mockelts** can ONLY run well on Node.js v10.0.0 to Node.js v19.3.x as well as Jest v25.5.1 to Jest 29.5.x

## Getting Started

You can use mocklets inside your jest test suite files simply by importing into these files and calling the functions outside or within the `describe()` callback. You can also make addditional calls within any of `test()` callbacks.

It is important to note that when 

## Some Basic Example (on the browser)
>src/greetingMaker/index.js
```js

export default function greetingMaker (subjectFullName = 'John Doe', subjectTitle = 'Mr.') {
   const format = window.sessionStorage.getItem('greeting:format');
   const today = new Date();
   const hourOfToDay = today.getHours();

   let salutation = "Good evening";

   if (hourOfToDay < 12) {
      salutation = "Good morning";
   }

   if (hourOfToDay >= 12 && hourOfToDay <= 16) {
      salutation = "Good afternoon";
   }

   if (format === "old-fashioned") {
     salutation = "Good day";
   }

   return `${saluation}, ${subjectTitle} ${subjectFullName}`;
}
```

>src/greetingMaker/\__tests\__/greetingMaker.spec.js
```js
import {
  provisionFakeBrowserSessionStorageForTests,
  provisionFakeDateForTests,
  $EXECUTION
} from 'mocklets';

import greetingMaker from '../';

describe('{greetingMaker(..)} | Unit Test Suite', () => {

  const timekeeper = provisionFakeDateForTests(
    new Date(2024, 0, 2, 12, 34, 55),
    $EXECUTION.IGNORE_RESET_AFTER_EACH_TEST_CASE
  );

  provisionFakeBrowserSessionStorageForTests(
    $EXECUTION.RESET_AFTER_EACH_TEST_CASE
  )

  test('it should return the correct greeting text given no valid format', () => {

    expect(greetingMaker('Diana Obiora', 'Miss.')).toBe(
      'Good afternoon, Miss. Diana Obiora'
    )
  });

  test('it should return the correct greeting text given a valid format', () => {

    timekeeper.travel(new Date(2024, 1, 2, 10, 22, 27))
    window.sessionStorage.setItem('greeting:format', 'old-fashioned')

    expect(greetingMaker('Samuel Obiora')).toBe(
      'Good day, Mr. Samuel Obiora'
    )
  });
});
```

## More Basic Examples (on the server)

Below are some more ways you can use `mockelts`.

>src/controller/downloads/getFile.js
```js
module.exports = function (req, res, next) {
  const options = {
    root: path.join(__dirname, 'public'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

  const fileName = req.params.name

  res.sendFile(`${fileName}.txt`, options, function (error) {
    if (error) {
      next(error)
    } else {
      console.log('Sent:', fileName)
    }
  })
}
```

>src/index.js
```js
'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const getFile = require('./controllers/downloads/getFile.js')

const app = express();

app.use(bodyParser.json());

app.get('/fetch/file/:name', getFile);

app.listen(8080, function() {
  console.log('Server started');
});
```

>src/controller/downloads/\__tests\__/getFile.spec.js
```js
import  {
  provisionFakeDateForTests,
  provisionFixturesForTests_withAddons,
  provisionMockedNodeJSFileSystemForTests,
  provisionMockedJSConsoleLoggingForTests,
  $EXECUTION
} from 'mocklets'

/* @HINT: 
 *
 * Mocking/Faking the filesystem (in memory)
 * 
 * Always remember, for all imported packages,
 * {mocklets} depends on manual hoisting!!
 */
provisionMockedNodeJSFileSystemForTests((mock, path, require) => {
  const expressJSPublicFolderPath = require.resolve(
    path.join(__dirname, '../../../../public')
  )

  mock({
    [expressJSPublicFolderPath]: mock.directory({
      mode: 0755,
      items: {
        'open-scape.txt': mock.file({
          content: 'Hello World!',
          ctime: new Date(1411609054470), //Wed Sep 24 2014 18:37:34 GMT-0700 (PDT)
          mtime: new Date(1411609054470) //Wed Sep 24 2014 18:37:34 GMT-0700 (PDT)
        }),
        '.DS_store': { mode: parseInt('444', 8), content: '' },
        'pixies.png': Buffer.from([8, 6, 7, 5, 3, 0, 9])
      }
    })
  })
});

/* @HINT:
 *
 *
 * Remember that we are importing 'getFile' ES module
 * here because {mocklets} uses manual hoisting to
 * set mocks up as opposed to automatic mocking used
 * by Jest + Babel
 * 
 * Since, the 'getFile' module makes use of `res.sendFile()`,
 * I have to import it after mocking the filesystem (above)
 */
import getFile from '../../getFile';

/* @HINT:
 *
 * 
 * Always provision `console.log/warn/error/...` after loading
 * 
 * The 'Delayed Logging' strategy will still push your logs to the console.
 * 
 * You'll still be able to see them all in time
 * however, only after the test case has run.
 * 
 * We'll be mocking/faking only `console.log()`
 */
provisionMockedJSConsoleLoggingForTests(
  $EXECUTION.DELAYED_LOGGING,
  [ 'log' ]
);

/* @HINT:
 *
 * 
 * The date mock/fake here is frozen in time for the tests
 */
provisionFakeDateForTests(
  new Date(2024, 1, 4, 11, 24, 10),
  $EXECUTION.IGNORE_RESET_AFTER_EACH_TEST_CASE
);

const { getTestFixtures } = provisionFixturesForTests_withAddons()


describe('...', () => {
  test(
    '... | [expressHttpRequest, expressHttpResponse, expressNext]',
    () => {
      /* @NOTE: Arrange */
      const req  = getTestFixture('expressHttpRequest', {
        params: {
          /* @HINT:
           *
           * 
           * Misspell the name of the file as http request params
           * (on purpose)
           * */
          name: 'open-spacey'
        }
      })
      const res = getTestFixture('expressHttpResponse', {
        locals: {
          id: '273993'
        }
      })
      const nextErrorSpy = jest.fn()
      const next = getTestFixture('expressNext',  nextErrorSpy)

      /* @NOTE: Act */
      getFile(req, res, next)


      /* @NOTE: Assert */
      expect(req.sendFile).toHaveBeenCalled();
      expect(req.sendFile).toHaveBeenCalledWith(
        'open-spacey.txt',
        expect.objectContaining({
          dotfiles: 'deny',
          headers: {
            'x-timestamp': 1707042250000,
            'x-sent': true
          }
        }),
        expect.any(Function)
      )

      expect(console.log).not.toHaveBeenCalled();

      expect(nextErrorSpy).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error))
  })

  test(
    '... | [expressHttpRequest, expressHttpResponse, expressNext]',
    () => {
      /* @NOTE: Arrange */
      const req  = getTestFixture('expressHttpRequest', {
        params: {
          name: 'open-scape'
        }
      })
      const res = getTestFixture('expressHttpResponse', {
        locals: {
          id: '273993'
        }
      })
      const nextErrorSpy = jest.fn()
      const next = getTestFixture('expressNext',  nextErrorSpy)


      /* @NOTE: Act */
      getFile(req, res, next)


      /* @NOTE: Assert */
      expect(req.sendFile).toHaveBeenCalled();
      expect(req.sendFile).toHaveBeenCalledWith(
        'open-scape.txt',
        expect.objectContaining({
          dotfiles: 'deny',
          headers: {
            'x-timestamp': 1707042250000,
            'x-sent': true
          }
        }),
        expect.any(Function)
      )

      expect(console.log).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Sent:', 'open-scape')

      expect(nextErrorSpy).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
  })
})
```

## Usage

It's important to not that `mockelets` depends heavily on **manual hoisting** for it to work. Usually, Jest and Babel work together to automatocally hoist mocks on the test file. However, `mocklets` takes a different approach using
`jest.doMock()` instead of `jest.mock()` to avoidd automatic hoisting at all costs.

...

## License

Apache License 2.0

## Contributing

If you wish to contribute to this project, you are very much welcome. Please, create an issue first before you proceed to create a PR (either to propose a feature or fix a bug). Make sure to clone the repo, checkout to a contribution branch and build the project before making modifications to the codebase.

Run all the following command (in order they appear) below:

```bash

$ npm run lint

$ npm run build

$ npm run test
```
