import { prisma } from '../prisma/client'
import { redisGet, redisSet } from './redis'

const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS ?? '4', 10)

export interface SessionContext {
  sessionId: string
  tableId: string
  messageCount: number
  preferences: Record<string, unknown>
  conversationSummary: string
  cartSnapshot: unknown[]
}

export async function getOrCreateSession(tableId: string) {
  const existing = await prisma.session.findFirst({
    where: {
      tableId,
      status: 'ACTIVE',
      expiresAt: { gt: new Date() },
    },
  })

  if (existing) {
    return existing
  }

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + SESSION_TTL_HOURS)

  return prisma.session.create({
    data: {
      tableId,
      expiresAt,
      preferences: {},
    },
  })
}

export async function getSessionById(sessionId: string) {
  return prisma.session.findUnique({ where: { id: sessionId } })
}

export async function incrementMessageCount(sessionId: string) {
  return prisma.session.update({
    where: { id: sessionId },
    data: { messageCount: { increment: 1 } },
  })
}

export async function getSessionContext(sessionId: string): Promise<SessionContext> {
  const session = await prisma.session.findUnique({ where: { id: sessionId } })
  if (!session) {
    throw new Error('Session not found')
  }

  const contextRaw = await redisGet(`session:${sessionId}:context`)
  let context: {
    preferences?: Record<string, unknown>
    conversationSummary?: string
    cartSnapshot?: unknown[]
  } = {}

  if (contextRaw) {
    try {
      context = JSON.parse(contextRaw)
    } catch {
      context = {}
    }
  }

  return {
    sessionId: session.id,
    tableId: session.tableId,
    messageCount: session.messageCount,
    preferences: (context.preferences ?? session.preferences ?? {}) as Record<string, unknown>,
    conversationSummary: context.conversationSummary ?? session.conversationSummary ?? '',
    cartSnapshot: context.cartSnapshot ?? [],
  }
}

export async function updateSessionPreferences(
  sessionId: string,
  preferences: Record<string, unknown>
) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { preferences },
  })
}

export async function saveSessionContext(
  sessionId: string,
  data: {
    preferences?: Record<string, unknown>
    conversationSummary?: string
    cartSnapshot?: unknown[]
    messageCount?: number
  }
) {
  const ttlSeconds = SESSION_TTL_HOURS * 3600
  const existing = await redisGet(`session:${sessionId}:context`)
  let current: Record<string, unknown> = {}
  if (existing) {
    try {
      current = JSON.parse(existing)
    } catch {
      current = {}
    }
  }

  const merged = { ...current, ...data }
  await redisSet(`session:${sessionId}:context`, JSON.stringify(merged), ttlSeconds)

  if (data.preferences) {
    await updateSessionPreferences(sessionId, data.preferences)
  }
  if (data.conversationSummary) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { conversationSummary: data.conversationSummary.slice(0, 500) },
    })
  }
}
