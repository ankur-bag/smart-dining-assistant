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
      className={`flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 p-2 ${
        compact ? 'text-xs' : ''
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg">
        🍽️
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-900 truncate">{suggestion.name}</p>
        {!compact && suggestion.reason && (
          <p className="text-xs text-stone-500 truncate">{suggestion.reason}</p>
        )}
        <p className="text-sm font-semibold text-amber-700">₹{suggestion.price}</p>
      </div>
      <button
        onClick={onAdd}
        className="shrink-0 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white min-h-[44px] hover:bg-amber-700"
      >
        Add
      </button>
    </div>
  )
}
