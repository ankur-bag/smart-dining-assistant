import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { chromaSearch } from '../services/embeddings'
import { getCartByTableId, addToCart } from '../services/cart'
import { prisma } from '../prisma/client'
import { getPopularItems } from '../services/menu'

export const searchMenuTool = tool(
  async ({ query, filters }) => chromaSearch(query, filters),
  {
    name: 'search_menu',
    description: 'Semantic search over menu items by natural language query',
    schema: z.object({
      query: z.string(),
      filters: z.record(z.any()).optional(),
    }),
  }
)

export const getCartTool = tool(
  async ({ tableId }) => getCartByTableId(tableId),
  {
    name: 'get_cart',
    description: 'Get current cart state for a table',
    schema: z.object({ tableId: z.string() }),
  }
)

export const addToCartTool = tool(
  async ({ sessionId, itemId, qty }) => {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, status: 'ACTIVE' },
    })
    if (!session) throw new Error('Session not found')
    return addToCart(sessionId, itemId, qty)
  },
  {
    name: 'add_to_cart',
    description: 'Add a menu item to the shared table cart',
    schema: z.object({
      sessionId: z.string(),
      itemId: z.string(),
      qty: z.number(),
    }),
  }
)

export const getComplementaryTool = tool(
  async ({ itemId }) => {
    const item = await prisma.menuItem.findUnique({ where: { id: itemId } })
    if (!item?.complementaryItems.length) return []
    return prisma.menuItem.findMany({
      where: { id: { in: item.complementaryItems }, available: true },
    })
  },
  {
    name: 'get_complementary',
    description: 'Get items frequently ordered together with a given item',
    schema: z.object({ itemId: z.string() }),
  }
)

export const getPopularItemsTool = tool(
  async ({ timeOfDay }) => getPopularItems(timeOfDay),
  {
    name: 'get_popular_items',
    description: 'Get top-ordered items for current time of day',
    schema: z.object({ timeOfDay: z.string() }),
  }
)

export const validateStockTool = tool(
  async ({ itemId }) => {
    const item = await prisma.menuItem.findUnique({ where: { id: itemId } })
    return { available: item?.available ?? false }
  },
  {
    name: 'validate_stock',
    description: 'Check if a menu item is currently available',
    schema: z.object({ itemId: z.string() }),
  }
)
