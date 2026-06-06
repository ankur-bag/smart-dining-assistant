import { Server } from 'socket.io'
import { prisma } from '../prisma/client'
import { redisGet, redisSet } from './redis'
import { getSessionById } from './session'
import { emitCartEvent } from '../socket/socketHandler'

export interface CartItemData {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  specialInstructions?: string
  addedBy?: string
  tags: string[]
  imageUrl?: string | null
}

let ioInstance: Server | null = null

export function setCartIo(io: Server) {
  ioInstance = io
}

function cartKey(sessionId: string) {
  return `cart:${sessionId}`
}

async function getCartRaw(sessionId: string): Promise<CartItemData[]> {
  const raw = await redisGet(cartKey(sessionId))
  if (!raw) return []
  try {
    return JSON.parse(raw) as CartItemData[]
  } catch {
    return []
  }
}

async function saveCart(sessionId: string, items: CartItemData[]) {
  const ttl = parseInt(process.env.SESSION_TTL_HOURS ?? '4', 10) * 3600
  await redisSet(cartKey(sessionId), JSON.stringify(items), ttl)
}

function cartTotal(items: CartItemData[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

export async function getCart(sessionId: string): Promise<CartItemData[]> {
  return getCartRaw(sessionId)
}

export async function getCartByTableId(tableId: string): Promise<CartItemData[]> {
  const session = await prisma.session.findFirst({
    where: { tableId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
  })
  if (!session) return []
  return getCartRaw(session.id)
}

export async function addToCart(
  sessionId: string,
  itemId: string,
  qty: number,
  addedBy?: string
): Promise<CartItemData[]> {
  const session = await getSessionById(sessionId)
  if (!session) throw new Error('Session not found')

  const menuItem = await prisma.menuItem.findUnique({ where: { id: itemId } })
  if (!menuItem || !menuItem.available) {
    throw new Error('Item unavailable')
  }

  const items = await getCartRaw(sessionId)
  const existing = items.find((i) => i.menuItemId === itemId)

  if (existing) {
    existing.quantity += qty
    if (addedBy) existing.addedBy = addedBy
  } else {
    items.push({
      id: `${sessionId}-${itemId}`,
      menuItemId: itemId,
      name: menuItem.name,
      price: Number(menuItem.price),
      quantity: qty,
      addedBy,
      tags: menuItem.tags,
      imageUrl: menuItem.imageUrl,
    })
  }

  await saveCart(sessionId, items)

  if (ioInstance) {
    emitCartEvent(ioInstance, session.tableId, 'cart:item_added', {
      itemId,
      name: menuItem.name,
      qty,
      addedBy,
      cartTotal: cartTotal(items),
    })
  }

  return items
}

export async function updateCartItem(
  sessionId: string,
  itemId: string,
  updates: { qty?: number; specialInstructions?: string }
): Promise<CartItemData[]> {
  const session = await getSessionById(sessionId)
  if (!session) throw new Error('Session not found')

  const items = await getCartRaw(sessionId)
  const item = items.find((i) => i.menuItemId === itemId)
  if (!item) throw new Error('Cart item not found')

  if (updates.qty !== undefined) item.quantity = updates.qty
  if (updates.specialInstructions !== undefined) {
    item.specialInstructions = updates.specialInstructions
  }

  await saveCart(sessionId, items)

  if (ioInstance) {
    emitCartEvent(ioInstance, session.tableId, 'cart:item_updated', {
      itemId,
      newQty: item.quantity,
    })
  }

  return items
}

export async function removeFromCart(sessionId: string, itemId: string): Promise<CartItemData[]> {
  const session = await getSessionById(sessionId)
  if (!session) throw new Error('Session not found')

  const items = (await getCartRaw(sessionId)).filter((i) => i.menuItemId !== itemId)
  await saveCart(sessionId, items)

  if (ioInstance) {
    emitCartEvent(ioInstance, session.tableId, 'cart:item_removed', { itemId })
  }

  return items
}

export async function clearCart(sessionId: string): Promise<void> {
  await saveCart(sessionId, [])
}

export function calculateTax(items: CartItemData[]): { subtotal: number; tax: number; total: number } {
  let subtotal = 0
  let tax = 0
  for (const item of items) {
    const lineTotal = item.price * item.quantity
    subtotal += lineTotal
    const rate = item.tags.includes('packaged') ? 0.12 : 0.05
    tax += lineTotal * rate
  }
  return { subtotal, tax, total: subtotal + tax }
}
