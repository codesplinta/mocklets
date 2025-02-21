[![Generic badge](https://img.shields.io/badge/Jest-Yes-lightgreen.svg)](https://shields.io/) ![@isocroft](https://img.shields.io/badge/@isocroft-CodeSplinta-blue) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![Made in Nigeria](https://img.shields.io/badge/made%20in-nigeria-008751.svg?style=flat-square)](https://github.com/acekyd/made-in-nigeria)

# mocklets

This package helps you write tests using **Jest** (and **Vitest** - coming soon!) with much less boilerplate than you are currently used to. Much of this boilerplate is in the mocks you have to setup and use in your tests. It also helps to reduce friction with test assertions for side effects (or outputs) that are harder to assert on. By creating fakes and/or mocks that are reusable and also pass as **Jest** stubs making it easy to assert on them.

Therefore, **mocklets** is a set of reusable standard mocks (and [fakes](https://blog.pragmatists.com/test-doubles-fakes-mocks-and-stubs-1a7491dfa3da)) for popular browser APIs, Node.js APIs and framework/library objects for [**Jest**](https://jestjs.io/). This library creates a seamless bridge between **Jest**, **JSDOM** and **Popular Thrid-party JS libraries** (e.g. `fetch()`, `localStorage`, `console.log()`, `window.location.href`, `window.open()`, `window.confirm()`, `new ResizeObserver()`, [MUI](https://mui.com/material-ui/getting-started/), [Nextjs](https://nextjs.org/docs), [react-hook-form](https://react-hook-form.com), [ExpressJS](https://expressjs.com/en/5x/api.html#express) e.t.c) used for building apps such that you don't have to think about how and what you need/require to setup your testing space to write tests.

You can now write your **Jest** tests a lot more faster and better than before.

## Preamble

So, **mocklets** as stated earlier is simply something that helps removes unnecessary heavy boilerplate and assertion friction when writing tests in **Jest**. But why and how does it help to remove all these ?

When writing tests, we have to assert on the side effects (or outputs) from our **Jest** test cases that has just run. Sometimes, it is easy to assert these side effects (or outputs) if they are in a place that is easy to access (e.g. `window.localStoraget.getItem(...)` if the output from our test case was set into local storage like using `window.localStorage.setItem(...)`)

Other times, it is not so easy. We have to setup **Jest** _**stubs**_ (i.e. testing tools that record when they are called, what they are called with and how many times they are called). Yet, when we want to verify these things from when third-party libraries/APIs are called, it's not easy because these third-party libraries/APIs are not wrapped with Jest #stubs that record these calls so we can easily assert the side effect from running our code in these test cases.

Plus, we don't always want to run the real thing (i.e. the real implementation of these third-party libraries/APIs) in our tests every time. We want to run a fake version or a mock version that behaves like the real implementation simply because it's cheaper to run. Also, since #Jest uses JSDOM which isn't a real browser environment, the real implementation might get stuck somehow.

So, **mocklets** is a bridge between faking out these third-party libries/APIs and making them test-friendly in a Jest/JSDOM environment.

For instance, `window.location.href` when set to a new url value in a real browser causes navigation so JSDOM doesn't really allow for it to be set to a new url value. But **mocklets** turns this around using some JS tricks make it possible to set `window.location.href` to a new url value making it easy to assert if `window.location.href` was changed during the running of your test case.

Again, **mocklets** also does the same for the `useForm()` hook from **react-hook-form** third-party library. Within your test environment, `useForm()` becomes a fake implementation that returns a **Jest** _**stub**_ object that can asserted on.

Finally, **mocklets** does the same for the JS object returned by the **NextJS** hook: `useRouter()` when called. Now, you can easily assert that `back()` or `push()` was called since `back()` or `push()` are **Jest** _**stubs**_ based on a fake implementation of `useRouter()`.

## Motivation

Everyone knows how hard software testing setup can be. When it comes to the [testing pyramid](https://www.perfecto.io/blog/testing-pyramid) or [testing polygon](https://x.com/isocroft/status/1834250591456927848), the most amount of work to be done is in creating fixtures or building mocks and fakes which can be quite daunting.

The very popular testing frameworks for unit testing and e-to-e tests are good at providing certain building blocks for creating mocks/fakes but how often do we have to rebuild/reconstruct the same building blocks to create the same exact (usually from scratch) materials in each test suite in order to make [test doubles](https://en.wikipedia.org/wiki/Test_double#:~:text=In%20test%20automation%2C%20a%20test,the%20rest%20of%20the%20codebase.) (e.g. mocks/stubs(spies)/fakes) available for different JavaScript software projects ?

This is where **mocklets** come in.

This project provides re-usable and standard mocks/stubs/fakes for _Jest_ only (Vitest coming soon).

Finally, sometimes, **Jest** and **JSDOM** don't play nice and **JSDOM** has browser APIs that are not yet implemented or badly implemented (see list [here](https://github.com/tmobile/jest-jsdom-browser-compatibility/blob/master/README.md)). **mocklets** tries to shield you from these issues so you don't have to deal with them.

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

>**mocklets** can ONLY run well on [**Node.js**](https://nodejs.org/) v12.2.0 - v19.3.x as well as [**Jest**](https://jestjs.io/) v25.5.1 - v29.5.x

## Getting Started

You can use mocklets inside your jest test suite files simply by importing into these files and calling the functions outside or within the `describe()` callback. You can also make addditional calls within any of `test()` and/or `it()` callbacks.

It is important to note that [**Jest module hoisting**](https://tigeroakes.com/posts/jest-mock-and-import-statements/) is still necessary for **mocklets** to work properly. 

For instance, we can simply hoist **React** in **Jest** by doing this:

```ts
import React from 'react';

jest.mock('react', () => ({
  ...jest.requireActual('react')
}));

const $useRef = (value) => {
  return {
    current: value 
  }
};

jest.spyOn(require('react'), 'useRef').mockImplementationOnce(
  $useRef
);
```

In the same vein, we can also provision **react-hook-form** hooks (when using **mocklets**) by doing this too:

```tsx
import type { UseFormReturn, SubmitHandler } from 'react-hook-form';
import { render, fireEvent } from '@testing-library/react';
import {
  provisionMockedReactHookFormForTests_withAddons
} from 'mocklets'

import Form from '../src/components/UI/regions/Form';

import { toBeArray, toBeEmpty } from 'jest-extended';


expect.extend({ toBeArray, toBeEmpty });  

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form')
}))

describe('Tests for my custom React form', () => {

  const {
    $setSpyOn_useForm_withMockImplementation
  } = provisionMockedReactHookFormForTests_withAddons()

  const stubSubmit = jest.fn() as unknown as SubmitHandler<{ id: number }>;

  beforeEach(() => {
    if ('mockClear' in stubSubmit
      && typeof stubSubmit['mockClear'] === 'function') {
      stubSubmit['mockClear']();
    }
  });

  it('should render the form', () => {
    const { getByTestId } = render(
      <Form onSubmit={stubSubmit} />
    );

    const form = getByTestId("my-form")

    expect(form).toBeInTheDocument()
  })

  it('should submit the form',  () => {
    const { formState }: UseFormReturn = $setSpyOn_useForm_withMockImplementation({
      options: {
        values: {
          id: 345458
        }
      }
    });
    const { getByTestId } = render(
      <Form onSubmit={stubSubmit} />
    );

    const submitButton = getByTestId('submitbutton')

    fireEvent.click(submitButton);

    expect(formState.errors).not.toBeEmpty();
    expect(stubSubmit).toHaveBeenCalled();
  })
})
```
## Avoiding Mocks

The philosophy which **mocklets** operates on is that of avoiding mocks ([test doubles](https://en.wikipedia.org/wiki/Test_double#:~:text=In%20test%20automation%2C%20a%20test,the%20rest%20of%20the%20codebase.) that have no implementation) for as long as possible before choosing them as a last resort. For **mocklets**, the real implementation (and interface) is prefered first. Where it is impractical to use the real implmentation and interface then, fakes ([test doubles](https://en.wikipedia.org/wiki/Test_double#:~:text=In%20test%20automation%2C%20a%20test,the%20rest%20of%20the%20codebase.) that have implementation) are prefered.

This layers of preference is due to the fact that tests have much hgher reliability when either the real implementation or a fake implmentation is used when testing.

Using a fake implementation boosts the confidence of a software engineer in the tests they've written so that it is safer and faster to make changes without worry.

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
  const ticker = provisionFakeDateForTests(
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
    const timekeeper = ticker.timePiece;
 
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
    root: path.join(process.cwd(), '..',  'public'),
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
import { createRequire } from 'module';
import  {
  provisionFakeDateForTests,
  provisionFixturesForTests_withAddons,
  provisionMockedNodeJSFileSystemForTests,
  provisionMockedJSConsoleLoggingForTests,
  $EXECUTION
} from 'mocklets'

function addBodyParserForTests (app) {
  const bodyParser = require('body-parser');
  app.use(bodyParser.json());
}

/* @HINT: 
 *
 * Mocking/Faking the filesystem (in memory)
 * 
 * Always remember, #{mocklets} requires the 'fs'
 * module hoisted (as above) !!
 */
provisionMockedNodeJSFileSystemForTests((mock, path) => {
  const expressJSPublicFolderPath = path.resolve(
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
        '.DS_store': mock.file({ mode: 33188, content: '', birthtime: new Date() }),
        'pixies.png': Buffer.from([8, 6, 7, 5, 3, 0, 9])
      }
    })
  })
});

/* @HINT:
 * 'getFile' is a commonjs module being imported
 * in an ES context. So, we use `createRequire()` 
 * 
 * Since, the 'getFile' module makes use of `res.sendFile()`,
 * It has to be imported after mocking the filesystem (as above)
 */
const require = createRequire(import.meta.url);
const getFile = require('../../getFile');

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
  * however, only after all the test case has run.
  * 
  * Here, we'll be mocking/faking ONLY `console.log()`
  * 
  * We can fake more if we want by just adding it to the
  * array: [ 'log', 'warn', 'error' ]
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
    "should send error as http response to client if file doesn't exist | [fixture: expressHttpRequest, expressHttpResponse, expressNext]",
    () => {
      /* @NOTE: Arrange */
      const req  = getTestFixture('expressHttpRequest', {
        /* @HINT:
         *
         * 
         * Misspell the name of the file as http request params
         * (on purpose)
         */
        params: {
          name: 'open-spacey'
        },
      })
      const res = getTestFixture('expressHttpResponse', {
        locals: {
          id: '273993'
        },
        cookies: [
          '__user_id=ajdjH34u774GDye8w3004993; Path=/; Secure; HttpOnly; SameSite=None;' 
        ]
      })
      const nextErrorSpy = jest.fn()
      const next = getTestFixture('expressNext',  nextErrorSpy)

      /* @INFO: Setup boddy parser for the test for the `getFile` route handler  */
      addBodyParserForTests(req.app)

      /* @INFO: Needed by the ExpressJS fake implementation of `sendFile()` */
      req.next = next;

      /* @NOTE: Act - Execute the ExpressJS route handler */
      getFile(req, res, next)


      /* @NOTE: Assert - Validate assertions */
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
    "should send file as http response to client if file exists | [fixture: expressHttpRequest, expressHttpResponse, expressNext]",
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

      /* @INFO: Setup boddy parser for the test for the `getFile` route handler  */
      addBodyParserForTests(req.app)

      /* @INFO: Needed by the ExpressJS fake implementation of `sendFile()` */
      req.next = next;

      /* @NOTE: Act - Execute the ExpressJS route handler */
      getFile(req, res, next)


      /* @NOTE: Assert - Validate assertions */
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

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router')
}))

describe('Test article page for my blog', () => {
  
  /* @HINT:
   * 
   * Create a factory for Next.js
   * fake `useRouter()` hook that has Jest
   * stub as part of the return object
   * that can record imperative calls.
   */
  const { 
    $setSpyOn_useRouter_withReturnValueOnce
  } = provisionMockedNextJSRouterForTests_withAddons();

  /* @HINT:
   * 
   * Create a setter for `process.env`
   * variables that make it easy to 
   * create test-only values for any
   * environmental variable.
   */
  const {
    $setEnv_forThisTestSuite
  } = provisionEnvironmentalVariablesForTests_withAddons(
    $EXECUTION.IGNORE_RESET_AFTER_EACH_TEST_CASE
  );

  /* @HINT:
   *
   * Create a fkae for the Next.js env variable:
   * 
   * NEXT_PUBLIC_API_URL
   */
  $setEnv_forThisTestSuite('NEXT_PUBLIC_API_URL', 'http://localhost:3000/');


  it('should navigate to edit-article page', async () => {
    /* @NOTE: Arrange */

    /* @HINT: Create a Jest fake for Next.js `useRouter()` hook */
    const { push }: NextRouter = $setSpyOn_useRouter_withReturnValueOnce(
      {
        query: {
          id: dummyArticleId
        },
      }
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
      }
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

## Testing Web Network Connections

With **mocklets**, you can test two types of network requests namely:

- Web Sockets (`ws://`)
- HTTP (`http://`)

Here's an example of each:

#### WebSockets

>src/chatRoom.js
```js

const urlMap = {};

export const createWebSocketClient = (eventOptions = {}) => {
  let _socket = null;

  return {
    connectTo (url = '') {
      if (typeof url !== "string"
        || _socket !== null
          || urlMap.hasOwnProperty(url)) {
        return Promise.reject(_socket);
      }

      return new Promise((resolve, reject) => {
        try {
          _socket = new window.WebSocket(url);

          Object.keys(eventOptions).map((event) => {
            const $callback = eventOptions[event]
            _socket.addEventListener(event, $callback.bind(null, _socket));
          });

          urlMap[url] = _socket.readyState;
          _socket.addEventListener('error', () => {
            delete urlMap[url];
            _socket = null;
            reject(null)
          })
          _socket.addEventListener('open', () => {
            urlMap[url] = _socket.readyState;
            resolve(_socket)
          })
        } catch(_) {
          _socket = null
          reject(_socket);
        }
      })
    },
    sendMessage (message = '') {
      if (typeof message !== "string"
        || _socket === null) {
        return;
      }

      if (urlMap.hasOwnProperty(url)) {
        urlMap[url] = _socket.readyState;
        _socket.send(message);
      }
    }
  }
} 
```

Now, write a test

>tests/integrations/webSocket.spec.js
```js
import {
  provisionMockedJSConsoleLoggingForTests,
  provisionMockedWebSocketClientAndServerForTests,
  $EXECUTION
} from 'mocklets';

import { createWebSocketClient } from '../../src/chatRoom'

/* @HINT:
 *
 * Setup mocking for `console.log(...)`,
 * `console.error(...)` and `console.info(...)`
 * 
 * Compact logging is used to tie logs to specific
 * tests with related prefix text.
 * 
 */
provisionMockedJSConsoleLoggingForTests(
  $EXECUTION.COMPACT_LOGGING,
  [ 'log', 'error', 'info' ]
);
/* @HINT:
 *
 * Setup the mock web sockets server,
 * as well as the client constructor
 */
const handle = provisionMockedWebSocketClientAndServerForTests(
  (serverInstance) => {
    serverInstance.on('connection', (socket) => {
      socket.on('message', () => {
        // @TODO: Provide actual implementation later on...
        socket.send('PING! PING!!')
      });
    })
  },
  'ws://localhost:8080'
);

describe('Test websocket comms', () => {
  it('should connect and recieve data only when connection is alive', () => {
    /** Arrange */
    const client = createWebSocketClient({
      open: (websocket/*, event */) => {
        console.info("Details: ", websocket.url, websocket.readyState)
      },
      error: (websocket/*, event */) => {
        websocket.close();
      },
      close: (/* websocket, event */) => {
        console.error("web socket is closed")
      },
      message: (websocket, event) => {
        if (websocket.readyState === window.WebSocket.OPEN) {
          console.log("Message: ", event.data);
        }
      }
    })


    /** Act */
    client.connectTo("ws://localhost:8080").then(
      () => {
        client.sendMessage("Hello!")
        setTimeout(() => {
          handle.webSocketServerMock.simulate('error')
        }, 0);
      }
    );
    

    /** Assert */
    expect(handle.webSocketServerMock).toBeDefined()
    expect(handle.webSocketServerMock.clients().length).toBe(1)

    setTimeout(() => {
      expect(console.info).toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledWith("Details: ", "ws://localhost:8080", window.WebSocket.OPEN)

      expect(console.log).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith("Message: ", "PING! PING!!")

      expect(console.error).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("web socket is closed");
    }, 1500);
  })
});
```

#### HTTP

>src/apis/getTodos.js
```js

class HttpResponseError extends Error {
  constructor (public message: string, public response: Response) {
    super(message);
    this.response = response
  }
}

export default async function getTodos () {
  let result = null;

  try {
    result = await window.fetch('https://service.tryoptics.com/api/v1/todos', {
      method: 'GET',
      mode: 'no-cors'
    });

    if (!result.ok) {
      throw new HttpResponseError('http server error', result)
    }

    const jsonText = await result.text();

    return JSON.parse(jsonText);
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      console.error(error.message);
    }
  }
}
```

Now, write a test

>test/integrations/httpServer.js
```js
import {
  provisionMockedJSConsoleLoggingForTests,
  provisionMockedHttpServerForTests,
  $EXECUTION
} from 'mocklets';

import { setupServer } from 'msw/node'

import getTodos from '../../src/apis/getTodos'

/* @HINT:
 *
 * Setup mocking for `console.error(...)`
 * and `console.info(...)`
 * 
 */
provisionMockedJSConsoleLoggingForTests(
  $EXECUTION.DELAYED_LOGGING,
  [ 'error', 'info' ]
);
/* @HINT:
 *
 * Setup the mock http server,
 * 
 */
provisionMockedHttpServerForTests((http) => {
  const handlers = [
    http.get('https://service.tryoptics.com/api/v1/todos', () => {
      console.info('Captured a "GET /todos" request')
      return new Response('[ todos! ]')
    }),
    http.delete('https://service.tryoptics.com/api/v1/todos/:id', ({ params }) => {
      console.log(`Captured a "DELETE /todos/${params.id}" request`)
    }),
    http.head('https://service.tryoptics.com/api/v1', () => {
      // Respond with a network error.
      return Response.error()
    })
  ]

  return setupServer(...handlers);
});

describe('Test api comms', () => {

  it('should return todos', async () => {
    /** Assert */
    expect(console.info).toHaveBeenCalled()
    expect(console.info).toHaveBeenCalledTimes(1)
    expect(console.info).toHaveBeenCalledWith('Captured a "GET /todos" request')
    await expect(getTodos()).resolves.toBe('[ todos! ]');
  })
})
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
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$': '<rootDir>/__mocks__/imageFileMock.js',
  },
  setupFilesAfterEnv: [
    /*! The mocklets jest setup file should be the first entry into the array */
    '<rootDir>/node_modules/mocklets/.export/jest.setup.js',
    //'<rootDir>/setupJestTests.ts'
  ],
}
```
**mocklets** makes it easy to use Jest mocks and mock implementations for the popular libraries and packages that you use everyday.

## License

Apache License 2.0

## Contributing

If you wish to contribute to this project, you are very much welcome. Please, create an issue first before you proceed to create a PR (either to propose a feature or fix a bug). Make sure to clone the repo, checkout to a contribution branch and build the project before making modifications to the codebase.

Run all the following command (in order they appear) below:

```bash

$ npm run lint

$ npm run test

$ npm run build
```
