import { SidebarNav } from '@/components/dance/SidebarNav'
import { CommandMenuProvider } from '@/components/dance/CommandMenu'
import { GlobalKeyboardShortcuts } from '@/components/dance/GlobalKeyboardShortcuts'
import { useDanceStore, requestTaskSheetAnimatedClose } from '@/state/store'
import { selectSidebarNav } from '@/state/selectors'
import { useEffect, useMemo, type ReactNode } from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

export function AppShell({ children }: { children?: ReactNode }) {
  const { name: workspaceName, plans } = useDanceStore(
    useShallow((s) => selectSidebarNav(s)),
  )
  const setCommandOpen = useDanceStore((s) => s.setCommandOpen)
  const sidebarCollapsed = useDanceStore((s) => s.sidebarCollapsed)
  const toggleSidebarCollapsed = useDanceStore((s) => s.toggleSidebarCollapsed)
  const { planId, eventId: legacyEventId } = useParams<{ planId?: string; eventId?: string }>()
  const currentPlanId = planId ?? legacyEventId

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key !== '.' && e.code !== 'Period') return

      const target = e.target as HTMLElement | null
      const inEditable = target?.closest('input, textarea, [contenteditable="true"]')

      const { selectedPhaseId, setSidebarCollapsed, toggleSidebarCollapsed: toggleSidebar } =
        useDanceStore.getState()

      if (!selectedPhaseId && inEditable) return

      e.preventDefault()

      if (selectedPhaseId) {
        requestTaskSheetAnimatedClose()
        setSidebarCollapsed(true)
      } else {
        toggleSidebar()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const plansList = useMemo(() => Object.values(plans), [plans])

  return (
    <CommandMenuProvider>
      <GlobalKeyboardShortcuts />
      <div
        className="flex h-dvh w-dvw min-h-0 overflow-hidden bg-background"
        onPointerDownCapture={(e) => {
          const t = e.target as HTMLElement
          if (t.closest?.('[data-search-trigger]')) {
            setCommandOpen(true)
          }
        }}
      >
        <SidebarNav
          workspaceName={workspaceName}
          plans={plansList}
          currentEventId={currentPlanId}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
          className="min-h-0"
        />
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-border p-3 md:border-b-0 md:pl-0"
          data-app-content=""
        >
          <div className="flex items-center gap-3 border-b border-border py-2 md:hidden">
            <Link to="/" className="text-sm font-semibold text-foreground transition-surface duration-150 ease-hover hover:text-primary">
              Dance
            </Link>
            <Link to="/find" className="text-xs text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground">
              Find
            </Link>
            <Link to="/plan" className="text-xs text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground">
              Plan
            </Link>
            <Link to="/settings" className="text-xs text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground">
              Settings
            </Link>
            <span className="text-xs text-muted-foreground">Press / to search</span>
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-gantt-canvas">
            {children ?? <Outlet />}
          </div>
        </div>
      </div>
    </CommandMenuProvider>
  )
}
