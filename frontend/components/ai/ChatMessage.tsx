'use client'

import { Message } from '@/types'
import { ItemSuggestionCard } from './ItemSuggestionCard'

interface ChatMessageProps {
  message: Message
  onAddSuggestion: (itemId: string) => void
}

export function ChatMessage({ message, onAddSuggestion }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-amber-600 text-white rounded-br-sm'
            : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm shadow-sm'
        }`}
      >
        {!isUser && (
          <p className="mb-1 text-xs font-semibold text-amber-600">Zara</p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content.replace(/__META__.*/, '')}</p>

        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 space-y-2">
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
          <div className="mt-2">
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
