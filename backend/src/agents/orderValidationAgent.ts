import { getCart } from '../services/cart'
import { prisma } from '../prisma/client'

export interface ValidationResult {
  valid: boolean
  issues?: string[]
}

export async function orderValidationAgent(sessionId: string): Promise<ValidationResult> {
  const cart = await getCart(sessionId)
  const issues: string[] = []

  if (cart.length === 0) {
    issues.push('Your cart is empty')
    return { valid: false, issues }
  }

  for (const item of cart) {
    if (item.quantity <= 0) {
      issues.push(`${item.name} has invalid quantity`)
    }
    const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } })
    if (!menuItem?.available) {
      issues.push(`${item.name} is currently unavailable`)
    }
  }

  return issues.length > 0 ? { valid: false, issues } : { valid: true }
}
