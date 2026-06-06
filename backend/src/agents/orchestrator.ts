import { callWithFallback, getLLM, getFallbackLLM, isLLMAvailable } from '../services/llm'
import { multilingualAgent } from './multilingualAgent'
import { greeterAgent } from './greeterAgent'
import { recommendationAgent } from './recommendationAgent'
import { upsellAfterAdd } from './upsellAgent'
import { contextMemoryAgent } from './contextMemoryAgent'
import { orderValidationAgent } from './orderValidationAgent'
import { getSessionContext, incrementMessageCount } from '../services/session'

type Intent = 'GREET' | 'RECOMMEND' | 'ADD_ITEM' | 'CHECKOUT' | 'FALLBACK'

export interface AgentResponse {
  type: 'greet' | 'recommend' | 'checkout' | 'upsell'
  message: string
  quickOptions?: string[]
  preferenceChips?: string[]
  suggestions?: Array<{
    itemId: string
    name: string
    price: number
    reason: string
    imageUrl?: string | null
  }>
  upsell?: {
    itemId: string
    name: string
    price: number
  }
  validation?: { valid: boolean; issues?: string[] }
}

async function classifyIntent(normalised: { intent: string; raw_text: string }): Promise<Intent> {
  const prompt = `Classify this dining assistant user input into exactly one of:
GREET, RECOMMEND, ADD_ITEM, CHECKOUT, FALLBACK

Input: ${JSON.stringify(normalised)}

Rules:
- GREET: first message or general hello
- RECOMMEND: asking for suggestions, browsing
- ADD_ITEM: explicit "add X", "I want X", "give me X"
- CHECKOUT: "place order", "done", "pay", "checkout"
- FALLBACK: anything else

Return only the intent word. Nothing else.`

  const result = await callWithFallback(
    () => getLLM(0.1, 20).invoke(prompt),
    () => getFallbackLLM(0.1, 20).invoke(prompt),
    'orchestrator'
  )
  const text = result.content.toString().trim().toUpperCase()
  const valid: Intent[] = ['GREET', 'RECOMMEND', 'ADD_ITEM', 'CHECKOUT', 'FALLBACK']
  return valid.includes(text as Intent) ? (text as Intent) : 'FALLBACK'
}

const MOOD_PREFERENCES: Record<string, Record<string, boolean>> = {
  spicy: { spicy: true },
  light: { light: true },
  sweet: { sweet: true },
  filling: { filling: true },
  'surprise me': { surprise: true },
  'surprise me!': { surprise: true },
}

function applyMoodPreferences(
  normalised: Awaited<ReturnType<typeof multilingualAgent>>,
  userMessage: string
) {
  const lower = userMessage.toLowerCase().trim()
  for (const [key, prefs] of Object.entries(MOOD_PREFERENCES)) {
    if (lower === key || lower.includes(key)) {
      normalised.preferences = { ...normalised.preferences, ...prefs }
      if (normalised.intent === 'GREET' || normalised.intent === 'FALLBACK') {
        normalised.intent = 'RECOMMEND'
      }
      break
    }
  }
  if (lower === "tell me what's good" || lower === 'tell me whats good') {
    normalised.intent = 'RECOMMEND'
    normalised.preferences = { ...normalised.preferences, popular: true }
  }
  if (lower === 'just browsing') {
    normalised.intent = 'RECOMMEND'
    normalised.preferences = { ...normalised.preferences, browsing: true }
  }
}

export async function orchestrate(
  sessionId: string,
  tableId: string,
  userMessage: string
): Promise<AgentResponse> {
  if (!isLLMAvailable()) {
    throw new Error('AI service temporarily unavailable')
  }

  const context = await getSessionContext(sessionId)

  if (userMessage === '__INIT__') {
    const greet = await greeterAgent(sessionId, context)
    return {
      type: 'greet',
      message: greet.message,
      quickOptions: greet.quickOptions,
      preferenceChips: greet.preferenceChips,
    }
  }

  const normalised = await multilingualAgent(userMessage)
  applyMoodPreferences(normalised, userMessage)

  const validIntents: Intent[] = ['GREET', 'RECOMMEND', 'ADD_ITEM', 'CHECKOUT', 'FALLBACK']
  let intent: Intent = validIntents.includes(normalised.intent as Intent)
    ? (normalised.intent as Intent)
    : await classifyIntent(normalised)

  if (intent === 'FALLBACK') intent = 'RECOMMEND'

  await contextMemoryAgent(sessionId, userMessage, normalised)
  await incrementMessageCount(sessionId)

  switch (intent) {
    case 'GREET': {
      const greet = await greeterAgent(sessionId, context)
      return {
        type: 'greet',
        message: greet.message,
        quickOptions: greet.quickOptions,
        preferenceChips: greet.preferenceChips,
      }
    }
    case 'CHECKOUT': {
      const validation = await orderValidationAgent(sessionId)
      return {
        type: 'checkout',
        message: validation.valid
          ? 'Your order looks good! Head to checkout when ready.'
          : `Please fix these issues: ${validation.issues?.join(', ')}`,
        validation,
      }
    }
    case 'RECOMMEND':
    case 'ADD_ITEM':
    default: {
      const rec = await recommendationAgent(sessionId, normalised, context, tableId)
      const response: AgentResponse = {
        type: 'recommend',
        message: rec.message,
        suggestions: rec.suggestions,
      }

      if (rec.addedToCart && rec.suggestions?.[0]) {
        const upsell = await upsellAfterAdd(sessionId, tableId, rec.suggestions[0].itemId)
        if (upsell?.suggestion) {
          response.upsell = upsell.suggestion
          response.message += ` ${upsell.message}`
        }
      }

      return response
    }
  }
}

export async function* orchestrateStream(
  sessionId: string,
  tableId: string,
  userMessage: string
): AsyncGenerator<string> {
  const response = await orchestrate(sessionId, tableId, userMessage)
  const fullText = response.message
  const words = fullText.split(' ')

  for (let i = 0; i < words.length; i++) {
    yield (i === 0 ? words[i] : ' ' + words[i])
    await new Promise((r) => setTimeout(r, 30))
  }

  yield `\n\n__META__${JSON.stringify({
    type: response.type,
    suggestions: response.suggestions,
    quickOptions: response.quickOptions,
    preferenceChips: response.preferenceChips,
    upsell: response.upsell,
    validation: response.validation,
  })}`
}
