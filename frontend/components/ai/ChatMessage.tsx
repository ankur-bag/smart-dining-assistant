'use client'

import { Message } from '@/types'
import { ItemSuggestionCard } from './ItemSuggestionCard'

const MOOD_EMOJI: Record<string, string> = {
  Spicy: '🌶',
  Light: '🥗',
  Sweet: '🍰',
  Filling: '🍽',
  'Surprise me!': '✨',
}

interface ChatMessageProps {
  message: Message
  onAddSuggestion: (itemId: string) => void
  onQuickOption?: (text: string) => void
  onMoodSelect?: (mood: string) => void
  showInteractive?: boolean
}

export function ChatMessage({
  message,
  onAddSuggestion,
  onQuickOption,
  onMoodSelect,
  showInteractive = false,
}: ChatMessageProps) {
  const isUser = message.role === 'user'
  const content = message.content.replace(/__META__.*/, '').trim()

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm text-white shadow-sm">
          ✨
        </div>
      )}

      <div className={`max-w-[82%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-br-sm shadow-md'
              : 'border border-stone-200/80 bg-white text-stone-800 rounded-bl-sm shadow-sm'
          }`}
        >
          {!isUser && (
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600">
              Zara
            </p>
          )}
          {content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>}
        </div>

        {showInteractive && message.quickOptions && message.quickOptions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {message.quickOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => onQuickOption?.(opt)}
                className="min-h-[40px] rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm font-medium text-amber-900 transition hover:bg-amber-100 active:scale-[0.98]"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {showInteractive && message.preferenceChips && message.preferenceChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.preferenceChips.map((chip) => {
              const label = chip.replace(/[^\w\s!]/g, '').trim() || chip
              const emoji = MOOD_EMOJI[label] ?? MOOD_EMOJI[chip] ?? ''
              return (
                <button
                  key={chip}
                  onClick={() => onMoodSelect?.(label)}
                  className="min-h-[36px] rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 active:scale-95"
                >
                  {emoji} {label}
                </button>
              )
            })}
          </div>
        )}

        {message.suggestions && message.suggestions.length > 0 && (
          <div className="space-y-2 w-full">
            {message.suggestions.map((s) => (
              <ItemSuggestionCard
                key={s.itemId}
                suggestion={s}
                onAdd={() => onAddSuggestion(s.itemId)}
              />
            ))}
          </div>
        )}

        {message.upsell && (
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-1">
            <p className="mb-1 px-2 pt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              Pairs well with
            </p>
            <ItemSuggestionCard
              suggestion={message.upsell}
              onAdd={() => onAddSuggestion(message.upsell!.itemId)}
              compact
            />
          </div>
        )}
      </div>
    </div>
  )
}
