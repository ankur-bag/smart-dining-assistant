import { Router } from 'express'
import { orchestrate, orchestrateStream } from '../agents/orchestrator'
import { validateBody, validateSessionHeader, chatSchema } from '../middleware/validate'
import { getSessionById } from '../services/session'
import { AppError } from '../middleware/errorHandler'
import { isLLMAvailable } from '../services/llm'

const router = Router()

router.post(
  '/session/:id/ai/chat',
  validateSessionHeader,
  validateBody(chatSchema),
  async (req, res, next) => {
    try {
      if (!isLLMAvailable()) {
        return res.status(503).json({ error: 'AI service temporarily unavailable' })
      }
      const session = await getSessionById(req.params.id)
      if (!session) return next(new AppError(404, 'Session not found'))

      const response = await orchestrate(session.id, session.tableId, req.body.message)
      res.json(response)
    } catch (err) {
      if (err instanceof Error && err.message.includes('unavailable')) {
        return res.status(503).json({ error: err.message })
      }
      next(err)
    }
  }
)

router.get('/session/:id/ai/stream', validateSessionHeader, async (req, res, next) => {
  try {
    if (!isLLMAvailable()) {
      return res.status(503).json({ error: 'AI service temporarily unavailable' })
    }
    const session = await getSessionById(req.params.id)
    if (!session) return next(new AppError(404, 'Session not found'))

    const message = (req.query.message as string) ?? ''
    if (!message) return next(new AppError(400, 'Message required'))

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    try {
      const stream = orchestrateStream(session.id, session.tableId, message)
      for await (const chunk of stream) {
        res.write(`data: ${chunk}\n\n`)
      }
      res.write('data: [DONE]\n\n')
    } catch {
      res.write('data: [ERROR]\n\n')
    } finally {
      res.end()
    }
  } catch (err) {
    next(err)
  }
})

export default router
