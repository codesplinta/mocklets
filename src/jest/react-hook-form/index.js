export const fakeReactHookFormPackageFactory = () => {
  let _value = {}

  const mockController = () => {
    return <></>
  };

  return () => ({
    __esModule: true,
    ...jest.requireActual('react-hook-form'),
    Controller: () => mockController(),
    useFormContext: () => ({
      set _value (value) {
        _value = value || {}
      },
      control: () => ({}),
      watch: () => true,
      handleSubmit: jest.fn((onSubmit) => onSubmit),
      getValues: () => (_value),
      setValue: jest.fn((key, val) => {
        _value[key] = val
      }),
      formState: { errors: {}, isDirty: true, isSubmitting: false, isValid: true }
    })
  })
}
