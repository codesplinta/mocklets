[![Generic badge](https://img.shields.io/badge/Jest-Yes-lightgreen.svg)](https://shields.io/) ![@isocroft](https://img.shields.io/badge/@isocroft-CodeSplinta-blue) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

# mocklets

Reusable standard mocks and fakes for popular browser and Node.js APIs, framework/library objects for [**Jest**](https://jestjs.io/).

## Motivation

Everyone knows how hard software testing setup can be. When it comes to the [testing pyramid](https://www.perfecto.io/blog/testing-pyramid), the most amount of work to be done is in creating fixtures (like mocks and fakes) and it can be quite daunting. The very popular testing frameworks for unit testing and e-to-e tests are good at providing the building blocks for creating mocks/fakes but how often do we have reuse the same building blocks to create the same exact mocks/stubs(spies)/fakes for different projects ? This is where **mocklets** come in. This project is a monorepo that provides usable and standard mocks/stubs/fakes for _Jest_ only.

## Installation
>Install using `npm`

```bash
   npm install mocklets/jest
```

Or install using `yarn`

```bash
   yarn add mocklets/jest
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
