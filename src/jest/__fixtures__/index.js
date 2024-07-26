// # process.env.NEXT_PUBLIC_API_URL = 'http://localhost:xxxx/';
module.exports = {
  nextApiRequest: {
    method: 'GET',
    body: {},
    headers: {
      referer: `${process.env.NEXT_PUBLIC_API_URL}`
    },
    query: {}
  },
  nextApiResponse: {},
  nextImageObject: {
    src: '/x.png',
    height: 107,
    width: 340,
    blurDataURL: 'data:image/png;base64,=ab3489ksejYHSBd84759'
  },
  expressHttpRequest: {},
  expresHttpResponse: {}
}
