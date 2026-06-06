'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useSessionStore } from '@/store/sessionStore'
import { useCartStore } from '@/store/cartStore'
import { useChatStore } from '@/store/chatStore'
import {
  getSession,
  getMenu,
  getCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  sendChatMessage,
  streamChat,
} from '@/lib/api'
import { connectSocket, generateDisplayName } from '@/lib/socket'
import { MenuItem } from '@/types'
import { CategoryTabs } from '@/components/menu/CategoryTabs'
import { TagFilter } from '@/components/menu/TagFilter'
import { MenuGrid } from '@/components/menu/MenuGrid'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ChatDrawer } from '@/components/ai/ChatDrawer'
import { WelcomeOverlay } from '@/components/ai/WelcomeOverlay'
import { GroupBanner } from '@/components/group/GroupBanner'
import { MenuCard } from '@/components/menu/MenuCard'

export default function TablePage() {
  const params = useParams()
  const tableId = params.tableId as string
  const { sessionId, setSession, displayName, setDisplayName } = useSessionStore()
  const { setCart, totalItems } = useCartStore()
  const {
    messages,
    addMessage,
    appendChunk,
    setStreaming,
    isOpen: chatOpen,
    setOpen: setChatOpen,
    unreadCount,
    clearUnread,
    setLastSuggestions,
    updateLastAssistantMessage,
    welcomeVisible,
    setWelcomeVisible,
    greetingLoading,
    setGreetingLoading,
  } = useChatStore()

  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [groupMembers, setGroupMembers] = useState<string[]>([])
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set())
  const [initDone, setInitDone] = useState(false)

  const { data: menu = [], isLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: getMenu,
    enabled: !!sessionId,
  })

  const categories = useMemo(
    () => [...new Set((menu as MenuItem[]).map((m) => m.category))],
    [menu]
  )

  const filteredMenu = useMemo(() => {
    let items = menu as MenuItem[]
    if (activeCategory !== 'All') {
      items = items.filter((i) => i.category === activeCategory)
    }
    if (activeTags.length > 0) {
      items = items.filter((i) => activeTags.every((t) => i.tags.includes(t)))
    }
    return items
  }, [menu, activeCategory, activeTags])

  const lastSuggestions = useChatStore((s) => s.lastSuggestions)
  const greetingMessage = messages.find((m) => m.id === 'greet' || m.id === 'greet-fallback') ?? null

  const dismissWelcome = useCallback(() => {
    setWelcomeVisible(false)
    setChatOpen(true)
    clearUnread()
  }, [setWelcomeVisible, setChatOpen, clearUnread])

  const refreshCart = useCallback(async () => {
    if (!sessionId) return
    const data = await getCart(sessionId)
    setCart(data.items, data.subtotal, data.tax, data.total)
  }, [sessionId, setCart])

  const handleAddToCart = useCallback(
    async (itemOrId: MenuItem | string, qty = 1) => {
      if (!sessionId) return
      const itemId = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
      const data = await addToCartApi(sessionId, itemId, qty, displayName ?? undefined)
      setCart(data.items, data.subtotal, data.tax, data.total)
      setNewItemIds((prev) => new Set(prev).add(itemId))
      setTimeout(() => {
        setNewItemIds((prev) => {
          const next = new Set(prev)
          next.delete(itemId)
          return next
        })
      }, 2000)
    },
    [sessionId, displayName, setCart]
  )

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!sessionId) return

      addMessage({ id: Date.now().toString(), role: 'user', content: message })
      setStreaming(true)
      setChatOpen(true)

      let assistantContent = ''
      const assistantId = (Date.now() + 1).toString()
      addMessage({ id: assistantId, role: 'assistant', content: '' })

      streamChat(
        sessionId,
        message,
        (chunk) => {
          assistantContent += chunk
          appendChunk(chunk)
        },
        (metaStr) => {
          setStreaming(false)
          if (metaStr) {
            try {
              const meta = JSON.parse(metaStr)
              updateLastAssistantMessage({
                suggestions: meta.suggestions,
                quickOptions: meta.quickOptions,
                preferenceChips: meta.preferenceChips,
                upsell: meta.upsell,
              })
              if (meta.suggestions?.length) {
                setLastSuggestions(meta.suggestions)
              }
            } catch {
              // ignore parse errors
            }
          }
        },
        () => {
          setStreaming(false)
          updateLastAssistantMessage({
            content: assistantContent || 'Sorry, I had trouble responding. Please try again.',
          })
        }
      )
    },
    [
      sessionId,
      addMessage,
      setStreaming,
      appendChunk,
      updateLastAssistantMessage,
      setLastSuggestions,
      setChatOpen,
    ]
  )

  const handleWelcomeChoice = useCallback(
    (text: string) => {
      dismissWelcome()
      handleSendMessage(text)
    },
    [dismissWelcome, handleSendMessage]
  )

  useEffect(() => {
    async function init() {
      const name = generateDisplayName()
      setDisplayName(name)
      setGreetingLoading(true)

      try {
        const session = await getSession(tableId)
        setSession(session.sessionId, tableId)

        const cartData = await getCart(session.sessionId)
        setCart(cartData.items, cartData.subtotal, cartData.tax, cartData.total)

        const socket = connectSocket(tableId, name)
        setGroupMembers([name])

        socket.on('session:user_joined', ({ displayName: joined }: { displayName: string }) => {
          setGroupMembers((prev) => (prev.includes(joined) ? prev : [...prev, joined]))
          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: `Hey! ${joined} just joined the table. Want to browse the menu together?`,
          })
        })

        socket.on('cart:item_added', () => refreshCart())
        socket.on('cart:item_removed', () => refreshCart())
        socket.on('cart:item_updated', () => refreshCart())

        if (!initDone) {
          try {
            const greet = await sendChatMessage(session.sessionId, '__INIT__')
            addMessage({
              id: 'greet',
              role: 'assistant',
              content: greet.message,
              quickOptions: greet.quickOptions,
              preferenceChips: greet.preferenceChips,
              suggestions: greet.suggestions,
            })
            if (greet.suggestions?.length) setLastSuggestions(greet.suggestions)
          } catch {
            addMessage({
              id: 'greet-fallback',
              role: 'assistant',
              content: `Hey! I'm Zara 👋 Welcome to Table ${tableId}. What's the vibe today?`,
              quickOptions: ['Just browsing', "Tell me what's good"],
              preferenceChips: ['Spicy', 'Light', 'Sweet', 'Filling', 'Surprise me!'],
            })
          }
          setInitDone(true)
        }
      } catch (err) {
        console.error('Session init failed:', err)
      } finally {
        setGreetingLoading(false)
      }
    }

    init()
  }, [tableId])

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      {welcomeVisible && (
        <WelcomeOverlay
          tableId={tableId}
          greeting={greetingMessage}
          loading={greetingLoading}
          onQuickOption={handleWelcomeChoice}
          onMoodSelect={(mood) => handleWelcomeChoice(`I'm in the mood for something ${mood}`)}
          onStartChat={dismissWelcome}
        />
      )}

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div>
          <h1 className="font-bold text-stone-900">Table {tableId}</h1>
          <p className="text-xs text-stone-500">Smart Dining · Zara is ready to help</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 font-semibold text-white min-h-[44px] shadow-md"
        >
          🛒 Cart
          {totalItems() > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {totalItems()}
            </span>
          )}
        </button>
      </header>

      <main className="space-y-4 p-4">
        <GroupBanner members={groupMembers} />

        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        <TagFilter active={activeTags} onChange={setActiveTags} />

        {lastSuggestions.length > 0 && (
          <section>
            <h2 className="mb-2 flex items-center gap-1.5 font-semibold text-stone-800">
              <span className="text-amber-500">✨</span> AI Pick for You
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {lastSuggestions.map((s) => {
                const item = (menu as MenuItem[]).find((m) => m.id === s.itemId)
                if (!item) return null
                return (
                  <MenuCard
                    key={s.itemId}
                    item={item}
                    onAdd={(i) => handleAddToCart(i)}
                    highlight
                  />
                )
              })}
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-stone-200" />
            ))}
          </div>
        ) : (
          <MenuGrid
            items={filteredMenu}
            onAdd={(item) => handleAddToCart(item)}
            highlightIds={lastSuggestions.map((s) => s.itemId)}
          />
        )}
      </main>

      <button
        onClick={() => {
          setChatOpen(true)
          clearUnread()
        }}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xl text-white shadow-lg shadow-amber-900/25 transition hover:scale-105 active:scale-95 min-h-[56px] min-w-[56px]"
        aria-label="Open chat with Zara"
      >
        <span className="relative">
          ✨
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </span>
      </button>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQty={async (itemId, qty) => {
          if (!sessionId) return
          const data = await updateCartItemApi(sessionId, itemId, { qty })
          setCart(data.items, data.subtotal, data.tax, data.total)
        }}
        onRemove={async (itemId) => {
          if (!sessionId) return
          const data = await removeCartItemApi(sessionId, itemId)
          setCart(data.items, data.subtotal, data.tax, data.total)
        }}
        newItemIds={newItemIds}
      />

      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onSend={handleSendMessage}
        onAddSuggestion={(itemId) => handleAddToCart(itemId)}
      />
    </div>
  )
}
