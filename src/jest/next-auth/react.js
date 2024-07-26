export const fakeNextAuthReactPackageFactory = () => {
  const originalModule = jest.requireActual('next-auth/react')
  const defaultSessionDataFixture = {
    isNewCustomer: false,
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: { id: 10000, roles: [], username: 'admin', name: 'super', email: 'admin@co.com' }
  }

  return () => ({
    __esModule: true,
    ...originalModule,
    signIn: jest.fn().mockReturnValue({
      error: undefined,
      status: 200,
      ok: true,
      url: null
    }),
    signOut: jest.fn().mockReturnValue({
      url: 'http://...'
    }),
    useSession: jest.fn().mockReturnValue(
      originalModule.version !== 'v4'
        ? [defaultSessionDataFixture, 'authenticated']
        : { data: defaultSessionDataFixture, status: 'authenticated' })
  })
}
