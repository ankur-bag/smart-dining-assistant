'use client'

import { MenuItem } from '@/types'

interface MenuCardProps {
  item: MenuItem
  onAdd: (item: MenuItem, qty: number) => void
  highlight?: boolean
}

export function MenuCard({ item, onAdd, highlight }: MenuCardProps) {
  const tagEmoji = (tag: string) => {
    if (tag === 'spicy') return '🌶'
    if (tag === 'veg') return '✅'
    if (tag === 'bestseller') return '⭐'
    return null
  }

  return (
    <div
      className={`rounded-xl border bg-white p-3 shadow-sm transition-all ${
        highlight ? 'border-amber-400 ring-2 ring-amber-200' : 'border-stone-200'
      } ${!item.available ? 'opacity-50' : ''}`}
    >
      <div className="mb-2 flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 text-3xl">
        {item.tags.includes('veg') ? '🥗' : item.tags.includes('seafood') ? '🦐' : '🍽️'}
      </div>
      <h3 className="font-semibold text-stone-900 line-clamp-1">{item.name}</h3>
      <p className="mt-0.5 text-xs text-stone-500 line-clamp-2">{item.description}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {item.tags.slice(0, 3).map((tag) => {
          const emoji = tagEmoji(tag)
          if (!emoji) return null
          return (
            <span key={tag} className="text-xs">
              {emoji}
            </span>
          )
        })}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-bold text-amber-700">₹{item.price}</span>
        {item.available ? (
          <button
            onClick={() => onAdd(item, 1)}
            className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white min-h-[44px] min-w-[44px] hover:bg-amber-700 active:scale-95"
          >
            Add
          </button>
        ) : (
          <span className="text-xs font-medium text-stone-400">Unavailable</span>
        )}
      </div>
    </div>
  )
}
