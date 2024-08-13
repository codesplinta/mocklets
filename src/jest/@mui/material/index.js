
import { mediaQueryMatcher } from './../../matchMedia'

export const createTheme = () => ({
  breakpoints: {
    up: (breakpoint) => {
      switch (breakpoint) {
        case 'sm':
          return '(min-width: 640px)'
        default:
          return '(min-width: 0px)'
      }
    }
  }
})
export const fakeMaterialUIKitPackageFactory = () => {
  return () => ({
    __esModule: true,
    useTheme: jest.fn().mockImplementation(() => createTheme()),
    useMediaQuery: (mediaQueryTagOrFunction, options = {}) => {
      let mediaQueryTag = ''

      if (!options.noSsr) {
        return false
      }

      if (typeof mediaQueryTagOrFunction === 'function') {
        mediaQueryTag = mediaQueryTagOrFunction(createTheme())
      } else {
        mediaQueryTag = mediaQueryTagOrFunction
      }

      return mediaQueryMatcher(mediaQueryTag).matches
    }
  })
}
