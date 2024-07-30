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

export const fakeReactHookFormPackageFactory = () => {
  let _values = {}
  let _errors = {}
  let _dirtyFields = {}
  let _touchedFields = {}
  let _invalidFields = {}
  let _defaultValues = {}
  let _registeredFields = {}

  let _invalid = false
  let _formStatus = 'idle'
  let _submitCount = 0

  const mockController = () => {
    return {}// <></>
  }

  return () => ({
    __esModule: true,
    ...jest.requireActual('react-hook-form'),
    Controller: () => mockController(),
    useForm: ({ defaultValues }) => {
      _defaultValues = defaultValues
      _values = JSON.parse(JSON.stringify(defaultValues))

      return {
        control: () => ({
          register: jest.fn(),
          unregister: jest.fn(),
          getFieldState: jest.fn((fieldName, formState) => {
            return {
              error: formState.errors[fieldName] || {},
              invalid: _invalidFields[fieldName] || false,
              isDirty: _dirtyFields[fieldName] || false,
              isTouched: _touchedFields[fieldName] || false
            }
          }),
          _names: {
            array: new Set('_test'),
            mount: new Set('_test'),
            unMount: new Set('_test'),
            watch: new Set('_test'),
            focus: '_test',
            watchAll: false
          },
          _subjects: {
            watch: jest.fn(),
            array: jest.fn(),
            state: jest.fn()
          },
          _getWatch: jest.fn(),
          _formValues: ['_test'],
          _defaultValues: ['_test']
        }),
        watch: () => jest.fn(() => true),
        handleSubmit (onSubmit, onSubmitError = () => undefined) {
          return jest.fn((e) => {
            if (typeof onSubmit !== 'function' ||
              typeof onSubmitError !== 'function') {
              return
            }

            let canSubmit = false
            const form = e.target
            const elements = Array.from(form.elements).filter((element) => {
              return element.type !== 'hidden' || element.type !== 'reset' || element.type !== 'image' || element.type !== 'button' || element.type !== 'submit'
            })

            if (elements.length > 0) {
              canSubmit = elements.filter((element) => {
                if (element.tagName === 'input' && element.required) {
                  return element.value !== ''
                }

                if (element.tagName === 'select' && element.required) {
                  return element.options[element.selectedIndex].value !== ''
                }

                return false
              }).length > 0
            }

            if (!canSubmit || !isEmpty(_invalidFields)) {
              if (!isEmpty(_errors)) {
                onSubmitError(_errors)
              }
              return
            }

            try {
              _formStatus = 'submitting'
              const result = onSubmit(_values, e)

              if (isAsync(onSubmit) || isPromise(result)) {
                result.then(() => {
                  ++_submitCount
                  _formStatus = 'submitted'
                })
              } else {
                ++_submitCount
                _formStatus = 'submitted'
              }
            } catch (error) {
              _formStatus = 'submitted_failure'
              throw error
            }
          })
        },
        getValues: jest.fn(() => (_values)),
        setValue: jest.fn((key, val) => {
          _values[key] = val
        }),
        get formState () {
          return {
            get errors () {
              return _errors
            },
            get isDirty () {
              return Object.values(
                _values
              ).filter(
                ($value) => $value
              ).length !== 0
            },
            get dirtyFields () {
              return _dirtyFields
            },
            get isSubmitting () {
              return _formStatus === 'submitting'
            },
            get isValid () {
              return !_invalid
            },
            get isSubmitted () {
              return _formStatus === 'submitted'
            },
            get isSubmittedSuccessful () {
              return _formStatus === 'submitted'
            },
            get submitCount () {
              return _submitCount
            },
            get isLoading () {
              return false
            }
          }
        },
        register (name, { required = false, disabled = false, tabIndex = 0, onBlur, onChange, value, defaultValue, min, max, minLength, maxLength }) {
          if (typeof name !== 'string') {
            return {}
          }

          return {
            onBlur: (e) => {
              if (typeof onBlur === 'function') {
                onBlur(e)
              }
            },
            onChange: (e) => {
              if (e.target.value !== '') {
                _values[name] = e.target.value
                if (name.includes('.')) {
                  ;
                } else {
                  _dirtyFields[name] = true
                }
              } else {
                if (name.includes('.')) {
                  ;
                } else if (name in _dirtyFields) {
                  delete _dirtyFields[name]
                }
              }

              if (typeof onChange === 'function') {
                onChange(e)
              }

              if (_registeredFields[e.target.name] !== e.target) {
                return
              }

              let error = null

              if (!e.target.checkValidity()) {
                if (!e.target.validity.valid) {
                  _invalidFields[e.target.name] = true
                }

                switch (true) {
                  case e.target.validity.valueMissing:
                    error = {
                      message: e.target.validationMessage, // `${e.target.name} is a required field`,
                      ref: { name: e.target.name },
                      type: 'required'
                    }
                    break
                  case e.target.validity.rangeOverflow:
                    error = {
                      message: e.target.validationMessage,
                      ref: { name: e.target.name },
                      type: 'max'
                    }
                    break
                }
              }

              if (error !== null) {
                _errors[e.target.name] = error
              }

              if (isEmpty(_dirtyFields) && isEmpty(_errors) && isEmpty(_invalidFields)) {
                _invalid = false
              } else {
                _invalid = true
              }
            },
            defaultValue: defaultValue || _values[name] || '',
            name,
            tabIndex,
            disabled,
            required,
            ref: (node) => {
              if (!node) {
                delete _registeredFields[name]
              } else {
                _registeredFields[name] = node
              }
            }
          }
        },
        getFieldState: jest.fn((fieldName, formState) => {
          return {
            error: formState.errors[fieldName] || {},
            invalid: _invalidFields[fieldName] || false,
            isDirty: _dirtyFields[fieldName] || false,
            isTouched: _touchedFields[fieldName] || false
          }
        }),
        setError: jest.fn((fieldName, error, { shouldFocus = false }) => {
          if (typeof fieldName !== 'string' || fieldName.includes('.')) {
            return
          }

          _errors[fieldName] = error

          if (!shouldFocus) {
            return
          }

          const node = _registeredFields[fieldName]

          if (node) {
            if (typeof node.focus === 'function') {
              node.focus()
            }
          }
        }),
        clearErrors: jest.fn((fieldOrFields) => {
          if (typeof fieldOrFields === 'undefined') {
            _errors = {}
            return
          }

          if (typeof fieldOrFields === 'string') {
            if (fieldOrFields.includes('.')) {
              ;
            } else {
              delete _errors[fieldOrFields]
            }
          } else {
            if (Array.isArray(fieldOrFields)) {
              ;
            }
          }
        }),
        reset: jest.fn((values, options = {}) => {
          _values = values || {}

          if (!options.keepTouched) {
            _touchedFields = {}
          }

          if (!options.keepDirty) {
            _dirtyFields = {}
          }

          if (!options.keepErrors) {
            _errors = {}
          }

          if (!options.keepIsValid) {
            _invalidFields = {}
          }

          if (!options.keepDefaultValues) {
            _defaultValues = {}
          }

          if (!options.keepIsSubmitted) {
            _formStatus = 'idle'
          }
        }),
        resetField: jest.fn((fieldName, options = {}) => {
          if (typeof fieldName !== 'string' || fieldName.includes('.')) {
            return
          }

          _values[fieldName] = options.defalutValue || undefined

          if (!options.keepTouched) {
            delete _touchedFields[fieldName]
          }

          if (!options.keepDirty) {
            delete _dirtyFields[fieldName]
          }

          if (!options.keepErrors) {
            delete _errors[fieldName]
          }

          if (!options.keepDefaultValues) {
            delete _defaultValues[fieldName]
          }
        }),
        trigger: jest.fn(() => ({})),
        unregister: jest.fn(() => {
          _registeredFields = {}
        }),
        setFocus: jest.fn((fieldName, { shouldSelect = false }) => {
          const node = _registeredFields[fieldName]

          if (node) {
            if (typeof node.focus === 'function') {
              node.focus()
            }
          }

          if (shouldSelect) {
            if (typeof node.select === 'function') {
              node.select()
            }
          }
        })
      }
    }
  })
}
