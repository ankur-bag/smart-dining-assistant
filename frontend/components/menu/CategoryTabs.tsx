'use client'

interface CategoryTabsProps {
  categories: string[]
  active: string
  onChange: (category: string) => void
}

export function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange('All')}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium min-h-[44px] ${
          active === 'All'
            ? 'bg-amber-600 text-white'
            : 'bg-stone-100 text-stone-700'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium min-h-[44px] ${
            active === cat
              ? 'bg-amber-600 text-white'
              : 'bg-stone-100 text-stone-700'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
