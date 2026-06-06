import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:8000'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export function connectSocket(tableId: string, displayName: string) {
  const s = getSocket()
  if (!s.connected) s.connect()
  s.emit('join:table', { tableId, displayName })
  return s
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect()
}

const ADJECTIVES = ['Spicy', 'Sweet', 'Hungry', 'Happy', 'Curious', 'Bold']
const FOODS = ['Sam', 'Riya', 'Arjun', 'Maya', 'Dev', 'Anya', 'Kiran', 'Zara']

export function generateDisplayName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const food = FOODS[Math.floor(Math.random() * FOODS.length)]
  return `${adj} ${food}`
}
