import { PlanStatusIcon } from '@/components/dance/StatusBadge'
import { ActionDialog } from '@/components/ui/action-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CenteredPageScroll } from '@/layouts/CenteredPageScroll'
import { PageShell } from '@/layouts/PageShell'
import {
  filterPlansByIndexTab,
  formatPlanDateRange,
  PLAN_INDEX_TABS,
  type PlanIndexTab,
} from '@/features/plans/planIndexFilters'
import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
import { useUiStore } from '@/state/uiStore'
import type { Plan, PlanStatus } from '@/types/domain'
import { ChevronRight, ListChecks, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.isContentEditable) return true
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (el.closest('[cmdk-input-wrapper]')) return true
  if (el.closest('[role="combobox"]')) return true
  return false
}

function PlanIndexToolbar({
  tab,
  onTabChange,
  selectionMode,
  selectedCount,
  onToggleSelectionMode,
  onNewPlan,
  onDeleteSelected,
}: {
  tab: PlanIndexTab
  onTabChange: (tab: PlanIndexTab) => void
  selectionMode: boolean
  selectedCount: number
  onToggleSelectionMode: () => void
  onNewPlan: () => void
  onDeleteSelected: () => void
}) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex min-w-0 flex-wrap items-center gap-3" role="tablist" aria-label="Plan collections">
        {PLAN_INDEX_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => onTabChange(id)}
            className={cn(
              'pressable dance-focus-ring shrink-0 text-[1.75rem] font-semibold leading-none text-foreground outline-none',
              'transition-surface duration-150 ease-hover',
              tab === id ? 'opacity-100' : 'opacity-20 hover:opacity-40',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {selectionMode ? (
          <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
            {selectedCount} selected
          </p>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'size-10 shrink-0 transition-surface pressable duration-150',
            selectionMode
              ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
              : 'text-foreground',
          )}
          aria-label={selectionMode ? 'Done selecting' : 'Select items'}
          aria-pressed={selectionMode}
          title={selectionMode ? 'Done selecting' : 'Select items'}
          onClick={onToggleSelectionMode}
        >
          <ListChecks className="size-5" aria-hidden />
        </Button>
        {selectionMode ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 text-foreground transition-surface pressable duration-150"
            aria-label="Delete selected plans"
            title="Delete selected plans"
            disabled={selectedCount === 0}
            onClick={onDeleteSelected}
          >
            <Trash2 className="size-5" aria-hidden />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 text-foreground transition-surface pressable duration-150"
            aria-label="New plan"
            title="New plan"
            onClick={onNewPlan}
          >
            <Plus className="size-5" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  )
}

function PlanIndexCard({
  plan,
  highlighted,
  selectionMode,
  selected,
  onToggleSelect,
  onHoverChange,
}: {
  plan: Plan
  highlighted?: boolean
  selectionMode?: boolean
  selected?: boolean
  onToggleSelect?: () => void
  onHoverChange?: (planId: string | null) => void
}) {
  const status: PlanStatus = plan.status ?? 'healthy'
  const location = plan.location?.trim() || '—'
  const dateRange = formatPlanDateRange(plan.start, plan.end)

  const body = (
    <>
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {selectionMode ? (
            <span className="flex size-4 shrink-0 items-center justify-center">
              <Checkbox
                checked={selected}
                onCheckedChange={() => onToggleSelect?.()}
                aria-label={`Select ${plan.name}`}
                className="size-5 [&_svg]:size-3"
                onClick={(e) => e.stopPropagation()}
              />
            </span>
          ) : (
            <PlanStatusIcon status={status} className="size-4" />
          )}
          <h2 className="truncate text-md font-medium text-foreground">{plan.name}</h2>
        </div>
        <p className="flex min-w-0 flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="truncate">{location}</span>
          <span aria-hidden className="text-muted-foreground/60">
            |
          </span>
          <span className="shrink-0 tabular-nums">{dateRange}</span>
        </p>
      </div>
      <ChevronRight
        className={cn(
          'size-5 shrink-0 text-muted-foreground transition-surface duration-150 ease-hover',
          !selectionMode && 'group-hover:text-foreground',
        )}
        aria-hidden
      />
    </>
  )

  const className = cn(
    'group flex items-start justify-between gap-4 rounded-xl bg-surface-1 p-6',
    'inset-edge-ring inset-edge-ring-full inset-edge-hover',
    'transition-surface duration-150 ease-hover hover:bg-fill-hover',
    highlighted && 'ring-2 ring-primary/30',
    selectionMode && selected && 'bg-fill-selected',
  )

  const hoverHandlers = {
    'data-plan-index-card': plan.id,
    onMouseEnter: () => onHoverChange?.(plan.id),
    onMouseLeave: () => onHoverChange?.(null),
  }

  if (selectionMode) {
    return (
      <button
        type="button"
        className={cn(className, 'w-full cursor-pointer text-left')}
        onClick={onToggleSelect}
        aria-pressed={selected}
        {...hoverHandlers}
      >
        {body}
      </button>
    )
  }

  return (
    <Link to={`/plans/${plan.id}`} className={className} {...hoverHandlers}>
      {body}
    </Link>
  )
}

const EMPTY_COPY: Record<PlanIndexTab, string> = {
  upcoming: 'No upcoming plans.',
  past: 'No past plans.',
  archived: 'No archived plans.',
}

export function PlanIndexPage() {
  const location = useLocation()
  const workspace = usePlansStore((s) => s.workspace)
  const deletePlan = usePlansStore((s) => s.deletePlan)
  const lastCreatedPlanId = useUiStore((s) => s.lastCreatedPlanId)
  const setLastCreatedPlanId = useUiStore((s) => s.setLastCreatedPlanId)
  const setNewPlanDialogOpen = useUiStore((s) => s.setNewPlanDialogOpen)

  const [tab, setTab] = useState<PlanIndexTab>('upcoming')
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null)
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const planList = useMemo(() => {
    const list = Object.values(workspace.plans)
    const filtered = filterPlansByIndexTab(list, tab)
    if (!lastCreatedPlanId || tab !== 'upcoming') return filtered
    const created = workspace.plans[lastCreatedPlanId]
    if (!created || !filterPlansByIndexTab([created], tab).length) return filtered
    return [created, ...filtered.filter((p) => p.id !== lastCreatedPlanId)]
  }, [workspace.plans, lastCreatedPlanId, tab])

  function toggleSelectionMode() {
    setSelectionMode((on) => {
      if (on) setSelectedIds(new Set())
      return !on
    })
  }

  function togglePlanSelected(planId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(planId)) next.delete(planId)
      else next.add(planId)
      return next
    })
  }

  function handleTabChange(next: PlanIndexTab) {
    setTab(next)
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  function exitSelectionMode() {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const openDeleteDialog = useCallback((planIds: string[]) => {
    const ids = [...new Set(planIds)].filter((id) => workspace.plans[id])
    if (ids.length === 0) return
    setDeleteTargetIds(ids)
    setDeleteDialogOpen(true)
  }, [workspace.plans])

  function confirmDeleteTargets() {
    const ids = [...deleteTargetIds]
    for (const planId of ids) {
      deletePlan(planId)
      if (planId === lastCreatedPlanId) setLastCreatedPlanId(null)
    }
    setDeleteTargetIds([])
    exitSelectionMode()
  }

  const selectedCount = selectedIds.size
  const deleteCount = deleteTargetIds.length

  useEffect(() => {
    if (location.pathname !== '/plans') return

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      if (deleteDialogOpen) return
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key !== 'Backspace' && e.key !== 'Delete') return
      if (e.repeat) return
      if (!hoveredPlanId || !workspace.plans[hoveredPlanId]) return

      e.preventDefault()
      openDeleteDialog([hoveredPlanId])
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [deleteDialogOpen, hoveredPlanId, location.pathname, openDeleteDialog, workspace.plans])

  function handleDeleteDialogOpenChange(open: boolean) {
    setDeleteDialogOpen(open)
    if (!open) setDeleteTargetIds([])
  }

  return (
    <PageShell>
      <CenteredPageScroll columnClassName="gap-4">
        <PlanIndexToolbar
          tab={tab}
          onTabChange={handleTabChange}
          selectionMode={selectionMode}
          selectedCount={selectedCount}
          onToggleSelectionMode={toggleSelectionMode}
          onNewPlan={() => setNewPlanDialogOpen(true)}
          onDeleteSelected={() => openDeleteDialog([...selectedIds])}
        />
        {planList.length === 0 ? (
          <p className="text-sm text-muted-foreground">{EMPTY_COPY[tab]}</p>
        ) : (
          planList.map((p) => (
            <PlanIndexCard
              key={p.id}
              plan={p}
              highlighted={p.id === lastCreatedPlanId}
              selectionMode={selectionMode}
              selected={selectedIds.has(p.id)}
              onToggleSelect={() => togglePlanSelected(p.id)}
              onHoverChange={(id) =>
                setHoveredPlanId((current) => {
                  if (id === null) return current === p.id ? null : current
                  return id
                })
              }
            />
          ))
        )}
      </CenteredPageScroll>

      <ActionDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
        title={deleteCount === 1 ? 'Delete this plan?' : `Delete ${deleteCount} plans?`}
        description={
          <>
            This removes the selected plan{deleteCount === 1 ? '' : 's'}, their planner timelines,
            and every phase tied to them. Press ⌘Z (Ctrl+Z on Windows/Linux) afterward to undo if
            you&apos;re not typing in a field.
          </>
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDeleteTargets}
      />
    </PageShell>
  )
}
