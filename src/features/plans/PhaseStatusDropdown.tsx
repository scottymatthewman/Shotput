import {
  BloomDropdown,
  BloomDropdownMenuLabel,
  BloomDropdownRadioRow,
  bloomPlacementFromRadix,
} from '@/components/ui/bloom-menu'
import {
  armTimelineRowClickSuppression,
  phaseStatusMenuLabel,
} from '@/components/dance/phaseStatusMenu'
import { usePlansStore } from '@/state/store'
import type { PhaseStatus } from '@/types/domain'
import { cloneElement, isValidElement, useCallback, useEffect, useState, type ReactElement } from 'react'

const statuses: PhaseStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'blocked',
  'done',
]

function triggerWithRowAction(stopRowNavigate: boolean, trigger: ReactElement): ReactElement {
  if (!stopRowNavigate || !isValidElement(trigger)) return trigger
  return cloneElement(trigger, { 'data-phase-row-action': '' } as Partial<HTMLElement>)
}

/** Optional popper placement for the status menu (maps to Bloom `direction` / `anchor`). */
export type PhaseStatusMenuPlacement = {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  alignOffset?: number
}

/** Compact status picker. Use `modal={false}` in Dialog/Sheet. `hotkeyOpensDropdown` (Gantt): S key opens the menu via store-driven open state. */
export function PhaseStatusDropdown({
  phaseId,
  currentStatus,
  modal = false,
  children,
  stopParentRowNavigate = true,
  hotkeyOpensDropdown = false,
  menuPlacement,
}: {
  phaseId: string
  currentStatus: PhaseStatus
  /** Typically a button; Bloom measures it for the morph animation. */
  children: ReactElement
  modal?: boolean
  /** When true, merge `data-phase-row-action` onto the trigger so row/card click handlers ignore status UI. */
  stopParentRowNavigate?: boolean
  hotkeyOpensDropdown?: boolean
  menuPlacement?: PhaseStatusMenuPlacement
}) {
  const setPhaseStatus = usePlansStore((s) => s.setPhaseStatus)
  const pendingGanttTaskId = usePlansStore((s) => s.pendingGanttStatusMenuPhaseId)
  const clearPendingGanttStatusMenu = usePlansStore((s) => s.clearPendingGanttStatusMenu)
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

  return (
    <BloomDropdown
      open={open}
      onOpenChange={handleOpenChange}
      modal={modal}
      placement={bloomPlacementFromRadix(menuPlacement)}
      menuWidth={192}
      trigger={triggerWithRowAction(stopParentRowNavigate, children)}
    >
      <BloomDropdownMenuLabel>Status</BloomDropdownMenuLabel>
      {statuses.map((s, i) => (
        <BloomDropdownRadioRow
          key={s}
          selected={currentStatus === s}
          shortcut={String(i + 1)}
          onSelect={() => {
            setPhaseStatus(phaseId, s)
            armTimelineRowClickSuppression()
          }}
        >
          {phaseStatusMenuLabel(s)}
        </BloomDropdownRadioRow>
      ))}
    </BloomDropdown>
  )
}
