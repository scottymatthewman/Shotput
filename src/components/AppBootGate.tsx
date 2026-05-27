import { AppBootSkeleton } from '@/components/AppBootSkeleton'
import { ThemeSync } from '@/components/ThemeSync'
import { hasInstantConfig } from '@/lib/instant/db'
import { InstantBootstrap } from '@/state/instantBootstrap'
import { useLocalWorkspaceStore } from '@/state/localWorkspaceStore'
import { useUiStore } from '@/state/uiStore'
import { useWorkspaceQuery } from '@/state/useWorkspaceQuery'
import { useEffect, useState, type ReactNode } from 'react'

/** Gate first paint until UI persist hydrates and workspace is ready. */
export function AppBootGate({ children }: { children: ReactNode }) {
  const [uiHydrated, setUiHydrated] = useState(() => useUiStore.persist.hasHydrated())
  const [localHydrated, setLocalHydrated] = useState(
    () => hasInstantConfig || useLocalWorkspaceStore.persist.hasHydrated(),
  )
  const { ready } = useWorkspaceQuery()

  useEffect(() => {
    if (useUiStore.persist.hasHydrated()) {
      setUiHydrated(true)
      return
    }
    return useUiStore.persist.onFinishHydration(() => setUiHydrated(true))
  }, [])

  useEffect(() => {
    if (hasInstantConfig) {
      setLocalHydrated(true)
      return
    }
    if (useLocalWorkspaceStore.persist.hasHydrated()) {
      useLocalWorkspaceStore.getState().ensureInitialized()
      setLocalHydrated(true)
      return
    }
    return useLocalWorkspaceStore.persist.onFinishHydration(() => {
      useLocalWorkspaceStore.getState().ensureInitialized()
      setLocalHydrated(true)
    })
  }, [])

  const bootReady = uiHydrated && localHydrated && ready

  return (
    <>
      <ThemeSync />
      <InstantBootstrap />
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden overscroll-none">
        {!bootReady ? <AppBootSkeleton /> : children}
      </div>
    </>
  )
}
