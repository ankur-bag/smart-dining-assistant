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
  const prompt = `You are Zara, a warm witty dining assistant at a restaurant table ${context.tableId}.
Write a welcome message (max 2 sentences). Never say you are an AI.
Return ONLY valid JSON:
{
  "message": "Hey! I'm Zara — what's the vibe today?",
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
