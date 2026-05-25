import { AppBootSkeleton } from '@/components/AppBootSkeleton'
import { InstantBootstrap } from '@/state/instantBootstrap'
import { useDomainStore } from '@/state/domainStore'
import { useUiStore } from '@/state/uiStore'
import { useEffect, useState, type ReactNode } from 'react'

/** Gate first paint until UI persist hydrates and domain store is ready. */
export function AppBootGate({ children }: { children: ReactNode }) {
  const [uiHydrated, setUiHydrated] = useState(() => useUiStore.persist.hasHydrated())
  const domainHydrated = useDomainStore((s) => s.hydrated)

  useEffect(() => {
    if (useUiStore.persist.hasHydrated()) {
      setUiHydrated(true)
      return
    }
    return useUiStore.persist.onFinishHydration(() => setUiHydrated(true))
  }, [])

  const ready = uiHydrated && domainHydrated

  return (
    <>
      <InstantBootstrap />
      {!ready ? <AppBootSkeleton /> : children}
    </>
  )
}
