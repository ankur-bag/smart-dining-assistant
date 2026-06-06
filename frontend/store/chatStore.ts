import { create } from 'zustand'
import { Message, Suggestion } from '@/types'

interface ChatState {
  messages: Message[]
  isStreaming: boolean
  unreadCount: number
  isOpen: boolean
  welcomeVisible: boolean
  greetingLoading: boolean
  lastSuggestions: Suggestion[]
  addMessage: (msg: Message) => void
  appendChunk: (chunk: string) => void
  setStreaming: (v: boolean) => void
  clearUnread: () => void
  setOpen: (v: boolean) => void
  setWelcomeVisible: (v: boolean) => void
  setGreetingLoading: (v: boolean) => void
  setLastSuggestions: (suggestions: Suggestion[]) => void
  updateLastAssistantMessage: (updates: Partial<Message>) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  unreadCount: 0,
  isOpen: false,
  welcomeVisible: true,
  greetingLoading: true,
  lastSuggestions: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
      unreadCount: state.isOpen ? state.unreadCount : state.unreadCount + (msg.role === 'assistant' ? 1 : 0),
    })),
  appendChunk: (chunk) =>
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last?.role === 'assistant') {
        messages[messages.length - 1] = { ...last, content: last.content + chunk }
      } else {
        messages.push({ id: Date.now().toString(), role: 'assistant', content: chunk })
      }
      return { messages }
    }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  clearUnread: () => set({ unreadCount: 0 }),
  setOpen: (isOpen) => set({ isOpen, unreadCount: isOpen ? 0 : get().unreadCount }),
  setWelcomeVisible: (welcomeVisible) => set({ welcomeVisible }),
  setGreetingLoading: (greetingLoading) => set({ greetingLoading }),
  setLastSuggestions: (lastSuggestions) => set({ lastSuggestions }),
  updateLastAssistantMessage: (updates) =>
    set((state) => {
      const messages = [...state.messages]
      const idx = messages.map((m) => m.role).lastIndexOf('assistant')
      if (idx >= 0) messages[idx] = { ...messages[idx], ...updates }
      return { messages }
    }),
}))
