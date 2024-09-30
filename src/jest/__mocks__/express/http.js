import Stream from 'stream'
import { EventEmitter } from 'events'
import { STATUS_CODES } from 'http'
import * as path from 'path'
import * as util from 'util'
// const toPromise = (val) => (val instanceof Promise ? val : Promise.resolve(val))

/**
 * No-op function.
 * @private
 */

function noop () {}

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

/*
 *  The MurmurHash3 algorithm was created by Austin Appleby.  This JavaScript port was authored
 *  by whitequark (based on Java port by Yonik Seeley) and is placed into the public domain.
 *  The author hereby disclaims copyright to this source code.
 *
 *  This produces exactly the same hash values as the final C++ version of MurmurHash3 and
 *  is thus suitable for producing the same hash values across platforms.
 *
 *  There are two versions of this hash implementation. First interprets the string as a
 *  sequence of bytes, ignoring most significant byte of each codepoint. The second one
 *  interprets the string as a UTF-16 codepoint sequence, and appends each 16-bit codepoint
 *  to the hash independently. The latter mode was not written to be compatible with
 *  any other implementation, but it should offer better performance for JavaScript-only
 *  applications.
 *
 *  See http://github.com/whitequark/murmurhash3-js for future updates to this file.
 */

const MurmurHash3 = {
  mul32: function (m, n) {
    /* eslint-disable */
    const nlo = n & 0xffff
    const nhi = n - nlo
    /* eslint-enable */
    return ((nhi * m | 0) + (nlo * m | 0)) | 0
  },

  hashBytes: function (data, len, seed) {
    /* eslint-disable */
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593

    let h1 = seed
    const roundedEnd = len & ~0x3

    for (let i = 0; i < roundedEnd; i += 4) {
      let k1 = (data.charCodeAt(i) & 0xff) | ((data.charCodeAt(i + 1) & 0xff) << 8) | ((data.charCodeAt(i + 2) & 0xff) << 16) | ((data.charCodeAt(i + 3) & 0xff) << 24)

      k1 = this.mul32(k1, c1)
      k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17) // ROTL32(k1,15);
      k1 = this.mul32(k1, c2)

      h1 ^= k1
      h1 = ((h1 & 0x7ffff) << 13) | (h1 >>> 19) // ROTL32(h1,13);
      h1 = (h1 * 5 + 0xe6546b64) | 0
    }

    k1 = 0

    switch (len % 4) {
      case 3:
        k1 = (data.charCodeAt(roundedEnd + 2) & 0xff) << 16
        // fallthrough
      case 2:
        k1 |= (data.charCodeAt(roundedEnd + 1) & 0xff) << 8
        // fallthrough
      case 1:
        k1 |= (data.charCodeAt(roundedEnd) & 0xff)
        k1 = this.mul32(k1, c1)
        k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17) // ROTL32(k1,15);
        k1 = this.mul32(k1, c2)
        h1 ^= k1
    }

    // finalization
    h1 ^= len

    // fmix(h1);
    h1 ^= h1 >>> 16
    h1 = this.mul32(h1, 0x85ebca6b)
    h1 ^= h1 >>> 13
    h1 = this.mul32(h1, 0xc2b2ae35)
    h1 ^= h1 >>> 16
    /* eslint-disable */

    return h1
  },

  hashString: function (data, len, seed) {
    /* eslint-disable */
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593

    let h1 = seed
    const roundedEnd = len & ~0x1

    for (let i = 0; i < roundedEnd; i += 2) {
      let k1 = data.charCodeAt(i) | (data.charCodeAt(i + 1) << 16)

      k1 = this.mul32(k1, c1)
      k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17) // ROTL32(k1,15);
      k1 = this.mul32(k1, c2)

      h1 ^= k1
      h1 = ((h1 & 0x7ffff) << 13) | (h1 >>> 19) // ROTL32(h1,13);
      h1 = (h1 * 5 + 0xe6546b64) | 0
    }

    if ((len % 2) === 1) {
      k1 = data.charCodeAt(roundedEnd)
      k1 = this.mul32(k1, c1)
      k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17) // ROTL32(k1,15);
      k1 = this.mul32(k1, c2)
      h1 ^= k1
    }

    // finalization
    h1 ^= (len << 1)

    // fmix(h1);
    h1 ^= h1 >>> 16
    h1 = this.mul32(h1, 0x85ebca6b)
    h1 ^= h1 >>> 13
    h1 = this.mul32(h1, 0xc2b2ae35)
    h1 ^= h1 >>> 16
    /* eslint-enable */

    return h1
  }
}

const extname = path.extname
const join = path.join
const normalize = path.normalize
const resolve = path.resolve
const sep = path.sep

// status code to message map
statuses.message = STATUS_CODES

// status message (lower-case) to code map
statuses.code = createMessageToStatusCodeMap(STATUS_CODES)

// array of status codes
statuses.codes = createStatusCodeList(STATUS_CODES)

// status codes for redirects
statuses.redirect = {
  300: true,
  301: true,
  302: true,
  303: true,
  305: true,
  307: true,
  308: true
}

// status codes for empty bodies
statuses.empty = {
  204: true,
  205: true,
  304: true
}

// status codes for when you should retry the request
statuses.retry = {
  502: true,
  503: true,
  504: true
}

/**
 * Create a map of message to status code.
 * @private
 */

function createMessageToStatusCodeMap (codes) {
  const map = {}

  Object.keys(codes).forEach(function forEachCode (code) {
    const message = codes[code]
    const status = Number(code)

    // populate map
    map[message.toLowerCase()] = status
  })

  return map
}

/**
 * Create a list of all status codes.
 * @private
 */

function createStatusCodeList (codes) {
  return Object.keys(codes).map(function mapCode (code) {
    return Number(code)
  })
}

/**
 * Get the status code for given message.
 * @private
 */

function getStatusCode (message) {
  const msg = message.toLowerCase()

  if (!Object.prototype.hasOwnProperty.call(statuses.code, msg)) {
    throw new Error('invalid status message: "' + message + '"')
  }

  return statuses.code[msg]
}

/**
 * Get the status message for given code.
 * @private
 */

function getStatusMessage (code) {
  if (!Object.prototype.hasOwnProperty.call(statuses.message, code)) {
    throw new Error('invalid status code: ' + code)
  }

  return statuses.message[code]
}

/**
 * Get the status code.
 *
 * Given a number, this will throw if it is not a known status
 * code, otherwise the code will be returned. Given a string,
 * the string will be parsed for a number and return the code
 * if valid, otherwise will lookup the code assuming this is
 * the status message.
 *
 * @param {string|number} code
 * @returns {number}
 * @public
 */

function statuses (code) {
  if (typeof code === 'number') {
    return getStatusMessage(code)
  }

  if (typeof code !== 'string') {
    throw new TypeError('code must be a number or string')
  }

  // '403'
  const asNumber = parseInt(code, 10)
  if (!isNaN(asNumber)) {
    return getStatusMessage(asNumber)
  }

  return getStatusCode(code)
}

const encodeUrl = (url) => {
  /* @TODO: Complete implementation */
  return url
}

const escapeHtml = (html) => {
  /* @TODO: Complete implementation */
  return html
}

const sign = (payload) => {
  /* @TODO: Complete implementation */
  return payload
}

/**
 * RegExp to check for no-cache token in Cache-Control.
 * @private
 */

const CACHE_CONTROL_NO_CACHE_REGEXP = /(?:^|,)\s*?no-cache\s*?(?:,|$)/

/**
 * Regular expression for identifying a bytes Range header.
 * @private
 */

const BYTES_RANGE_REGEXP = /^ *bytes=/

/**
 * Maximum value allowed for the max age.
 * @private
 */

const MAX_MAXAGE = 60 * 60 * 24 * 365 * 1000 // 1 year

