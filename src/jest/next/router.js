export const fakeNextJSRouterPackageFactory = () => {

  const mockRouterPush = jest.fn()
  const mockRouterBack = jest.fn()
  const _query = {}

  const router =  jest.fn().mockReturnValue({
    push: mockRouterPush,
    query: _query,
    back: mockRouterBack
  })

  router.setRouterQuery = (query = {}) => _query = Object.assign({}, query)

  return () => ({
    useRouter: router
  })
};

     
