import { NormalisedInput } from './multilingualAgent'
import { getCart } from '../services/cart'
import { saveSessionContext, getSessionContext } from '../services/session'

export async function contextMemoryAgent(
  sessionId: string,
  userMessage: string,
  normalised: NormalisedInput
) {
  const context = await getSessionContext(sessionId)
  const cart = await getCart(sessionId)

  const mergedPreferences = {
    ...context.preferences,
    ...normalised.preferences,
  }

  if (normalised.allergens_to_avoid.length > 0) {
    mergedPreferences.allergens = [
      ...new Set([
        ...((mergedPreferences.allergens as string[]) ?? []),
        ...normalised.allergens_to_avoid,
      ]),
    ]
  }

  const summary = context.conversationSummary
  const newSummary = summary
    ? `${summary} | User: ${userMessage.slice(0, 80)}`
    : `User: ${userMessage.slice(0, 80)}`

  await saveSessionContext(sessionId, {
    preferences: mergedPreferences,
    conversationSummary: newSummary.slice(0, 500),
    cartSnapshot: cart,
  })
}
