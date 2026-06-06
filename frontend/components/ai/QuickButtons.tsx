'use client'

const BUTTONS = [
  { label: '🌶 Spicy', message: 'Something spicy please' },
  { label: '🥗 Light', message: 'Something light and healthy' },
  { label: '🍽 Filling', message: 'Something filling' },
  { label: '🍰 Dessert', message: 'Show me desserts' },
  { label: '🍹 Drinks', message: 'What drinks pair with my order?' },
  { label: '⭐ Best Sellers', message: 'What are the best sellers?' },
  { label: '👨‍🍳 Chef Special', message: 'What is the chef special today?' },
  { label: '👥 For Groups', message: 'Good options for our group' },
]

interface QuickButtonsProps {
  onSelect: (message: string) => void
  disabled?: boolean
}

export function QuickButtons({ onSelect, disabled }: QuickButtonsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {BUTTONS.map((btn) => (
        <button
          key={btn.label}
          onClick={() => onSelect(btn.message)}
          disabled={disabled}
          className="shrink-0 rounded-full border border-amber-200/80 bg-white px-3 py-2 text-xs font-semibold text-amber-900 min-h-[36px] shadow-sm transition hover:border-amber-300 hover:bg-amber-50 disabled:opacity-40"
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
