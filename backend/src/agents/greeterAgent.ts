import { invokeLLM } from '../services/llm'
import { SessionContext } from '../services/session'

export interface GreeterResponse {
  message: string
  quickOptions: string[]
  preferenceChips: string[]
}

export async function greeterAgent(
  _sessionId: string,
  context: SessionContext
): Promise<GreeterResponse> {
  const hour = new Date().getHours()
  const meal =
    hour >= 7 && hour < 11
      ? 'breakfast'
      : hour >= 11 && hour < 16
        ? 'lunch'
        : hour >= 16 && hour < 22
          ? 'dinner'
          : 'late-night'

  const prompt = `You are Zara, a warm witty dining assistant at a restaurant table ${context.tableId}.
Time: ${meal}. Write a welcome greeting (max 2 sentences). Ask about their mood/vibe today.
Never say you are an AI. Be energetic like a knowledgeable friend.
Return ONLY valid JSON:
{
  "message": "Hey! I'm Zara at Table ${context.tableId} — what's the vibe today?",
  "quickOptions": ["Just browsing", "Tell me what's good"],
  "preferenceChips": ["Spicy", "Light", "Sweet", "Filling", "Surprise me!"]
}`

  try {
    const text = await invokeLLM(prompt, 0.8, 150, 'greeterAgent')
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // fall through
  }

  return {
    message: `Hey! I'm Zara 👋 Welcome to Table ${context.tableId}. What's the vibe today?`,
    quickOptions: ['Just browsing', "Tell me what's good"],
    preferenceChips: ['Spicy 🌶', 'Light 🥗', 'Sweet 🍰', 'Filling 🍽', 'Surprise me!'],
  }
}
