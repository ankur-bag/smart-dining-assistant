import { create } from 'zustand'
import { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  setCart: (items: CartItem[], subtotal?: number, tax?: number, total?: number) => void
  totalItems: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  setCart: (items, subtotal = 0, tax = 0, total = 0) => set({ items, subtotal, tax, total }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))
