import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from './i18n'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
}

interface ChatStore {
  activeChannelId: string | null
  setActiveChannel: (id: string) => void
  emotion: any | null
  setEmotion: (e: any) => void
  lang: Lang
  setLang: (l: Lang) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'wetalk-auth' }
  )
)

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      activeChannelId: null,
      setActiveChannel: (id) => set({ activeChannelId: id }),
      emotion: null,
      setEmotion: (emotion) => set({ emotion }),
      lang: 'fr',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'wetalk-chat' }
  )
)
