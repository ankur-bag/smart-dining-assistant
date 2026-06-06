'use client'

interface GroupBannerProps {
  members: string[]
}

export function GroupBanner({ members }: GroupBannerProps) {
  if (members.length < 2) return null

  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
      <div className="flex -space-x-2">
        {members.slice(0, 5).map((name) => (
          <span
            key={name}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-200 text-xs font-bold text-blue-800"
          >
            {name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
          </span>
        ))}
      </div>
      <p className="text-sm text-blue-800">
        <span className="font-semibold">{members.length} people</span> at this table
      </p>
    </div>
  )
}
