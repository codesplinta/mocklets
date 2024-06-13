//# process.env.NEXT_PUBLIC_API_URL = 'http://localhost:xxxx/';
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
    expressHttpRequest: {},
    expresHttpResponse: {}
};