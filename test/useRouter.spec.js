import {
  provisionFakeBrowserURILocationForTests_withAddons
} from '../index'
import { provisionFakeWebPageWindowObject } from './.helpers/utils'
import { fakeNextJSRouterPackageFactory } from '../src/jest/next/router.js'
/* eslint-env jest */

const { $setWindowOrigin_forThisTestCase } = provisionFakeBrowserURILocationForTests_withAddons()

describe('Tests for NextJS useRouter', () => {
  provisionFakeWebPageWindowObject(
    'location'
  )

  let useRouteEventsMap = {}
  let routerFactory = () => ({});

  const initializeRouterState = ({ query = {}, pathname = "/", isPreview = false }) => {
    const $router = (routerFactory().useRouter())

    $router.query = query
    $router.asPath = pathname
    $router.isPreview = isPreview

    return $router;
  };

  beforeAll(() => {
    routerFactory = fakeNextJSRouterPackageFactory(
      useRouteEventsMap
    )
  });

  afterEach(() => {
    useRouteEventsMap = {}
    routerFactory = fakeNextJSRouterPackageFactory(
      useRouteEventsMap
    )
  });
  
  it('should assert that `useRouter` can be initialized and push an entry in and out of the fake history while updating window object', () => {
    $setWindowOrigin_forThisTestCase("https://localhost:3000");
    const router = initializeRouterState({ pathname = "/home" });
    //router.push("/about");
    
    //expect(window.location.pathname).toBe("/about")
    //expect(router.pathname).toBe("/about")
  
    //router.back();

    
    //expect(window.location.pathname).toBe("/home")
    //expect(router.pathname).toBe("/home")
  })

  it('should assert that `useRouter` can be initialized and fire the `beforePopState(...)` callback', () => {
    $setWindowOrigin_forThisTestCase("https://localhost:3000")
    const router = initializeRouterState({ pathname = "/home" });
    //const routerCallback = jest.fn(() => undefined);
    //const browserCallback = jest.fn(() => undefined);
    
    //router.beforePopState(routerCallback);
    //window.addEventListener('popstate', browserCallback, false);
    //router.back();

    //expect(browserCallback).toHaveBeenCalled()
    //expect(browserCallback).toHaveBeenCalledTimes(1)
    //expect(routerCallback).toHaveBeenCalled()
    //expect(routerCallback).toHaveBeenCalledTimes(1)
  })

  it('should assert that `useRouter` can be intialized and fire "routeChangeStart" event properly', () => {
    $setWindowOrigin_forThisTestCase("https://localhost:3000")
    const router = initializeRouterState({ pathname = "/home" });
    //const routerCallback = jest.fn(() => undefined);

    //router.events.on('routeChangeStart', routerCallback);
    //router.push("/about")

    //expect()
  });
})
