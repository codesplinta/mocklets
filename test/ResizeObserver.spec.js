import { fakeResizeObserverFactory } from '../src/jest/ResizeObserver'
import { provisionFakeWebPageWindowObject } from './.helpers/utils'
/* eslint-env jest */

describe(() => {
  provisionFakeWebPageWindowObject(
    'ResizeObserver',
    fakeResizeObserverFactory()
  )
  /* ... */
})