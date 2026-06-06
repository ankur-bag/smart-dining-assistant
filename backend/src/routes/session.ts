import { Router } from 'express'
import { getOrCreateSession } from '../services/session'

const router = Router()

router.get('/table/:tableId/session', async (req, res, next) => {
  try {
    const session = await getOrCreateSession(req.params.tableId)
    res.json({
      sessionId: session.id,
      tableId: session.tableId,
      status: session.status,
      messageCount: session.messageCount,
      expiresAt: session.expiresAt,
    })
  } catch (err) {
    next(err)
  }
})

export default router
