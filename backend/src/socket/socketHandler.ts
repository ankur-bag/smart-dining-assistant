import { Server } from 'socket.io'

const tableUsers = new Map<string, Set<string>>()

export function initSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join:table', ({ tableId, displayName }: { tableId: string; displayName: string }) => {
      const room = `table:${tableId}`
      socket.join(room)
      socket.data.tableId = tableId
      socket.data.displayName = displayName

      if (!tableUsers.has(tableId)) {
        tableUsers.set(tableId, new Set())
      }
      tableUsers.get(tableId)!.add(displayName)

      socket.to(room).emit('session:user_joined', { displayName, tableId })
    })

    socket.on('disconnect', () => {
      const tableId = socket.data.tableId as string | undefined
      const displayName = socket.data.displayName as string | undefined
      if (tableId && displayName) {
        tableUsers.get(tableId)?.delete(displayName)
      }
    })
  })
}

export function emitCartEvent(io: Server, tableId: string, event: string, data: unknown) {
  io.to(`table:${tableId}`).emit(event, data)
}

export function emitOrderPlaced(
  io: Server,
  tableId: string,
  data: { orderId: string; status: string; estimatedWait: string }
) {
  io.to(`table:${tableId}`).emit('order:placed', data)
}
