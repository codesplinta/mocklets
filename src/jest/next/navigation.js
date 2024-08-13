import { nextJSuseRouter } from './router'

export const fakeNextJSNavigationPackageFactory = (eventsMap) => {
  const useRouter = nextJSuseRouter(eventsMap)
  return () => ({
    __esModule: true,
    notFound: jest.fn(),
    usePathname: jest.fn().mockImplementation(() => {
      const router = useRouter()
      return router.asPath
    }),
    useSearchParams: jest.fn().mockImplementation(() => {
      const router = useRouter()
      return new URLSearchParams(router.query)
    }),
    useServerInsertedHTML: jest.fn(),
    useRouter
  })
}
