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

/* @NOTE: a basic `Stack` data-structure definition */
class Stack {
  constructor (data = []) {
    this.length = 0
    if (Array.isArray(data)) {
      this.push.apply(this, data)
    }
  }

  isEmpty () {
    return this.length === 0
  }

  size () {
    return this.length
  }

  peek () {
    return this[this.size() - 1]
  }

  push (...args) {
    return Array.prototype.push.apply(this, args)
  }

  pop () {
    const formerTop = this.peek()
    Array.prototype.pop.call(this)

    return formerTop
  }

  replaceTop (...args) {
    this.pop()
    this.push(...args)
  }

  toJSON () {
    return '[ ' + Array.prototype.slice.call(this, 0).join(', ') + ' ]'
  }

  toObject () {
    try {
      return JSON.parse(this.toJSON())
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'SyntaxError') {
          return Array.prototype.slice.call(this, 0, this.size())
        }
      }
      return []
    }
  }

  clone () {
    return new Stack([...this.toObject()])
  }
}

/* @NOTE: a basic `BasicStack` data-structure definition */
class BasicStack {
  constructor (data = []) {
    this.length = 0
    if (Array.isArray(data)) {
      this.push.apply(this, data)
    }
  }

  isEmpty () {
    return this.length === 0
  }

  size () {
    return this.length
  }

  peek () {
    return this[0]
  }

  push (...args) {
    return Array.prototype.unshift.apply(this, args)
  }

  pull () {
    return Array.prototype.shift.apply(this)
  }

  toJSON () {
    return '[ ' + Array.prototype.slice.call(this, 0).join(', ') + ' ]'
  }

  flip () {
    Array.prototype.reverse.apply(this)
  }

  toObject () {
    try {
      return JSON.parse(this.toJSON())
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'SyntaxError') {
          return Array.prototype.slice.call(this, 0, this.size())
        }
      }
      return []
    }
  }

  clone () {
    return new BasicStack([...this.toObject()])
  }
}

