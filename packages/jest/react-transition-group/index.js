jest.mock("reatc-transition-group", () => {
    return {
        CSSTransition: jest.fn(({ children, in: show }) => (show ? children : null)),
    }
})