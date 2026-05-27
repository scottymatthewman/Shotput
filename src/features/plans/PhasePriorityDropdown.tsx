import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { armTimelineRowClickSuppression } from '@/components/dance/phaseStatusMenu'
import { PriorityIcon } from '@/components/dance/PriorityIcon'
import { PHASE_PRIORITY_ORDER, phasePriorityLabel } from '@/lib/phasePriority'
import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
import type { Phase } from '@/types/domain'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check } from 'lucide-react'
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
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        {triggerWithRowAction(stopParentRowNavigate, children)}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="min-w-[12rem] border-0 shadow-md"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="font-normal text-muted-foreground">Priority</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={currentPriority}
          onValueChange={(v) => {
            updatePhaseDetails(phaseId, { priority: v as Phase['priority'] })
            armTimelineRowClickSuppression()
          }}
        >
          {PHASE_PRIORITY_ORDER.map((p, i) => (
            <DropdownMenuPrimitive.RadioItem
              key={p}
              value={p}
              className={cn(
                'relative flex cursor-default select-none items-center gap-2 rounded-[var(--radius-nested-md-p1)] py-1.5 pl-2 pr-2 text-sm outline-none transition-surface duration-150',
                'focus:bg-accent/40 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
              )}
            >
              <span className="w-6 shrink-0 text-center text-xs font-medium tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <PriorityIcon priority={p} />
              <span className="min-w-0 flex-1">{phasePriorityLabel(p)}</span>
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
