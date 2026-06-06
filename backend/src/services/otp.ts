import { redisGet, redisSet, redisIncr } from './redis'

const OTP_TTL = 300
const MAX_ATTEMPTS = 3

function otpKey(phone: string) {
  return `otp:${phone}`
}

function attemptKey(phone: string) {
  return `otp:attempts:${phone}`
}

export async function sendOtp(phone: string): Promise<void> {
  if (process.env.OTP_MODE === 'mock') {
    console.log(`[OTP MOCK] Code for ${phone}: 123456`)
    await redisSet(otpKey(phone), '123456', OTP_TTL)
    await redisSet(attemptKey(phone), '0', OTP_TTL)
    return
  }
  // Twilio Verify API would go here
  await redisSet(otpKey(phone), 'sent', OTP_TTL)
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const attempts = parseInt((await redisGet(attemptKey(phone))) ?? '0', 10)
  if (attempts >= MAX_ATTEMPTS) {
    throw new Error('Too many OTP attempts. Please request a new code.')
  }

  await redisIncr(attemptKey(phone))

  if (process.env.OTP_MODE === 'mock') {
    return code === '123456'
  }
  // Twilio check would go here
  return false
}
