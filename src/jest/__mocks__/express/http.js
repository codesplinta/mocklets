const path = require('path')
const EventEmitter = require('events').EventEmitter
const STATUS_CODES = require('http').STATUS_CODES
// const toPromise = (val) => (val instanceof Promise ? val : Promise.resolve(val))

const send = () => undefined

function attachFinishedListener (res, callback) {
  let finished = false

  function onFinish (error) {
    if (finished) {
      return
    }

    finished = true
    callback(error)
  }

  function onSocket (socket) {
    // remove listener
    res.removeListener('socket', onSocket)

    if (finished) return

    // finished on first socket event
    socket.on('error', onFinish)
    socket.on('close', onFinish)
  }

  if (res.socket) {
    // socket already assigned
    onSocket(res.socket)
    return
  }

  // wait for socket to be assigned
  res.on('socket', onSocket)
}

function attachListener (res, listener) {
  let attached = res.__onFinished

  // create a private single listener with queue
  if (!attached || !attached.queue) {
    attached = res.__onFinished = createListener(res)
    attachFinishedListener(res, attached)
  }

  attached.queue.push(listener)
}

function createListener (res) {
  function listener (err) {
    if (res.__onFinished === listener) res.__onFinished = null
    if (!listener.queue) return

    const queue = listener.queue
    listener.queue = null

    for (let $index = 0; $index < queue.length; $index++) {
      queue[$index](err, res)
    }
  }

  listener.queue = []

  return listener
}

function isFinished (msg) {
  const socket = msg.socket

  if (typeof msg.finished === 'boolean') {
    // OutgoingMessage [response]
    return Boolean(msg.finished || (socket && !socket.writable))
  }

  if (typeof msg.complete === 'boolean') {
    // IncomingMessage [request]
    return Boolean(msg.upgrade || !socket || !socket.readable || (msg.complete && !msg.readable))
  }

  // don't know
  return undefined
}
const isAbsolute = (path) => {
  if (path[0] === '/') return true
  if (path[1] === ':' && path[2] === '\\') return true
  if (path.substring(0, 2) === '\\\\') return true // Microsoft Azure absolute path
}

const onFinished = (msg, listener) => {
  const defer = typeof setImmediate === 'function'
    ? setImmediate
    : function (fn) { process.nextTick(fn.bind.apply(fn, arguments)) }

  if (isFinished(msg) !== false) {
    defer(listener, null, msg)
    return msg
  }

  // attach the listener to the message
  attachListener(msg, listener)

  return msg
}

const escapeHtml = (html) => {
  return html
}

const sign = (payload) => {
  return payload
}

const serializeCookie = (name, value, options = {}) => {
  return (`${name}=${encodeURIComponent(value)}; ${Object.keys(options).map((optionName) => {
    const directive = options[optionName]
    switch (optionName) {
      case 'domain':
        return `Domain=${('encode' in options)
        ? options.encode(options[optionName])
        : encodeURIComponent(options[optionName])}`
      case 'path':
        return `Path=${('encode' in options)
        ? options.encode(options[optionName])
        : encodeURIComponent(options[optionName])}`
      case 'secure':
        return 'Secure'
      case 'httpOnly':
        return 'HttpOnly'
      case 'expires':
        return `Expires=${directive.toGMTString()}`
      case 'maxAge':
        return `Max-Age=${options[optionName]}`
      case 'sameSite':
        if (/^strict|lax|none$/.test(directive.toLowerCase())) {
          throw new Error('cookie directive sameSite: invalid value')
        }
        return `SameSite=${directive.charAt(0).toUpperCase()}${directive.slice(1)}`
      default:
        return ''
    }
  }).join('; ')}`).trim()
}

