export const fakeReacti18NextPackageFactory = (translationObjectMap = {}) => {
  return () => ({
    __esModule: true,
    ...jest.requireActual('react-i18next'),
    useTranslation: () => ({
      t: jest.fn((transaltionKey) => translationObjectMap[transaltionKey]),
      i18n: {
        changeLanguage: () => new Promise(() => {})
      }
    })
  })
}
