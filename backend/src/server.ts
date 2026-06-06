import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import menuRouter from './routes/menu'
import sessionRouter from './routes/session'
import cartRouter from './routes/cart'
import aiRouter from './routes/ai'
import otpRouter from './routes/otp'
import orderRouter, { setOrderIo } from './routes/order'
import popularRouter from './routes/popular'
import { initSocketHandlers } from './socket/socketHandler'
import { generalRateLimit, aiRateLimit } from './middleware/rateLimit'
import { errorHandler } from './middleware/errorHandler'
import { setCartIo } from './services/cart'
import { reindexAllMenuItems } from './services/embeddings'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', methods: ['GET', 'POST'] },
})

initSocketHandlers(io)
setCartIo(io)
setOrderIo(io)

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }))
app.use(express.json())
app.use(generalRateLimit)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/menu', menuRouter)
app.use('/api', sessionRouter)
app.use('/api', cartRouter)
app.use('/api', aiRateLimit, aiRouter)
app.use('/api/otp', otpRouter)
app.use('/api', orderRouter)
app.use('/api', popularRouter)

app.use(errorHandler)

const PORT = process.env.PORT || 8000

httpServer.listen(PORT, async () => {
  console.log(`Backend running on :${PORT}`)
  try {
    await reindexAllMenuItems()
  } catch (err) {
    console.warn('[Startup] Embedding reindex skipped:', err)
  }
})

export { io }
