export const fakeIntersectionObserverFactory = () => (function () {
  /* @SOURCE: `GoogleChromeLabs/intersection-observer` */
  /* @CHECK: https://github.com/GoogleChromeLabs/intersection-observer/blob/main/intersection-observer.js#L661C32-L676C3 */
  const parseRootMargin = (rootMargin) => {
    const marginString = rootMargin || '0px'
    const margins = marginString.split(/\s+/).map(function (margin) {
      const [, value, unit] = /^(-?\d*\.?\d+)(px|%)$/.exec(margin) || [undefined, '', null]

      if (!unit || !value) {
        throw new Error('rootMargin must be specified in pixels or percent')
      }

      return { value: parseFloat(value), unit }
    })

    margins[1] = margins[1] || margins[0]
    margins[2] = margins[2] || margins[0]
    margins[3] = margins[3] || margins[1]

    return margins
  }

  /* @SOURCE: `GoogleChromeLabs/intersection-observer` */
  /* @CHECK: https://github.com/GoogleChromeLabs/intersection-observer/blob/main/intersection-observer.js#L323C32-L339C3 */
  const expandViewPortRectByRootMargin = (viewPortRect, rootMargin) => {
    const [topMargin, rightMargin, bottomMargin, leftMargin] = parseRootMargin(
      rootMargin
    ).map(function (margin, index) {
      return margin.unit === 'px'
        ? margin.value
        : margin.value * (
          index % 2
            ? viewPortRect.width
            : viewPortRect.height
        ) / 100
    })

    const newRect = {
      top: viewPortRect.top - topMargin,
      right: viewPortRect.right + rightMargin,
      bottom: viewPortRect.bottom + bottomMargin,
      left: viewPortRect.left - leftMargin
    }

    newRect.width = newRect.right - newRect.left
    newRect.height = newRect.bottom - newRect.top

    newRect.x = newRect.left
    newRect.y = newRect.top

    return newRect
  }

  const isInViewPort = (entry, viewPort, options) => {
    let thresholds = [0]
    const rect = entry.target.getBoundingClientRect()
    const viewPortRect = expandViewPortRectByRootMargin(
      viewPort.getBoundingClientRect(),
      options.rootMargin
    )

    entry.boundingClientRect = rect
    entry.rootBounds = viewPortRect

    if ('threshold' in options) {
      thresholds = options.threshold
      console.log(thresholds)
    }

    return (
      rect.left >= viewPortRect.x &&
      rect.top >= viewPortRect.y &&
      rect.right <= viewPortRect.right &&
      rect.bottom <= viewPortRect.bottom
    )
  }

  /* @SOURCE: `Blog Post` */
  /* @CHECK: https://junhyunny.github.io/javascript/jest/testing-library/test-driven-development/how-to-test-intersection-observer/ */
  class IntersectionObserver {
    constructor (callback, options) {
      if (typeof callback !== 'function') {
        throw new TypeError(
          typeof callback === 'undefined'
            ? "Failed to construct 'IntersectionObserver': 1 argument required, but only 0 present."
            : "Failed to construct 'IntersectionObserver': parameter 1 is not of type 'Function'."
        )
      }

      if (
        options.root &&
        options.root.nodeType !== 1 &&
        options.root.nodeType !== 9
      ) {
        throw new Error('root must be a Document or Element')
      }

      this.thresholds = options.threshold || options.thresholds || [0]
      this.delay = 0
      this.trackVisibility = false
      this.root = options.root || null
      this.rootMargin = options.rootMargin || '0px 0px 0px 0px'

      if (options.root !== this.root &&
          this.root === null) {
        options.root = null
      }

      const viewPort = options.root === null || options.root.nodeType === 9
        ? window.document.documentElement
        : options.root

      this.entries = []

      viewPort.addEventListener('scroll', () => {
        this.entries.forEach((entry) => {
          entry.isIntersecting = isInViewPort(
            entry,
            viewPort,
            options
          )

          if (entry.isIntersecting) {
            if (entry.time === 0) {
              entry.time = (new Date()).getTime()
            }
            entry.intersectionRatio = 1.0
          } else {
            entry.time = 0
            entry.intersectionRatio = 0.0
            entry.intersectionRect = {
              x: 0,
              y: 0,
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              width: 0,
              height: 0
            }
          }
        })
        callback(
          this.entries.slice(0).map(
            (entry) => Object.freeze(entry)
          ),
          this
        )
      }, false)
    }

    observe (target) {
      if (!target) {
        throw new TypeError("Failed to execute 'observe' on 'IntersectionObserver': 1 argument required, but only 0 present.")
      }

      if (target instanceof window.HTMLElement) {
        this.entries.push({
          isIntersecting: false,
          target,
          time: 0,
          rootBounds: {
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: 0,
            height: 0
          },
          intersectionRatio: 0.0,
          intersectionRect: {
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: 0,
            height: 0
          },
          boundingClientRect: target.getBoundingClientRect()
        })
      } else {
        throw new TypeError("Failed to execute 'observe' on 'IntersectionObserver': parameter 1 is not of type 'Element'.")
      }
    }

    unobserve (target) {
      this.entries = this.entries.filter(
        (entry) => entry.target !== target
      )
    }

    disconnect () {
      this.entries = []
    }
  }

  return IntersectionObserver
})()
