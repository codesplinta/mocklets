import { WebSocket, Server } from 'mock-socket'

export const fakeWebSocketFactory = (url) => {
  return [new Server(url, { mock: false }), WebSocket]
}
