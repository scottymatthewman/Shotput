import { AssigneePill } from '@/components/dance/AssigneePill'
import { BudgetAmountField } from '@/components/dance/BudgetAmountField'
import { PriorityIcon } from '@/components/dance/PriorityIcon'
import { StatusBadge } from '@/components/dance/StatusBadge'
import { navCopyLinkIcon } from '@/components/nav/navIcons'
import { PhaseChecklistTaskRow } from '@/features/plans/PhaseChecklistTaskRow'
import { PhaseDatePickerField } from '@/features/plans/PhaseDatePickerField'
import { PhaseStatusDropdown } from '@/features/plans/PhaseStatusDropdown'
import {
  DetailCollapsibleSection,
  inkDatePickers,
  inkOverviewGridValue,
  inkOverviewTitle,
  overviewGridMenuPlacement,
  overviewMetadataGrid,
  OverviewActivityTimeline,
  OverviewDescriptionField,
  OverviewMetadataCell,
  OverviewOwnerPill,
} from '@/features/plans/overviewPageLayout'
import { formatPlanDateRange } from '@/features/plans/planIndexFilters'
import { Button } from '@/components/ui/button'
import {
  BloomDropdown,
  BloomDropdownItem,
} from '@/components/ui/bloom-menu'
import { Input } from '@/components/ui/input'
import { formatBudgetCents, planBudgetCurrency } from '@/lib/budget'
import { phaseDetailPath } from '@/lib/planRoute'
import { PHASE_PRIORITY_ORDER, phasePriorityLabel } from '@/lib/phasePriority'
import { getEffectivePhaseStatus, normalizePhaseStatus } from '@/lib/phaseStatus'
import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
import type { Phase, User } from '@/types/domain'
import {
  CalendarDays,
  ChevronLeft,
  CircleDashed,
  DollarSign,
  Flag,
  MapPin,
  User as UserIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export type PhaseDetailPanelProps = {
  planId: string
  phaseId: string
  /** Focus title input when the panel opens (e.g. new phase). */
  autoFocusTitle?: boolean
  className?: string
}

export function PhaseDetailPanel({
  planId,
  phaseId,
  autoFocusTitle = false,
  className,
}: PhaseDetailPanelProps) {
  const workspace = usePlansStore((s) => s.workspace)
  const updatePhaseDetails = usePlansStore((s) => s.updatePhaseDetails)
  const toggleChecklistTask = usePlansStore((s) => s.toggleChecklistTask)
  const setPhaseQuickDialog = usePlansStore((s) => s.setPhaseQuickDialog)
  const activityLog = usePlansStore((s) => s.activityLog)

  const livePhase = workspace.phases[phaseId]
  const plan = workspace.plans[planId]

  const titleRef = useRef<HTMLInputElement>(null)
  const [titleDraft, setTitleDraft] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [shareCopied, setShareCopied] = useState(false)
  const [tasksOpen, setTasksOpen] = useState(true)
  const [activityOpen, setActivityOpen] = useState(true)

  useEffect(() => {
    if (!livePhase) return
    setTitleDraft(livePhase.title)
    setDescriptionDraft(livePhase.description)
  }, [livePhase?.id, livePhase?.title, livePhase?.description])

  useEffect(() => {
    if (!autoFocusTitle || !titleRef.current) return
    const t = window.setTimeout(() => {
      titleRef.current?.focus()
      titleRef.current?.select()
    }, 0)
    return () => window.clearTimeout(t)
  }, [autoFocusTitle, phaseId])

  const budgetCurrency = plan ? planBudgetCurrency(plan) : undefined
  const storedStatus = livePhase ? normalizePhaseStatus(livePhase.status) : 'todo'
  const status = livePhase ? getEffectivePhaseStatus(livePhase) : 'todo'

  const phaseEvents = useMemo(() => {
    return activityLog
      .filter((e) => e.objectId === phaseId && e.planId === planId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
  }, [activityLog, phaseId, planId])

  const workspaceUsers = useMemo(() => {
    return workspace.userIds
      .map((id) => workspace.users[id])
      .filter((u): u is User => !!u)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [workspace.userIds, workspace.users])

  const leadUserId = livePhase?.assigneeUserIds[0]
  const leadUser = leadUserId ? workspace.users[leadUserId] : undefined
  const leadAgentId =
    !leadUser && livePhase?.assigneeAgentIds[0] ? livePhase.assigneeAgentIds[0] : undefined
  const leadAgent = leadAgentId ? workspace.agents[leadAgentId] : undefined

  const commitTitle = useCallback(() => {
    if (!livePhase || titleDraft.trim() === livePhase.title) return
    if (!titleDraft.trim()) {
      setTitleDraft(livePhase.title)
      return
    }
    updatePhaseDetails(phaseId, { title: titleDraft })
  }, [livePhase, phaseId, titleDraft, updatePhaseDetails])

  const commitDescription = useCallback(() => {
    if (!livePhase || descriptionDraft === livePhase.description) return
    updatePhaseDetails(phaseId, { description: descriptionDraft })
  }, [descriptionDraft, livePhase, phaseId, updatePhaseDetails])

  const sharePhaseLink = useCallback(async () => {
    const url = `${window.location.origin}${phaseDetailPath(planId, phaseId)}`
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // Clipboard may be denied in non-secure contexts or without permission.
    }
  }, [planId, phaseId])

  if (!plan || !livePhase || livePhase.planId !== planId) {
    return null
  }

  const spentLabel =
    livePhase.budgetActualCents != null
      ? formatBudgetCents(livePhase.budgetActualCents, budgetCurrency)
      : '—'
  const planDateRange = formatPlanDateRange(plan.start, plan.end)
  const locationLabel = plan.location?.trim() ? plan.location : '—'

  return (
    <div className={cn('flex flex-col gap-10', className)}>
      <div className="flex flex-col gap-6">
        <Link
          to={`/plans/${planId}`}
          className="inline-flex w-fit max-w-full items-center gap-1 text-sm text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground"
        >
          <ChevronLeft className="size-5 shrink-0" aria-hidden />
          <span className="min-w-0 truncate">{plan.name}</span>
          <span className="shrink-0 text-muted-foreground/50" aria-hidden>
            ·
          </span>
          <span className="shrink-0 tabular-nums">{planDateRange}</span>
        </Link>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Input
                ref={titleRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                aria-label="Phase title"
                className={inkOverviewTitle}
              />
              <div className="h-px w-full bg-border" aria-hidden />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'mt-0.5 size-8 shrink-0 text-muted-foreground transition-surface pressable duration-150 ease-hover',
                'hover:text-foreground',
                shareCopied && 'text-foreground',
              )}
              aria-label={shareCopied ? 'Link copied' : 'Copy phase link'}
              title={shareCopied ? 'Copied' : 'Copy link'}
              onClick={() => void sharePhaseLink()}
            >
              {navCopyLinkIcon({ className: 'size-[18px]', 'aria-hidden': true })}
            </Button>
          </div>
        </div>

        <OverviewDescriptionField
          value={descriptionDraft}
          onChange={(e) => setDescriptionDraft(e.target.value)}
          onBlur={commitDescription}
          placeholder="Describe this phase."
          aria-label="Phase description"
        />

        <div className={overviewMetadataGrid}>
          <OverviewMetadataCell icon={UserIcon} label="Assignee">
            <BloomDropdown
              placement={overviewGridMenuPlacement}
              menuWidth={240}
              trigger={
                leadUser ? (
                  <OverviewOwnerPill
                    as="button"
                    user={leadUser}
                    aria-label="Change assignee"
                  />
                ) : leadAgent ? (
                  <button
                    type="button"
                    aria-label="Change assignee"
                    className="pressable cursor-pointer transition-surface duration-150 ease-hover"
                  >
                    <AssigneePill agent={leadAgent} className="max-w-full" />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Assign phase owner"
                    className={cn(
                      inkOverviewGridValue,
                      'pressable cursor-pointer text-right',
                    )}
                  >
                    Assign
                  </button>
                )
              }
            >
              {workspaceUsers.map((u) => (
                <BloomDropdownItem
                  key={u.id}
                  className="text-sm"
                  onSelect={() =>
                    updatePhaseDetails(phaseId, { assigneeUserIds: [u.id] })
                  }
                >
                  <OverviewOwnerPill user={u} />
                </BloomDropdownItem>
              ))}
              {leadUser || leadAgent ? (
                <BloomDropdownItem
                  className="text-sm text-muted-foreground"
                  onSelect={() =>
                    updatePhaseDetails(phaseId, { assigneeUserIds: [] })
                  }
                >
                  Clear assignee
                </BloomDropdownItem>
              ) : null}
            </BloomDropdown>
          </OverviewMetadataCell>

          <OverviewMetadataCell icon={CalendarDays} label="Timeline">
            <div className="flex flex-wrap items-center justify-end gap-2.5 text-sm tabular-nums text-foreground">
              <PhaseDatePickerField
                value={livePhase.start}
                ariaLabel="Start date"
                labelFormat="short"
                scrub
                align="end"
                maxDate={livePhase.end}
                onChange={(next) => updatePhaseDetails(phaseId, { start: next })}
                className={cn(inkDatePickers, '!px-0 !py-0')}
              />
              <span className="shrink-0 text-muted-foreground/30" aria-hidden>
                –
              </span>
              <PhaseDatePickerField
                value={livePhase.end}
                ariaLabel="End date"
                labelFormat="short"
                scrub
                align="end"
                minDate={livePhase.start}
                onChange={(next) => updatePhaseDetails(phaseId, { end: next })}
                className={cn(inkDatePickers, '!px-0 !py-0')}
              />
            </div>
          </OverviewMetadataCell>

          <OverviewMetadataCell icon={CircleDashed} label="Status">
            <PhaseStatusDropdown
              phaseId={phaseId}
              currentStatus={storedStatus}
              modal={false}
              stopParentRowNavigate={false}
              menuPlacement={{ side: 'bottom', align: 'center' }}
            >
              <button
                type="button"
                className="pressable cursor-pointer transition-surface duration-150 ease-hover"
                aria-label="Change phase status"
              >
                <StatusBadge status={status} />
              </button>
            </PhaseStatusDropdown>
          </OverviewMetadataCell>

          <OverviewMetadataCell icon={MapPin} label="Location">
            <span className={cn(inkOverviewGridValue, 'pointer-events-none text-right')}>
              {locationLabel}
            </span>
          </OverviewMetadataCell>

          <OverviewMetadataCell icon={DollarSign} label="Budget">
            <div className="flex items-center gap-2.5 text-sm tabular-nums text-foreground">
              <span>{spentLabel}</span>
              <span className="text-muted-foreground/30" aria-hidden>
                /
              </span>
              <BudgetAmountField
                valueCents={livePhase.budgetAllocatedCents}
                currency={budgetCurrency}
                ariaLabel="Phase budget allocated"
                onCommit={(cents) =>
                  updatePhaseDetails(phaseId, {
                    budgetAllocatedCents: cents ?? undefined,
                  })
                }
                className="min-w-0 justify-end [&_input]:px-0 [&_input]:text-right"
              />
            </div>
          </OverviewMetadataCell>

          <OverviewMetadataCell icon={Flag} label="Priority">
            <BloomDropdown
              placement={overviewGridMenuPlacement}
              menuWidth={200}
              trigger={
                <button
                  type="button"
                  aria-label="Change priority"
                  className={cn(
                    inkOverviewGridValue,
                    'pressable inline-flex cursor-pointer items-center justify-end gap-1.5 whitespace-nowrap text-right',
                  )}
                >
                  <PriorityIcon priority={livePhase.priority} tone="muted" />
                  {phasePriorityLabel(livePhase.priority)}
                </button>
              }
            >
              {PHASE_PRIORITY_ORDER.map((p) => (
                <BloomDropdownItem
                  key={p}
                  className="text-sm"
                  onSelect={() =>
                    updatePhaseDetails(phaseId, {
                      priority: p as Phase['priority'],
                    })
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <PriorityIcon priority={p} tone="muted" />
                    {phasePriorityLabel(p)}
                  </span>
                </BloomDropdownItem>
              ))}
            </BloomDropdown>
          </OverviewMetadataCell>
        </div>
      </div>

      <DetailCollapsibleSection
        title="Tasks"
        open={tasksOpen}
        onOpenChange={setTasksOpen}
      >
        {livePhase.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {livePhase.tasks.map((task) => (
              <li key={task.id}>
                <PhaseChecklistTaskRow
                  task={task}
                  assignee={leadUser}
                  onToggle={() => toggleChecklistTask(phaseId, task.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </DetailCollapsibleSection>

      <DetailCollapsibleSection
        title="Activity"
        open={activityOpen}
        onOpenChange={setActivityOpen}
      >
        <OverviewActivityTimeline events={phaseEvents} workspace={workspace} />
      </DetailCollapsibleSection>

      <div className="flex items-center justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="inset-edge-destructive-hover cursor-pointer text-muted-foreground transition-surface duration-150 ease-out hover:text-destructive"
          onClick={() => setPhaseQuickDialog({ kind: 'delete', phaseId })}
        >
          Delete phase
        </Button>
      </div>
    </div>
  )
}
