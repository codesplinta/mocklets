import { fakeResizeObserverFactory } from '../src/jest/ResizeObserver'
import { provisionFakeWebPageWindowObject } from './.helpers/utils'
/* eslint-env jest */

const callback = jest.fn();

describe('Test for Browser ResizeObserver API', () => {
  provisionFakeWebPageWindowObject(
    'ResizeObserver',
    fakeResizeObserverFactory()
  )

  it('should assert that instance of `new ResizeObserver(...)` is initialized with proper argument', () => {
    const observer = new ResizeObserver(callback);

    expect(() => observer.observe({})).toThrow("Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element'.")
    expect(callback).toHaveBeenCalledTimes(0)
  })
})