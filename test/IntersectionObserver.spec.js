import { fakeIntersectionObserverFactory } from '../src/jest/IntersectionObserver'
import { provisionFakeWebPageWindowObject } from './.helpers/utils'
/* eslint-env jest */

describe(() => {
  provisionFakeWebPageWindowObject(
    'IntersectionObserver',
    fakeIntersectionObserverFactory()
  )
  
  /* ... */
})