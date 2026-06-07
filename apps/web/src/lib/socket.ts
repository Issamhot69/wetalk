import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
let currentUserId: string | null = null

export const getSocket = (userId: string, token: string): Socket => {
  if (socket && currentUserId === userId && socket.connected) return socket

  if (socket) { socket.removeAllListeners(); socket.disconnect(); socket = null }

  currentUserId = userId
  socket = io('http://localhost:9020/chat', {
    auth: { userId, token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionAttempts: 5,
  })

  socket.on('connect',    () => console.log('✅ WebSocket connecté'))
  socket.on('disconnect', () => console.log('❌ WebSocket déconnecté'))
  return socket
}

export const disconnectSocket = () => {
  if (socket) { socket.removeAllListeners(); socket.disconnect(); socket = null; currentUserId = null }
}
