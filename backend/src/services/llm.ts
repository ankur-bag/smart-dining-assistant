import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

const PRIMARY = process.env.GEMINI_PRIMARY_MODEL ?? 'gemini-3-flash-preview'
const FALLBACK = process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-2.5-flash'
const TIMEOUT_MS = 10000

export function isLLMAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}

export function getLLM(temperature = 0.7, maxTokens = 400) {
  return new ChatGoogleGenerativeAI({
    model: PRIMARY,
    apiKey: process.env.GEMINI_API_KEY,
    temperature,
    maxOutputTokens: maxTokens,
  })
}

export function getFallbackLLM(temperature = 0.7, maxTokens = 400) {
  return new ChatGoogleGenerativeAI({
    model: FALLBACK,
    apiKey: process.env.GEMINI_API_KEY,
    temperature,
    maxOutputTokens: maxTokens,
  })
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('LLM timeout')), ms)
    promise
      .then((val) => {
        clearTimeout(timer)
        resolve(val)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

export async function callWithFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  agentName = 'unknown'
): Promise<T> {
  try {
    return await withTimeout(primaryFn(), TIMEOUT_MS)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn(
      `[LLM] ${new Date().toISOString()} Primary (${PRIMARY}) failed in ${agentName}: ${message} — switching to ${FALLBACK}`
    )
    try {
      return await withTimeout(fallbackFn(), TIMEOUT_MS)
    } catch (fallbackErr: unknown) {
      const fbMessage = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)
      console.error(`[LLM] Fallback also failed in ${agentName}: ${fbMessage}`)
      throw new Error('AI service temporarily unavailable')
    }
  }
}

export async function invokeLLM(
  prompt: string,
  temperature = 0.7,
  maxTokens = 400,
  agentName = 'agent'
): Promise<string> {
  const result = await callWithFallback(
    async () => {
      const res = await getLLM(temperature, maxTokens).invoke(prompt)
      const text = res.content?.toString()?.trim()
      if (!text) throw new Error('Empty response')
      return text
    },
    async () => {
      const res = await getFallbackLLM(temperature, maxTokens).invoke(prompt)
      const text = res.content?.toString()?.trim()
      if (!text) throw new Error('Empty response')
      return text
    },
    agentName
  )
  return result
}
