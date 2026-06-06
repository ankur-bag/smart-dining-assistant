import { Router } from 'express'
import { prisma } from '../prisma/client'
import { getCart, clearCart, calculateTax } from '../services/cart'
import { orderValidationAgent } from '../agents/orderValidationAgent'
import { validateBody, validateSessionHeader, placeOrderSchema } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'
import { emitOrderPlaced } from '../socket/socketHandler'
import { Server } from 'socket.io'

let ioInstance: Server | null = null

export function setOrderIo(io: Server) {
  ioInstance = io
}

const router = Router()

router.post(
  '/session/:id/order',
  validateSessionHeader,
  validateBody(placeOrderSchema),
  async (req, res, next) => {
    try {
      const session = await prisma.session.findUnique({ where: { id: req.params.id } })
      if (!session) return next(new AppError(404, 'Session not found'))

      const validation = await orderValidationAgent(session.id)
      if (!validation.valid) {
        return res.status(400).json({ error: 'Order validation failed', issues: validation.issues })
      }

      const cart = await getCart(session.id)
      const { subtotal, tax, total } = calculateTax(cart)

      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            sessionId: session.id,
            customerName: req.body.customerName,
            customerPhone: req.body.customerPhone,
            totalAmount: total,
            taxAmount: tax,
            status: 'CONFIRMED',
            items: {
              create: cart.map((item) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice: item.price,
                specialInstructions: item.specialInstructions,
              })),
            },
          },
          include: { items: { include: { menuItem: true } } },
        })

        await tx.session.update({
          where: { id: session.id },
          data: { status: 'ORDERED' },
        })

        return newOrder
      })

      await clearCart(session.id)

      if (ioInstance) {
        emitOrderPlaced(ioInstance, session.tableId, {
          orderId: order.id,
          status: order.status,
          estimatedWait: '20-25 mins',
        })
      }

      res.json({
        orderId: order.id,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        taxAmount: Number(order.taxAmount),
        subtotal,
        estimatedWait: '20-25 mins',
      })
    } catch (err) {
      next(err)
    }
  }
)

router.get('/order/:orderId', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: {
        items: { include: { menuItem: true } },
        session: true,
      },
    })
    if (!order) return next(new AppError(404, 'Order not found'))

    res.json({
      ...order,
      totalAmount: Number(order.totalAmount),
      taxAmount: Number(order.taxAmount),
      items: order.items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        menuItem: { ...i.menuItem, price: Number(i.menuItem.price) },
      })),
    })
  } catch (err) {
    next(err)
  }
})

export default router
