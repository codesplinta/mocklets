import { fakeAdonisJSCachePackageFactory } from '../src/jest/adonisjs-cache'
import { provisionLocalClassInstance } from './.helpers/utils'
/* eslint-env jest */

describe(() => {
  const CacheClass = fakeAdonisJSCachePackageFactory()
  const cacheInstance = provisionLocalClassInstance(CacheClass)

  it('...', () => {
    expect(cacheInstance.add()).resolve.toBe(true)
  })
})