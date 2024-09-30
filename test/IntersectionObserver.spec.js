import { fakeIntersectionObserverFactory } from '../src/jest/IntersectionObserver'
import { provisionFakeWebPageWindowObject } from './.helpers/utils'
/* eslint-env jest */

const callback = jest.fn();

describe('Test for Browser IntersectionObserver API', () => {
  provisionFakeWebPageWindowObject(
    'IntersectionObserver',
    fakeIntersectionObserverFactory()
  )
  
  it('should assert that instance of `new IntersectionObserver(...)` is initialized with proper arguments', () => {
    const observer = new IntersectionObserver(callback, {});

    expect(() => observer.observe({})).toThrow("Failed to execute 'observe' on 'IntersectionObserver': parameter 1 is not of type 'Element'.")
    expect(callback).toHaveBeenCalledTimes(0)
  })
})