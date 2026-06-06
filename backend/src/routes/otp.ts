import { Router } from 'express'
import { sendOtp, verifyOtp } from '../services/otp'
import { validateBody, otpSendSchema, otpVerifySchema } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'

const router = Router()

router.post('/send', validateBody(otpSendSchema), async (req, res, next) => {
  try {
    await sendOtp(req.body.phone)
    res.json({ success: true, message: 'OTP sent' })
  } catch (err) {
    next(err)
  }
})

router.post('/verify', validateBody(otpVerifySchema), async (req, res, next) => {
  try {
    const { phone, otp } = req.body
    const verified = await verifyOtp(phone, otp)
    res.json({ verified })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Too many')) {
      return next(new AppError(429, err.message))
    }
    next(err)
  }
})

export default router
