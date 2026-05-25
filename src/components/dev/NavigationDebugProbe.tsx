import { navigationDebug } from '@/lib/navigationDebug'
import { useUiStore } from '@/state/uiStore'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

function parseInterestParams(pathname: string): Record<string, string | undefined> {
  const planner = pathname.match(/^\/plan\/([^/]+)\/?$/) ?? pathname.match(/^\/events\/([^/]+)\/?$/)
  if (planner) {
    return { eventId: planner[1] }
  }
  const legacyTimeline = pathname.match(/^\/projects\/([^/]+)\/timelines\/([^/]+)\/?$/)
  if (legacyTimeline) {
    return { projectId: legacyTimeline[1], timelineId: legacyTimeline[2] }
  }
  const legacyProject = pathname.match(/^\/projects\/([^/]+)\/?$/)
  if (legacyProject) return { projectId: legacyProject[1] }
  return {}
}

/**
 * Logs every client navigation plus zustand-persist hydrate (helps trace blank Outlet / crashes after clicks).
 */
export function NavigationDebugProbe() {
  const location = useLocation()
  const lastKeyRef = useRef<string>('')

  useEffect(() => {
    const key = `${location.pathname}${location.search ?? ''}:${location.state ? 'hasState' : 'noState'}`
    if (lastKeyRef.current === key) return
    lastKeyRef.current = key

    navigationDebug(`navigate:${location.pathname}`, {
      search: location.search || undefined,
      parsed: parseInterestParams(location.pathname),
      hasLocationState: location.state !== null,
    })
  }, [location.pathname, location.search, location.state])

  useEffect(() => {
    try {
      return useUiStore.persist.onFinishHydration(() => {
        const s = useUiStore.getState()
        navigationDebug('zustand/persist hydrate done', {
          timelineViewMode: s.timelineViewMode,
          selectedPhaseId: s.selectedPhaseId ?? null,
          sidebarCollapsed: s.sidebarCollapsed,
          instantSeeded: s.instantSeeded,
        })
      })
    } catch {
      navigationDebug('zustand/persist: no hydrate listener')
      return undefined
    }
  }, [])

  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      navigationDebug('global window error', {
        message: String(e.message),
        filename: e.filename ?? null,
        lineno: e.lineno ?? null,
        colno: e.colno ?? null,
      })
    }
    const onRejection = (e: PromiseRejectionEvent) => {
      navigationDebug('global unhandledrejection', {
        reason:
          typeof e.reason === 'object' && e.reason !== null && 'message' in e.reason
            ? String((e.reason as { message: unknown }).message)
            : String(e.reason),
      })
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}