/**
 * Regular expression to match a path with a directory up component.
 * @private
 */

const UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/

/**
 * Destroy the given stream, and optionally suppress any future `error` events.
 *
 * @author https://github.com/stream-utils/destroy/blob/master/index.js#L27C1-L33C4
 *
 * @param {object} stream
 * @param {boolean} suppress
 * @public
 */

function destroy (stream, suppress) {
  if (isFsReadStream(stream)) {
    destroyReadStream(stream)
  } else if (hasDestroy(stream)) {
    stream.destroy()
  }

  if (isEventEmitter(stream) && suppress) {
    stream.removeAllListeners('error')
    stream.addListener('error', noop)
  }

  return stream
}

function onOpenClose () {
  if (typeof this.fd === 'number') {
    // actually close down the fd
    this.close()
  }
}

function destroyReadStream (stream) {
  stream.destroy()

  if (typeof stream.close === 'function') {
    // node.js core bug work-around
    stream.on('open', onOpenClose)
  }
}

/**
 * Determine if stream has destroy.
 * @private
 */

function hasDestroy (stream) {
  return stream instanceof Stream &&
    typeof stream.destroy === 'function'
}

/**
 * Determine if val is EventEmitter.
 * @private
 */

function isEventEmitter (val) {
  return val instanceof EventEmitter
}

/**
 * Determine if stream is fs.ReadStream stream.
 * @private
 */

function isFsReadStream (stream) {
  const RS = require('fs').ReadStream
  return stream instanceof RS
}

/**
 * Clear all headers from a response.
 *
 * @param {object} res
 * @private
 */

function clearHeaders (res) {
  const headers = getHeaderNames(res)

  for (let i = 0; i < headers.length; i++) {
    res.removeHeader(headers[i])
  }
}

/**
 * Collapse all leading slashes into a single slash
 *
 * @param {string} str
 * @private
 */
function collapseLeadingSlashes (str) {
  /* eslint-disable-next-line */
  for (var i = 0; i < str.length; i++) {
    if (str[i] !== '/') {
      break
    }
  }

  return i > 1
    ? '/' + str.substr(i)
    : str
}

/**
 * Determine if path parts contain a dotfile.
 *
 * @api private
 */

function containsDotFile (parts) {
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part.length > 1 && part[0] === '.') {
      return true
    }
  }

  return false
}

/**
 * Create a Content-Range header.
 *
 * @param {string} type
 * @param {number} size
 * @param {array} [range]
 */

function contentRange (type, size, range) {
  return type + ' ' + (range ? range.start + '-' + range.end : '*') + '/' + size
}

/**
 * Create a minimal HTML document.
 *
 * @param {string} title
 * @param {string} body
 * @private
 */

function createHtmlDocument (title, body) {
  return '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta charset="utf-8">\n' +
    '<title>' + title + '</title>\n' +
    '</head>\n' +
    '<body>\n' +
    '<pre>' + body + '</pre>\n' +
    '</body>\n' +
    '</html>\n'
}

function createError () {
  // so much arity going on ~_~
  let err
  let msg
  let status = 500
  let props = {}
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i]
    const type = typeof arg
    if (type === 'object' && arg instanceof Error) {
      err = arg
      status = err.status || err.statusCode || status
    } else if (type === 'number' && i === 0) {
      status = arg
    } else if (type === 'string') {
      msg = arg
    } else if (type === 'object') {
      props = arg
    } else {
      throw new TypeError('argument #' + (i + 1) + ' unsupported type ' + type)
    }
  }

  if (typeof status === 'number' && (status < 400 || status >= 600)) {
    console.warn('non-error status code; use only 4xx or 5xx status codes')
  }

  if (typeof status !== 'number' ||
    (!statuses.message[status] && (status < 400 || status >= 600))) {
    status = 500
  }

  if (!err) {
    // create error
    err = new Error(msg || statuses.message[status])
    Error.captureStackTrace(err, createError)
  }

  if ((err instanceof Error) || err.status !== status) {
    // add properties to generic error
    err.expose = status < 500
    err.status = err.statusCode = status
  }

  for (const key in props) {
    if (key !== 'status' && key !== 'statusCode') {
      err[key] = props[key]
    }
  }

  return err
}

/**
 * Create a HttpError object from simple arguments.
 *
 * @param {number} status
 * @param {Error|object} err
 * @private
 */

function createHttpError (status, err) {
  if (!err) {
    return createError(status)
  }

  return err instanceof Error
    ? createError(status, err, { expose: false })
    : createError(status, err)
}

/**
 * Generate an entity tag.
 *
 * @param {Buffer|string} entity
 * @return {string}
 * @private
 */

function entitytag (entity) {
  if (entity.length === 0) {
    // fast-path empty
    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'
  }

  let $entity = entity

  if (Array.isArray(entity)) {
    $entity = entity.join('|')
  }

  const byteLength = Buffer.byteLength($entity, 'utf8')

  // compute hash of entity
  /* @INFO:
   *
   * Instead of using a cryptographic hash based on `require('crypto')`,
   * use a less expensive and faster non-cryptographic hash `MurmurHash3`
   */
  const hash = Buffer.isBuffer(entity)
    ? MurmurHash3.hashBytes($entity, byteLength, 190)
    : MurmurHash3.hashString($entity, byteLength, 100)
  const finalHash = (Number(
    /* eslint-disable-next-line */
    Math.abs(hash) % 262144263494052048758001
  ).toString(16))

  // compute length of entity
  const len = typeof entity === 'string'
    ? byteLength
    : $entity.length

  return '"' + len.toString(16) + '-' + finalHash + '"'
}

/**
 * Create a simple ETag.
 *
 * @param {string|Buffer|Stats} entity
 * @param {object} [options]
 * @param {boolean} [options.weak]
 * @return {String}
 * @public
 */

function etag (entity, options) {
  if (entity === null) {
    throw new TypeError('argument entity is required')
  }

  // support fs.Stats object
  const isStats = isstats(entity)
  const weak = options && typeof options.weak === 'boolean'
    ? options.weak
    : isStats

  // validate argument
  if (!isStats && typeof entity !== 'string' && !Buffer.isBuffer(entity)) {
    throw new TypeError('argument entity must be string, Buffer, or fs.Stats')
  }

  // generate entity tag
  const tag = isStats
    ? stattag(entity)
    : entitytag(entity)

  return weak
    ? 'W/' + tag
    : tag
}

/**
 * Determine if object is a Stats object.
 *
 * @param {object} obj
 * @return {boolean}
 * @api private
 */

function isstats (obj) {
  const Stats = require('fs').Stats
  const toString = Object.prototype.toString

  if (typeof Stats === 'function' && obj instanceof Stats) {
    return true
  }

  // quack quack
  return obj && typeof obj === 'object' &&
    'ctime' in obj && toString.call(obj.ctime) === '[object Date]' &&
    'mtime' in obj && toString.call(obj.mtime) === '[object Date]' &&
    'ino' in obj && typeof obj.ino === 'number' &&
    'size' in obj && typeof obj.size === 'number'
}

/**
 * Generate a tag for a stat.
 *
 * @param {object} stat
 * @return {string}
 * @private
 */

function stattag (stat) {
  const mtime = stat.mtime.getTime().toString(16)
  const size = stat.size.toString(16)

  return '"' + size + '-' + mtime + '"'
}

/**
 * decodeURIComponent.
 *
 * Allows V8 to only deoptimize this fn instead of all
 * of send().
 *
 * @param {String} path
 * @api private
 */

function decode (path) {
  try {
    return decodeURIComponent(path)
  } catch (err) {
    return -1
  }
}

/**
 * Get the header names on a response.
 *
 * @param {object} res
 * @returns {array[string]}
 * @private
 */

