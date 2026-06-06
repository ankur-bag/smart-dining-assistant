import { Router } from 'express'
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
  calculateTax,
} from '../services/cart'
import { validateBody, validateSessionHeader, addCartSchema, updateCartSchema } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'

const router = Router()

router.get('/session/:id/cart', validateSessionHeader, async (req, res, next) => {
  try {
    const items = await getCart(req.params.id)
    const totals = calculateTax(items)
    res.json({ items, ...totals })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/session/:id/cart',
  validateSessionHeader,
  validateBody(addCartSchema),
  async (req, res, next) => {
    try {
      const { itemId, qty, addedBy } = req.body
      const items = await addToCart(req.params.id, itemId, qty, addedBy)
      const totals = calculateTax(items)
      res.json({ items, ...totals })
    } catch (err) {
      if (err instanceof Error && err.message === 'Item unavailable') {
        return next(new AppError(400, err.message))
      }
      next(err)
    }
  }
)

router.patch(
  '/session/:id/cart/:itemId',
  validateSessionHeader,
  validateBody(updateCartSchema),
  async (req, res, next) => {
    try {
      const items = await updateCartItem(req.params.id, req.params.itemId, req.body)
      const totals = calculateTax(items)
      res.json({ items, ...totals })
    } catch (err) {
      next(err)
    }
  }
)

router.delete('/session/:id/cart/:itemId', validateSessionHeader, async (req, res, next) => {
  try {
    const items = await removeFromCart(req.params.id, req.params.itemId)
    const totals = calculateTax(items)
    res.json({ items, ...totals })
  } catch (err) {
    next(err)
  }
})

export default router
