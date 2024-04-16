export const fakeNextJSRouterPackageFactory = () => {
  const mockRouterPush = jest.fn()
  const mockRouterBack = jest.fn()
  const mockRouterReload = jest.fn()
  const mockRouterPrefetch = jest.fn()
  const mockRouterReplace = jest.fn()
  let _query = {}

  const router = jest.fn().mockReturnValue({
    push: mockRouterPush,
    query: _query,
    pathname: '',
    back: mockRouterBack,
    reload: mockRouterReload,
    prefetch: mockRouterPrefetch,
    replace: mockRouterReplace,
    events: { on: jest.fn() },
    isReady: false,
    asPath: ''
  })

  router.setRouterQuery = (query = {}) => {
    _query = Object.assign({}, query)
  }

  return () => ({
    useRouter: router
  })
}
