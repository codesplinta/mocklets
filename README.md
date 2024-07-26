[![Generic badge](https://img.shields.io/badge/Jest-Yes-lightgreen.svg)](https://shields.io/) ![@isocroft](https://img.shields.io/badge/@isocroft-CodeSplinta-blue) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![Made in Nigeria](https://img.shields.io/badge/made%20in-nigeria-008751.svg?style=flat-square)](https://github.com/acekyd/made-in-nigeria)

# mocklets

Reusable standard mocks and fakes for popular browser and Node.js APIs, framework/library objects for [**Jest**](https://jestjs.io/).

## Motivation

Everyone knows how hard software testing setup can be. When it comes to the [testing pyramid](https://www.perfecto.io/blog/testing-pyramid) or [testing polygon](https://example.com), the most amount of work to be done is in creating fixtures (like mocks and fakes) and it can be quite daunting.

The very popular testing frameworks for unit testing and e-to-e tests are good at providing certain building blocks for creating mocks/fakes but how often do we have to rebuild/reconstruct the same building blocks to create the same exact [test doubles](https://en.wikipedia.org/wiki/Test_double#:~:text=In%20test%20automation%2C%20a%20test,the%20rest%20of%20the%20codebase.) (e.g. mocks/stubs(spies)/fakes) for different JavaScript software projects ?

This is where **mocklets** come in.

This project provides re-usable and standard mocks/stubs/fakes for _Jest_ only (Vitest coming soon).

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

>**mocklets** can ONLY run well on [**Node.js**](https://nodejs.org/) v10.0.0 - v19.3.x as well as [**Jest**](https://jestjs.io/) v25.5.1 - v29.5.x

## Getting Started

You can use mocklets inside your jest test suite files simply by importing into these files and calling the functions outside or within the `describe()` callback. You can also make addditional calls within any of `test()` callbacks.

It is important to note that when [Kl](https://tigeroakes.com/posts/jest-mock-and-import-statements/)

## Some Basic Example (on the browser)
>src/greetingMaker/index.js
```js

export default function greetingMaker (subjectFullName = 'John Doe', subjectTitle = 'Mr.') {
   const format = window.localStorage.getItem('greeting:format');
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
  /* @HINT
   * 
   * mock/fake for `new Date()`
   */
  const timekeeper = provisionFakeDateForTests(
    new Date(2024, 0, 2, 12, 34, 55),
    $EXECUTION.IGNORE_RESET_AFTER_EACH_TEST_CASE
  );

  /* @HINT
   *
   * mock/fake for `winodw.localStorage`
   */
  provisionFakeBrowserLocalStorageForTests()

  test('it should return the correct greeting text given no valid format', () => {
    expect(greetingMaker('Diana Obiora', 'Miss.')).toBe(
      'Good afternoon, Miss. Diana Obiora'
    )
  });

  test('it should return the correct greeting text given a valid format', () => {

    timekeeper.travel(new Date(2024, 1, 2, 10, 22, 27))
    window.localStorage.setItem('greeting:format', 'old-fashioned')

    expect(greetingMaker('Samuel Obiora')).toBe(
      'Good day, Mr. Samuel Obiora'
    )
  });
});
```

## More Basic Examples (on the server)

Below are some more ways you can use `mocklets`.

- Imagine we have a simple **ExpressJS** app with one route defined that reads a file from disk and serves the contents down to the http client. See below:

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

- We can write a test for the **ExpressJS** app (using `mocklets`) as follows:

>src/controller/downloads/\__tests\__/getFile.spec.js
```js
import  {
  provisionFakeDateForTests,
  provisionFixturesForTests_withAddons,
  provisionMockedNodeJSFileSystemForTests,
  provisionMockedJSConsoleLoggingForTests,
  $EXECUTION
} from 'mocklets'

jest.mock('fs', () => ({
  ...jest.requireActual('fs')
}));

/* @HINT: 
 *
 * Mocking/Faking the filesystem (in memory)
 * 
 * Always remember, {mocklets} requires the 'fs'
 * module hoisted (as above) !!
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
          ctime: new Date(1411609054470), // Wed Sep 24 2014 18:37:34 GMT-0700 (PDT)
          mtime: new Date(1411609054470) // Wed Sep 24 2014 18:37:34 GMT-0700 (PDT)
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
 * Since, the 'getFile' module makes use of `res.sendFile()`,
 * It has to be imported after mocking the filesystem (as above)
 */
import getFile from '../../getFile';



describe('Testing `getFile()` ExpressJS app controller action', () => {
 /* @HINT
  *
  * ExpressJS request, response and next fixtures/fakes will be extracted
  * from here ( i.e. `getTextFixtures(...)` ).
  */
  const { getTestFixtures } = provisionFixturesForTests_withAddons()
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
  * Here, we'll be mocking/faking only `console.log()`
  */
  provisionMockedJSConsoleLoggingForTests(
    $EXECUTION.DELAYED_LOGGING,
    [ 'log' ]
  );

 /* @HINT:
  *
  * 
  * The `new Date()` mock/fake here is frozen in time for the tests
  */
  provisionFakeDateForTests(
    new Date(2024, 1, 4, 11, 24, 10),
    $EXECUTION.IGNORE_RESET_AFTER_EACH_TEST_CASE
  );

  test(
    "should send error as http response to client if file doesn't exist | [expressHttpRequest, expressHttpResponse, expressNext]",
    () => {
      /* @NOTE: Arrange */
      const req  = getTestFixture('expressHttpRequest', {
        params: {
          /* @HINT:
           *
           * 
           * Misspell the name of the file as http request params
           * (on purpose)
           */
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
    "should send file as http response to client if file exists | [expressHttpRequest, expressHttpResponse, expressNext]",
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

- Imagine we created a simple function called: `isLocalHost()` to check if a web page is served from _localhost_. See below:

>src/helpers/index.js
```js

export const isLocalHost = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return ["http://localhost", "http://127.0.0.1"].includes(
    window.location.origin.replace(/\:[\d$]{4,5}/, "")
  ) || Boolean(
      window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
  )
};
```

- We could write a unit test for the `isLocalHost()` function (using `mocklets`) as follows:

```js
import {
  provisionFakeBrowserURILocationForTests_withAddons
} from 'mocklets'

import {
  isLocalHost
} from './src/helpers/index'

describe('Tests for isLocalHost() function', () => {
  const {
    $setWindowOrigin_forThisTestCase
  } = provisionFakeBrowserURILocationForTests_withAddons()

  it('should return `false` if page host isn\'t localhost', () => {
    $setWindowOrigin_forThisTestCase('https://example.com')

    expect(isLocalHost()).toBe(false)
  });

  it('should return `true` if page host is localhost', () => {
    $setWindowOrigin_forThisTestCase('http://localhost')

    expect(isLocalHost()).toBe(true)
  })
})
```

## Usage
Setting up **mocklets** for use is very easy. All you need is to import the relavant API to provision whatever mock/fake you need and let **mocklets**  handdle  the rest.

- Let's take a simple test case

>So, instead of doing this below...

```js
import {
  getUserFromStorage
} from '../../utils'

describe('Test getUserFromStorage function', () => {
  /* eslint-disable-next-line no-proto */
  jest.spyOn(window.sessionStorage.__proto__, 'getItem').mockImplementationOnce((key) => {
    if (key === 'user') {
      return '{ "lastname": "Ebeihie", "firstname" : "Jonah", "gender": "male" }'
    }
  });

  it('should return the user object', () => {
    expect(
      getUserFromStorage()
    ).toBe('{ "lastname": "Ebeihie", "firstname" : "Jonah", "gender": "male" }')
  })
})
```

>It's better to do this...

```js
import {
  provisionFakeBrowserSessionStorageForTests
} from 'mocklets'

import {
  getUserFromStorage
} from '../../utils'

describe('Test getUserFromStorage function', () => {
  /* @HINT
   *
   * mock/fake for `window.sessionStorage`
   */
  provisionFakeBrowserSessionStorageForTests()

  it('should return the user object', () => {
    window.sessionStorage.setItem(
      "user",
      '{ "lastname": "Ebeihie", "firstname" : "Jonah", "gender": "male" }'
    )

    expect(
      getUserFromStorage()
    ).toBe('{ "lastname": "Ebeihie", "firstname" : "Jonah", "gender": "male" }')
  })
})
```

- Now, let's take a **NextJS** project test case

>Again, instead of doing the following...

```tsx
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';

import * as router from 'next/router';
import type { NextRouter } from 'next/router';

import {
  asButton,
  articlePage_editButtonName,
  articlePage_backButtonName
} from '../../../constants';
import MyArticleComponentUsingNextRouter from '../../pages/blog/article/[articleId]';
import { dummyArticleId } from '../__fixtures__/forArticles';

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/';

describe('Test article page logic', () => {
  const mockPush = jest.fn(() => undefined);
  const mockBack = jest.fn(() => undefined);

  beforeEach(() => {
    mockPush.mockClear()
    mockBack.mockClear()
  });

  it('should navigate to edit-article page', async () => {
    jest.spyOn(router, 'useRouter').mockImplementation(() => ({
      query: {
        id: dummyArticleId
      },
      push: mockPush,
    } as never as NextRouter));

    const { getByRole } = render(
      <MyArticleComponentUsingNextRouter />
    )
    
    /* @HINT: Use ARIA attributes and constants so test code isn't tightly coupled to application code */
    /* @NOTE: Imports; `asButton` = 'button' and `articlePage_editButton` = 'edit' */
    fireEvent.click(getByRole(asButton, { name: articlePage_editButtonName }));

    await waitFor(
      () => expect(
        mockPush
      ).toHaveBeenCalledWith(
        `/blog/article/edit/${dummyArticleId}`
      )
    );
  });

  it('should navigate back to article page', async () => {
    jest.spyOn(router, 'useRouter').mockImplementation(() => ({
      query: {
        id: dummyArticleId
      },
      pathname: `/blog/article/edit/${dummyArticleId}`,
      back: mockback
    } as never as NextRouter));

    const { getByRole } = render(
      <MyArticleComponentUsingNextRouter />
    )
    
    /* @HINT: Use ARIA attributes and constants so test code isn't tightly coupled to application code */
    /* @NOTE: Imports; `asButton` = 'button' and `articlePage_backButton` = 'back' */
    fireEvent.click(getByRole(asButton, { name: articlePage_backButtonName }));

    await waitFor(
      () => expect(
        back
      ).toHaveBeenCalledTimes(1)
    );
  });
});
```

>It's much better to do this...

```tsx
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';

import * as router from 'next/router';
import { NextRouter } from 'next/router';

import {
  provisionMockedNextJSRouterForTests_withAddons,
  provisionEnvironmentalVariablesForTests_withAddons,
  $EXECUTION
} from 'mocklets';

import {
  asButton,
  articlePage_editButtonName,
  articlePage_backButtonName
} from '../../../constants';
import MyArticleComponentUsingNextRouter from '../../pages/blog/article/[articleId]';
import { dummyArticleId } from '../__fixtures__/forArticles';


describe('Test article page for my blog', () => {

  const { 
    $setSpyOn_useRouter_withReturnValueOnce
  } = provisionMockedNextJSRouterForTests_withAddons();
  const {
    $setEnv_forThisTestSuite
  } = provisionEnvironmentalVariablesForTests_withAddons(
    $EXECUTION.IGNORE_RESET_AFTER_EACH_TEST_CASE
  );

  $setEnv_forThisTestSuite('NEXT_PUBLIC_API_URL', 'http://localhost:3000/');



  it('should navigate to edit-article page', async () => {
    /* @NOTE: Arrange */
    const { push }: NextRouter = $setSpyOn_useRouter_withReturnValueOnce(
      {
        query: {
          id: dummyArticleId
        },
      },
      router
    );

    /* @NOTE: Arrange */
    const { getByRole } = render(
      <MyArticleComponentUsingNextRouter />
    )
    
    /* @NOTE: Act */

    /* @HINT: Use ARIA attributes and constants so test code isn't tightly coupled to application code */
    /* @NOTE: Imports; `asButton` = 'button' and `articlePage_editButton` = 'edit' */
    fireEvent.click(getByRole(asButton, { name: articlePage_editButtonName }));

    /* @NOTE: Assert */
    await waitFor(
      () => expect(
        push
      ).toHaveBeenCalledWith(
        `/blog/article/edit/${dummyArticleId}`
      )
    );
  });

  it('should navigate back to article page', async () => {
    /* @NOTE: Arrange */
    const { back }: NextRouter = $setSpyOn_useRouter_withReturnValueOnce(
      {
        query: {
          id: dummyArticleId
        },
        pathname: `/blog/article/edit/${dummyArticleId}`,
      },
      router
    );

    /* @NOTE: Arrange */
    const { getByRole } = render(
      <MyArticleComponentUsingNextRouter />
    )
    
    /* @NOTE: Act */

    /* @HINT: Use ARIA attributes and constants so test code isn't tightly coupled to application code */
    /* @NOTE: Imports; `asButton` = 'button' and `articlePage_editButton` = 'edit' */
    fireEvent.click(getByRole(asButton, { name: articlePage_editButtonName }));

    /* @NOTE: Assert */
    await waitFor(
      () => expect(
        back
      ).toHaveBeenCalledTimes(1)
    );
  });
});
```

## Setting up for Jest
To be able to use mocklets with the most ease and clarity, it is advised the you set up the [Jest configuration for `setupFilesAfterEnv`](https://jest-archive-august-2023.netlify.app/docs/26.x/configuration/#setupfilesafterenv-array).

**mockelts** exposes a jest setup file inside an _.export_ folder.

See example (below) of how to set it up inside a `jest.config.js` file:

>jest.config.js
```js
module.exports = {
  testTimeout: 90000,
  workerIdleMemoryLimit: '512MB',
  cacheDirectory: '<rootDir>/.jest-cache',
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    // https://jestjs.io/docs/webpack#mocking-css-modules
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle image imports
    // https://jestjs.io/docs/webpack#handling-static-assets
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: [
    /*! The mocklets jest setup file should be the first entry into the array */
    '<rootDir>/node_modules/mocklets/.export/jest.setup.js',
    '<rootDir>/setupJestTests.ts'
  ],
}
```

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
