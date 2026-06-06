import { Redis } from '@upstash/redis'

let redis: Redis | null = null

export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (!redis) {
    redis = new Redis({ url, token })
  }
  return redis
}

const memoryStore = new Map<string, { value: string; expiresAt?: number }>()

export async function redisGet(key: string): Promise<string | null> {
  const client = getRedis()
  if (client) {
    const val = await client.get<string>(key)
    return val ?? null
  }
  const entry = memoryStore.get(key)
  if (!entry) return null
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryStore.delete(key)
    return null
  }
  return entry.value
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> {
  const client = getRedis()
  if (client) {
    if (ttlSeconds) {
      await client.set(key, value, { ex: ttlSeconds })
    } else {
      await client.set(key, value)
    }
    return
  }
  memoryStore.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
  })
}

export async function redisDel(key: string): Promise<void> {
  const client = getRedis()
  if (client) {
    await client.del(key)
    return
  }
  memoryStore.delete(key)
}

export async function redisIncr(key: string): Promise<number> {
  const client = getRedis()
  if (client) {
    return client.incr(key)
  }
  const current = parseInt((await redisGet(key)) ?? '0', 10)
  const next = current + 1
  await redisSet(key, String(next))
  return next
}
