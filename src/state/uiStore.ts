import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const STORAGE_KEY = 'webapp-template-ui-v1'

export type ThemeMode = 'light' | 'dark'

export interface UiStore {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebarCollapsed: () => void
  agentChatOpen: boolean
  setAgentChatOpen: (v: boolean) => void
  toggleAgentChatOpen: () => void
  commandOpen: boolean
  setCommandOpen: (v: boolean) => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      agentChatOpen: false,
      setAgentChatOpen: (v) => set({ agentChatOpen: v }),
      toggleAgentChatOpen: () => set((s) => ({ agentChatOpen: !s.agentChatOpen })),
      commandOpen: false,
      setCommandOpen: (v) => set({ commandOpen: v }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        sidebarCollapsed: s.sidebarCollapsed,
        agentChatOpen: s.agentChatOpen,
      }),
      version: 1,
    },
  ),
)
