'use strict'

export const fakeAdonisJSCachePackageFactory = () => (function () {
  return function Cache () {
    return {
      _store: {},
      async has (key = '') {
        return Boolean(this._store[key])
      },
      async add (key = '', val, decayMins) {
        const expires = Math.floor((Date.now() / 1000) + decayMins * 60)
        this._store[key] = {
          data: JSON.stringify(val),
          expiration: expires
        }
        return true
      },
      async remember (key = '', decayMins, callBackVal) {
        if ((await this.get(key)) === null) {
          const expires = Math.floor((Date.now() / 1000) + decayMins * 60)
          this._store[key] = {
            data: JSON.stringify((await callBackVal())),
            expiration: expires
          }
        }
        return true
      },
      async get (key = '', defaultVal = 0) {
        const val = this._store[key]
        if (val === undefined) {
          return defaultVal
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
        return result !== null
      },
      getPrefix () {
        return ''
      },
      _incrementOrDecrement (key, value, callback) {
        return new Promise((resolve, reject) => {
          const val = this._store[key]
          if (val === undefined) {
            resolve(false)
            return
          }
          const currentValue = parseInt(val.data)
          if (Number.isNaN(currentValue)) {
            resolve(false)
            return
          }
          const newValue = callback(currentValue)
          this._store[key].value = newValue
          resolve(newValue)
        })
      },
      async increment (key, value = 1) {
        return this._incrementOrDecrement(key, value, (currentValue) => {
          return currentValue + value
        })
      },
      async decrement (key, value = 1) {
        return this._incrementOrDecrement(key, value, (currentValue) => {
          return currentValue + value
        })
      },
      async forget (key = '') {
        return (delete this._store[key]) !== null
      }
    }
  }
})()