function getHeaderNames (res) {
  return typeof res.getHeaderNames !== 'function'
    ? Object.keys(res._headers || {})
    : res.getHeaderNames()
}

/**
 * Determine if emitter has listeners of a given type.
 *
 * The way to do this check is done three different ways in Node.js >= 0.10
 * so this consolidates them into a minimal set using instance methods.
 *
 * @param {EventEmitter} emitter
 * @param {string} type
 * @returns {boolean}
 * @private
 */

function hasListeners (emitter, type) {
  const count = typeof emitter.listenerCount !== 'function'
    ? emitter.listeners(type).length
    : emitter.listenerCount(type)

  return count > 0
}

/**
 * Normalize the index option into an array.
 *
 * @param {boolean|string|array} val
 * @param {string} name
 * @private
 */

function normalizeList (val, name) {
  const list = [].concat(val || [])

  for (let i = 0; i < list.length; i++) {
    if (typeof list[i] !== 'string') {
      throw new TypeError(name + ' must be array of strings or false')
    }
  }

  return list
}

/**
 * Check freshness of the response using request and response headers.
 *
 * @param {Object} reqHeaders
 * @param {Object} resHeaders
 * @return {Boolean}
 * @public
 */

function fresh (reqHeaders, resHeaders) {
  // fields
  const modifiedSince = reqHeaders['if-modified-since']
  const noneMatch = reqHeaders['if-none-match']

  // unconditional request
  if (!modifiedSince && !noneMatch) {
    return false
  }

  // Always return stale when Cache-Control: no-cache
  // to support end-to-end reload requests
  // https://tools.ietf.org/html/rfc2616#section-14.9.4
  const cacheControl = reqHeaders['cache-control']
  if (cacheControl && CACHE_CONTROL_NO_CACHE_REGEXP.test(cacheControl)) {
    return false
  }

  // if-none-match takes precedent over if-modified-since
  if (noneMatch) {
    if (noneMatch === '*') {
      return true
    }
    const etag = resHeaders.etag

    if (!etag) {
      return false
    }

    const matches = parseTokenList(noneMatch)
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      if (match === etag || match === 'W/' + etag || 'W/' + match === etag) {
        return true
      }
    }

    return false
  }

  // if-modified-since
  if (modifiedSince) {
    const lastModified = resHeaders['last-modified']
    const modifiedStale = !lastModified || !(parseHttpDate(lastModified) <= parseHttpDate(modifiedSince))

    if (modifiedStale) {
      return false
    }
  }

  return true
}

/**
 * Parse an HTTP Date into a number.
 *
 * @param {string} date
 * @private
 */

function parseHttpDate (date) {
  const timestamp = date && Date.parse(date)

  return typeof timestamp === 'number'
    ? timestamp
    : NaN
}

/**
 * Parse a HTTP token list.
 *
 * @param {string} str
 * @private
 */

function parseTokenList (str) {
  let end = 0
  const list = []
  let start = 0

  // gather tokens
  for (let i = 0, len = str.length; i < len; i++) {
    switch (str.charCodeAt(i)) {
      case 0x20: /*   */
        if (start === end) {
          start = end = i + 1
        }
        break
      case 0x2c: /* , */
        if (start !== end) {
          list.push(str.substring(start, end))
        }
        start = end = i + 1
        break
      default:
        end = i + 1
        break
    }
  }

  // final token
  if (start !== end) {
    list.push(str.substring(start, end))
  }

  return list
}

/**
 * Set an object of headers on a response.
 *
 * @param {object} res
 * @param {object} headers
 * @private
 */

function setHeaders (res, headers) {
  const keys = Object.keys(headers)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    res.setHeader(key, headers[key])
  }
}

/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @author https://github.com/jshttp/mime-types/blob/master/index.js#L72C1-L77C4
 *
 * @param {string} str
 * @return {boolean|string}
 */
function getMimeType (str) {
  if (!str || typeof str !== 'string') {
    return false
  }

  const localFileExtensionMap = {
    bin: 'application/octet-stream',
    json: 'application/json',
    pdf: 'application/pdf',
    csv: 'text/csv',
    doc: 'application/msword',
    aac: 'audio/aac',
    mp3: 'audio/mpeg',
    ico: 'image/vnd.microsoft.icon',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    html: 'text/html',
    htm: 'text/html',
    xml: 'application/xhtml+xml',
    txt: 'text/plain',
    js: 'application/javascript',
    mjs: 'application/javascript',
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    css: 'text/css',
    md: 'text/x-markdown'
  }

  let mime = str.indexOf('/') === -1
    ? localFileExtensionMap[str.toLowerCase().substr(str.lastIndexOf('.') + 1)]
    : str

  if (!mime) {
    return false
  }

  if (mime.indexOf('charset') === -1) {
    const charset = mime.startsWith('text/') ||
      mime.startsWith('application/j') ||
        mime.startsWith('application/xhtml') ||
          mime.startsWith('application/pdf')
      ? 'UTF-8'
      : ''
    if (charset) mime += '; charset=' + charset.toLowerCase()
  }

  return mime
}

/**
 * Initialize a `SendStream` with the given `path`.
 *
 * @param {Request} req
 * @param {String} path
 * @param {object} [options]
 * @private
 */

function SendStream (req, path, options) {
  Stream.call(this)

  const opts = options || {}

  this.options = opts
  this.path = path
  this.req = req

  this.fs = require('fs')

  this._acceptRanges = opts.acceptRanges !== undefined
    ? Boolean(opts.acceptRanges)
    : true

  this._cacheControl = opts.cacheControl !== undefined
    ? Boolean(opts.cacheControl)
    : true

  this._etag = opts.etag !== undefined
    ? Boolean(opts.etag)
    : true

  this._dotfiles = opts.dotfiles !== undefined
    ? opts.dotfiles
    : 'ignore'

  if (this._dotfiles !== 'ignore' && this._dotfiles !== 'allow' && this._dotfiles !== 'deny') {
    throw new TypeError('dotfiles option must be "allow", "deny", or "ignore"')
  }

  this._extensions = opts.extensions !== undefined
    ? normalizeList(opts.extensions, 'extensions option')
    : []

  this._immutable = opts.immutable !== undefined
    ? Boolean(opts.immutable)
    : false

  this._index = opts.index !== undefined
    ? normalizeList(opts.index, 'index option')
    : ['index.html']

  this._lastModified = opts.lastModified !== undefined
    ? Boolean(opts.lastModified)
    : true

  this._maxage = opts.maxAge || opts.maxage
  this._maxage = typeof this._maxage === 'string'
    ? msFn(this._maxage)
    : Number(this._maxage)
  this._maxage = !isNaN(this._maxage)
    ? Math.min(Math.max(0, this._maxage), MAX_MAXAGE)
    : 0

  this._root = opts.root
    ? resolve(opts.root)
    : null
}

/**
 * Inherits from `Stream`.
 */

util.inherits(SendStream, Stream)

/**
 * Emit error with `status`.
 *
 * @param {number} status
 * @param {Error} [err]
 * @private
 */

SendStream.prototype.error = function error (status, err) {
  // emit if listeners instead of responding
  if (hasListeners(this, 'error')) {
    return this.emit('error', createHttpError(status, err))
  }

  const res = this.res
  const msg = statuses.message[status] || String(status)
  const doc = createHtmlDocument('Error', escapeHtml(msg))

  // clear existing headers
  clearHeaders(res)

  // add error headers
  if (err && err.headers) {
    setHeaders(res, err.headers)
  }

  // send basic response
  res.statusCode = status
  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.setHeader('Content-Length', Buffer.byteLength(doc))
  res.setHeader('Content-Security-Policy', "default-src 'none'")
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(doc)
}

/**
 * Check if the pathname ends with "/".
 *
 * @return {boolean}
 * @private
 */

