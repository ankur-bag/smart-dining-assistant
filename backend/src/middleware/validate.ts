import { NextFunction, Request, Response } from 'express'
import { z, ZodSchema } from 'zod'
import { AppError } from './errorHandler'

export const addCartSchema = z.object({
  itemId: z.string().uuid(),
  qty: z.number().int().positive().default(1),
  addedBy: z.string().max(50).optional(),
})

export const updateCartSchema = z.object({
  qty: z.number().int().positive().optional(),
  specialInstructions: z.string().max(500).optional(),
})

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
})

export const otpSendSchema = z.object({
  phone: z.string().min(10).max(15),
})

export const otpVerifySchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6),
})

export const placeOrderSchema = z.object({
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().min(10).max(15),
})

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return next(new AppError(400, result.error.errors[0]?.message ?? 'Invalid request'))
    }
    req.body = result.data
    next()
  }
}

export function validateSessionHeader(req: Request, _res: Response, next: NextFunction) {
  const sessionId = req.headers['x-session-id'] as string | undefined
  const paramId = req.params.id ?? req.params.sessionId
  if (paramId && sessionId && sessionId !== paramId) {
    return next(new AppError(403, 'Session ID mismatch'))
  }
  next()
}
