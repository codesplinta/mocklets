import { EventEmitter } from 'events'
import { STATUS_CODES } from 'http'

/**
 * isEmpty:
 *
 * @param {Object} objectValue
 *
 * @returns {Boolean}
 */
const isEmpty = (objectValue) => {
  if (!objectValue || typeof objectValue !== 'object') {
    return true
  }

  for (const prop in objectValue) {
    if (Object.prototype.hasOwnProperty.call(objectValue, prop)) {
      return false
    }
  }

  return JSON.stringify(objectValue) === JSON.stringify({})
}

/**
 * Convert URL query string to object literal
 *
 * @param {String} url
 *
 * @returns {Object}
 */
const reduceUrlFromQueryString = (url) => {
  if (typeof url !== 'string') {
    return {}
  }

  const $url = url.startsWith('?') ? url : '?' + url
  return ($url || '').slice(($url || '').indexOf('?')).slice(
    1
  ).split(
    '&'
  ).map((querySlice) => {
    return querySlice.split('=')
  }).reduce((queryPairMap, previousQuerySlicePair) => {
    const [key, value] = previousQuerySlicePair
    queryPairMap[key] = decodeURIComponent(value).includes(',')
      ? value.split(',')
      : value
    return queryPairMap
  }, {})
}

export const nextjsFakesFactory = {
  // # process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/'
  // # process.env.PORT = '3000'
  make_nextApiRequest: ({ method = 'GET', body = null, cookies = {}, headers = {}, query = {}, url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', port = process.env.PORT || '3000', ip = '::1' } = {}) => {
    const today = new Date()
    const _headers = Object.assign({}, {
      accept: 'text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8',
      'accept-encoding': 'deflate, gzip;q=1.0, *;q=0.5',
      'accept-charset': 'utf-8, iso-8859-1;q=0.7',
      'accept-language': 'en-US, en;q=0.9, fr;q=0.8, de;q=0.7, *;q=0.5',
      'content-type': 'text/html; charset=utf-8',
      'if-modified-since': today.toGMTString(),
      referer: `${process.env.NEXT_PUBLIC_API_URL}`,
      connection: 'keep-alive',
      pragma: 'no-cache',
      'cache-control': 'no-cache'
    }, headers)
    const { hostname, pathname, protocol, query: $query } = ((new URL(url)))
    const request = {
      body,
      protocol,
      aborted: false,
      host: `${hostname}:${port}`,
      ip,
      method: method || 'GET',
      finished: false,
      complete: false,
      destroyed: false,
      writableEnded: false,
      writableFinished: false,
      maxHeadersCount: 2000,
      reusedSocket: false
    }

    if (method.toLowerCase() === 'get' ||
      method.toLowerCase() === 'head') {
      delete _headers['content-type']
    }

    const _socketMethod = request.method.toUpperCase()

    /* @HINT http.IncomingMessage specific fields */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpincomingmessage */

    request.headers = _headers

    /* @HINT: ensure mocked request is a sub class of event emitter */
    const emitter = Object.create(EventEmitter.prototype, {
      connection: {
        value: {},
        enumerable: true,
        configurable: false
      },
      socket: {
        value: (function _makeSocket () {
          let _encoding = 'ascii'
          const _buffer = []

          /* @HINT: ensure mocked request socket is also a sub class of event emitter */
          // https://github.com/moll/node-mitm
          return Object.create(
            EventEmitter.prototype,
            {
              connecting: {
                value: false,
                enumerable: true,
                configurable: true
              },
              parser: {
                value: {
                  outgoing: {
                    method: _socketMethod,
                    _header: `${_socketMethod} ${pathname} HTTP/1.1`
                  }
                },
                enumerable: false,
                configurable: false
              },
              _hadError: {
                value: false,
                enumerable: false,
                configurable: true
              },
              _parent: {
                value: null,
                enumerable: true,
                configurable: false
              },
              _host: {
                value: `${hostname}:${port}`,
                enumerable: false,
                configurable: false
              },
              setEncoding: {
                value: function (encoding = 'utf8') {
                  /* eslint-disable-next-line */
                  _encoding = encoding
                  const args = Array.prototype.slice.call(arguments)
                  args.unshift('setEncoding')
                  this.emit.apply(this, args)
                },
                enumerable: true,
                configurable: false
              },
              write: {
                value: function (data) {
                  _buffer.push(data)
                  const args = ([]).slice.call(arguments)
                  args.unshift('data')
                  this.emit.apply(this, args)
                },
                enumerable: true,
                configurable: false
              },
              drain: {
                value: function () {
                  const args = Array.prototype.slice.call(arguments)
                  args.unshift('drain')
                  this.emit.apply(this, args)
                },
                enumerable: true,
                configurable: false
              },
              destroySoon: {
                value: function () {
                  const args = Array.prototype.slice.call(arguments)
                  args.unshift('destroySoon')
                  this.emit.apply(this, args)
                },
                enumerable: true,
                configurable: false
              },
              destroy: {
                value: function () {
                  const args = Array.prototype.slice.call(arguments)
                  args.unshift('destroy')
                  this.emit.apply(this, args)
                },
                enumerable: true,
                configurable: false
              },
              close: {
                value: function () {
                  const args = Array.prototype.slice.call(arguments)
                  args.unshift('close')
                  this.emit.apply(this, args)
                },
                enumerable: true,
                configurable: false
              },
              error: {
                value: function () {
                  const args = Array.prototype.slice.call(arguments)
                  args.unshift('error')
                  this.emit.apply(this, args)
                },
                enumerable: true,
                configurable: false
              },
              writable: {
                value: false,
                configurable: false,
                enumerable: false
              },
              read: {
                value: () => {
                  return _buffer.shift() || null
                },
                enumerable: true,
                configurable: false
              },
              readable: {
                value: true,
                configurable: true,
                enumerable: false
              },
              localAddress: {
                value: ip,
                enumerable: true,
                configurable: false
              },
              localPort: {
                value: port || process.env.PORT,
                enumerable: true,
                configurable: false
              }
            }
          )
        }()),
        enumerable: true,
        configurable: false
      }
    })
    EventEmitter.call(emitter)

    request.query = isEmpty(query) ? reduceUrlFromQueryString($query) : query
    request.path = `/${pathname.split('/').slice(-1).join('/')}`

    Object.assign(emitter, request)

    /* @HINT http.IncomingMessage specific methods */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpincomingmessage */
    emitter.abort = jest.fn(function () {
      this.aborted = true
    })

    emitter.flushHeaders = jest.fn(function () {
      this.headersSent = true
    })

    emitter.end = jest.fn(function (data, encoding, callback) {
      if (typeof data !== 'function') {
        switch (typeof data) {
          case 'string':
            this.emit('data', data)
            break
          default:
            this.emit('data', data)
            break
        }
      }

      if (typeof data === 'function') {
        data()
      }

      if (typeof callback === 'function') {
        callback()
      }

      this.complete = true
      this.writableEnded = true
      this.emit('finish')
      this.writableFinished = true
    })

    emitter.getHeaderNames = jest.fn(function () {
      return Object.keys(this.headers)
    })

    emitter.setHeader = jest.fn(function (name, value) {
      if (typeof name !== 'string') {
        return
      }

      if (typeof value !== 'string' ||
        typeof value !== 'object') {
        return
      }

      this.headers[name.toLowerCase()] = value
    })

    emitter.destroy = jest.fn(function () {
      this.emit('error', {})
      this.emit('close', {})

      this.destroyed = true
      this.finished = true
    })

    emitter.removeHeader = jest.fn(function (name) {
      if (typeof name !== 'string') {
        return
      }

      delete this.headers[name.toLowerCase()]
    })

    emitter.hasHeader = jest.fn(function (name) {
      if (typeof name !== 'string') {
        return
      }

      return Boolean(this.headers[name.toLowerCase()])
    })

    emitter.getHeader = emitter.header = jest.fn(function (name) {
      if (typeof name !== 'string') {
        return
      }

      name = name.toLowerCase()
      switch (name) {
        case 'referer':
        case 'referrer':
          return this.headers.referrer || this.headers.referer
        default:
          return this.headers[name.toLowerCase()]
      }
    })

    /* @HINT: NextJS API Request specific methods */
    /* @CHECK: */

    return emitter
  },
  make_nextApiResponse: ({ statusCode = 0, headers = {}, cookies = {} } = {}) => {
    const today = new Date()
    const _headers = Object.assign({}, {
      'last-modified': today.toGMTString(),
      'cache-control': 'no-cache',
      'content-encoding': 'deflate, gzip',
      'content-type': 'text/html; charset=utf-8'
    },
    headers)
    const _cookies = JSON.parse(JSON.stringify(cookies))
    const response = {
      socket: {
        writable: true
      },
      connection: {},
      statusCode,
      statusMessage: '',
      httpVersion: '1.1',
      strictContentLength: false,
      writableEnded: false,
      writableFinished: false,
      finished: false,
      headersSent: false
    }

    /* @HINT: ensure mocked response is a sub class of event emitter */
    const emitter = Object.create(EventEmitter.prototype, { })
    EventEmitter.call(emitter)

    response.__mocks = {
      get cookies () {
        return _cookies
      },
      get headers () {
        return _headers
      }
    }

    /* @HINT: http.ServerResponse specific fields */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpserverresponse */

    response.headers = _headers

    Object.assign(emitter, response)

    /* @HINT: http.ServerResponse specific methods */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpserverresponse */
    emitter.flushHeaders = jest.fn(function () {
      this.headersSent = true
    })

    emitter.end = jest.fn(() => {

    })

    emitter.set = jest.fn(function (name, value) {
      if (typeof name !== 'string') {
        return
      }

      if (typeof value !== 'string' ||
        typeof value !== 'object') {
        return
      }

      const $value = value

      this.headers[name.toLowerCase()] = $value
    })

    emitter.get = jest.fn(function (name) {
      if (typeof name !== 'string') {
        return
      }

      return this.headers[name.toLowerCase()]
    })

    emitter.removeHeader = jest.fn(function (name) {
      if (typeof name !== 'string') {
        return
      }

      delete this.headers[name.toLowerCase()]
    })

    /* @HINT: NextJS API Response specific methods */
    /* @CHECK: https://nextjs.org/docs/pages/building-your-application/routing/api-routes#response-helpers */

    emitter.status = jest.fn(function (code) {
      this.statusCode = typeof code === 'number' ? code : 0
      this.statusMessage = STATUS_CODES[this.statusCode]
    })

    emitter.json = jest.fn(function (body) {
      if (typeof body !== 'object') {
        return
      }

      this.send(JSON.stringify(body))
    })

    emitter.send = jest.fn(function (body) {
      let $body = body
      // strip irrelevant headers
      if (this.statusCode === 204 || this.statusCode === 304) {
        this.removeHeader('Content-Type')
        this.removeHeader('Content-Length')
        this.removeHeader('Transfer-Encoding')
        $body = ''
      }

      this.end($body)
    })

    emitter.redirect = jest.fn(function (status = 307, path) {
      this.status(status).set('Location', path).send(null)
    })

    emitter.revalidate = jest.fn(function (urlPath) {
      this.status(204).set('Refresh', `0; url=${urlPath}`).send(null)
    })

    return emitter
  }
}
