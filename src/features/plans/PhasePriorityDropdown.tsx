import {
  BloomDropdown,
  BloomDropdownMenuLabel,
  BloomDropdownRadioRow,
} from '@/components/ui/bloom-menu'
import { armTimelineRowClickSuppression } from '@/components/dance/phaseStatusMenu'
import { PriorityIcon } from '@/components/dance/PriorityIcon'
import { PHASE_PRIORITY_ORDER, phasePriorityLabel } from '@/lib/phasePriority'
import { usePlansStore } from '@/state/store'
import type { Phase } from '@/types/domain'
import { cloneElement, isValidElement, useCallback, useEffect, useState, type ReactElement } from 'react'

export { PriorityIcon }

function triggerWithRowAction(stopRowNavigate: boolean, trigger: ReactElement): ReactElement {
  if (!stopRowNavigate || !isValidElement(trigger)) return trigger
  return cloneElement(trigger, { 'data-phase-row-action': '' } as Partial<HTMLElement>)
}

export function PhasePriorityDropdown({
  phaseId,
  currentPriority,
  children,
  stopParentRowNavigate = true,
  hotkeyOpensDropdown = false,
}: {
  phaseId: string
  currentPriority: Phase['priority']
  children: ReactElement
  stopParentRowNavigate?: boolean
  /** When true, P key opens this menu via `requestPhasePriorityDropdownForPhase` (table row). */
  hotkeyOpensDropdown?: boolean
}) {
  const updatePhaseDetails = usePlansStore((s) => s.updatePhaseDetails)
  const pendingTaskId = usePlansStore((s) => s.pendingPhasePriorityDropdownPhaseId)
  const clearPending = usePlansStore((s) => s.clearPendingPhasePriorityDropdown)
  const [open, setOpen] = useState(false)

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (hotkeyOpensDropdown && !next) clearPending()
    },
    [hotkeyOpensDropdown, clearPending],
  )

  useEffect(() => {
    if (!hotkeyOpensDropdown) return
    if (pendingTaskId !== phaseId) return
    const id = requestAnimationFrame(() => {
      setOpen(true)
      clearPending()
    })
    return () => cancelAnimationFrame(id)
  }, [hotkeyOpensDropdown, pendingTaskId, phaseId, clearPending])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key
      if (k < '1' || k > '4') return
      const idx = parseInt(k, 10) - 1
      const next = PHASE_PRIORITY_ORDER[idx]
      if (!next) return
      updatePhaseDetails(phaseId, { priority: next })
      armTimelineRowClickSuppression()
      setOpen(false)
      e.preventDefault()
      e.stopPropagation()
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open, phaseId, updatePhaseDetails])

  return (
    <BloomDropdown
      open={open}
      onOpenChange={handleOpenChange}
      menuWidth={192}
      trigger={triggerWithRowAction(stopParentRowNavigate, children)}
    >
      <BloomDropdownMenuLabel>Priority</BloomDropdownMenuLabel>
      {PHASE_PRIORITY_ORDER.map((p, i) => (
        <BloomDropdownRadioRow
          key={p}
          selected={currentPriority === p}
          shortcut={String(i + 1)}
          onSelect={() => {
            updatePhaseDetails(phaseId, { priority: p })
            armTimelineRowClickSuppression()
          }}
        >
          <span className="flex min-w-0 items-center gap-2">
            <PriorityIcon priority={p} />
            {phasePriorityLabel(p)}
          </span>
        </BloomDropdownRadioRow>
      ))}
    </BloomDropdown>
  )
}
