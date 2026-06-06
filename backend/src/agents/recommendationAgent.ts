import { invokeLLM } from '../services/llm'
import { chromaSearch } from '../services/embeddings'
import { getCart, addToCart } from '../services/cart'
import { prisma } from '../prisma/client'
import { NormalisedInput } from './multilingualAgent'
import { SessionContext } from '../services/session'

export interface Suggestion {
  itemId: string
  name: string
  price: number
  reason: string
  imageUrl?: string | null
}

export interface RecommendationResponse {
  message: string
  suggestions: Suggestion[]
  addedToCart?: boolean
}

export async function recommendationAgent(
  sessionId: string,
  normalised: NormalisedInput,
  context: SessionContext,
  tableId: string
): Promise<RecommendationResponse> {
  const cart = await getCart(sessionId)
  const cartIds = new Set(cart.map((c) => c.menuItemId))
  const query = normalised.raw_text

  let candidateIds: string[] = []
  try {
    const chromaResults = await chromaSearch(query)
    candidateIds = chromaResults.map((r) => r.id)
  } catch {
    const textResults = await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: { popularScore: 'desc' },
      take: 10,
    })
    candidateIds = textResults.map((i) => i.id)
  }

  const items = await prisma.menuItem.findMany({
    where: {
      id: { in: candidateIds },
      available: true,
    },
  })

  const filtered = items.filter((i) => !cartIds.has(i.id)).slice(0, 10)

  if (filtered.length === 0) {
    const fallbackItems = await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: { popularScore: 'desc' },
      take: 5,
    })
    const available = fallbackItems.filter((i) => !cartIds.has(i.id)).slice(0, 3)
    return {
      message: "Here are some popular picks from our menu!",
      suggestions: available.map((i) => ({
        itemId: i.id,
        name: i.name,
        price: Number(i.price),
        reason: 'Customer favourite',
        imageUrl: i.imageUrl,
      })),
    }
  }

  const hour = new Date().getHours()
  const timeOfDay = hour >= 11 && hour < 16 ? 'lunch' : hour >= 16 && hour < 22 ? 'dinner' : 'late'

  const itemList = filtered
    .map(
      (i) =>
        `- id:${i.id} | ${i.name} | ₹${i.price} | ${i.description ?? ''} | tags:${i.tags.join(',')}`
    )
    .join('\n')

  const prompt = `You are Zara, a restaurant dining assistant. Pick exactly 3 items from the list below.
NEVER invent items not in the list. NEVER suggest items already in cart.
User preferences: ${JSON.stringify(context.preferences)}
Time of day: ${timeOfDay}
User said: "${query}"

Available items:
${itemList}

Cart item IDs (do not suggest): ${[...cartIds].join(', ')}

Return ONLY valid JSON:
{
  "message": "friendly response in user's language style",
  "suggestions": [
    { "itemId": "uuid", "name": "Item Name", "price": 220, "reason": "short reason" }
  ]
}`

  try {
    const text = await invokeLLM(prompt, 0.7, 400, 'recommendationAgent')
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as RecommendationResponse
      const validSuggestions = (parsed.suggestions ?? [])
        .filter((s) => filtered.some((i) => i.id === s.itemId))
        .slice(0, 3)
        .map((s) => {
          const item = filtered.find((i) => i.id === s.itemId)!
          return {
            itemId: s.itemId,
            name: s.name || item.name,
            price: s.price || Number(item.price),
            reason: s.reason || 'Great choice',
            imageUrl: item.imageUrl,
          }
        })

      if (normalised.intent === 'ADD_ITEM' && validSuggestions.length > 0) {
        await addToCart(sessionId, validSuggestions[0].itemId, 1)
        return {
          message: parsed.message || `Added ${validSuggestions[0].name} to your cart!`,
          suggestions: validSuggestions,
          addedToCart: true,
        }
      }

      return {
        message: parsed.message || 'Here are my top picks for you!',
        suggestions: validSuggestions,
      }
    }
  } catch {
    // fall through
  }

  return {
    message: 'Here are some dishes I think you will love!',
    suggestions: filtered.slice(0, 3).map((i) => ({
      itemId: i.id,
      name: i.name,
      price: Number(i.price),
      reason: i.description?.slice(0, 60) ?? 'Popular choice',
      imageUrl: i.imageUrl,
    })),
  }
}
