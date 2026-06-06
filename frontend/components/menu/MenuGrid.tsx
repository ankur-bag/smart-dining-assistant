'use client'

import { MenuItem } from '@/types'
import { MenuCard } from './MenuCard'

interface MenuGridProps {
  items: MenuItem[]
  onAdd: (item: MenuItem, qty: number) => void
  highlightIds?: string[]
}

export function MenuGrid({ items, onAdd, highlightIds = [] }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-stone-500">
        No items match your filters
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          onAdd={onAdd}
          highlight={highlightIds.includes(item.id)}
        />
      ))}
    </div>
  )
}
