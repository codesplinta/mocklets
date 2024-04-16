export const fakeReactJSTransitionGroupFactory = () => {
  return () => {
    return {
      CSSTransition: jest.fn(({ children, in: show }) => (show ? children : null))
    }
  }
}
