import { provisionFakeBrowserURILocationForTests_withAddons } from "../index";
import { provisionFakeWebPageWindowObject } from "./.helpers/utils";
import { fakeNextJSRouterPackageFactory } from "../src/jest/next/router";
/* eslint-env jest */

const {
  $setWindowOrigin_forThisTestCase,
} = provisionFakeBrowserURILocationForTests_withAddons();

describe("Tests for NextJS `useRouter`", () => {
  provisionFakeWebPageWindowObject("location");

  let useRouteEventsMap = {};
  let routerFactory = () => ({});

  const initializeRouterState = ({
    query = {},
    pathname = "/",
    isPreview = false,
  }) => {
    const $router = routerFactory().useRouter();

    $router.query = query;
    $router.asPath = pathname;
    $router.isPreview = isPreview;

    return $router;
  };

  beforeAll(() => {
    routerFactory = fakeNextJSRouterPackageFactory(useRouteEventsMap);
  });

  afterEach(() => {
    useRouteEventsMap = {};
    routerFactory = fakeNextJSRouterPackageFactory(useRouteEventsMap);
  });

  it("should assert that `useRouter` can be initialized and push an entry in and out of the fake history while updating window object", () => {
    $setWindowOrigin_forThisTestCase("http://localhost:3300");
    const router = initializeRouterState({ pathname: "/home" });
    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerpush */
    router.push("/about");

    expect(window.location.pathname).toBe("/about");
    expect(router.pathname).toBe("/about");

    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerback */
    router.back();

    expect(window.location.pathname).toBe("/home");
    expect(router.pathname).toBe("/home");
  });

  it("should assert that `useRouter` can be initialized and fire the `beforePopState(...)` callback properly", () => {
    $setWindowOrigin_forThisTestCase("http://localhost:3300");
    const router = initializeRouterState({ pathname: "/home" });
    const routerCallback = jest.fn(() => undefined);
    const browserCallback = jest.fn(() => undefined);

    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerbeforepopstate */
    router.beforePopState(routerCallback);
    window.addEventListener("popstate", browserCallback, false);

    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerpush */
    router.push("/contact/new");
    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerback */
    router.back();

    expect(browserCallback).toHaveBeenCalled();
    expect(browserCallback).toHaveBeenCalledTimes(1);
    expect(routerCallback).toHaveBeenCalled();
    expect(routerCallback).toHaveBeenCalledTimes(1);

    window.removeEventListener("popstate", browserCallback, false);
  });

  it('should assert that `useRouter` can be intialized and fire "routeChangeStart" event properly', () => {
    $setWindowOrigin_forThisTestCase("http://localhost:3300");
    const router = initializeRouterState({ pathname: "/home" });
    const routerCallback = jest.fn(() => undefined);

    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerevents */
    router.events.on("routeChangeStart", routerCallback);

    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerpush */
    router.push("/about");

    expect(routerCallback).toHaveBeenCalled();
    expect(routerCallback).toHaveBeenCalledTimes(1);
    expect(routerCallback).toHaveBeenCalledWith("/about", { shallow: false })

    expect(router.pathname).toBe("/about");
  });

  it('should assert that `useRouter` can be intialized and fire "routeChangeComplete" event properly', () => {
    $setWindowOrigin_forThisTestCase("http://localhost:3300");
    const router = initializeRouterState({ pathname: "/home" });
    const routerCallback = jest.fn(() => undefined);

    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerevents */
    router.events.on("routeChangeComplete", routerCallback);

    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerpush */
    router.push("/about");

    expect(routerCallback).toHaveBeenCalled();
    expect(routerCallback).toHaveBeenCalledTimes(1);
    expect(routerCallback).toHaveBeenCalledWith("/about", { shallow: false })

    expect(router.pathname).toBe("/about");
  });

  it('should assert that `useRouter` can be initialized and fire "routeChangeError" event properly', () => {
    $setWindowOrigin_forThisTestCase("http://localhost:3300");
    const router = initializeRouterState({ pathname: "/home" });
    const routerCallback = jest.fn(() => undefined);
    const routerCallbackThrowingError = () => {
      throw new Error("cancel route loading...")
    };

    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerevents */
    router.events.on("routeChangeStart", routerCallbackThrowingError)
    router.events.on("routeChangeError", routerCallback);

    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerpush */
    router.push("/invalid-route");

    expect(routerCallback).toHaveBeenCalled();
    expect(routerCallback).toHaveBeenCalledTimes(1);

    expect(router.pathname).toBe("/invalid-route");
  });

  it('should assert that `useRouter` can be initialized and fire "beforeHistoryChange" event properly', () => {
    $setWindowOrigin_forThisTestCase("http://localhost:3300");
    const router = initializeRouterState({ pathname: "/home" });
    const routerCallback = jest.fn(() => undefined);

    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerevents */
    router.events.on("beforeHistoryChange", routerCallback);

    /* @HINT+reference: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerpush */
    router.push("/about");

    expect(routerCallback).toHaveBeenCalled();
    expect(routerCallback).toHaveBeenCalledTimes(1);

    expect(router.pathname).toBe("/about");
  });
});
