'use client'

const BUTTONS = [
  { label: '🌶 Spicy', message: 'Something spicy please' },
  { label: '🥗 Light', message: 'Something light and healthy' },
  { label: '🍽 Filling', message: 'Something filling' },
  { label: '🍰 Dessert', message: 'Show me desserts' },
  { label: '🍹 Drinks', message: 'What drinks do you have?' },
  { label: '⭐ Best Sellers', message: 'What are the best sellers?' },
]

interface QuickButtonsProps {
  onSelect: (message: string) => void
}

export function QuickButtons({ onSelect }: QuickButtonsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {BUTTONS.map((btn) => (
        <button
          key={btn.label}
          onClick={() => onSelect(btn.message)}
          className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 min-h-[36px] hover:bg-amber-100"
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
