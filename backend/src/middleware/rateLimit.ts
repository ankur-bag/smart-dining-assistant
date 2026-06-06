import rateLimit from 'express-rate-limit'
import { Request } from 'express'

export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
})

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req.headers['x-session-id'] as string) ?? req.ip ?? 'unknown'
  },
  message: { error: 'AI rate limit exceeded for this session' },
})
