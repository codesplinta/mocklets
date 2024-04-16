[![Generic badge](https://img.shields.io/badge/Jest-Yes-lightgreen.svg)](https://shields.io/) ![@isocroft](https://img.shields.io/badge/@isocroft-CodeSplinta-blue) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

# mocklets

Reusable standard mocks and fakes for popular browser and Node.js APIs, framework/library objects for [**Jest**](https://jestjs.io/).

## Motivation

Everyone knows how hard software testing setup can be. When it comes to the [testing pyramid](https://www.perfecto.io/blog/testing-pyramid) or [testing polygon](https://example.com), the most amount of work to be done is in creating fixtures (like mocks and fakes) and it can be quite daunting.

The very popular testing frameworks for unit testing and e-to-e tests are good at providing certain building blocks for creating mocks/fakes but how often do we have to rebuild/reconstruct the same building blocks to create the same exact [test doubles](https://en.wikipedia.org/wiki/Test_double#:~:text=In%20test%20automation%2C%20a%20test,the%20rest%20of%20the%20codebase.) (e.g. mocks/stubs(spies)/fakes) for different JavaScript software projects ? This is where **mocklets** come in.

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

## Getting Started

You can use mocklets inside your jest test suite files simply by importing into these files and calling the functions within the `describe()` callback before any of `test()` routine calls.

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

>src/greetingMaker/tests/greetingMaker.spec.js
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

## License

MIT License

## Contributing

If you wish to contribute to this project, you are very much welcome. Please, create an issue first before you proceed to create a PR (either to propose a feature or fix a bug). Make sure to clone the repo, checkout to a contribution branch and build the project before making modifications to the codebase.

Run all the following command (in order they appear) below:

```bash

$ npm run lint

$ npm run build

$ npm run test
```
