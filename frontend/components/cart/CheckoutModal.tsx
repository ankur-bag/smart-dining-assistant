'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { sendOtp, verifyOtp, placeOrder } from '@/lib/api'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const router = useRouter()
  const { sessionId } = useSessionStore()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  if (!isOpen) return null

  const handleSendOtp = async () => {
    if (!name.trim() || phone.length < 10) {
      setError('Please enter name and valid phone number')
      return
    }
    setLoading(true)
    setError('')
    try {
      await sendOtp(phone)
      setStep(2)
      setResendTimer(60)
    } catch {
      setError('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Enter 6-digit OTP')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { verified } = await verifyOtp(phone, otp)
      if (!verified) {
        setError('Invalid OTP. Use 123456 for demo.')
        setLoading(false)
        return
      }
      setStep(3)
      const order = await placeOrder(sessionId!, name, phone)
      router.push(`/order/${order.orderId}`)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; issues?: string[] } } }
      const msg =
        axiosErr.response?.data?.issues?.join(', ') ??
        axiosErr.response?.data?.error ??
        (err instanceof Error ? err.message : 'Order failed')
      setError(msg)
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Checkout</h2>
          <button onClick={onClose} className="h-11 w-11 text-stone-400">✕</button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 min-h-[48px]"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 min-h-[48px]"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full rounded-xl bg-amber-600 py-3 font-semibold text-white min-h-[48px] disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">Enter the 6-digit OTP sent to {phone}</p>
            <p className="text-xs text-amber-600">Demo OTP: 123456</p>
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-center text-2xl tracking-widest min-h-[48px]"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full rounded-xl bg-amber-600 py-3 font-semibold text-white min-h-[48px] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Place Order'}
            </button>
            {resendTimer > 0 ? (
              <p className="text-center text-sm text-stone-400">Resend in {resendTimer}s</p>
            ) : (
              <button
                onClick={handleSendOtp}
                className="w-full text-sm text-amber-600 min-h-[44px]"
              >
                Resend OTP
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center py-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
            <p className="mt-4 text-stone-600">Placing your order...</p>
          </div>
        )}
      </div>
    </div>
  )
}
