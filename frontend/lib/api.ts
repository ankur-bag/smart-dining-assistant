import axios from 'axios'
import { useSessionStore } from '@/store/sessionStore'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const sessionId = useSessionStore.getState().sessionId
  if (sessionId) {
    config.headers['X-Session-Id'] = sessionId
  }
  return config
})

export async function getSession(tableId: string) {
  const { data } = await api.get(`/api/table/${tableId}/session`)
  return data
}

export async function getMenu() {
  const { data } = await api.get('/api/menu')
  return data
}

export async function getCart(sessionId: string) {
  const { data } = await api.get(`/api/session/${sessionId}/cart`)
  return data
}

export async function addToCartApi(
  sessionId: string,
  itemId: string,
  qty = 1,
  addedBy?: string
) {
  const { data } = await api.post(`/api/session/${sessionId}/cart`, { itemId, qty, addedBy })
  return data
}

export async function updateCartItemApi(
  sessionId: string,
  itemId: string,
  updates: { qty?: number; specialInstructions?: string }
) {
  const { data } = await api.patch(`/api/session/${sessionId}/cart/${itemId}`, updates)
  return data
}

export async function removeCartItemApi(sessionId: string, itemId: string) {
  const { data } = await api.delete(`/api/session/${sessionId}/cart/${itemId}`)
  return data
}

export async function sendChatMessage(sessionId: string, message: string) {
  const { data } = await api.post(`/api/session/${sessionId}/ai/chat`, { message })
  return data
}

export async function sendOtp(phone: string) {
  const { data } = await api.post('/api/otp/send', { phone })
  return data
}

export async function verifyOtp(phone: string, otp: string) {
  const { data } = await api.post('/api/otp/verify', { phone, otp })
  return data
}

export async function placeOrder(
  sessionId: string,
  customerName: string,
  customerPhone: string
) {
  const { data } = await api.post(`/api/session/${sessionId}/order`, {
    customerName,
    customerPhone,
  })
  return data
}

export async function getOrder(orderId: string) {
  const { data } = await api.get(`/api/order/${orderId}`)
  return data
}

export function streamChat(
  sessionId: string,
  message: string,
  onChunk: (text: string) => void,
  onDone: (meta?: string) => void,
  onError?: () => void
) {
  const url = `${BACKEND_URL}/api/session/${sessionId}/ai/stream?message=${encodeURIComponent(message)}`
  const es = new EventSource(url)

  es.onmessage = (e) => {
    if (e.data === '[DONE]') {
      onDone()
      es.close()
      return
    }
    if (e.data === '[ERROR]') {
      onError?.()
      es.close()
      return
    }
    if (e.data.includes('__META__')) {
      const meta = e.data.replace('__META__', '')
      onDone(meta)
      return
    }
    onChunk(e.data)
  }

  es.onerror = () => {
    onError?.()
    es.close()
  }

  return () => es.close()
}
