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

export const fakeFormikReactPackageFactory = () => {
  let _values = {}
  let _submitCount = 0
  let _isSubmitting = false

  const _isValidating = false

  const originalModule = jest.requireActual('formik')
  return () => {
    return ({
      __esModule: true,
      ...originalModule,
      useFormikContext: jest.fn(),
      useFormik: jest.fn(({ initialValues, onSubmit }) => {
        if (isEmpty(_values)) {
          _values = JSON.parse(JSON.stringify(initialValues))
        }

        return {
          get values () {
            return _values
          },
          getFieldMeta: jest.fn(),
          touched: true,
          get isSubmitting () {
            return _isSubmitting
          },
          get isValidating () {
            return _isValidating
          },
          errors: false,
          get submitCount () {
            return _submitCount
          },
          submitForm () {
            return new Promise((resolve, reject) => {
              try {
                _isSubmitting = true
                const result = onSubmit(_values)

                if (isAsync(onSubmit) || isPromise(result)) {
                  result.then(resolve).catch(reject)
                } else {
                  ++_submitCount
                  _isSubmitting = false
                  resolve(result)
                }
              } catch (error) {
                ++_submitCount
                _isSubmitting = false
                reject(error)
              }
            })
          }
        }
      })
    })
  }
}
