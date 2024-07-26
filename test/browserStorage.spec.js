import { fakeStorageInstanceFactory } from '../src/jest/browserStorage' 
import { provisionFakeWebPageWindowObject } from './.helpers/utils'
/* eslint-env jest */

describe(() => {
  provisionFakeWebPageWindowObject(
    'localStorage',
    fakeStorageInstanceFactory()
  )
  provisionFakeWebPageWindowObject(
    'sessionStorage',
    fakeStorageInstanceFactory()
  )
  
  /* ... */
})