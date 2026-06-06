'use client'

const TAGS = ['spicy', 'veg', 'light', 'sweet', 'bestseller', 'non-veg']

interface TagFilterProps {
  active: string[]
  onChange: (tags: string[]) => void
}

export function TagFilter({ active, onChange }: TagFilterProps) {
  const toggle = (tag: string) => {
    if (active.includes(tag)) {
      onChange(active.filter((t) => t !== tag))
    } else {
      onChange([...active, tag])
    }
  }

  const labels: Record<string, string> = {
    spicy: '🌶 Spicy',
    veg: '✅ Veg',
    light: '🥗 Light',
    sweet: '🍰 Sweet',
    bestseller: '⭐ Bestseller',
    'non-veg': '🍗 Non-Veg',
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => toggle(tag)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium min-h-[36px] border ${
            active.includes(tag)
              ? 'border-amber-500 bg-amber-50 text-amber-800'
              : 'border-stone-200 bg-white text-stone-600'
          }`}
        >
          {labels[tag]}
        </button>
      ))}
    </div>
  )
}
