export const fakeReacti18NextPackageFactory = (translationObjectMap = {
  common: { }
}) => {
  /* @SEE: https://react.i18next.com/misc/testing */
  return () => ({
    __esModule: true,
    withTranslation: () => Component => {
      Component.defaultProps = { ...Component.defaultProps, t: jest.fn(() => '') }
      return Component
    },
    useTranslation: () => ({
      t: jest.fn((transaltionKey, { ns }) => translationObjectMap[ns][transaltionKey]),
      i18n: {
        changeLanguage: jest.fn(() => new Promise(() => {}))
      }
    })
  })
}
