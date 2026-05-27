import { SidebarNav } from '@/components/dance/SidebarNav'
import { CommandMenuProvider } from '@/features/plans/CommandMenu'
import { GlobalKeyboardShortcuts } from '@/features/plans/GlobalKeyboardShortcuts'
import { features } from '@/config/features'
import { resolvePhaseDetailRoute } from '@/lib/planRoute'
import { usePlansStore } from '@/state/store'
import { selectSidebarNav } from '@/state/selectors'
import { useEffect, type ReactNode } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

export function AppShell({ children }: { children?: ReactNode }) {
  const workspaceName = usePlansStore((s) => selectSidebarNav(s).name)
  const setCommandOpen = usePlansStore((s) => s.setCommandOpen)
  const sidebarCollapsed = usePlansStore((s) => s.sidebarCollapsed)
  const toggleSidebarCollapsed = usePlansStore((s) => s.toggleSidebarCollapsed)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key !== '.' && e.code !== 'Period') return

      const target = e.target as HTMLElement | null
      const inEditable = target?.closest('input, textarea, [contenteditable="true"]')

      const state = usePlansStore.getState()
      const phaseRoute = resolvePhaseDetailRoute(location.pathname, state.workspace)

      if (!phaseRoute && !state.selectedPhaseId && inEditable) return

      e.preventDefault()

      if (state.phaseModal) {
        state.closePhaseModal()
        state.setSidebarCollapsed(true)
      } else if (phaseRoute) {
        navigate(`/plans/${phaseRoute.planId}`)
        state.setSidebarCollapsed(true)
      } else if (state.selectedPhaseId) {
        state.setSelectedPhaseId(null)
        state.setSidebarCollapsed(true)
      } else {
        toggleSidebarCollapsed()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [location.pathname, navigate, toggleSidebarCollapsed])

  return (
    <CommandMenuProvider>
      <GlobalKeyboardShortcuts />
      <div
        className="flex h-full min-h-0 w-full max-w-full overflow-hidden overscroll-none bg-background"
        onPointerDownCapture={(e) => {
          const t = e.target as HTMLElement
          if (t.closest?.('[data-search-trigger]')) {
            setCommandOpen(true)
          }
        }}
      >
        <SidebarNav
          workspaceName={workspaceName}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
          className="min-h-0"
        />
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col inset-edge inset-edge-b bg-background p-3 md:inset-edge-b-none md:pl-0"
          data-app-content=""
        >
          <div className="flex items-center gap-3 inset-edge inset-edge-b py-2 md:hidden">
            <Link
              to="/plans"
              className="text-sm font-semibold text-foreground transition-surface duration-150 ease-hover hover:text-primary"
            >
              Dance
            </Link>
            <Link
              to="/plans"
              className="text-xs text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground"
            >
              Plans
            </Link>
            {features.settings ? (
              <Link
                to="/settings"
                className="text-xs text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground"
              >
                Settings
              </Link>
            ) : null}
            <span className="text-xs text-muted-foreground">Press / to search</span>
          </div>
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-clip rounded-xl inset-edge inset-edge-full inset-edge-panel bg-surface-1">
            {children ?? <Outlet />}
          </div>
        </div>
      </div>
    </CommandMenuProvider>
  )
}
