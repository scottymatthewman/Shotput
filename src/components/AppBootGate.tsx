import { AppBootSkeleton } from '@/components/AppBootSkeleton'
import { ThemeSync } from '@/components/ThemeSync'
import { useUiStore } from '@/state/uiStore'
import { useSyncExternalStore, type ReactNode } from 'react'

function subscribeToHydration(onStoreChange: () => void) {
  return useUiStore.persist.onFinishHydration(onStoreChange)
}

function getHydrated() {
  return useUiStore.persist.hasHydrated()
}

/** Gate first paint until the persisted UI store hydrates (theme, sidebar). */
export function AppBootGate({ children }: { children: ReactNode }) {
  const uiHydrated = useSyncExternalStore(subscribeToHydration, getHydrated)

  return (
    <>
      <ThemeSync />
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden overscroll-none">
        {!uiHydrated ? <AppBootSkeleton /> : children}
      </div>
    </>
  )
}