SendStream.prototype.hasTrailingSlash = function hasTrailingSlash () {
  return this.path[this.path.length - 1] === '/'
}

/**
 * Check if this is a conditional GET request.
 *
 * @return {Boolean}
 * @api private
 */

SendStream.prototype.isConditionalGET = function isConditionalGET () {
  return this.req.headers['if-match'] ||
    this.req.headers['if-unmodified-since'] ||
    this.req.headers['if-none-match'] ||
    this.req.headers['if-modified-since']
}

/**
 * Check if the request preconditions failed.
 *
 * @return {boolean}
 * @private
 */

SendStream.prototype.isPreconditionFailure = function isPreconditionFailure () {
  const req = this.req
  const res = this.res

  // if-match
  const match = req.headers['if-match']
  if (match) {
    const etag = res.getHeader('ETag')
    return !etag || (match !== '*' && parseTokenList(match).every(function (match) {
      return match !== etag && match !== 'W/' + etag && 'W/' + match !== etag
    }))
  }

  // if-unmodified-since
  const unmodifiedSince = parseHttpDate(req.headers['if-unmodified-since'])
  if (!isNaN(unmodifiedSince)) {
    const lastModified = parseHttpDate(res.getHeader('Last-Modified'))
    return isNaN(lastModified) || lastModified > unmodifiedSince
  }

  return false
}

/**
 * Strip various content header fields for a change in entity.
 *
 * @private
 */

SendStream.prototype.removeContentHeaderFields = function removeContentHeaderFields () {
  const res = this.res

  res.removeHeader('Content-Encoding')
  res.removeHeader('Content-Language')
  res.removeHeader('Content-Length')
  res.removeHeader('Content-Range')
  res.removeHeader('Content-Type')
}

/**
 * Respond with 304 not modified.
 *
 * @api private
 */

SendStream.prototype.notModified = function notModified () {
  const res = this.res

  this.removeContentHeaderFields()
  res.statusCode = 304
  res.end()
}

/**
 * Raise error that headers already sent.
 *
 * @api private
 */

SendStream.prototype.headersAlreadySent = function headersAlreadySent () {
  const err = new Error('Can\'t set headers after they are sent.')
  this.error(500, err)
}

/**
 * Check if the request is cacheable, aka
 * responded with 2xx or 304 (see RFC 2616 section 14.2{5,6}).
 *
 * @return {Boolean}
 * @api private
 */

SendStream.prototype.isCachable = function isCachable () {
  const statusCode = this.res.statusCode
  return (statusCode >= 200 && statusCode < 300) ||
    statusCode === 304
}

/**
 * Handle stat() error.
 *
 * @param {Error} error
 * @private
 */

SendStream.prototype.onStatError = function onStatError (error) {
  switch (error.code) {
    case 'ENAMETOOLONG':
    case 'ENOENT':
    case 'ENOTDIR':
      this.error(404, error)
      break
    default:
      this.error(500, error)
      break
  }
}

/**
 * Check if the cache is fresh.
 *
 * @return {Boolean}
 * @api private
 */

SendStream.prototype.isFresh = function isFresh () {
  return fresh(this.req.headers, {
    etag: this.res.getHeader('ETag'),
    'last-modified': this.res.getHeader('Last-Modified')
  })
}

/**
 * Check if the range is fresh.
 *
 * @return {Boolean}
 * @api private
 */

SendStream.prototype.isRangeFresh = function isRangeFresh () {
  const ifRange = this.req.headers['if-range']

  if (!ifRange) {
    return true
  }

  // if-range as etag
  if (ifRange.indexOf('"') !== -1) {
    const etag = this.res.getHeader('ETag')
    return Boolean(etag && ifRange.indexOf(etag) !== -1)
  }

  // if-range as modified date
  const lastModified = this.res.getHeader('Last-Modified')
  return parseHttpDate(lastModified) <= parseHttpDate(ifRange)
}

/**
 * Redirect to path.
 *
 * @param {string} path
 * @private
 */

SendStream.prototype.redirect = function redirect (path) {
  const res = this.res

  if (hasListeners(this, 'directory')) {
    this.emit('directory', res, path)
    return
  }

  if (this.hasTrailingSlash()) {
    this.error(403)
    return
  }

  const loc = encodeUrl(collapseLeadingSlashes(this.path + '/'))
  const doc = createHtmlDocument('Redirecting', 'Redirecting to ' + escapeHtml(loc))

  // redirect
  res.statusCode = 301
  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.setHeader('Content-Length', Buffer.byteLength(doc))
  res.setHeader('Content-Security-Policy', "default-src 'none'")
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Location', loc)
  res.end(doc)
}

/**
 * Pipe to `res.
 *
 * @param {Stream} res
 * @return {Stream} res
 * @api public
 */

SendStream.prototype.pipe = function pipe (res) {
  // root path
  const root = this._root

  // references
  this.res = res

  // decode the path
  let path = decode(this.path)
  if (path === -1) {
    this.error(400)
    return res
  }

  // null byte(s)
  if (~path.indexOf('\0')) {
    this.error(400)
    return res
  }

  let parts
  if (root !== null) {
    // normalize
    if (path) {
      path = normalize('.' + sep + path)
    }

    // malicious path
    if (UP_PATH_REGEXP.test(path)) {
      this.error(403)
      return res
    }

    // explode path parts
    parts = path.split(sep)

    // join / normalize from optional root dir
    path = normalize(join(root, path))
  } else {
    // ".." is malicious without "root"
    if (UP_PATH_REGEXP.test(path)) {
      this.error(403)
      return res
    }

    // explode path parts
    parts = normalize(path).split(sep)

    // resolve the path
    path = resolve(path)
  }

  // dotfile handling
  if (containsDotFile(parts)) {
    switch (this._dotfiles) {
      case 'allow':
        break
      case 'deny':
        this.error(403)
        return res
      case 'ignore':
      default:
        this.error(404)
        return res
    }
  }

  // index file support
  if (this._index.length && this.hasTrailingSlash()) {
    this.sendIndex(path)
    return res
  }

  this.sendFile(path)
  return res
}

/**
 * Transfer `path`.
 *
 * @param {String} path
 * @api public
 */

SendStream.prototype.send = function send (path, stat) {
  const options = this.options
  const opts = {}
  const res = this.res
  const req = this.req

  let len = stat.size
  let ranges = req.headers.range
  let offset = options.start || 0

  if (res.headersSent) {
    // impossible to send now
    this.headersAlreadySent()
    return
  }

  // set header fields
  this.setHeader(path, stat)

  // set content-type
  this.type(path)

  // conditional GET support
  if (this.isConditionalGET()) {
    if (this.isPreconditionFailure()) {
      this.error(412)
      return
    }

    if (this.isCachable() && this.isFresh()) {
      this.notModified()
      return
    }
  }

  // adjust len to start/end options
  len = Math.max(0, len - offset)
  if (options.end !== undefined) {
    const bytes = options.end - offset + 1
    if (len > bytes) len = bytes
  }

  // Range support
  if (this._acceptRanges && BYTES_RANGE_REGEXP.test(ranges)) {
    // parse
    ranges = parseRange(len, ranges, {
      combine: true
    })

    // If-Range support
    if (!this.isRangeFresh()) {
      ranges = -2
    }

    // unsatisfiable
    if (ranges === -1) {
      // Content-Range
      res.setHeader('Content-Range', contentRange('bytes', len))

      // 416 Requested Range Not Satisfiable
      return this.error(416, {
        headers: { 'Content-Range': res.getHeader('Content-Range') }
      })
    }

    // valid (syntactically invalid/multiple ranges are treated as a regular response)
    if (ranges !== -2 && ranges.length === 1) {
      // Content-Range
      res.statusCode = 206
      res.setHeader('Content-Range', contentRange('bytes', len, ranges[0]))

      // adjust for requested range
      offset += ranges[0].start
      len = ranges[0].end - ranges[0].start + 1
    }
  }

  // clone options
  for (const prop in options) {
    opts[prop] = options[prop]
  }

  // set read options
  opts.start = offset
  opts.end = Math.max(offset, offset + len - 1)

  // content-length
  res.setHeader('Content-Length', len)

  // HEAD support
  if (req.method === 'HEAD') {
    res.end()
    return
  }

  this.stream(path, opts)
}

