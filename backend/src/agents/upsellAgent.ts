import { getCart } from '../services/cart'
import { prisma } from '../prisma/client'

export interface UpsellResponse {
  message: string
  suggestion?: {
    itemId: string
    name: string
    price: number
  }
}

export async function upsellAgent(
  sessionId: string,
  tableId: string,
  trigger: 'post_add' | 'cart_total' | 'no_beverage' | 'evening' = 'post_add',
  lastAddedItemId?: string
): Promise<UpsellResponse | null> {
  const cart = await getCart(sessionId)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const hour = new Date().getHours()
  const isEvening = hour >= 16 && hour < 20

  const hasMains = cart.some(
    (i) => i.tags.includes('main') || i.name.toLowerCase().includes('curry')
  )
  const hasBeverage = cart.some(
    (i) => i.tags.includes('beverage') || i.tags.includes('drink')
  )

  let upsellItem = null

  if (trigger === 'post_add' && lastAddedItemId) {
    const item = await prisma.menuItem.findUnique({ where: { id: lastAddedItemId } })
    if (item?.complementaryItems.length) {
      const complement = await prisma.menuItem.findFirst({
        where: { id: { in: item.complementaryItems }, available: true },
      })
      if (complement && !cart.some((c) => c.menuItemId === complement.id)) {
        upsellItem = complement
      }
    }
  }

  if (!upsellItem && cartTotal > 500 && cartTotal < 700) {
    const deal = await prisma.menuItem.findFirst({
      where: { category: 'Combos & Deals', available: true },
    })
    if (deal && !cart.some((c) => c.menuItemId === deal.id)) {
      upsellItem = deal
    }
  }

  if (!upsellItem && hasMains && !hasBeverage) {
    upsellItem = await prisma.menuItem.findFirst({
      where: {
        available: true,
        OR: [{ category: 'Beverages Cold' }, { category: 'Beverages Hot' }],
      },
    })
  }

  if (!upsellItem && isEvening) {
    upsellItem = await prisma.menuItem.findFirst({
      where: { category: 'Desserts', available: true },
      orderBy: { popularScore: 'desc' },
    })
  }

  if (!upsellItem) return null

  const price = Number(upsellItem.price)

  if (trigger === 'post_add') {
    return {
      message: `Great pick! Most people grab ${upsellItem.name} with this — only ₹${price}.`,
      suggestion: { itemId: upsellItem.id, name: upsellItem.name, price },
    }
  }
  if (trigger === 'cart_total') {
    const gap = 700 - cartTotal
    return {
      message: `You're ₹${Math.round(gap)} away from our Meal Deal — add ${upsellItem.name} to unlock it.`,
      suggestion: { itemId: upsellItem.id, name: upsellItem.name, price },
    }
  }
  if (trigger === 'no_beverage') {
    return {
      message: `Looks like no drinks yet! Want something refreshing like ${upsellItem.name}?`,
      suggestion: { itemId: upsellItem.id, name: upsellItem.name, price },
    }
  }

  return {
    message: `Evening special: ${upsellItem.name} pairs perfectly with your order!`,
    suggestion: { itemId: upsellItem.id, name: upsellItem.name, price },
  }
}

export async function upsellAfterAdd(sessionId: string, tableId: string, itemId: string) {
  return upsellAgent(sessionId, tableId, 'post_add', itemId)
}
