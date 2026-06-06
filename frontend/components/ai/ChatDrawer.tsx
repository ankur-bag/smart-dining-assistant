'use client'

import { useRef, useEffect, useState } from 'react'
import { useChatStore } from '@/store/chatStore'
import { ChatMessage } from './ChatMessage'
import { QuickButtons } from './QuickButtons'

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSend: (message: string) => void
  onAddSuggestion: (itemId: string) => void
}

export function ChatDrawer({ isOpen, onClose, onSend, onAddSuggestion }: ChatDrawerProps) {
  const { messages, isStreaming } = useChatStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  if (!isOpen) return null

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    onSend(input.trim())
    setInput('')
  }

  const handleChipOrOption = (text: string) => {
    if (isStreaming) return
    onSend(text)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close chat"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
      />

      <div className="relative flex max-h-[92vh] flex-col rounded-t-3xl bg-stone-50 shadow-2xl animate-slide-up">
        <div className="flex shrink-0 items-center gap-3 border-b border-amber-100 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-4 text-white rounded-t-3xl">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl ring-2 ring-white/30">
            ✨
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-amber-600 bg-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg leading-tight">Zara</h2>
            <p className="text-xs text-amber-100/90">Your AI dining companion · online</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[40vh] max-h-[50vh]">
          {messages.length === 0 && (
            <div className="flex justify-center py-8">
              <p className="text-sm text-stone-400">Start a conversation with Zara...</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onAddSuggestion={onAddSuggestion}
              onQuickOption={handleChipOrOption}
              onMoodSelect={handleChipOrOption}
              showInteractive={
                idx === messages.length - 1 &&
                msg.role === 'assistant' &&
                !isStreaming &&
                Boolean(msg.quickOptions?.length || msg.preferenceChips?.length)
              }
            />
          ))}
          {isStreaming && (
            <div className="flex justify-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm">
                ✨
              </div>
              <div className="rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-4 py-3 shadow-sm">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:0.2s]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 border-t border-stone-200 bg-white p-3 space-y-2 safe-bottom">
          <QuickButtons onSelect={handleChipOrOption} disabled={isStreaming} />
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Try: something spicy but light..."
              className="flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm min-h-[48px] focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              disabled={isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 font-semibold text-white shadow-md disabled:opacity-40"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