/**
 * Transfer file for `path`.
 *
 * @param {String} path
 * @api private
 */
SendStream.prototype.sendFile = function sendFile (path) {
  let i = 0
  const self = this

  this.fs.stat(path, function onstat (err, stat) {
    const pathEndsWithSep = path[path.length - 1] === sep
    if (err && err.code === 'ENOENT' && !extname(path) && !pathEndsWithSep) {
      // not found, check extensions
      return next(err)
    }
    if (err) return self.onStatError(err)
    if (stat.isDirectory()) return self.redirect(path)
    if (pathEndsWithSep) return self.error(404)
    self.emit('file', path, stat)
    self.send(path, stat)
  })

  function next (err) {
    if (self._extensions.length <= i) {
      return err
        ? self.onStatError(err)
        : self.error(404)
    }

    const p = path + '.' + self._extensions[i++]

    this.fs.stat(p, function (err, stat) {
      if (err) return next(err)
      if (stat.isDirectory()) return next()
      self.emit('file', p, stat)
      self.send(p, stat)
    })
  }
}

/**
 * Transfer index for `path`.
 *
 * @param {String} path
 * @api private
 */
SendStream.prototype.sendIndex = function sendIndex (path) {
  let i = -1
  const self = this

  function next (err) {
    if (++i >= self._index.length) {
      if (err) return self.onStatError(err)
      return self.error(404)
    }

    const p = join(path, self._index[i])

    this.fs.stat(p, function (err, stat) {
      if (err) return next(err)
      if (stat.isDirectory()) return next()
      self.emit('file', p, stat)
      self.send(p, stat)
    })
  }

  next()
}

/**
 * Stream `path` to the response.
 *
 * @param {String} path
 * @param {Object} options
 * @api private
 */

SendStream.prototype.stream = function stream (path, options) {
  const self = this
  const res = this.res

  // pipe
  const stream = this.fs.createReadStream(path, options)
  this.emit('stream', stream)
  stream.pipe(res)

  // cleanup
  function cleanup () {
    destroy(stream, true)
  }

  // response finished, cleanup
  onFinished(res, cleanup)

  // error handling
  stream.on('error', function onerror (err) {
    // clean up stream early
    cleanup()

    // error
    self.onStatError(err)
  })

  // end
  stream.on('end', function onend () {
    self.emit('end')
  })
}

/**
 * Set content-type based on `path`
 * if it hasn't been explicitly set.
 *
 * @param {String} path
 * @api private
 */

SendStream.prototype.type = function type (path) {
  const res = this.res

  if (res.getHeader('Content-Type')) return

  const ext = extname(path)
  const type = getMimeType(ext)

  if (typeof type === 'string') {
    res.setHeader('Content-Type', type)
  }
}

/**
 * Set response header fields, most
 * fields may be pre-defined.
 *
 * @param {String} path
 * @param {Object} stat
 * @api private
 */

SendStream.prototype.setHeader = function setHeader (path, stat) {
  const res = this.res

  this.emit('headers', res, path, stat)

  if (this._acceptRanges && !res.getHeader('Accept-Ranges')) {
    res.setHeader('Accept-Ranges', 'bytes')
  }

  if (this._cacheControl && !res.getHeader('Cache-Control')) {
    let cacheControl = 'public, max-age=' + Math.floor(this._maxage / 1000)

    if (this._immutable) {
      cacheControl += ', immutable'
    }

    res.setHeader('Cache-Control', cacheControl)
  }

  if (this._lastModified && !res.getHeader('Last-Modified')) {
    const modified = stat.mtime.toUTCString()
    res.setHeader('Last-Modified', modified)
  }

  if (this._etag && !res.getHeader('ETag')) {
    const val = etag(stat)
    res.setHeader('ETag', val)
  }
}

const send = (req, pathname, options) => {
  return new SendStream(req, pathname, options)
}

/**
 * RegExp to match *( ";" parameter ) in RFC 7231 sec 3.1.1.1
 *
 * parameter     = token "=" ( token / quoted-string )
 * token         = 1*tchar
 * tchar         = "!" / "#" / "$" / "%" / "&" / "'" / "*"
 *               / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
 *               / DIGIT / ALPHA
 *               ; any VCHAR, except delimiters
 * quoted-string = DQUOTE *( qdtext / quoted-pair ) DQUOTE
 * qdtext        = HTAB / SP / %x21 / %x23-5B / %x5D-7E / obs-text
 * obs-text      = %x80-FF
 * quoted-pair   = "\" ( HTAB / SP / VCHAR / obs-text )
 */
const PARAM_REGEXP = /; *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g // eslint-disable-line no-control-regex
const TEXT_REGEXP = /^[\u000b\u0020-\u007e\u0080-\u00ff]+$/ // eslint-disable-line no-control-regex
const TOKEN_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/

/**
  * RegExp to match quoted-pair in RFC 7230 sec 3.2.6
  *
  * quoted-pair = "\" ( HTAB / SP / VCHAR / obs-text )
  * obs-text    = %x80-FF
  */
const QESC_REGEXP = /\\([\u000b\u0020-\u00ff])/g // eslint-disable-line no-control-regex

/**
  * RegExp to match chars that must be quoted-pair in RFC 7230 sec 3.2.6
  */
