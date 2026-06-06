import { Router } from 'express'
import { getPopularItems } from '../services/menu'

const router = Router()

router.get('/popular', async (req, res, next) => {
  try {
    const time = (req.query.time as string) ?? undefined
    const items = await getPopularItems(time)
    res.json(
      items.map((item) => ({
        ...item,
        price: Number(item.price),
      }))
    )
  } catch (err) {
    next(err)
  }
})

export default router
