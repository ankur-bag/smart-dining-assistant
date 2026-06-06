'use client'

import { Suggestion } from '@/types'

interface ItemSuggestionCardProps {
  suggestion: Suggestion
  onAdd: () => void
  compact?: boolean
}

export function ItemSuggestionCard({ suggestion, onAdd, compact }: ItemSuggestionCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50/50 p-2.5 shadow-sm ${
        compact ? 'text-xs' : ''
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-inner">
        {suggestion.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={suggestion.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg">🍽️</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 truncate">{suggestion.name}</p>
        {!compact && suggestion.reason && (
          <p className="text-xs text-stone-500 line-clamp-2">{suggestion.reason}</p>
        )}
        <p className="text-sm font-bold text-amber-700">₹{suggestion.price}</p>
      </div>
      <button
        onClick={onAdd}
        className="shrink-0 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 px-3 py-2 text-xs font-bold text-white min-h-[44px] shadow-sm transition active:scale-95 hover:shadow-md"
      >
        + Add
      </button>
    </div>
  )
}
