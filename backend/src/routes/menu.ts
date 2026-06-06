import { Router } from 'express'
import { getAllMenuItems, searchMenuItems } from '../services/menu'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const items = await getAllMenuItems()
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

router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q as string) ?? ''
    const items = await searchMenuItems(q)
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
