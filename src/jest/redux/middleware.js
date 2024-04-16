/**
 * @SEE: https://redux.js.org/usage/writing-tests#middleware
 */

const thunk = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState)
  }
  return next(action)
}

export const createThunkEnv = () => {
  const store = {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn()
  }
  const next = jest.fn()
  const invoke = action => thunk(store)(next)(action)

  return { store, next, invoke }
}
