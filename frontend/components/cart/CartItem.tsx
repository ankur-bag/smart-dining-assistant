'use client'

import { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
  onUpdateQty: (itemId: string, qty: number) => void
  onRemove: (itemId: string) => void
  isNew?: boolean
}

export function CartItemRow({ item, onUpdateQty, onRemove, isNew }: CartItemProps) {
  const initials = item.addedBy
    ? item.addedBy.split(' ').map((w) => w[0]).join('').slice(0, 2)
    : '?'

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        isNew ? 'border-green-400 bg-green-50' : 'border-stone-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-stone-900">{item.name}</h4>
            {item.addedBy && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                {initials}
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500">₹{item.price} each</p>
        </div>
        <button
          onClick={() => onRemove(item.menuItemId)}
          className="text-stone-400 hover:text-red-500 min-h-[44px] min-w-[44px]"
          aria-label="Remove item"
        >
          ✕
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQty(item.menuItemId, Math.max(1, item.quantity - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 text-lg"
          >
            −
          </button>
          <span className="w-6 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.menuItemId, item.quantity + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 text-lg"
          >
            +
          </button>
        </div>
        <span className="font-semibold text-amber-700">
          ₹{item.price * item.quantity}
        </span>
      </div>
    </div>
  )
}
