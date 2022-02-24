const EventEmitter = require('events').EventEmitter;
const url = require('url')
const toPromise = (val) => (val instanceof Promise ? val : Promise.resolve(val))

export const http = {
  makeNext: (callback) => {
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
  makeRequest: ({ ip = '::1', body = {}, headers = {}, params = {}, query = {}, method = 'GET', path = '', url = '', originalUrl = '' } = {}) => {
    const _headers = headers
    const request = {
      body,
      params,
      query,
      socket: {},
      cookies: {},
      signedCookies: {},
      ip
    }

    request.headers = _headers
    request.ips = [ip]

    /* @HINT: ensure mocked request is a sub class of event emitter */
    let emitter = Object.create(EventEmitter.prototype, { });
    EventEmitter.call(emitter);

    request.method = method || 'GET';
    request.url = url || path;
    request.originalUrl = originalUrl || url;
    request.path = path || (url ? url.parse(url).pathname : '');

    Object.assign(emitter, request);

    emitter.param = function (paramName, defaultValue) {
        if (request.params.hasOwnProperty(paramName)) {
            return request.params[paramName];
        } else if (request.body.hasOwnProperty(paramName)) {
            return request.body[paramName];
        } else if (request.query.hasOwnProperty(paramName)) {
            return request.query[paramName];
        }
        return defaultValue;
    }

    emitter.get = emitter.getHeader = emitter.header = function (name) {
      name = name.toLowerCase();
      switch (name) {
        case 'referer':
        case 'referrer':
          return _headers.referrer || _headers.referer;
        default:
          return _headers[name];
      }
    }

    return emitter;
  },
  makeResponse: ({ headers = {} } = {}) => {
    const _headers = headers
    const response = {
      socket: {}
    }

    /* @HINT: ensure mocked response is a sub class of event emitter */
    let emitter = Object.create(EventEmitter.prototype, { });
    EventEmitter.call(emitter);

    const chainableMethods = ['status']
    const nonChainableMethods = ['send', 'end', 'header', 'json']

    Object.assign(emitter, response)

    chainableMethods.forEach((method) => emitter[method] = jest.fn().mockReturnValue(response))
    nonChainableMethods.forEach((method) => emitter[method] = jest.fn(() => (...args) => method === 'header' ? _headers[args[0]] : true))

    return emitter
  }
}