const QUOTE_REGEXP = /([\\"])/g

/**
  * RegExp to match type in RFC 7231 sec 3.1.1.1
  *
  * media-type = type "/" subtype
  * type       = token
  * subtype    = token
  */
const TYPE_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/

/**
  * Format object to media type.
  *
  * @param {object} obj
  * @return {string}
  * @public
  */

function contentTypeFormat (obj) {
  if (!obj || typeof obj !== 'object') {
    throw new TypeError('argument obj is required')
  }

  const parameters = obj.parameters
  const type = obj.type

  if (!type || !TYPE_REGEXP.test(type)) {
    throw new TypeError('invalid type')
  }

  let string = type

  // append parameters
  if (parameters && typeof parameters === 'object') {
    let param
    const params = Object.keys(parameters).sort()

    for (let i = 0; i < params.length; i++) {
      param = params[i]

      if (!TOKEN_REGEXP.test(param)) {
        throw new TypeError('invalid parameter name')
      }

      string += '; ' + param + '=' + qstring(parameters[param])
    }
  }

  return string
}

/**
  * Parse media type to object.
  *
  * @param {string|object} string
  * @return {Object}
  * @public
  */

function contentTypeParse (string) {
  if (typeof string !== 'string') {
    throw new TypeError('argument string is required')
  }

  // support req/res-like objects as argument
  const header = typeof string === 'object'
    ? getContentType(string)
    : string

  if (typeof header !== 'string') {
    throw new TypeError('argument string is required to be a string')
  }

  let index = header.indexOf(';')
  const type = index !== -1
    ? header.slice(0, index).trim()
    : header.trim()

  if (!TYPE_REGEXP.test(type)) {
    throw new TypeError('invalid media type')
  }

  const obj = new ContentType(type.toLowerCase())

  // parse parameters
  if (index !== -1) {
    let key
    let match
    let value

    PARAM_REGEXP.lastIndex = index

    while ((match = PARAM_REGEXP.exec(header))) {
      if (match.index !== index) {
        throw new TypeError('invalid parameter format')
      }

      index += match[0].length
      key = match[1].toLowerCase()
      value = match[2]

      if (value.charCodeAt(0) === 0x22 /* " */) {
        // remove quotes
        value = value.slice(1, -1)

        // remove escapes
        if (value.indexOf('\\') !== -1) {
          value = value.replace(QESC_REGEXP, '$1')
        }
      }

      obj.parameters[key] = value
    }

    if (index !== header.length) {
      throw new TypeError('invalid parameter format')
    }
  }

  return obj
}

/**
  * Get content-type from req/res objects.
  *
  * @param {object}
  * @return {Object}
  * @private
  */

function getContentType (obj) {
  let header

  if (typeof obj.getHeader === 'function') {
    // res-like
    header = obj.getHeader('content-type')
  } else if (typeof obj.headers === 'object') {
    // req-like
    header = obj.headers && obj.headers['content-type']
  }

  if (typeof header !== 'string') {
    throw new TypeError('content-type header is missing from object')
  }

  return header
}

/**
  * Quote a string if necessary.
  *
  * @param {string} val
  * @return {string}
  * @private
  */

function qstring (val) {
  const str = String(val)

  // no need to quote tokens
  if (TOKEN_REGEXP.test(str)) {
    return str
  }

  if (str.length > 0 && !TEXT_REGEXP.test(str)) {
    throw new TypeError('invalid parameter value')
  }

  return '"' + str.replace(QUOTE_REGEXP, '\\$1') + '"'
}

/**
  * Class to represent a content type.
  * @private
  */
function ContentType (type) {
  this.parameters = Object.create(null)
  this.type = type
}

function parseRange (size, rangeHeader, options = {}) {
  const index = rangeHeader.indexOf('=')

  if (index === -1) {
    return -2
  }

  // split the range string
  const rangeSlice = rangeHeader.slice(index + 1).split(',')
  const ranges = []

  // add ranges type
  ranges.type = rangeHeader.slice(0, index)

  // parse all ranges
  for (let rangeSliceCount = 0; rangeSliceCount < rangeSlice.length; rangeSliceCount++) {
    const range = rangeSlice[rangeSliceCount].split('-')
    let start = parseInt(range[0], 10)
    let end = parseInt(range[1], 10)

    // -nnn
    if (isNaN(start)) {
      start = size - end
      end = size - 1
    // nnn-
    } else if (isNaN(end)) {
      end = size - 1
    }

    // limit last-byte-pos to current length
    if (end > size - 1) {
      end = size - 1
    }

    // invalid or unsatisifiable
    if (isNaN(start) || isNaN(end) || start > end || start < 0) {
      continue
    }

    // add range
    ranges.push({
      start: start,
      end: end
    })
  }

  if (ranges.length < 1) {
    // unsatisifiable
    return -1
  }

  return options.combine
    ? combineRanges(ranges)
    : ranges
}

function setCharset (type, charset) {
  if (!type || !charset) {
    return type
  }

  // parse type
  const parsed = contentTypeParse(type)

  // set charset
  parsed.parameters.charset = charset

  // format type
  return contentTypeFormat(parsed)
}

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

function onFinished (msg, listener) {
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

/**
 * Combine overlapping & adjacent ranges.
 * @private
 */

function combineRanges (ranges) {
  const ordered = ranges.map(mapWithIndex).sort(sortByRangeStart)

  /* eslint-disable-next-line */
  for (var cursor = 0, rangesCount = 1; rangesCount < ordered.length; rangesCount++) {
    const range = ordered[rangesCount]
    const current = ordered[cursor]

    if (range.start > current.end + 1) {
      // next range
      ordered[++cursor] = range
    } else if (range.end > current.end) {
      // extend range
      current.end = range.end
      current.index = Math.min(current.index, range.index)
    }
  }

  // trim ordered array
  ordered.length = cursor + 1

  // generate combined range
  const combined = ordered.sort(sortByRangeIndex).map(mapWithoutIndex)

  // copy ranges type
  combined.type = ranges.type

  return combined
}

/**
 * Map function to add index value to ranges.
 * @private
 */

function mapWithIndex (range, index) {
  return {
    start: range.start,
    end: range.end,
    index: index
  }
}

/**
 * Map function to remove index value from ranges.
 * @private
 */

function mapWithoutIndex (range) {
  return {
    start: range.start,
    end: range.end
  }
}

/**
 * Sort function to sort ranges by index.
 * @private
 */

function sortByRangeIndex (a, b) {
  return a.index - b.index
}

/**
 * Sort function to sort ranges by start position.
 * @private
 */

function sortByRangeStart (a, b) {
  return a.start - b.start
}

/**
 * Parse accept params `str` returning an
 * object with `.value`, `.quality` and `.params`.
 * also includes `.originalIndex` for stable sorting
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function acceptParams (str, index) {
  const parts = str.split(/ *; */)
  const ret = { value: parts[0], quality: 1, params: {}, originalIndex: index }

  for (let i = 1; i < parts.length; ++i) {
    const bits = parts[i].split(/ *= */)
    if (bits[0] === 'q') {
      ret.quality = parseFloat(bits[1])
    } else {
      ret.params[bits[0]] = bits[1]
    }
  }

  return ret
}

/**
 * Normalize the given `type`, for example "html" becomes "text/html".
 *
 * @param {String} type
 * @return {Object}
 * @api private
 */

const normalizeType = (type) => {
  return type.indexOf('/') > -1
    ? acceptParams(type)
    /* eslint-disable-next-line */
    : { value: getMimeType(type), params: {} }
}

/**
 * Normalize `types`, for example "html" becomes "text/html".
 *
 * @param {Array} types
 * @return {Array}
 * @api private
 */

const normalizeTypes = function (types = []) {
  const ret = []

  for (let i = 0; i < types.length; ++i) {
    ret.push(normalizeType(types[i]))
  }

  return ret
}

/**
 * A type guard for errors.
 * @private
 *
 * @param value - The value to test
 * @returns A boolean `true` if the provided value is an Error-like object
 */
function isError (value) {
  return typeof value === 'object' && value !== null && 'message' in value
}

function msFn (value) {
  try {
    if (typeof value === 'string') {
      return parseMs(value)
    }
    throw new Error('Value provided to ms() must be a string or number.')
  } catch (error) {
    const message = isError(error)
      ? `${error.message}. value=${JSON.stringify(value)}`
      : 'An unknown error has occurred.'
    throw new Error(message)
  }
}

function parseMs (str) {
  if (typeof str !== 'string' || str.length === 0 || str.length > 100) {
    throw new Error(
      'Value provided to ms.parse() must be a string with length between 1 and 99.'
    )
  }

  // Helpers.
  const s = 1000
  const m = s * 60
  const h = m * 60
  const d = h * 24
  const w = d * 7
  const y = d * 365.25
  const match =
    /^(?<value>-?(?:\d+)?\.?\d+) *(?<type>milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    )
  // Named capture groups need to be manually typed today.
  // https://github.com/microsoft/TypeScript/issues/32098
  const groups = match?.groups

  if (!groups) {
    return NaN
  }

  const n = parseFloat(groups.value)
  const type = (groups.type || 'ms').toLowerCase()

  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'weeks':
    case 'week':
    case 'w':
      return n * w
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      // This should never occur.
      throw new Error(
        `The unit ${type} was matched, but no matching case exists.`
      )
  }
}

