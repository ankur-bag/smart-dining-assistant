import { prisma } from '../prisma/client'

export async function getAllMenuItems() {
  return prisma.menuItem.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
}

export async function searchMenuItems(query: string) {
  const q = query.toLowerCase()
  const items = await prisma.menuItem.findMany({
    where: { available: true },
  })
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
  )
}

export async function getPopularItems(timeOfDay?: string) {
  const items = await prisma.menuItem.findMany({
    where: { available: true },
    orderBy: { popularScore: 'desc' },
    take: 5,
  })

  if (timeOfDay === 'lunch') {
    return items.filter(
      (i) =>
        i.category.includes('Mains') ||
        i.category.includes('Combos') ||
        i.category.includes('Breads')
    )
  }
  if (timeOfDay === 'dinner') {
    return items.filter(
      (i) =>
        i.category.includes('Mains') ||
        i.category.includes('Starters') ||
        i.category.includes('Desserts')
    )
  }
  return items
}

export async function getMenuItemById(id: string) {
  return prisma.menuItem.findUnique({ where: { id } })
}
