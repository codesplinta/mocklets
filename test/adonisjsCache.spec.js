import { fakeAdonisJSCachePackageFactory } from '../src/jest/adonisjs-cache'
import { provisionLocalClassInstance } from './.helpers/utils'
/* eslint-env jest */

describe('Tests for AdonisJS Cache package', () => {
  const CacheClass = fakeAdonisJSCachePackageFactory()
  const cacheInstance = provisionLocalClassInstance(CacheClass)

  it('should assert that `Cache.addd(...)` methods resolves correctly', async () => {
    await expect(cacheInstance.add('session_uid', 'xM6ye&7hd78', 2)).resolves.toBe(true)
  })
})