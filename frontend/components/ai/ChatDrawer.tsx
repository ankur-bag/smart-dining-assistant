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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-50">
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
        <div>
          <h2 className="font-bold text-stone-900">Zara</h2>
          <p className="text-xs text-stone-500">Your dining assistant</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onAddSuggestion={onAddSuggestion} />
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white border border-stone-200 px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:0.2s]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-stone-200 bg-white p-3 space-y-2">
        <QuickButtons onSelect={onSend} />
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Zara anything..."
            className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-sm min-h-[48px]"
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white min-h-[48px] min-w-[48px] disabled:opacity-50"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
