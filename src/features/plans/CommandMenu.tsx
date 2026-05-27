import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { buildCommandIndex, pushRecentCommand } from '@/lib/commandIndex'
import { resolvePlanWorkspaceRoute } from '@/lib/planRoute'
import { usePlansStore } from '@/state/store'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const open = usePlansStore((s) => s.commandOpen)
  const setOpen = usePlansStore((s) => s.setCommandOpen)
  const workspace = usePlansStore((s) => s.workspace)
  const selectedPhaseId = usePlansStore((s) => s.selectedPhaseId)
  const timelineViewMode = usePlansStore((s) => s.timelineViewMode)
  const setTimelineViewMode = usePlansStore((s) => s.setTimelineViewMode)
  const openNewPhaseModal = usePlansStore((s) => s.openNewPhaseModal)
  const toggleSidebarCollapsed = usePlansStore((s) => s.toggleSidebarCollapsed)
  const resetDemo = usePlansStore((s) => s.resetDemo)
  const navigate = useNavigate()
  const location = useLocation()

  const groups = useMemo(
    () =>
      buildCommandIndex({
        workspace,
        pathname: location.pathname,
        selectedPhaseId,
        openNewPhaseModal,
        setTimelineViewMode,
        timelineViewMode,
        toggleSidebarCollapsed,
        resetDemo,
        resolveTimelineId: () => {
          const route = resolvePlanWorkspaceRoute(location.pathname, workspace)
          return route?.planId ?? null
        },
      }),
    [
      workspace,
      location.pathname,
      selectedPhaseId,
      openNewPhaseModal,
      setTimelineViewMode,
      timelineViewMode,
      toggleSidebarCollapsed,
      resetDemo,
    ],
  )

  const runItem = (item: { id: string; to?: string; action?: () => void }) => {
    pushRecentCommand(item.id)
    if (item.action) item.action()
    else if (item.to) navigate(item.to)
    setOpen(false)
  }

  return (
    <>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search plans, tasks, actions…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          {groups.recent.length > 0 ? (
            <CommandGroup heading="Recent">
              {groups.recent.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.keywords}
                  onSelect={() => runItem(item)}
                >
                  <span className="truncate">{item.label}</span>
                  {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          <CommandGroup heading="Actions">
            {groups.actions.map((item) => (
              <CommandItem key={item.id} value={item.keywords} onSelect={() => runItem(item)}>
                <span className="truncate">{item.label}</span>
                {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Navigation">
            {groups.navigation.map((item) => (
              <CommandItem key={item.id} value={item.keywords} onSelect={() => runItem(item)}>
                <span className="truncate">{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Tasks">
            {groups.index.map((item) => (
              <CommandItem key={item.id} value={item.keywords} onSelect={() => runItem(item)}>
                <span className="truncate">{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
