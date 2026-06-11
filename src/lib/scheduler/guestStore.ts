import type { Post, PostTarget, SocialAccount } from '@/lib/scheduler/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Guest-mode data layer — mirrors the InstantDB entities in localStorage so
 * the whole product works before `VITE_INSTANT_APP_ID` is configured.
 */
type GuestSchedulerState = {
  accounts: SocialAccount[]
  posts: Post[]
  targets: PostTarget[]
  addAccount: (account: SocialAccount) => void
  updateAccount: (id: string, patch: Partial<SocialAccount>) => void
  removeAccount: (id: string) => void
  addPost: (post: Post) => void
  addTargets: (targets: PostTarget[]) => void
  updateTarget: (id: string, patch: Partial<PostTarget>) => void
  removeTarget: (id: string) => void
}

export const useGuestSchedulerStore = create<GuestSchedulerState>()(
  persist(
    (set) => ({
      accounts: [],
      posts: [],
      targets: [],
      addAccount: (account) => set((s) => ({ accounts: [...s.accounts, account] })),
      updateAccount: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          targets: s.targets.filter((t) => t.accountId !== id),
        })),
      addPost: (post) => set((s) => ({ posts: [...s.posts, post] })),
      addTargets: (targets) => set((s) => ({ targets: [...s.targets, ...targets] })),
      updateTarget: (id, patch) =>
        set((s) => ({
          targets: s.targets.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTarget: (id) =>
        set((s) => ({ targets: s.targets.filter((t) => t.id !== id) })),
    }),
    { name: 'shotput-guest-scheduler' },
  ),
)
