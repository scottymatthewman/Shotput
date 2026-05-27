import { useEffect, useRef } from 'react'
import { hasInstantConfig } from '@/lib/instant/db'
import { seedInstantIfEmpty } from '@/lib/instant/seed'
import { useUiStore } from '@/state/uiStore'

/** Seed Instant when empty. Workspace reads come from useWorkspaceQuery (Instant subscription). */
export function InstantBootstrap() {
  const setInstantSeeded = useUiStore((s) => s.setInstantSeeded)
  const seedStarted = useRef(false)

  useEffect(() => {
    if (seedStarted.current) return
    seedStarted.current = true
    try {
      localStorage.removeItem('dance-prototype-v1')
    } catch {
      /* ignore */
    }
    if (!hasInstantConfig) {
      setInstantSeeded(true)
      return
    }
    void seedInstantIfEmpty()
      .then((seeded) => {
        setInstantSeeded(true)
        if (seeded) console.info('[Dance] InstantDB seeded with demo fixtures')
      })
      .catch((err) => {
        console.error('[Dance] Instant seed failed:', err)
        setInstantSeeded(true)
      })
  }, [setInstantSeeded])

  return null
}
