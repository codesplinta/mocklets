'use strict'
const isPromise = (object) => {
  if (typeof object === 'undefined' ||
    object === null ||
      !(object instanceof Object)) {
    return false
  }
  return Boolean(
    (typeof object.then === 'function' || Object.prototype.toString.call(object) === '[object Promise]')
  )
}

const isAsync = (callback) => {
  if (typeof callback !== 'function') {
    return false
  }
  const $string = callback.toString().trim()
  return Boolean($string.match(/^async /) || callback.constructor.name === 'AsyncFunction')
}

export const fakeAdonisJSCachePackageFactory = () => (function () {
  return function Cache () {
    return {
      _store: {},
      has (key = '') {
        return Promise.resolve(Boolean(this._store[key]))
      },
      async add (key = '', val, decayMins) {
        const expires = Math.floor((Date.now() / 1000) + decayMins * 60)
        this._store[key] = {
          data: JSON.stringify(val),
          expiration: expires
        }
        /* @HINT: Simulate wait time to add data to a fake remote store (e.g. [fake] Redis) */
        await (new Promise((resolve) => setTimeout(resolve, 500)))
        return true
      },
      async remember (key = '', decayTimeInMins, callback) {
        if ((await this.get(key)) === null) {
          const expires = Math.floor(
            (Date.now() / 1000) + decayTimeInMins * 60
          )
          const result = callback()
          this._store[key] = {
            data: JSON.stringify(
              (isAsync(callback) || isPromise(result)
                ? await result
                : result
              )
            ),
            expiration: expires
          }
        }
        return true
      },
      async get (key = '', defaultValue = 0) {
        const val = this._store[key]
        if (val === undefined) {
          return defaultValue
        }
        if (Date.now() / 1000 >= val.expiration) {
          await this.forget(key)
          return null
        }
        return JSON.parse(val.data)
      },
      async pull (key = '', defaultVal = null) {
        const val = this._store[key]
        if (!val) {
          return defaultVal
        }
        await this.forget(key)
        return JSON.parse(val.data)
      },
      async flush () {
        const result = this._store = {}
        /* @HINT: Simulate wait time to flush data from a fake remote store (e.g. [fake] Redis) */
        await (new Promise((resolve) => setTimeout(resolve, 500)))
        return result !== null
      },
      getPrefix () {
        return ''
      },
      _incrementOrDecrement (key, value, callback) {
        return new Promise((resolve) => {
          const val = this._store[key]
          if (val === undefined) {
            resolve(false)
            return
          }
          const currentValue = parseInt(val.data || value)
          if (Number.isNaN(currentValue)) {
            resolve(false)
            return
          }
          const newValue = callback(currentValue)
          this._store[key].value = newValue
          resolve(newValue)
        })
      },
      increment (key, value = 1) {
        return this._incrementOrDecrement(key, value, (currentValue) => {
          return currentValue + value
        })
      },
      decrement (key, value = 1) {
        return this._incrementOrDecrement(key, value, (currentValue) => {
          return currentValue + value
        })
      },
      async forget (key = '') {
        /* @HINT: Simulate wait time to drop a data key from a fake remote store (e.g. [fake] Redis) */
        await (new Promise((resolve) => setTimeout(resolve, 500)))
        return (delete this._store[key]) !== null
      }
    }
  }
})()
