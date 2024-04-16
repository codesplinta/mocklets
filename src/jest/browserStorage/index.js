export const fakeStorageInstanceFactory = () => (function () {
  let __keys = []
  let __map = {}

  const storageFake = new Proxy(
    {
      setItem (key, value) {
        if (typeof key !== 'string') {
          return
        }

        if (typeof value !== 'string') {
          return
        }

        __keys.push(key)
        __map[key] = value
      },
      removeItem (key) {
        const index = __keys.indexOf(key)
        if (index === -1) {
          return
        }
        __keys.splice(index, 1)
        delete __map[key]
      },
      key (keyIndex) {
        if (typeof keyIndex !== 'number') {
          throw new TypeError("Failed to execute 'key' on 'Storage': 1 argument required, but only 0 present.")
        }
        return __keys[keyIndex] || null
      },
      length: -1,
      clear () {
        __keys = []
        __map = {}
      },
      getItem (key) {
        if (typeof key !== 'string') {
          return null
        }
        return __map[key] || null
      }
    },
    {
      get: (target, property) => {
        if (typeof target[property] !== 'number') {
          return target[property]
        } else {
          if (property === 'length') {
            return __keys.length
          }
        }
      },
      set: (target, prop, value) => {
        if (prop === Symbol.toStringTag || prop === 'constructor') {
          target[prop] = value
          return value
        }

        if (target[prop]) {
          throw new Error(`${prop}: readonly`)
        }
      }
    }
  )

  storageFake[Symbol.toStringTag] = 'Storage'
  storageFake.constructor = 'function Storage() { [native code] }'

  return Object.freeze(storageFake)
}())
