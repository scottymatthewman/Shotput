import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useGanttCollisionBoundary } from '@/components/dance/timeline/GanttCollisionBoundaryContext'
import {
  armTimelineRowClickSuppression,
  taskStatusMenuLabel,
} from '@/components/dance/taskStatusMenu'
import { cn } from '@/lib/utils'
import { useDanceStore } from '@/state/store'
import type { TaskStatus } from '@/types/domain'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check } from 'lucide-react'
import { cloneElement, isValidElement, useCallback, useEffect, useState, type ReactElement } from 'react'

const statuses: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'blocked', 'done']

function triggerWithRowAction(stopRowNavigate: boolean, trigger: ReactElement): ReactElement {
  if (!stopRowNavigate || !isValidElement(trigger)) return trigger
  return cloneElement(trigger, { 'data-task-row-action': '' } as Partial<HTMLElement>)
}

/** Optional popper placement for the status menu (Radix: flips `side` when colliding). */
export type TaskStatusMenuPlacement = {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  alignOffset?: number
}

/** Compact status picker. Use `modal={false}` in Dialog/Sheet. `hotkeyOpensDropdown` (Gantt): S key opens the menu via store-driven open state. */
export function TaskStatusDropdown({
  phaseId,
  currentStatus,
  modal = false,
  children,
  stopParentRowNavigate = true,
  hotkeyOpensDropdown = false,
  menuPlacement,
}: {
  phaseId: string
  currentStatus: TaskStatus
  /** Typically a button; receives Radix trigger props via `asChild`. */
  children: ReactElement
  modal?: boolean
  /** When true, merge `data-task-row-action` onto the trigger so row/card click handlers ignore status UI. */
  stopParentRowNavigate?: boolean
  hotkeyOpensDropdown?: boolean
  menuPlacement?: TaskStatusMenuPlacement
}) {
  const setPhaseStatus = useDanceStore((s) => s.setPhaseStatus)
  const pendingGanttTaskId = useDanceStore((s) => s.pendingGanttStatusMenuPhaseId)
  const clearPendingGanttStatusMenu = useDanceStore((s) => s.clearPendingGanttStatusMenu)
  const ganttCollisionBoundary = useGanttCollisionBoundary()

  const [open, setOpen] = useState(false)

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (hotkeyOpensDropdown && !next) clearPendingGanttStatusMenu()
    },
    [hotkeyOpensDropdown, clearPendingGanttStatusMenu],
  )

  useEffect(() => {
    if (!hotkeyOpensDropdown) return
    if (pendingGanttTaskId !== phaseId) return
    const id = requestAnimationFrame(() => {
      setOpen(true)
      clearPendingGanttStatusMenu()
    })
    return () => cancelAnimationFrame(id)
  }, [hotkeyOpensDropdown, pendingGanttTaskId, phaseId, clearPendingGanttStatusMenu])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key
      if (k < '1' || k > '5') return
      const idx = parseInt(k, 10) - 1
      const nextStatus = statuses[idx]
      if (!nextStatus) return
      setPhaseStatus(phaseId, nextStatus)
      armTimelineRowClickSuppression()
      setOpen(false)
      e.preventDefault()
      e.stopPropagation()
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open, phaseId, setPhaseStatus])

  const ganttPopperCollision =
    hotkeyOpensDropdown && ganttCollisionBoundary
      ? { collisionBoundary: ganttCollisionBoundary, collisionPadding: 8 }
      : {}

  return (
    <DropdownMenu modal={modal} open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        {triggerWithRowAction(stopParentRowNavigate, children)}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        {...menuPlacement}
        {...ganttPopperCollision}
        className="min-w-[12rem]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="font-normal text-muted-foreground">Status</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={currentStatus}
          onValueChange={(v) => {
            setPhaseStatus(phaseId, v as TaskStatus)
            armTimelineRowClickSuppression()
          }}
        >
          {statuses.map((s, i) => (
            <DropdownMenuPrimitive.RadioItem
              key={s}
              value={s}
              className={cn(
                'relative flex cursor-default select-none items-center gap-2 rounded-[var(--radius-nested-md-p1)] py-1.5 pl-2 pr-2 text-sm outline-none transition-surface duration-150',
                'focus:bg-accent/40 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
              )}
            >
              <span className="w-6 shrink-0 text-center text-xs font-medium tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">{taskStatusMenuLabel(s)}</span>
              <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
                <DropdownMenuPrimitive.ItemIndicator>
                  <Check className="size-3.5 text-primary" strokeWidth={2.5} />
                </DropdownMenuPrimitive.ItemIndicator>
              </span>
            </DropdownMenuPrimitive.RadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
