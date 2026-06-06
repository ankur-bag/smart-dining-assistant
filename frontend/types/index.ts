export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  description?: string | null
  imageUrl?: string | null
  tags: string[]
  allergens: string[]
  available: boolean
  popularScore: number
  complementaryItems: string[]
}

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  specialInstructions?: string
  addedBy?: string
  tags: string[]
  imageUrl?: string | null
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: Suggestion[]
  quickOptions?: string[]
  preferenceChips?: string[]
  upsell?: Suggestion
}

export interface Suggestion {
  itemId: string
  name: string
  price: number
  reason?: string
  imageUrl?: string | null
}

export interface Order {
  id: string
  status: string
  totalAmount: number
  taxAmount: number
  customerName: string
  customerPhone: string
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    menuItem: MenuItem
  }>
  session?: { tableId: string }
}
