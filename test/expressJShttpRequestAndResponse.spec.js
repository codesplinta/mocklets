import {
  /* eslint-disable-next-line */
  expressjsFakesFactory
} from '../src/jest/__mocks__/express/http'
/* eslint-env jest */

describe('Tests for ExpressJS Http Request & Response Objects', () => {
  const _ = expressjsFakesFactory
  let req, res;

  afterEach(() => {
    if (req) {
      req.app = null
    }
  });
  
  it('should assert that ExpressJS `req` and `res` objects have the `app` reference', () => {
    req = _.make_expressHttpRequest({
      method: 'GET',
      headers: { 'x-api-sender': 'xampp' }
    });
    res = _.make_expressHttpResponse({
      headers: { 'x-api-result-sender': 'xampp-server' }
    })
    
    expect(req.app === res.app).toBe(true)
  })

  it('should assert that headers can be accessed correctly', () => {
    req = _.make_expressHttpRequest({
      method: 'POST',
      headers: { 'x-api-sender': 'xampp' }
    });
    res = _.make_expressHttpResponse({
      headers: { 'x-api-result-sender': 'xampp-server' }
    })

    expect(res.charset).toBe('utf-8')
    expect(req.getHeader('connection')).toBe('keep-alive')
    expect(req.is('text/*')).toBe(true)
  })
})