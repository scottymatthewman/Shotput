import { ActivityItem } from '@/components/dance/ActivityItem'
import { BudgetAmountField } from '@/components/dance/BudgetAmountField'
import { PriorityIcon } from '@/components/dance/PriorityIcon'
import { PhaseStatusIcon } from '@/components/dance/StatusBadge'
import { phaseStatusMenuLabel } from '@/components/dance/phaseStatusMenu'
import { PhaseDatePickerField } from '@/features/plans/PhaseDatePickerField'
import { ScheduleYearPickerField } from '@/features/plans/ScheduleYearPickerField'
import { PhasePropertiesSection } from '@/features/plans/PhasePropertiesSection'
import { PhaseStatusDropdown } from '@/features/plans/PhaseStatusDropdown'
import {
  inkBody,
  inkDatePickers,
  inkTitle,
  overviewMetricCardBase,
  overviewSectionShell,
  OverviewRow,
} from '@/features/plans/overviewPageLayout'
import type { PhaseDetailLayoutDial } from '@/features/plans/usePhaseDetailDialKit'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { planBudgetCurrency } from '@/lib/budget'
import { PHASE_PRIORITY_ORDER, phasePriorityLabel } from '@/lib/phasePriority'
import { getEffectivePhaseStatus, normalizePhaseStatus } from '@/lib/phaseStatus'
import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
import type { Phase } from '@/types/domain'
import {
  CalendarPlus,
  Layers2,
  MessageSquare,
  Sparkles,
  Tag,
  UserPlus,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const ACTIVITY_INITIAL_VISIBLE = 3
const ACTIVITY_LOAD_MORE_STEP = 10

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export type PhaseDetailPanelProps = {
  planId: string
  phaseId: string
  /** Focus title input when the panel opens (e.g. new phase). */
  autoFocusTitle?: boolean
  className?: string
  /** Live layout tuning from DialKit (phase detail page). */
  dialLayout?: PhaseDetailLayoutDial
}

export function PhaseDetailPanel({
  planId,
  phaseId,
  autoFocusTitle = false,
  className,
  dialLayout,
}: PhaseDetailPanelProps) {
  const workspace = usePlansStore((s) => s.workspace)
  const updatePhaseDetails = usePlansStore((s) => s.updatePhaseDetails)
  const toggleChecklistTask = usePlansStore((s) => s.toggleChecklistTask)
  const activityLog = usePlansStore((s) => s.activityLog)

  const phase = workspace.phases[phaseId]
  const livePhase = workspace.phases[phaseId] ?? phase
  const plan = workspace.plans[planId]

  const titleRef = useRef<HTMLInputElement>(null)
  const [titleDraft, setTitleDraft] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [activityExpansion, setActivityExpansion] = useState<number | 'all'>(
    ACTIVITY_INITIAL_VISIBLE,
  )

  useEffect(() => {
    if (!livePhase) return
    setTitleDraft(livePhase.title)
    setDescriptionDraft(livePhase.description)
  }, [livePhase?.id, livePhase?.title, livePhase?.description])

  useEffect(() => {
    setActivityExpansion(ACTIVITY_INITIAL_VISIBLE)
  }, [phaseId])

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
    return activityLog.filter((e) => e.objectId === phaseId && e.planId === planId)
  }, [activityLog, phaseId, planId])

  const activityVisibleCount =
    activityExpansion === 'all'
      ? phaseEvents.length
      : Math.min(activityExpansion, phaseEvents.length)
  const displayedActivity = phaseEvents.slice(0, activityVisibleCount)
  const hasMoreActivity = phaseEvents.length > activityVisibleCount

  const leadUserId = livePhase?.assigneeUserIds[0]
  const leadUser = leadUserId ? workspace.users[leadUserId] : undefined
  const leadAgentId =
    !leadUser && livePhase?.assigneeAgentIds[0] ? livePhase.assigneeAgentIds[0] : undefined
  const leadAgent = leadAgentId ? workspace.agents[leadAgentId] : undefined
  const teamAgent =
    livePhase?.assigneeAgentIds.map((id) => workspace.agents[id]).filter(Boolean)[0] ??
    workspace.agents.a1
  const coral = leadUser ? leadUser.id.charCodeAt(1) % 2 === 0 : false

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

  if (!plan || !livePhase || livePhase.planId !== planId) {
    return null
  }

  const sectionShell = dialLayout
    ? cn(
        'flex flex-col rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft bg-muted',
      )
    : overviewSectionShell
  const sectionShellStyle = dialLayout
    ? { gap: dialLayout.sectionCardGap, padding: dialLayout.sectionCardPadding }
    : undefined
  const metricSectionShell = dialLayout
    ? cn(overviewMetricCardBase)
    : cn(overviewMetricCardBase, 'py-3')
  const metricSectionStyle = dialLayout
    ? {
        paddingTop: dialLayout.metricPaddingY,
        paddingBottom: dialLayout.metricPaddingY,
      }
    : undefined
  const rootStyle = dialLayout
    ? {
        gap: dialLayout.panelGap,
        paddingLeft: dialLayout.panelPaddingX,
        paddingRight: dialLayout.panelPaddingX,
        paddingTop: dialLayout.panelPaddingTop,
        paddingBottom: dialLayout.panelPaddingBottom,
      }
    : undefined

  return (
    <div
      className={cn(!dialLayout && 'flex flex-col gap-2 p-4 pb-8', dialLayout && 'flex flex-col', className)}
      style={rootStyle}
    >
      <div className={sectionShell} style={sectionShellStyle}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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
            className={cn(inkTitle, 'sm:min-w-0 sm:flex-1')}
          />
          <div className="flex shrink-0 flex-wrap items-center justify-start gap-1 text-sm sm:justify-end">
            <PhaseDatePickerField
              value={livePhase.start}
              ariaLabel="Start date"
              labelFormat="short"
              scrub
              align="end"
              maxDate={livePhase.end}
              onChange={(next) => updatePhaseDetails(phaseId, { start: next })}
              className={cn(inkDatePickers)}
            />
            <span className="shrink-0 text-muted-foreground" aria-hidden>
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
              className={cn(inkDatePickers)}
            />
            <ScheduleYearPickerField
              startDate={livePhase.start}
              endDate={livePhase.end}
              align="end"
              onChange={({ start, end }) => updatePhaseDetails(phaseId, { start, end })}
            />
          </div>
        </div>

        <Textarea
          value={descriptionDraft}
          onChange={(e) => setDescriptionDraft(e.target.value)}
          onBlur={commitDescription}
          placeholder="Add a description…"
          aria-label="Phase description"
          className={inkBody}
        />
      </div>

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="Status">
          <PhaseStatusDropdown phaseId={phaseId} currentStatus={storedStatus} modal={false}>
            <button
              type="button"
              className="pressable dance-focus-ring flex min-w-0 cursor-pointer items-center gap-2 rounded-sm py-0.5 text-left text-sm text-foreground outline-none transition-surface duration-150 ease-hover hover:bg-accent/40"
              aria-label={`Status: ${phaseStatusMenuLabel(status)}. Change status`}
            >
              <PhaseStatusIcon status={status} className="size-4 shrink-0" />
              <span className="min-w-0 truncate">{phaseStatusMenuLabel(status)}</span>
            </button>
          </PhaseStatusDropdown>
        </OverviewRow>
      </div>

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="Schedule">
          <div className="flex min-w-0 items-center gap-2">
            <Checkbox
              id={`phase-status-infer-${phaseId}`}
              checked={livePhase.statusIsManual === false}
              onCheckedChange={(v) =>
                updatePhaseDetails(phaseId, { statusIsManual: v !== true })
              }
            />
            <Label
              htmlFor={`phase-status-infer-${phaseId}`}
              className="cursor-pointer font-normal text-foreground"
            >
              Infer Todo/Missed from end date
            </Label>
          </div>
        </OverviewRow>
      </div>

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="Priority">
          <PriorityIcon priority={livePhase.priority} tone="muted" />
          <select
            aria-label="Priority"
            className="min-w-0 cursor-pointer border-0 bg-transparent py-0 text-sm text-foreground outline-none transition-surface duration-150 ease-hover focus-visible:ring-0"
            value={livePhase.priority}
            onChange={(e) =>
              updatePhaseDetails(phaseId, {
                priority: e.target.value as Phase['priority'],
              })
            }
          >
            {PHASE_PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {phasePriorityLabel(p)}
              </option>
            ))}
          </select>
        </OverviewRow>
      </div>

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="Lead">
          {leadUser ? (
            <>
              <Avatar
                className={cn(
                  'size-6 shrink-0 text-[10px]',
                  coral ? 'bg-assignee-coral' : 'bg-assignee-blue',
                )}
              >
                <AvatarFallback className="rounded-full text-primary-foreground">
                  {initials(leadUser.name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 truncate text-sm">{leadUser.name}</span>
            </>
          ) : leadAgent ? (
            <>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/25 text-primary">
                <Sparkles className="size-3.5" aria-hidden />
              </span>
              <span className="min-w-0 truncate text-sm">{leadAgent.name}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Add lead</span>
          )}
        </OverviewRow>
      </div>

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="Members">
          <UserPlus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">Add members</span>
        </OverviewRow>
      </div>

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="Issues">
          <Layers2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="text-sm tabular-nums">{livePhase.tasks.length}</span>
        </OverviewRow>
      </div>

      <div className={cn(metricSectionShell, 'space-y-2')} style={metricSectionStyle}>
        <OverviewRow label="Allocated">
          <BudgetAmountField
            valueCents={livePhase.budgetAllocatedCents}
            currency={budgetCurrency}
            ariaLabel="Phase budget allocated"
            onCommit={(cents) =>
              updatePhaseDetails(phaseId, {
                budgetAllocatedCents: cents ?? undefined,
              })
            }
          />
        </OverviewRow>
        <OverviewRow label="Spent">
          <BudgetAmountField
            valueCents={livePhase.budgetActualCents}
            currency={budgetCurrency}
            ariaLabel="Phase budget spent"
            onCommit={(cents) =>
              updatePhaseDetails(phaseId, {
                budgetActualCents: cents ?? undefined,
              })
            }
          />
        </OverviewRow>
      </div>

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="Start date">
          <PhaseDatePickerField
            value={livePhase.start}
            ariaLabel="Start date"
            labelFormat="long"
            maxDate={livePhase.end}
            leading={<CalendarPlus className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
            onChange={(v) => updatePhaseDetails(phaseId, { start: v })}
          />
        </OverviewRow>
      </div>

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="End date">
          <PhaseDatePickerField
            value={livePhase.end}
            ariaLabel="End date"
            labelFormat="long"
            minDate={livePhase.start}
            leading={<CalendarPlus className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
            onChange={(v) => updatePhaseDetails(phaseId, { end: v })}
          />
        </OverviewRow>
      </div>

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="Hard stop">
          <PhaseDatePickerField
            value={livePhase.hardStop ?? ''}
            ariaLabel="Hard stop date"
            labelFormat="long"
            leading={<CalendarPlus className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
            onChange={(v) =>
              updatePhaseDetails(phaseId, { hardStop: v.trim() ? v : undefined })
            }
          />
        </OverviewRow>
      </div>

      <PhasePropertiesSection
        phaseId={phaseId}
        planType={plan?.planType}
        phase={livePhase}
        sectionShell={metricSectionShell}
        sectionShellStyle={metricSectionStyle}
      />

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="Teams">
          <Sparkles className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 truncate text-sm">{teamAgent?.name ?? '—'}</span>
        </OverviewRow>
      </div>

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="Slack">
          <MessageSquare className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">Slack channel</span>
        </OverviewRow>
      </div>

      <div className={metricSectionShell} style={metricSectionStyle}>
        <OverviewRow label="Labels">
          <Tag className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">Add label</span>
        </OverviewRow>
      </div>

      <div className={sectionShell} style={sectionShellStyle}>
        <p className="text-sm font-medium text-foreground">Tasks</p>
        <ul className="space-y-1">
          {livePhase.tasks.map((st) => (
            <li key={st.id}>
              <label
                htmlFor={`checklist-${phaseId}-${st.id}`}
                className="flex min-h-9 cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 transition-surface duration-150 ease-hover hover:bg-fill-hover"
              >
                <Checkbox
                  id={`checklist-${phaseId}-${st.id}`}
                  checked={st.completed}
                  onCheckedChange={() => toggleChecklistTask(phaseId, st.id)}
                />
                <span
                  className={cn(
                    'min-w-0 flex-1 text-sm',
                    st.completed ? 'text-muted-foreground line-through' : 'text-foreground',
                  )}
                >
                  {st.title}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className={sectionShell} style={sectionShellStyle}>
        <p className="text-sm font-medium text-foreground">
          Activity
          <span className="font-normal text-muted-foreground"> · {plan.name}</span>
        </p>
        <div>
          {phaseEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <>
              {displayedActivity.map((e) => (
                <ActivityItem key={e.id} event={e} workspace={workspace} />
              ))}
              {hasMoreActivity ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="pressable h-8 px-2 text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground"
                    onClick={() => {
                      if (activityExpansion === 'all') return
                      const next = activityExpansion + ACTIVITY_LOAD_MORE_STEP
                      setActivityExpansion(next >= phaseEvents.length ? 'all' : next)
                    }}
                  >
                    View 10 more
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="pressable h-8 px-2 text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground"
                    onClick={() => setActivityExpansion('all')}
                  >
                    View all
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

    </div>
  )
}
