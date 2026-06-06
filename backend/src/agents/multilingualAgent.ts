import { invokeLLM } from '../services/llm'

export interface NormalisedInput {
  intent: string
  preferences: Record<string, boolean>
  allergens_to_avoid: string[]
  language_detected: string
  raw_text: string
}

export async function multilingualAgent(userMessage: string): Promise<NormalisedInput> {
  if (userMessage === '__INIT__') {
    return {
      intent: 'GREET',
      preferences: {},
      allergens_to_avoid: [],
      language_detected: 'en',
      raw_text: userMessage,
    }
  }

  const prompt = `Normalise this dining assistant user input into JSON only. Handle Hinglish, Telugu-English, typos.

Input: "${userMessage}"

Return ONLY valid JSON with this schema:
{
  "intent": "RECOMMEND|ADD_ITEM|CHECKOUT|GREET|FALLBACK",
  "preferences": { "spicy": true, "light": true, "veg": false, "sweet": true },
  "allergens_to_avoid": ["dairy"],
  "language_detected": "hinglish|en|te-en",
  "raw_text": "original text"
}`

  try {
    const text = await invokeLLM(prompt, 0.2, 150, 'multilingualAgent')
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const parsed = JSON.parse(jsonMatch[0])
    return {
      intent: parsed.intent ?? 'RECOMMEND',
      preferences: parsed.preferences ?? {},
      allergens_to_avoid: parsed.allergens_to_avoid ?? [],
      language_detected: parsed.language_detected ?? 'en',
      raw_text: parsed.raw_text ?? userMessage,
    }
  } catch {
    return {
      intent: 'RECOMMEND',
      preferences: {},
      allergens_to_avoid: [],
      language_detected: 'en',
      raw_text: userMessage,
    }
  }
}
