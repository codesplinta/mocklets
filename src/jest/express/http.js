const toPromise = (val) => (val instanceof Promise ? val : Promise.resolve(val))

export const http = {
  makeRequest: (body = {}, headers = {}, params = {}, query = {}) => {
    const _headers = headers
    const request = {
      body,
      params,
      query
    }
  },
  makeResponse: (headers = {}) => {
    const _headers = headers
    const response = {
      response: {}
    }
    const chainableMethods = ['status']
    const nonChainableMethods = ['send', 'end', 'header', 'json']

    chainableMethods.forEach((method) => response[method] = jest.fn().mockReturnValue(response))
    nonChainableMethods.forEach((method) => response[method] = jest.fn(() => (...args) => method === 'header' ? _headers[args[0]] : true))
  }
}
