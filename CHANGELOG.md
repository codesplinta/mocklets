<a name="0.1.1"></a>
# 0.1.1 (2025-03-26)

### Feature Added

### Enhancements
- [Added `example.env` file to document environmental variables](https://github.com/codesplinta/mocklets/pull/2) used in **mocklets**

### WIP (Work-in-progress)
- Adding `middleware` fake **Redux**
- Adding **NextJS** middleware request/response mock objects
- Adding fakes and mocks for `app` and `BrowserWindow` objects in **electron**

### Bug Fixes

<a name="0.1.0"></a>
# 0.1.0 (2024-09-30)

### Feature Added
- Refactored code logic to only include dynamic `require()` calls for testing-related third-party packages
- Added support for **NextJS** API routes request/response mock object
- [Breaking Change]; Public APIs modified: `provisionMockedMaterialUIKitForTests()`, `provisionMockedHttpServerForTests()`

### WIP (Work-in-progress)
- Adding `middleware` fake **Redux**
- Adding **NextJS** middleware request/response mock objects

### Bug Fixes
- Fixed invalid build in v0.0.6

<a name="0.0.6"></a>
# 0.0.6 (2024-09-18)

### Feature Added
- Added `provisionMockedNextJSRouterForTests_withAddons()` helper function
- Added `provisionMockedReactHookFormForTests_withAddons()` helper function
- Added `provisionFakeBrowserResizeObserverForTests()` helper function
- Added `provisionEnvironmentalVariablesForTests_withAddons()` helper function
- Added `provisionFixturesForTests_withAddons()` helper function (WIP: "`(req, res, next)` fakes for **ExpressJS**" - v0.0.5)
- Added `provisionMockedJSConsoleLoggingForTests()` helper function
- Added `provisionMockedNodeJSFileSystemForTests()` helper function
- Added `provisionFakeBrowserMatchMediaForTests()` helper function
- Added `provisionMockedReacti18NextForTests()` helper function
- Added `provisionFakeBrowserURILocationForTests_withAddons()` helper function
- Added `provisionFakeBrowserDialogForTests()` helper function
- Added `provisionMockedMaterialUIKitForTests()` helper function
- Added `provisionMockedWebSocketClientAndServerForTests()` helper function
- Added `provisionMockedHttpServerForTests()` helper function
- Added `provisionMockedNodeJSCloudinaryForTests()` helper function (WIP: "`Cloudinary.uploader` fake **Cloudinary**" - v0.0.5)

### WIP (Work-in-progress)
- Adding `middleware` fake **Redux**

### Bug Fixes
- Fixed bug in `provisionFakeBrowserIntersectionObserverForTests()` helper function

<a name="0.0.5"></a>
# 0.0.5 (2024-05-05)

### Feature Added
- Added `provisionMockedAdonisJSv4CacheForTests()` helper function

### WIP (Work-in-progress)
- Adding `Cloudinary.uploader` fake **Cloudinary**
- Adding `(req, res, next)` fakes for **ExpressJS**

### Bug Fixes
- Fixed issue (error) with `provisionFakeBrowserIntersectionObserverForTests()` helper function: **disconnect() is not defined**

<a name="0.0.4"></a>
# 0.0.4 (2024-04-17)

### Feature Added
- None

### Bug Fixes
- Fixed error `Cannot find module 'timekeeper' from 'node_modules/mocklets/dist/mocklets.cjs.js'`.

<a name="0.0.3"></a>
# 0.0.3 (2024-04-16)

### Feature Added
- None

### Bug Fixes
- Fixed bug with `browserStorage` fake object.

<a name="0.0.2"></a>
# 0.0.2 (2023-04-16)

### Feature Added
- None

### Bug Fixes
- Exposed missing TypeScript declaration file

<a name="0.0.1"></a>
# 0.0.1 (2023-04-16)

### Feature Added
- Added `provisionMockedDateForTests()` helper function.
- Added `provisionFakeBrowserSessionStorageForTests()` helper function.
- Added `provisionFakeBrowserLocalStorageForTests()` helper function.
- Added `provisionFakeBrowserIntersectionObserverForTests()` helper function.
- Added `provisionMockedNextJSRouterForTests()` helper function.
- Added `provisionMockedWinstonLoggerForTests()` helper function.
- Added `provisionMockedPinoLoggerForTests()` helper function.
- Added `provisionMockedReactTransitionGroupForTests()` helper function.
- Added `provisionFakeDateForTests()` helper function.

### Bug Fixes
- None