export const nextJSuseRouter = (eventsMap = {}) => {
  const mockRouterPush = jest.fn((url, asPath, options) => {
    if (typeof asPath !== 'string' && typeof options === 'undefined') {
      /* @HINT: Adjusting for Next.js v13.x+ argument signature for 'router.push()' */
      if (typeof asPath === 'object' && (asPath instanceof Object)) {
        if (asPath.shallow || asPath.scroll) {
          return updatePath(url, asPath, 'push')
        }
      } else {
        return updatePath(url, { shallow: false, scroll: true }, 'push')
      }
    }
    return updatePath(url, options || { shallow: false, scroll: true }, 'push', asPath)
  })
  const mockRouterReload = jest.fn(() => {
    if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          try {
            window.location.reload()
          } catch {
            window.dispatchEvent(
              new Event('beforeunload', { cancelable: true })
            );
          }
        }, 0)
    }
    return Promise.resolve(true)
  })
  const mockRouterPrefetch = jest.fn().mockResolvedValue(true)
  const mockRouterReplace = jest.fn((url, asPath, options) => {
    if (typeof asPath !== 'string' && typeof options === 'undefined') {
      /* @HINT: Adjusting for Next.js v13.x+ argument signature for 'router.replace()' */
      if (typeof asPath === 'object' && (asPath instanceof Object)) {
        if (asPath.shallow || asPath.scroll) {
          return updatePath(url, asPath, 'push')
        }
      } else {
        return updatePath(url, { shallow: false, scroll: true }, 'push')
      }
    }
    return updatePath(url, options || { shallow: false, scroll: true }, 'replace', asPath)
  })

  let _beforePopStateCallback = () => false
  let _query = {}
  let _hash = ''
  let routingHistoryList = new Stack([])
  let routingHistoryListShiftBuffer = new BasicStack([])

  const emitter = mitt(eventsMap)

  const reduceUrlToQueryString = (url) => {
    if (typeof url !== 'string' || url === '') {
      return {}
    }
    const $url = url.startsWith('?') ? url : '?' + url

    return $url
      .slice($url.indexOf('?'))
      .slice(1)
      .split('&')
      .map((querySlice) => {
        return querySlice.split('=')
      }).reduce((queryPairMap, previousQuerySlicePair) => {
        const [key, value] = previousQuerySlicePair
        queryPairMap[key] = decodeURIComponent(value).includes(',')
          ? decodeURIComponent(value).split(',')
          : decodeURIComponent(value)
        return queryPairMap
      }, {})
  }

  const removeTrailingSlashOnPathname = (pathname) => {
    return pathname.endsWith('/') && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname || '/'
  }

  const stringifyFromQueryObjects = (sourceQuery, targetQuery = {}) => {
    let queryString = '?'

    Object.entries(
      sourceQuery
    ).forEach(([key, value]) => {
      const isQueryValueArray = Array.isArray(value)

      queryString +=
        isQueryValueArray
          ? `${key}=${encodeURIComponent(value.join(','))}&`
          : `${key}=${encodeURIComponent(value)}&`

      targetQuery[key.toString()] = isQueryValueArray ? value : value?.toString()
    })

    return { queryString: queryString.slice(1, -1) }
  }

  const normalizeAsRouteFromUrl = (url, previousPathname, previousQuery, asPath) => {
    let _asPath = asPath

    if (!_asPath) {
      _asPath = removeTrailingSlashOnPathname(url.pathname || previousPathname)
    }

    const $query = { ...previousQuery }
    const queryStringFromUrl = typeof url.search === 'string' && url.search.length > 0
      ? reduceUrlToQueryString(url.search)
      : {}
    const hasQueryObject = typeof url.query === 'object' && url !== null && url.query !== null
    const allQuery = Object.assign({}, queryStringFromUrl, hasQueryObject ? url.query : {})
    const asPathIsDynamicRoute = _asPath.indexOf('[') !== -1 && _asPath.indexOf(']') !== -1

    let asPathSuffix = '?'

    if (asPathIsDynamicRoute) {
      _asPath = removeTrailingSlashOnPathname(
        _asPath.replace(/(\[(?:\[)?[^\s\S]{1,}(?:\])?\])/g, (pathSlice) => {
          let routeParam = allQuery[pathSlice.replace(/^\[\[?/, '').replace(/\]?\]$/, '').replace('...', '')]
          if (Array.isArray(routeParam)) {
            routeParam = routeParam.map(
              (paramSlice) => encodeURIComponent(paramSlice)
            ).join('/')
          }
          return encodeURIComponent(routeParam || '')
        })
      )
    }

    /* @SMELL: argument `$query` is updated via/by reference here; Be careful! */
    const { queryString } = stringifyFromQueryObjects(allQuery, $query)

    asPathSuffix += queryString

    if (asPathSuffix !== '?') {
      _asPath += asPathSuffix
    }

    try {
      window.location.pathname = url.pathname;
      window.location.search = queryString;
      window.location.hash = url.hash
    } catch {}

    return { query: $query, hash: url.hash, pathname: url.pathname, asPath: _asPath }
  }

  const detectHashChangeFromRouteAction = (previousRoute, currentRoute) => {
    /*! attribution */
    /* @CHECK: https://github.com/scottrippey/next-router-mock/blob/main/src/MemoryRouter.tsx#L266C10-L266C34 */

    const isHashChange = previousRoute.hash !== currentRoute.hash
    const isQueryChange = stringifyFromQueryObjects(previousRoute.query).queryString !==
      stringifyFromQueryObjects(currentRoute.query).queryString
    const isRouteChange = isQueryChange || previousRoute.pathname !== currentRoute.pathname

    /**
     * @HINT: Try to replicate NextJs routing behaviour:
     *
     * /abc       -> routeChange
     * /abc#cba   -> hashChange
     * /abc#cba   -> hashChange
     * /abc       -> hashChange
     * /abc       -> routeChange
     * /bde#fuz   -> routeChange
     */
    return !isRouteChange && (isHashChange || currentRoute.hash)
  }

  const updatePath = async (url, { shallow = false, scroll = true, locale }, action, asPath) => {
    /* eslint-disable-next-line */
    const isURL_OfType_String = typeof url === 'string'
    const previousRoute = {
      query: routerFields.query,
      hash: _hash,
      pathname: routerFields.pathname
    }

    let $asPath = asPath || ''
    let normalizedRoute = { asPath, query: _query, hash: _hash, pathname: '' }

    /* eslint-disable-next-line */
    if (isURL_OfType_String) {
      /* @HINT:
       *
       * A ficticious `base` url is added to avoid `Invalid URL` type error
       */
      const $url = new URL(
        url,
        window.location.origin || 'https://test.com'
      )

      normalizedRoute = normalizeAsRouteFromUrl(
        $url,
        previousRoute.pathname,
        previousRoute.query,
        $asPath
      )
    } else {
      normalizedRoute = normalizeAsRouteFromUrl(
        url,
        previousRoute.pathname,
        previousRoute.query,
        $asPath
      )
    }

    if (locale) {
      routerFields.locale = locale
    }

    const shouldTriggerHashChangeEvent = detectHashChangeFromRouteAction(
      previousRoute,
      normalizedRoute
    )

    $asPath = normalizedRoute.asPath

    if (shouldTriggerHashChangeEvent) {
      routerFields.events.emit('hashChangeStart', $asPath, { shallow })
    } else {
      routerFields.events.emit('routeChangeStart', $asPath, { shallow })
    }

    const returnValue = await new Promise((resolve) => setTimeout(() => {
      const routingHistoryEntry = {
        url: typeof url === 'string'
          ? Object.assign(
              {},
              { query: normalizedRoute.query },
              (new URL(url, window.location.origin || 'https://test.com'))
            )
          : url,
        asPath: $asPath,
        options: { shallow, scroll, locale }
      }

      switch (action) {
        case 'push':
          routingHistoryList.push(
            routingHistoryEntry
          )
          window.history.pushState(null, "", routingHistoryEntry.url.pathname);
          break
        default:
          if (action === 'replace') {
            routingHistoryList.replaceTop(
              routingHistoryEntry
            )
            window.history.replaceState(null, "", routingHistoryEntry.url.pathname);
          }
      }

      /* @HINT: Update to current route fields */
      _query = normalizedRoute.query
      _hash = normalizedRoute.hash

      resolve(true)
    }, 100))

    if (shouldTriggerHashChangeEvent) {
      routerFields.events.emit('hashChangeComplete', $asPath, { shallow })
    } else {
      routerFields.events.emit('routeChangeComplete', $asPath, { shallow })
    }

    return returnValue
  }

  const mockRouterForward = jest.fn(() => {
    if (routingHistoryListShiftBuffer.isEmpty()) {
      return
    }

    const routePathHistoryEntry = routingHistoryListShiftBuffer.pull()

    _beforePopStateCallback(routePathHistoryEntry)

    window.dispatchEvent(new PopStateEvent('popstate'));

    window.history.forward();

    try {
      window.location.pathname = routePathHistoryEntry.url.pathname
      window.location.search = routePathHistoryEntry.url.search
      window.location.hash = routePathHistoryEntry.url.hash
    } catch {}

    routingHistoryList.push(routePathHistoryEntry)
  })
  const mockRouterBack = jest.fn(() => {
    if (routingHistoryList.isEmpty()) {
      return
    }

    const routePathHistoryEntry = routingHistoryList.pop()

    _beforePopStateCallback(routePathHistoryEntry)

    window.dispatchEvent(new PopStateEvent('popstate'));

    window.history.back();

    const topRoutePathHistoryEntry = routingHistoryList.peek()

    try {
      window.location.pathname = topRoutePathHistoryEntry.url.pathname
      window.location.search = topRoutePathHistoryEntry.url.search
      window.location.hash = topRoutePathHistoryEntry.url.hash
    } catch {}

    routingHistoryListShiftBuffer.push(routePathHistoryEntry)
  })
  const mockBeforePopState = jest.fn((callback) => {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => setTimeout(() => {
        const currentPathname = window.location.pathname
        const currentSearch = window.location.search
        const currentHash = window.location.hash

        const TYPE_BACK_FORWARD = 2;

        let historyStack = routingHistoryList.clone()

        if (historyStack.isEmpty()) {
          return
        }

        historyStack.pop()

        const topRoutingPathHistoryEntry = historyStack.peek()

        if (!topRoutingPathHistoryEntry) {
          historyStack = null
          return
        }

        try {
          if (currentPathname === topRoutingPathHistoryEntry.url.pathname ||
              currentSearch === topRoutingPathHistoryEntry.url.search ||
                currentHash === topRoutingPathHistoryEntry.url.hash) {
            window.performace.navigation.type = TYPE_BACK_FORWARD;
          } else {
            window.performace.navigation.type = TYPE_BACK_FORWARD;
          }
        } catch {}
      }))
    }
    _beforePopStateCallback = callback
  })

  const routerFields = {
    push: mockRouterPush,
    get query () {
      return _query
    },
    set query (query = {}) {
      _query = JSON.parse(JSON.stringify(query));
      const { queryString } = stringifyFromQueryObjects(_query);
      try {
        window.location.search = queryString;
      } catch {}
    },
    basePath: '',
    get pathname () {
      return routingHistoryList.peek().url.pathname
    },
    forward: mockRouterForward,
    back: mockRouterBack,
    reload: mockRouterReload,
    refresh: jest.fn(() => undefined),
    prefetch: mockRouterPrefetch,
    replace: mockRouterReplace,
    events: {
      on: jest.fn(emitter.on),
      off: jest.fn(emitter.off),
      emit: jest.fn(emitter.emit)
    },
    isReady: false,
    isLocaleDomain: false,
    isFallback: false,
    isPreview: false,
    defaultLocale: '',
    get asPath () {
      return routingHistoryList.peek().asPath
    },
    set asPath (pathname) {
      const $query = this.query
      const $locale = this.locale

      try {
        window.location.pathname = pathname
      } catch {}

      routingHistoryList = new Stack([])
      routingHistoryListShiftBuffer = new BasicStack([])

      updatePath(
        { pathname, query: $query },
        { locale: $locale },
        'push'
      )
    },
    locale: 'en-US',
    locales: ['en-US'],
    beforePopState: mockBeforePopState
  }

  const router = jest.fn().mockReturnValue(routerFields)

  router.__setRouterQuery = (query = {}) => {
    _query = JSON.parse(JSON.stringify(query))
  }

  return router
}

export const fakeNextJSRouterPackageFactory = (eventsMap) => {
  return () => ({
    __esModule: true,
    useRouter: nextJSuseRouter(eventsMap)
  })
}
