import { fakeStorageInstanceFactory } from '../src/jest/browserStorage' 
import { provisionFakeWebPageWindowObject } from './.helpers/utils'
/* eslint-env jest */

describe('Tests for Browser Storage API', () => {
  provisionFakeWebPageWindowObject(
    'localStorage',
    fakeStorageInstanceFactory()
  )
  provisionFakeWebPageWindowObject(
    'sessionStorage',
    fakeStorageInstanceFactory()
  )

  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  })
  
  it('should assert that `localStorage` can store items', () => {
    window.localStorage.setItem('dandy', 'go')
    expect(window.localStorage.getItem('dandy')).toBe('go')
  })

  it('should assert that `sessionStorage` can remove stored items', () => {
    window.sessionStorage.setItem('dandy', 'go')
    window.sessionStorage.removeItem('dandy')
    expect(window.sessionStorage.getItem('dandy')).toBe(null)
  })
})