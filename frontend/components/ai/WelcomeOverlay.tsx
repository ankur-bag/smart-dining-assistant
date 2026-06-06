'use client'

import { Message } from '@/types'

interface WelcomeOverlayProps {
  tableId: string
  greeting: Message | null
  loading: boolean
  onQuickOption: (text: string) => void
  onMoodSelect: (mood: string) => void
  onStartChat: () => void
}

const MOOD_EMOJI: Record<string, string> = {
  Spicy: '🌶',
  Light: '🥗',
  Sweet: '🍰',
  Filling: '🍽',
  'Surprise me!': '✨',
}

export function WelcomeOverlay({
  tableId,
  greeting,
  loading,
  onQuickOption,
  onMoodSelect,
  onStartChat,
}: WelcomeOverlayProps) {
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-10 bottom-32 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-12">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-3xl shadow-lg shadow-amber-900/50 ring-4 ring-amber-400/20">
          <span className="animate-pulse">✨</span>
        </div>

        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-amber-300/80">
          Welcome to Smart Dining
        </p>
        <h1 className="mb-2 text-center text-2xl font-bold">Table {tableId}</h1>

        {loading ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:0.3s]" />
            </div>
            <p className="text-sm text-stone-400">Zara is getting ready...</p>
          </div>
        ) : (
          <>
            <div className="mt-4 max-w-sm rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
              <p className="mb-1 text-xs font-semibold text-amber-300">Zara</p>
              <p className="text-center text-base leading-relaxed text-stone-100">
                {greeting?.content ||
                  `Hey! I'm Zara 👋 Quick question — what's the vibe today?`}
              </p>
            </div>

            {greeting?.quickOptions && greeting.quickOptions.length > 0 && (
              <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
                {greeting.quickOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => onQuickOption(opt)}
                    className="min-h-[48px] rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 active:scale-[0.98]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {greeting?.preferenceChips && greeting.preferenceChips.length > 0 && (
              <div className="mt-5 w-full max-w-sm">
                <p className="mb-3 text-center text-xs text-stone-400">Or pick a mood</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {greeting.preferenceChips.map((chip) => {
                    const label = chip.replace(/[^\w\s!]/g, '').trim()
                    const emoji = MOOD_EMOJI[label] ?? MOOD_EMOJI[chip] ?? '•'
                    return (
                      <button
                        key={chip}
                        onClick={() => onMoodSelect(chip.replace(/[^\w\s!]/g, '').trim())}
                        className="min-h-[40px] rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20 active:scale-95"
                      >
                        {emoji} {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="relative px-6 pb-8">
        <button
          onClick={onStartChat}
          disabled={loading}
          className="w-full min-h-[48px] rounded-xl bg-white/10 py-3 text-sm text-stone-300 transition hover:bg-white/15 disabled:opacity-50"
        >
          Skip to menu →
        </button>
      </div>
    </div>
  )
}
