const EventEmitter = require('events').EventEmitter
// const toPromise = (val) => (val instanceof Promise ? val : Promise.resolve(val))

module.exports = {
  make_expressNext: (callback) => {
    const next = (err) => {
      // Calling the fallthrough function with a string may be valid:-
      // 1. Calling with 'route' will skip any remaining route callbacks
      // 2. Calling with 'router' will exit the router and 404
      const isBypass = typeof err === 'string' && /^router?$/.test(err)

      if (err && !isBypass) {
        if (typeof callback === 'function') {
          callback(err)
        }
      }
    }

    return next
  },
  make_expressHttpRequest: ({
    ip = '::1',
    body = {},
    cookies = {},
    headers = {},
    params = {},
    query = {},
    protocol = 'http',
    method = 'GET',
    path = '',
    url = '',
    port = '',
    hostname = '',
    xhr = false,
    fresh = false,
    originalUrl = '',
    signedCookies = {}
  } = {}) => {
    const _headers = Object.assign({}, {
      "accept": "text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8",
      "accept-encoding": "deflate, gzip;q=1.0, *;q=0.5",
      "accept-charset": "utf-8, iso-8859-1;q=0.7",
      "accept-language": "en-US, en;q=0.9, fr;q=0.8, de;q=0.7, *;q=0.5",
      "content-type": "text/html; charset=utf-8"
    }, headers)
    const request = {
      body,
      socket: {
        localAddres: ip,
        localPort: port || process.env.PORT
      },
      protocol,
      connection: {},
      aborted: false,
      host: `${hostname}:${port}`,
      ip,
      method: method || 'GET',
      finished: false,
      destroyed: false,
      writableEnded: false,
      writableFinished: false,
      maxHeadersCount: 2000,
      reusedSocket: false
    }

    if (method.toLowerCase() === 'get'
      || method.toLowerCase() === 'head') {
      delete _headers["content-type"];
    }

    /* @HINT http.IncomingMessage specific fields */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpincomingmessage */

    request.headers = _headers

    /* @HINT: ensure mocked request is a sub class of event emitter */
    const emitter = Object.create(EventEmitter.prototype, { })
    EventEmitter.call(emitter)

    /* @HINT: ExpressJS specific fields */
    /* @CHECK: https://expressjs.com/en/api.html#req */
    request.xhr = xhr
    request.fresh = fresh
    request.hostname = hostname
    request.ips = [ip]
    request.signedCookies = signedCookies
    request.cookies = cookies
    request.query = query
    request.stale = !fresh
    request.url = url || path
    request.originalUrl = originalUrl || url
    request.path = path || ((new URL(url, '')).pathname)
    request.basePath = path.split('/').slice(0, 1).join('/')
    request.secure = request.protocol === 'https'
    request.baseUrl = request.basePath
    request.params = params

    Object.assign(emitter, request)

    /* @HINT http.IncomingMessage specific methods */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpincomingmessage */
    emitter.abort = jest.fn(() => {
      this.aborted = true
    })

    emitter.flushHeaders = jest.fn()

    emitter.end = jest.fn((data, encoding, callback) => {
      if (typeof data !== 'function') {
        if (data) {
          this.emit('data', data)
        }
      }

      if (typeof data === 'function') {
        data()
      }

      if (typeof callback === 'function') {
        callback()
      }
    
      this.writableEnded = true
      this.emit('finish', {})
      this.writableFinished = true
    });

    emitter.getHeaderNames = jest.fn(() => {
      return Object.keys(this.headers)
    })

    emitter.setHeader = (name, value) => {
      if (typeof name !== 'string') {
        return
      }

      if (typeof value !== 'string'
        || typeof value !== 'object') {
        return
      }

      this.headers[name.toLowerCase()] = value;
    }

    emitter.destroy = jest.fn(() => {
      this.emit('error', {})
      this.emit('close', {})

      this.destroyed = true
      this.finished = true
    });

    emitter.removeHeader = jest.fn((name) => {
      if (typeof name !== 'string') {
        return
      }

      delete this.headers[name.toLowerCase()];
    });

    emitter.hasHeader = (name) => {
      if (typeof name !== 'string') {
        return
      }

      return Boolean(this.headers[name.toLowerCase()])
    }

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

    /* @HINT: ExpressJS specific methods */
    /* @CEHCK: https://expressjs.com/en/api.html#req */
    emitter.get = emitter.header

    emitter.range = (size) => {
      if (typeof size !== 'number') {
        return
      }

      const ranges = []
      ranges.type = this.headers["accept-ranges"]
      return ranges
    }

    emitter.is = (type) => {
      if (typeof type !== "string") {
        return
      }

      const requestContentType = this.headers["content-type"]
      const indexOfWildCard = type.indexOf('*')

      if (indexOfWildCard === -1) {
        return requestContentType.includes(type)
      }

      return requestContentType.search(
        new RegExp(
          indexOfWildCard === 0
            ? `^|${type.replace('*', '').replace('/', '\/')}`
            : `${type.replace('*', '').replace('/', '\/')}|$`
          ,
          'ig'
        )
      ) !== -1
    };
  
    emitter.acceptsEncodings = (encoding, ) => {
      if (typeof encoding !== "string") {
        return
      }

      const requestEncoding = this.headers["accept-encoding"]
      return requestEncoding.includes(encoding)
    }

    emitter.acceptsCharsets = (charset, ) => {
      if (typeof charset !== "string") {
        return
      }

      const requestCharset = this.headers["accept-charset"]
      return requestCharset.includes(charset)
    }

    emitter.acceptsLanguages = (language, ) => {
      const requestLanguage = this.headers["accept-language"]
      if (typeof language === "string") {
        return requestLanguage.includes(language)
      }
    }

    emitter.param = function (paramName, defaultValue) {
      const hasProperty = ({}).hasOwnProperty

      if (hasProperty.call(this.params, paramName)) {
        return this.params[paramName]
      } else if (hasProperty.call(request.body, paramName)) {
        return this.body[paramName]
      } else if (hasProperty.call(request.query, paramName)) {
        return this.query[paramName]
      }
      return defaultValue
    }

    return emitter
  },
  make_expressHttpResponse: ({
    headers = {},
    socket = {},
    locals = {}
  } = {}) => {
    const _headers = Object.assign({}, {
      "content-type": "application/json; charset=utf-8"
    },
    headers)

    const response = {
      socket,
      connection: {},
      statusCode: 0,
      statusMessage: '',
      httpVersion: '1.1',
      strictContentLength: false,
      writableEnded: false,
      writableFinished: false,
      finished: false,
      headersSent: false
    };

    /* @HINT: http.ServerResponse specific fields */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpserverresponse */

    response.headers = _headers

    /* @HINT: ensure mocked response is a sub class of event emitter */
    const emitter = Object.create(EventEmitter.prototype, { })
    EventEmitter.call(emitter)

    /* @HINT: ExpressJS specific fields */
    /* @CHECK: https://expressjs.com/en/api.html#res */

    response.locals = locals

    const chainableMethods = ['status', 'vary']
    const nonChainableMethods = ['send', 'sendFile', 'sendStatus', 'render', 'end', 'header', 'json']

    Object.assign(emitter, response)

    /* @HINT: http.ServerResponse specific methods */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpserverresponse */
    emitter.flushHeaders = jest.fn(() => {
      this.headersSent = true
    })

    /* @HINT: ExpressJS specific methods */
    /* @CHECK: https://expressjs.com/en/api.html#res */

    emitter.append = jest.fn(() => {

    })

    emitter.type = jest.fn((_type) => {
      if (typeof _type !== 'string') {
        return
      }

      let normalizedMimeType = _type

      if (normalizedMimeType.endsWith('html')) {
        normalizedMimeType = 'text/html'
      }

      const [, match ] = /^(png|jpe?g|gif|svg)$/.exec(
        normalizedMimeType
      ) || ['', '']

      if (match === 'svg') {
        normalizedMimeType = `image/${match}+xml`
      } else {
        normalizedMimeType = `image/${match}`
      }

      if (normalizedMimeType.includes('json')) {
        normalizedMimeType = 'application/json'
      }

      this.set(
        "content-type",
        "<mime-type>; charset=utf-8".replace(
          '<mime-type>',
          normalizedMimeType
        )
      )
    })

    emitter.set = jest.fn((name, value) => {
      if (typeof name !== "string") {
        return
      }

      if (typeof value !== 'string'
        || typeof value !== 'object') {
        return
      }

      this.headers[name] = value
    })

    emitter.get = jest.fn((name) => {
      if (typeof name !== "string") {
        return
      }

      return this.headers[name]
    })

    nonChainableMethods.forEach((method) => {
      emitter[method] = jest.fn(() => (...args) => {
        let result = undefined;
        
        result = method === 'header'
          ? this.get([args[0]])
          : undefined
        
        if (method === 'sendStatus') {
          this.statusCode = typeof args[0] === 'number' ? args[0] : 0
        }

        return result
      })
    })

    chainableMethods.forEach((method) => {
      emitter[method] = jest.fn((...args) => {
        if (method === 'status') {
          this.statusCode = typeof args[0] === 'number' ? args[0] : 0
        }

        if (method === 'vary') {
          this.set(method, args[0])
        }
      }).mockReturnValue(emitter)
    })

    return emitter
  }
}