// pipe the send file stream
function sendfile (res, file, options, callback) {
  let done = false
  let streaming

  // request aborted
  function onaborted () {
    if (done) {
      return
    }
    done = true

    const err = new Error('Request aborted')
    err.code = 'ECONNABORTED'
    callback(err)
  }

  // directory
  function ondirectory () {
    if (done) {
      return
    }
    done = true

    const err = new Error('EISDIR, read')
    err.code = 'EISDIR'
    callback(err)
  }

  // errors
  function onerror (err) {
    if (done) {
      return
    }
    done = true

    callback(err)
  }

  // ended
  function onend () {
    if (done) {
      return
    }
    done = true

    callback()
  }

  // file
  function onfile () {
    streaming = false
  }

  // finished
  function onfinish (err) {
    if (err && err.code === 'ECONNRESET') {
      return onaborted()
    }

    if (err) {
      return onerror(err)
    }

    if (done) {
      return
    }

    setImmediate(function () {
      if (streaming !== false && !done) {
        onaborted()
        return
      }

      if (done) {
        return
      }
      done = true

      callback()
    })
  }

  // streaming
  function onstream () {
    streaming = true
  }

  file.on('directory', ondirectory)
  file.on('end', onend)
  file.on('error', onerror)
  file.on('file', onfile)
  file.on('stream', onstream)

  onFinished(res, onfinish)

  if (options.headers) {
    // set headers on successful transfer
    file.on('headers', function headers (res) {
      const _headersStruct = options.headers
      const _headers = Object.keys(_headersStruct)

      for (let index = 0; index < _headers.length; index++) {
        const _header = _headers[index]
        res.setHeader(_header, _headersStruct[_headers])
      }
    })
  }

  // pipe
  // file.pipe(res);
}

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
    url = '',
    port = '',
    xhr = false,
    fresh = false,
    originalUrl = '',
    signedCookies = {}
  } = {}) => {
    const _headers = Object.assign({}, {
      accept: 'text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8',
      'accept-encoding': 'deflate, gzip;q=1.0, *;q=0.5',
      'accept-charset': 'utf-8, iso-8859-1;q=0.7',
      'accept-language': 'en-US, en;q=0.9, fr;q=0.8, de;q=0.7, *;q=0.5',
      'content-type': 'text/html; charset=utf-8',
      connection: 'keep-alive',
      pragma: 'no-cache',
      'cache-control': 'no-cache'
    }, headers)
    const { hostname, pathname } = ((new URL(url || originalUrl)))
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

    /* @HINT: ExpressJS specific fields */
    /* @CHECK: https://expressjs.com/en/api.html#req */
    request.xhr = xhr
    request.fresh = fresh
    request.hostname = hostname
    request.ips = [ip]
    request.signedCookies = JSON.parse(JSON.stringify(signedCookies))
    request.cookies = JSON.parse(JSON.stringify(cookies))
    request.query = query
    request.stale = !fresh
    request.url = url
    request.originalUrl = originalUrl
    request.secure = request.protocol === 'https'
    request.baseUrl = pathname.split('/').slice(0, -1).join('/')
    request.path = `/${pathname.split('/').slice(-1).join('/')}`
    request.params = params

    Object.assign(emitter, request)

    /* @HINT http.IncomingMessage specific methods */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpincomingmessage */
    emitter.abort = jest.fn(function () {
      this.aborted = true
    })

    // emitter.flushHeaders = jest.fn(function () {
    //   return;
    // });

    emitter.end = jest.fn(function (data, encoding, callback) {
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

    /* @HINT: ExpressJS specific methods */
    /* @CEHCK: https://expressjs.com/en/api.html#req */
    emitter.get = emitter.header

    emitter.range = jest.fn(function (size) {
      if (typeof size !== 'number') {
        return
      }

      const ranges = []
      ranges.type = this.headers['accept-ranges']
      return ranges
    })

    emitter.is = jest.fn(function (type) {
      if (typeof type !== 'string') {
        return
      }

      const requestContentType = this.headers['content-type']
      const indexOfWildCard = type.indexOf('*')

      if (indexOfWildCard === -1) {
        return requestContentType.includes(type)
      }

      return requestContentType.search(
        new RegExp(
          indexOfWildCard === 0
            /* eslint-disable-next-line */
            ? `^|${type.replace('*', '').replace('/', '\/')}`
            /* eslint-disable-next-line */
            : `${type.replace('*', '').replace('/', '\/')}|$`
          ,
          'ig'
        )
      ) !== -1
    })

    emitter.acceptsEncodings = jest.fn(function (encoding) {
      if (typeof encoding !== 'string') {
        return
      }

      const requestEncoding = this.headers['accept-encoding']
      return requestEncoding.includes(encoding)
    })

    emitter.acceptsCharsets = jest.fn(function (charset) {
      if (typeof charset !== 'string') {
        return
      }

      const requestCharset = this.headers['accept-charset']
      return requestCharset.includes(charset)
    })

    emitter.acceptsLanguages = jest.fn(function (language) {
      const requestLanguage = this.headers['accept-language']
      if (typeof language === 'string') {
        return requestLanguage.includes(language)
      }
    })

    emitter.param = jest.fn(function (paramName, defaultValue) {
      const hasProperty = ({}).hasOwnProperty

      if (hasProperty.call(this.params, paramName)) {
        return this.params[paramName]
      } else if (hasProperty.call(request.body, paramName)) {
        return this.body[paramName]
      } else if (hasProperty.call(request.query, paramName)) {
        return this.query[paramName]
      }
      return defaultValue
    })

    return emitter
  },
  make_expressHttpResponse: ({
    headers = {},
    locals = {},
    cookies = []
  } = {}) => {
    const _headers = Object.assign({}, {
      'content-type': 'text/html; charset=utf-8'
    },
    headers)
    const _cookies = JSON.parse(JSON.stringify(cookies))
    const _locals = JSON.parse(JSON.stringify(locals))

    const response = {
      socket: {
        writable: true
      },
      connection: {},
      statusCode: 0,
      statusMessage: '',
      httpVersion: '1.1',
      strictContentLength: false,
      writableEnded: false,
      writableFinished: false,
      finished: false,
      headersSent: false,
      req: null
    }

    response.__mocks = {
      get cookies () {
        return _cookies
      },
      get headers () {
        return _headers
      },
      get locals () {
        return _locals
      }
    }

    /* @HINT: http.ServerResponse specific fields */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpserverresponse */

    response.headers = _headers

    /* @HINT: ensure mocked response is a sub class of event emitter */
    const emitter = Object.create(EventEmitter.prototype, { })
    EventEmitter.call(emitter)

    /* @HINT: ExpressJS specific fields */
    /* @CHECK: https://expressjs.com/en/api.html#res */

    response.locals = _locals

    const chainableMethods = ['status', 'vary']
    const nonChainableMethods = ['sendFile', 'sendStatus', 'render', 'end', 'header', 'json']

    Object.assign(emitter, response)

    /* @HINT: http.ServerResponse specific methods */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpserverresponse */
    emitter.flushHeaders = jest.fn(() => {
      this.headersSent = true
    })

    /* @HINT: ExpressJS specific methods */
    /* @CHECK: https://expressjs.com/en/api.html#res */

    emitter.append = jest.fn(function (field, value) {
      const prev = this.get(field)
      let _value = value

      if (prev) {
        // concat the new and prev vals
        _value = Array.isArray(prev)
          ? prev.concat(_value)
          : Array.isArray(_value) ? [prev].concat(_value) : [prev, _value]
      }

      return this.set(field, _value)
    })

    emitter.cookie = jest.fn(function (name, value, options) {
      const _options = Object.assign({}, options)
      const req = this.req
      const secret = req.secret
      const signed = _options.signed

      let _value = value

      if (signed && !secret) {
        throw new Error('cookieParser("secret") required for signed cookies')
      }

      if (typeof _value === 'number') {
        _value = _value.toString()
      }

      if (typeof _value === 'object') {
        _value = 'j:' + JSON.stringify(_value)
      }

      if (signed) {
        _value = 's:' + sign(_value, secret)
      }

      if ('maxAge' in _options) {
        if (typeof _options.maxAge !== 'number') {
          throw new Error(`cookieParser("options") has invalid maxAge: ${_options.maxAge}`)
        }
        _options.expires = new Date(Date.now() + _options.maxAge)
        _options.maxAge /= 1000
      }
      if (_options.path === null) {
        _options.path = '/'
      }

      let headerVal = serializeCookie(name, String(_value), _options)

      // supports multiple 'res.cookie' calls by getting previous value
      const prevCokies = this.get('Set-Cookie')

      if (prevCokies) {
        if (Array.isArray(prevCokies)) {
          headerVal = prevCokies.concat(headerVal)
        } else {
          headerVal = [prevCokies, headerVal]
        }
      }

      this.set('Set-Cookie', headerVal)

      const _headerVals = typeof headerVal === 'string'
        ? [headerVal]
        : JSON.parse(JSON.stringify(headerVal))

      Object.assign(_cookies, _headerVals.reduce((cookiesMap, _headerVal) => {
        const [tuple, ...values] = _headerVal.split(';')
        const [_key, _val] = tuple.split('=')
        cookiesMap[_key] = {
          payload: _val,
          directives: values.map((eachValue) => eachValue.trim())
        }
        return cookiesMap
      }, {}))

      return this
    })

    emitter.clearCookies = jest.fn(function (name, options) {
      const opts = {
        expires: new Date(1),
        path: '/'
      }

      return this.cookie(name, '', options ? Object.assign(opts, options) : opts)
    })

    emitter.send = jest.fn(function () {
      ;
    })

    emitter.links = jest.fn(function (links = {}) {
      if (!(links instanceof Object)) {
        return
      }

      let link = this.get('Link') || ''

      if (link) {
        link += ', '
      }

      return this.set('Link', link + Object.keys(links).map(function (rel) {
        return '<' + links[rel] + '>; rel="' + rel + '"'
      }).join(', '))
    })

    emitter.attachment = jest.fn(function (filename) {
      if (typeof filename !== 'string') {
        return
      }

      const _filename = filename.split('/').pop()
      this.type(path.extname(_filename))

      this.set(
        'Content-Disposition',
        `attachment; filename="${_filename}"`
      )

      return this
    })

    emitter.type = jest.fn(function (_type) {
      if (typeof _type !== 'string') {
        return
      }

      let normalizedMimeType = _type

      if (normalizedMimeType.endsWith('html')) {
        normalizedMimeType = 'text/html'
      }

      const [, match] = /^(png|jpe?g|gif|svg)$/.exec(
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
        'Content-Type',
        '<mime-type>; charset=utf-8'.replace(
          '<mime-type>',
          normalizedMimeType
        )
      )
    })

    emitter.set = jest.fn(function (name, value) {
      if (typeof name !== 'string') {
        return
      }

      if (typeof value !== 'string' ||
        typeof value !== 'object') {
        return
      }

      this.headers[name.toLowerCase()] = value
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

    emitter.location = jest.fn(function (locationURI) {
      if (typeof locationURI === 'string') {
        return
      }

      const req = this.req
      let _locationURI = locationURI

      if (locationURI === 'back') {
        _locationURI = req.get('Referer') || '/'
      }

      this.set('Location', _locationURI)
    })

    emitter.redirect = jest.fn(function (...args) {
      let address = args[0]
      let body
      let status = 302

      // allow status / url
      if (args.length === 2) {
        if (typeof args[0] === 'number') {
          status = args[0]
          address = args[1]
        } else {
          console.warn('res.redirect(url, status) is deprecated: Use res.redirect(status, url) instead')
          status = args[1]
        }
      }

      // Set location header
      this.location(address)
      address = this.get('Location')

      // Support text/{plain,html} by default
      this.format({
        text: function () {
          body = STATUS_CODES[status] + '. Redirecting to ' + encodeURI(address)
        },
        html: function () {
          const u = escapeHtml(address)
          body = '<p>' + STATUS_CODES[status] + '. Redirecting to <a href="' + u + '">' + u + '</a></p>'
        },
        default: function () {
          body = ''
        }
      })

      // Respond
      this.statusCode = status
      this.set('Content-Length', Buffer.byteLength(body))

      if (this.req.method === 'HEAD') {
        this.end()
      } else {
        this.end(body)
      }
    })

    nonChainableMethods.forEach((method) => {
      emitter[method] = jest.fn(function () {
        return (...args) => {
          let result = null

          result = method === 'header'
            ? this.get(args[0])
            : null

          if (method === 'sendFile') {
            const req = this.req
            const res = this
            const next = req.next

            const _path = args[0]
            let _options = args[1]
            let _fn = args[2]

            if (!_path) {
              throw new TypeError('path argument is required to res.sendFile')
            }

            // support function as second arg
            if (typeof _options === 'function') {
              if (typeof _fn === 'undefined') {
                _fn = _options
                _options = {}
              }
            }

            _options = _options || {}

            if (!_options.root && !isAbsolute(path)) {
              throw new TypeError('path must be absolute or specify root to res.sendFile')
            }

            // create file stream
            const pathname = encodeURI(_path)
            const file = send(req, pathname, _options)

            // transfer
            sendfile(res, file, _options, function (err) {
              if (_fn) {
                return _fn(err)
              }
              if (err && err.code === 'EISDIR') {
                return next()
              }

              // next() all but write errors
              if (err && err.code !== 'ECONNABORTED' && err.syscall !== 'write') {
                next(err)
              }
            })
          }

          if (method === 'sendStatus') {
            const _statusCode = typeof args[0] === 'number' ? args[0] : 0
            const body = STATUS_CODES[_statusCode] || String(_statusCode)

            if (!body) {
              throw new Error('bad HTTP status code')
            }

            this.statusCode = _statusCode
            this.type('txt')

            return this.send(body)
          }

          if (method === 'json') {
            /* eslint-disable-next-line */
            let JSON_payload = args[0]
            /* @HINT: allow (body, status) together as arguments; (args[0], args[1]) */
            if (args.length === 2) {
              // res.json(body, status) backwards compat
              if (typeof args[1] === 'number') {
                console.warn('res.json(obj, status): Use res.status(status).json(obj) instead')
                this.statusCode = args[1]
              } else {
                console.warn('res.json(status, obj): Use res.status(status).json(obj) instead')
                this.statusCode = args[0]
                /* eslint-disable-next-line */
                JSON_payload = args[1]
              }
            }

            /* eslint-disable-next-line */
            const body = JSON.stringify(JSON_payload, null, ' ')

            // content-type
            if (!this.get('Content-Type')) {
              this.set('Content-Type', 'application/json')
            }

            return this.send(body)
          }

          return result
        }
      })
    })

    chainableMethods.forEach((method) => {
      emitter[method] = jest.fn(function (...args) {
        if (method === 'status') {
          this.statusCode = typeof args[0] === 'number' ? args[0] : 0
          this.statusMessage = STATUS_CODES[this.statusCode]
        }

        if (method === 'vary') {
          this.set(method, args[0])
        }

        return this
      })
    })

    return emitter
  }
}