const isContentNegotiationValid = (acceptHeader, query) => {
  if (typeof query !== 'string') {
    return false
  }

  let mimeType = query === 'text' ? 'txt' : query

  if (!mimeType.includes('/')) {
    const _type = getMimeType(mimeType)

    if (typeof _type === 'boolean') {
      return false
    }

    mimeType = _type.replace(/; charset=(?:.*)$/, '')
  }

  return (acceptHeader.includes('*/*') || ((acceptHeader.includes(mimeType) ||
    acceptHeader.includes(mimeType.replace(/\/(?:.*)$/, '/*'))) &&
      (acceptHeader.indexOf(mimeType + ';q=') === -1 || acceptHeader.indexOf(
        mimeType.replace(/\/(?:.*)$/, '/*') + ';q='
      ) === -1)))
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
  function onfile (path, stat) {
    if (path && options.lastModified !== false) {
      res.setHeader('Last-Modified', (new Date(stat.mtime)).toGMTString())
    }
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
  file.pipe(res)
}

let _app

export const expressjsFakesFactory = {
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
    method = 'GET',
    url = 'http://localhost:3650',
    port = '3650',
    xhr = false,
    fresh = false,
    originalUrl = 'http://localhost:3650',
    signedCookies = {}
  } = {}) => {
    const today = new Date()
    const _headers = Object.assign({}, {
      accept: 'text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8',
      'accept-encoding': 'deflate, gzip;q=1.0, *;q=0.5',
      'accept-charset': 'utf-8, iso-8859-1;q=0.7',
      'accept-language': 'en-US, en;q=0.9, fr;q=0.8, de;q=0.7, *;q=0.5',
      'content-type': 'text/html; charset=utf-8',
      'if-modified-since': today.toGMTString(),
      connection: 'keep-alive',
      pragma: 'no-cache',
      'cache-control': 'no-cache'
    }, headers)
    const { hostname, protocol, pathname, query: $query } = ((new URL(url || originalUrl)))
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
      headersSent: false,
      reusedSocket: false
    }

    Object.defineProperty(request, 'accepted', {
      get () {
        const accept = _headers.accept
        return accept.split(',').map((acceptBit) => {
          const { value, quality } = acceptParams(acceptBit)
          const [type, subtype] = value.trim().split('/')
          return { value: value.trim(), quality, type, subtype }
        })
      },
      configurable: false,
      enumerable: true
    })

    Object.defineProperty(request, 'acceptedLanguages', {
      get () {
        const acceptLanguage = _headers['accept-language']
        return acceptLanguage.split(',').map((acceptBit) => {
          const { value } = acceptParams(acceptBit)
          return value.trim()
        })
      },
      configurable: false,
      enumerable: true
    })

    Object.defineProperty(request, 'acceptedCharsets', {
      get () {
        const acceptCharset = _headers['accept-charset']
        return acceptCharset.split(',').map((acceptBit) => {
          const { value } = acceptParams(acceptBit)
          return value.trim()
        })
      },
      configurable: false,
      enumerable: true
    })

    if (!_app) {
      const express = require('express')
      _app = express()
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
    request.fresh = !(_headers['cache-control'].includes('no-cache')) || fresh
    request.hostname = hostname
    request.ips = [ip]
    request.signedCookies = JSON.parse(JSON.stringify(signedCookies))
    request.cookies = JSON.parse(JSON.stringify(cookies))
    request.query = isEmpty(query) ? reduceUrlFromQueryString($query) : query
    request.stale = !fresh
    request.url = url
    request.originalUrl = originalUrl
    request.secure = request.protocol === 'https'
    request.baseUrl = pathname.split('/').slice(0, -1).join('/')
    request.path = `/${pathname.split('/').slice(-1).join('/')}`
    request.subdomains = (hostname || '').split('.').slice(0, -2).sort()
    request.params = params

    Object.assign(emitter, request)

    emitter.app = _app
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

    /**
     * Parse "Range" header relative to the given file `size`.
     *
     * @author https://github.com/jshttp/range-parser/blob/master/index.js#L17C1-L25C4
     *
     * @param {Number} size
     * @param {Object} [options]
     *
     * @return {Array}
     * @public
     */
    emitter.range = jest.fn(function (size, { combine = false }) {
      // this.headers['accept-ranges']
      const ranges = this.headers.range
      return parseRange(size, ranges, { combine })
    })

    emitter.is = jest.fn(function (type) {
      if (typeof type !== 'string' ||
        method.toLowerCase() === 'get' ||
          method.toLowerCase() === 'head') {
        return false
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

    emitter.accepts = jest.fn(function (types) {
      const acceptHeader = this.get('Accept')
      let acceptMatches = []

      if (typeof types === 'string') {
        if (isContentNegotiationValid(acceptHeader, types)) {
          return types
        }
      } else if (Array.isArray(types)) {
        acceptMatches = types.filter((type) => {
          return isContentNegotiationValid(acceptHeader, type)
        })

        if (acceptMatches.length > 0) {
          return acceptMatches[0]
        }
      }

      return false
    })

    emitter.acceptsEncodings = jest.fn(function (encoding) {
      if (typeof encoding !== 'string') {
        return false
      }

      const requestEncoding = this.headers['accept-encoding']
      return requestEncoding.includes(encoding)
    })

    emitter.acceptsCharsets = jest.fn(function (charset) {
      if (typeof charset !== 'string') {
        return false
      }

      const requestCharset = this.headers['accept-charset']
      return requestCharset.includes(charset)
    })

    emitter.acceptsLanguages = jest.fn(function (language) {
      const requestLanguage = this.headers['accept-language']
      if (typeof language !== 'string') {
        return false
      }

      return requestLanguage.includes(language)
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
    const today = new Date()
    let _charset = 'utf-8'
    const _headers = Object.assign({}, {
      'last-modified': today.toGMTString(),
      'cache-control': 'no-cache',
      'content-encoding': 'deflate, gzip',
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
      headersSent: false
    }

    Object.defineProperty(response, 'charset', {
      set ($charset) {
        const contentType = _headers['content-type']
        _charset = $charset
        _headers['content-type'] = contentType.replace(
          /; charset=(?:.*)$/,
          `; charset=${$charset}`
        )
      },
      get () {
        return _charset
      },
      configurable: false,
      enumerable: true
    })

    if (!_app) {
      const express = require('express')
      _app = express()
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
    const nonChainableMethods = ['sendFile', 'sendfile'/* Supporting Express v3.x.x */, 'sendStatus', 'jsonp', 'header', 'json']

    Object.assign(emitter, response)

    emitter.app = _app

    /* @HINT: http.ServerResponse specific methods */
    /* @CHECK: https://nodejs.org/api/http.html#class-httpserverresponse */
    emitter.flushHeaders = jest.fn(function () {
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

    emitter.end = jest.fn(() => {

    })

    emitter.format = jest.fn(function (layout) {
      const req = this.req
      const next = req.next
      const defaultFn = layout.default

      if (defaultFn) {
        delete layout.default
      }

      const keys = Object.keys(layout)
      const key = req.accepts(keys)

      this.vary('Accept')

      if (key) {
        this.set('Content-Type', normalizeType(key).value)
        layout[key](req, this, next)
      } else if (typeof defaultFn === 'function') {
        defaultFn()
      } else {
        const err = new Error('Not Acceptable')
        err.status = 406
        err.types = normalizeTypes(keys).map(function (o) {
          return o.value
        })
        next(err)
      }

      return this
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

    emitter.send = jest.fn(function (body) {
      let chunk = body
      let encoding
      let len
      let type

      // settings
      const app = this.app || {}
      const req = this.req

      // allow status / body
      if (arguments.length === 2) {
        // res.send(body, status) backwards compat
        if (typeof arguments[0] !== 'number' && typeof arguments[1] === 'number') {
          console.warn('res.send(body, status): Use res.status(status).send(body) instead')
          this.statusCode = arguments[1]
        } else {
          console.warn('res.send(status, body): Use res.status(status).send(body) instead')
          this.statusCode = arguments[0]
          chunk = arguments[1]
        }
      }

      // disambiguate res.send(status) and res.send(status, num)
      if (typeof chunk === 'number' && arguments.length === 1) {
        // res.send(status) will set status message as text string
        if (!this.get('Content-Type')) {
          this.type('txt')
        }

        console.warn('res.send(status): Use res.sendStatus(status) instead')
        this.statusCode = chunk
        chunk = STATUS_CODES[chunk]
      }

      switch (typeof chunk) {
        // string defaulting to html
        case 'string':
          if (!this.get('Content-Type')) {
            this.type('html')
          }
          break
        case 'boolean':
        case 'number':
        case 'object':
          if (chunk === null) {
            chunk = ''
          } else if (Buffer.isBuffer(chunk)) {
            if (!this.get('Content-Type')) {
              this.type('bin')
            }
          } else {
            return this.json(chunk)
          }
          break
      }

      // write strings in utf-8
      if (typeof chunk === 'string') {
        encoding = 'utf8'
        type = this.get('Content-Type')

        // reflect this in content-type
        if (typeof type === 'string') {
          this.set('Content-Type', setCharset(type, encoding))
        }
      }

      // populate Content-Length
      if (chunk !== undefined) {
        if (!Buffer.isBuffer(chunk)) {
          // convert chunk to Buffer; saves later double conversions
          chunk = Buffer.from(chunk, encoding)
          encoding = undefined
        }

        len = chunk.length
        this.set('Content-Length', len)
      }

      // populate ETag
      let etag
      const generateETag = len !== undefined && app['etag fn']
      if (typeof generateETag === 'function' && !this.get('ETag')) {
        if ((etag = generateETag(chunk, encoding))) {
          this.set('ETag', etag)
        }
      }

      // freshness
      if (req.fresh) {
        this.statusCode = 304
      }

      // strip irrelevant headers
      if (this.statusCode === 204 || this.statusCode === 304) {
        this.removeHeader('Content-Type')
        this.removeHeader('Content-Length')
        this.removeHeader('Transfer-Encoding')
        chunk = ''
      }

      if (req.method === 'HEAD') {
        // skip body for HEAD
        this.end()
      } else {
        // respond
        this.end(chunk, encoding)
      }

      return this
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
        return this
      }

      const _filename = filename.split('/').pop()
      this.type(extname(_filename))

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

      let normalizedMimeType = getMimeType(_type)

      if (typeof normalizedMimeType === 'boolean') {
        return
      }

      const [, match] = /^(png|jpe?g|gif|svg)$/.exec(
        _type
      ) || ['', '']

      if (match) {
        normalizedMimeType = getMimeType(match)
      }

      this.set(
        'Content-Type',
        normalizedMimeType
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

      let $value = value

      if (name.toLowerCase() === 'content-type') {
        $value = value.replace(
          /; charset=(?:.*)$/,
          `; charset=${_charset}`
        )
      }

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

    emitter.render = jest.fn(function (view, options, fn) {
      options = options || {}
      const self = this
      const req = this.req
      const app = this.app || { render () { } }

      let $fn = fn
      let $options = {}

      // support callback function as second arg
      if (typeof options === 'function') {
        $fn = options
      } else {
        $options = JSON.parse(JSON.stringify(options))
      }

      // merge res.locals
      $options._locals = self.locals

      // default callback to respond
      $fn = $fn || function (err, str) {
        if (err) {
          return req.next(err)
        }

        self.send(str)
      }

      // render
      app.render(view, $options, $fn)
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

    emitter.download = jest.fn(function (path, filename, options, fn) {
      let $fn = fn
      let $options = options
      let $filename = filename

      const defaultOptions = {
        maxAge: 0,
        root: process.cwd(),
        lastModified: true,
        immutable: false,
        acceptRanges: true,
        cacheControl: true,
        dotfiles: 'ignore'
      }

      /* @HINT: support function argument signature for Express v3.x.x */
      if (typeof filename === 'function') {
        if (typeof options === 'undefined') {
          $fn = filename
          $filename = null
        }
      }

      /* @HINT: support function argument signature for Express v3.x.x, v4.x.x, v5.x.x */
      if (typeof options === 'function') {
        if (typeof fn === 'undefined') {
          $fn = options
          $options = defaultOptions
        }
      }

      $filename = $filename || path

      if (!($options instanceof Object)) {
        return
      } else {
        $options = Object.assign({}, defaultOptions, $options)
      }

      // set Content-Disposition when file is sent
      $options.headers = {
        'Content-Disposition': `attachment; filename="${$filename}"`
      }

      // Resolve the full path for sendFile
      const fullPath = resolve(path)

      return typeof $fn === 'function'
        ? _sendFile(fullPath, $options, $fn)
        : _sendFile(fullPath, $options)
    })

    function _sendFile (...args) {
      const req = this.req
      const res = this
      const next = req.next || (() => undefined)

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
        if (typeof _fn === 'function') {
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

    function _header (...args) {
      return this.get(args[0])
    }

    function _json (...args) {
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

      const app = this.app || {}
      const replacer = app['json replacer'] || null
      const spaces = app['json spaces'] || ' '
      /* eslint-disable-next-line */
      const body = JSON.stringify(JSON_payload, replacer, spaces)

      // content-type
      if (!this.get('Content-Type')) {
        this.set('Content-Type', 'application/json')
      }

      return this.send(body)
    }

    function _jsonP () {
      let val = arguments[0]

      // allow status / body
      if (arguments.length === 2) {
        // res.json(body, status) backwards compat
        if (typeof arguments[1] === 'number') {
          console.warn('res.jsonp(obj, status): Use res.status(status).json(obj) instead')
          this.statusCode = arguments[1]
        } else {
          console.warn('res.jsonp(status, obj): Use res.status(status).jsonp(obj) instead')
          this.statusCode = arguments[0]
          val = arguments[1]
        }
      }

      // settings
      const app = this.app || {}
      const replacer = app['json replacer']
      const spaces = app['json spaces']

      let body = JSON.stringify(val, replacer, spaces)
      let callback = this.req.query[app['jsonp callback name'] || 'callback']

      // content-type
      if (!this.get('Content-Type')) {
        this.charset = 'utf-8'
        this.set('X-Content-Type-Options', 'nosniff')
        this.set('Content-Type', 'application/json; charset=utf-8')
      }

      // fixup callback
      if (Array.isArray(callback)) {
        callback = callback[0]
      }

      // jsonp
      if (typeof callback === 'string' && callback.length !== 0) {
        this.charset = 'utf-8'
        this.set('X-Content-Type-Options', 'nosniff')
        this.set('Content-Type', 'text/javascript; charset=utf-8')

        // restrict callback charset
        /* eslint-disable-next-line */
        callback = callback.replace(/[^\[\]\w$.]/g, '')

        // replace chars not allowed in JavaScript that are in JSON
        body = body
          .replace(/\u2028/g, '\\u2028')
          .replace(/\u2029/g, '\\u2029')

        // the /**/ is a specific security mitigation for "Rosetta Flash JSONP abuse"
        // the typeof check is just to reduce client error noise
        body = '/**/ typeof ' + callback + ' === \'function\' && ' + callback + '(' + body + ');'
      }

      return this.send(body)
    }

    function _sendStatus (...args) {
      const _statusCode = typeof args[0] === 'number' ? args[0] : 0
      const body = STATUS_CODES[_statusCode] || String(_statusCode)

      if (!body) {
        throw new Error('bad HTTP status code')
      }

      this.statusCode = _statusCode
      this.type('txt')

      return this.send(body)
    }

    nonChainableMethods.forEach((method) => {
      emitter[method] = jest.fn(function () {
        return (...args) => {
          if (method === 'header') {
            return _header.apply(this, args)
          }

          if (method === 'sendFile' || method === 'sendfile') {
            return _sendFile.apply(this, args)
          }

          if (method === 'sendStatus') {
            return _sendStatus.apply(this, args)
          }

          if (method === 'json') {
            return _json.apply(this, args)
          }

          if (method === 'jsonp') {
            return _jsonP.apply(this, args)
          }
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
