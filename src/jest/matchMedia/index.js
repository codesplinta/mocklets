// Object.defineProperty(window, 'matchMedia', {
/* @NOTE: ATTRIBUTION# */
/*
MIT License

Copyright (c) Jason Miller (https://jasonformat.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
function mitt (allEventsMap = {}) {
  const all = Object.create(null)
  return {
    on (type, handler) {
      allEventsMap[type] = -1;
      (all[type] || (all[type] = [])).push(handler)
    },
    off (type, handler) {
      if (typeof allEventsMap[type] !== 'undefined') {
        delete allEventsMap[type]
      }
      if (all[type]) {
        all[type].splice(all[type].indexOf(handler) >>> 0, 1)
      }
    },
    emit (type) {
      if (allEventsMap[type]) {
        allEventsMap[type] = 1
      }

      const _len = arguments.length
      const evts = new Array(_len > 1 ? _len - 1 : 0)

      for (let _key = 1; _key < _len; _key++) {
        evts[_key - 1] = arguments[_key]
      }
      (all[type] || []).slice().forEach((handler) => {
        handler(...evts)
      })
    }
  }
}

export const mediaQueryMatcher = query => {
  if (typeof query === 'undefined') {
    throw new TypeError(
      "Failed to execute 'matchMedia' on 'Window': 1 argument required, but only 0 present."
    )
  }
  const eventsMap = {}
  const emitter = mitt(eventsMap)
  let _onchangeHandler = null

  const calculateMatches = (_query) => {
    /* eslint-disable-next-line */
    const queryPattern = /^\((min|max)\-(width)(?:[ ]*)\:(?:[ ]*)([\d]+?)(px|r?em)\)$/
    const viewPortWidth = window.outerWidth || window.document.documentElement.clientWidth
    const [, range, dimension, size, unit] = queryPattern.exec(_query) || [_query, '', '', '', '']

    if (dimension === 'width' && unit === 'px') {
      return range === 'min'
        ? viewPortWidth >= parseInt(size)
        : viewPortWidth <= parseInt(size)
    }

    return false
  }
  const _dispatchEvent = (event) => {
    const _modifiedEvent = Object.assign(
      {},
      event,
      { matches: calculateMatches(query) }
    )

    if (typeof _onchangeHandler === 'function') {
      _onchangeHandler(_modifiedEvent)
    }
    emitter.emit('change', _modifiedEvent)
  }

  window.addEventListener('resize', () => {
    _dispatchEvent(new window.Event('change'))
  })

  return {
    get matches () {
      return calculateMatches(query)
    },
    get media () {
      if (typeof query === 'object') {
        return 'not all'
      }
      return String(query)
    },
    set onchange (handler) {
      _onchangeHandler = handler
    },
    get onchange  () {
      return _onchangeHandler
    },
    addListener (callback) {
      /* @NOTE: deprecated */
      emitter.on('change', callback)
    },
    removeListener (callback) {
      /* @NOTE: deprecated */
      emitter.off('change', callback)
    },
    addEventListener (event, callback) {
      emitter.on(event, callback)
    },
    removeEventListener (event, callback) {
      emitter.off(event, callback)
    },
    dispatchEvent: _dispatchEvent
  }
}

export const fakematchMediaFactory = () => (function () {
  return jest.fn().mockImplementation(mediaQueryMatcher)
})()
