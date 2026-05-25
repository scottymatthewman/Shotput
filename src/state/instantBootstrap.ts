import { useEffect, useRef } from 'react'
import { assembleWorkspaceFromInstant, workspaceQuery } from '@/lib/instant/assembleWorkspace'
import { hasInstantConfig } from '@/lib/instant/db'
import { seedInstantIfEmpty } from '@/lib/instant/seed'
import { createInitialWorkspace, initialActivityLog } from '@/mock/fixtures'
import { db } from '@/lib/instant/db'
import { useDomainStore } from '@/state/domainStore'
import { useUiStore } from '@/state/uiStore'

const HYDRATE_TIMEOUT_MS = 4_000

function hydrateLocalFallback() {
  const { hydrated, hydrateFromInstant } = useDomainStore.getState()
  if (hydrated) return
  console.warn('[Dance] Using local fixtures while InstantDB sync catches up')
  hydrateFromInstant(createInitialWorkspace(), initialActivityLog)
}

/** Seed Instant when empty, then hydrate the domain store from query (or local fallback). */
export function InstantBootstrap() {
  const setInstantSeeded = useUiStore((s) => s.setInstantSeeded)
  const instantSeeded = useUiStore((s) => s.instantSeeded)
  const { isLoading, data, error } = db.useQuery(workspaceQuery)
  const hydrated = useDomainStore((s) => s.hydrated)
  const hydrateFromInstant = useDomainStore((s) => s.hydrateFromInstant)
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
      hydrateLocalFallback()
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

  useEffect(() => {
    if (hydrated) return

    const { workspace, activityLog } = assembleWorkspaceFromInstant(
      data?.workspaces,
      data?.activityEvents,
    )
    if (workspace) {
      hydrateFromInstant(workspace, activityLog)
    }
  }, [hydrated, data, hydrateFromInstant])

  useEffect(() => {
    if (hydrated || isLoading || !instantSeeded) return
    const { workspace } = assembleWorkspaceFromInstant(data?.workspaces, data?.activityEvents)
    if (!workspace) {
      hydrateLocalFallback()
    }
  }, [hydrated, isLoading, instantSeeded, data])

  useEffect(() => {
    if (hydrated) return
    const timer = window.setTimeout(() => {
      if (!useDomainStore.getState().hydrated) {
        hydrateLocalFallback()
      }
    }, HYDRATE_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [hydrated])

  useEffect(() => {
    if (error) {
      console.error('[Dance] Instant query error:', error.message)
      if (!useDomainStore.getState().hydrated) {
        hydrateLocalFallback()
      }
    }
  }, [error])

  return null
}
