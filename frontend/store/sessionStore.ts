import { create } from 'zustand'

interface SessionState {
  sessionId: string | null
  tableId: string | null
  displayName: string | null
  setSession: (sessionId: string, tableId: string) => void
  setDisplayName: (name: string) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  tableId: null,
  displayName: null,
  setSession: (sessionId, tableId) => set({ sessionId, tableId }),
  setDisplayName: (displayName) => set({ displayName }),
}))
