
let $socket = null

export const fakeWebSocketFactory = (url) => {
  const { WebSocket, Server } = require('mock-socket')

  if ($socket === null) {
    $socket = WebSocket
    return [new Server(url, { mock: false }), WebSocket]
  }

  return [new Server(url, { mock: false }), $socket]
}
