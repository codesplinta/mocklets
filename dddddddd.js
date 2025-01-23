// Taken and adjusted from from how @chakra-ui builds their components
// https://github.com/chakra-ui/chakra-ui/blob/620f0b7d756ffb6bfc6ddf0459e96f774ffbb9be/babel.config.js
const BABEL_ENV = process.env.BABEL_ENV;
const isCommonJS = BABEL_ENV !== undefined && BABEL_ENV === 'cjs';
const isESM = BABEL_ENV !== undefined && BABEL_ENV === 'esm';

module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      '@babel/env',
      {
        loose: true,
        modules: isCommonJS ? 'commonjs' : false,
        targets: {
          esmodules: isESM ? true : undefined
        }
      }
    ],
    '@babel/preset-typescript',
    '@babel/preset-react'
  ];

  return {
    presets
  };
};

{
    "name": "react-busser-headless-ui",
    "version": "1.1.37",
    "description": "...",
 
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/types/index.d.ts",
  "typings": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/cjs/index.js",
      "default": "./dist/esm/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build-icons": "yarn build:esm && yarn build:cjs && yarn build:types",
    "build-icons:esm": "cross-env BABEL_ENV=esm babel components --extensions .tsx -d dist/esm --source-maps",
    "build-icons:cjs": "cross-env BABEL_ENV=cjs babel components --extensions .tsx -d dist/cjs --source-maps",
    "build-icons:types": "tsc --emitDeclarationOnly --declaration --declarationDir dist/types",
    "update-icons:components": "node scripts/updateComponents.mjs",
    "test": "jest --env=jsdom --passWithNoTests tests/ --runInBand",
    "clean": "rm -rf node_modules & rm -f package-lock.json & rm -f yarn.lock & rm -rf dist"
  },
  "devDependencies": {
    "@babel/cli": "^7.12.0",
    "@babel/core": "^7.12.10",
    "@babel/preset-env": "^7.12.0",
    "@babel/preset-react": "^7.12.0",
    "@babel/preset-typescript": "^7.12.0",
    "@babel/runtime": "^7.12.0",
    "@svgr/core": "^5.5.0",
    "@svgr/plugin-jsx": "^5.5.0",
    "@svgr/plugin-prettier": "^5.5.0",
    "@svgr/plugin-svgo": "^5.5.0",
    "@testing-library/jest-dom": "^5.12.0",
    "@testing-library/react": "^11.2.6",
    "@types/react": "^17.0.5",
    "@types/react-dom": "^17.0.3",
    "cross-env": "7.0.3",
    "jest": "26.6.3",
    "jest-environment-jsdom": "26.6.2",
    "node-fetch": "^2.6.1",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "title-case": "^3.0.3",
    "ts-jest": "26.4.4",
    "typescript": "^4.1.3"
  }
}
