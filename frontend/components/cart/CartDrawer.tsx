'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { CartItemRow } from './CartItem'
import { CheckoutModal } from './CheckoutModal'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  onUpdateQty: (itemId: string, qty: number) => void
  onRemove: (itemId: string) => void
  newItemIds: Set<string>
}

export function CartDrawer({
  isOpen,
  onClose,
  onUpdateQty,
  onRemove,
  newItemIds,
}: CartDrawerProps) {
  const { items, subtotal, tax, total } = useCartStore()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-stone-50 shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4">
          <h2 className="text-lg font-bold text-stone-900">Your Cart</h2>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <p className="py-8 text-center text-stone-500">Your cart is empty</p>
          ) : (
            items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQty={onUpdateQty}
                onRemove={onRemove}
                isNew={newItemIds.has(item.menuItemId)}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone-200 p-4 space-y-2">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>GST (5% food / 12% packaged)</span>
              <span>₹{tax.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-stone-900">
              <span>Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="mt-2 w-full rounded-xl bg-amber-600 py-3 font-semibold text-white min-h-[48px] hover:bg-amber-700"
            >
              Place Order
            </button>
          </div>
        )}
      </div>

      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  )
}
