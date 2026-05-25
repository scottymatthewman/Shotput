import { ActivityItem } from '@/components/dance/ActivityItem'
import { BudgetAmountField } from '@/components/dance/BudgetAmountField'
import { PriorityIcon } from '@/components/dance/PriorityIcon'
import { TaskDatePickerField } from '@/components/dance/TaskDatePickerField'
import { TaskStatusIcon } from '@/components/dance/StatusBadge'
import { TaskStatusDropdown } from '@/components/dance/TaskStatusDropdown'
import { taskStatusMenuLabel } from '@/components/dance/taskStatusMenu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { isRadixOverlayContentTarget } from '@/lib/radixOverlay'
import { planBudgetCurrency } from '@/lib/budget'
import { TASK_PRIORITY_ORDER, taskPriorityLabel } from '@/lib/taskPriority'
import { getEffectiveTaskStatus, normalizeTaskStatus } from '@/lib/taskStatus'
import { cn } from '@/lib/utils'
import { useDanceStore } from '@/state/store'
import type { Phase, Workspace } from '@/types/domain'
import {
  CalendarPlus,
  Layers2,
  MessageSquare,
  Sparkles,
  Tag,
  UserPlus,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

const ACTIVITY_INITIAL_VISIBLE = 3
const ACTIVITY_LOAD_MORE_STEP = 10

/** Max description height (~11 lines at text-sm); extra scroll fades out at bottom. */
const DESCRIPTION_MAX_PX = 176
const DESCRIPTION_MIN_PX = 24

const SHEET_CLOSE_ROW_PAD_PX = 12
const SHEET_CLOSE_TARGET_PX = 36
const SHEET_CLOSE_ICON_PX = 16
const SHEET_BODY_PAD_X_PX =
  SHEET_CLOSE_ROW_PAD_PX + (SHEET_CLOSE_TARGET_PX - SHEET_CLOSE_ICON_PX) / 2

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function PropRow({
  label,
  children,
  valueClassName,
}: {
  label: string
  children: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="grid grid-cols-[minmax(5.5rem,auto)_minmax(0,1fr)] items-center gap-x-6 border-b border-border/70 py-2.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <div
        className={cn(
          'flex w-full min-w-0 items-center justify-start gap-2 text-left',
          valueClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function TaskSheet({
  open,
  onOpenChange,
  workspace,
  phase,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  workspace: Workspace
  phase: Phase | null
}) {
  if (!open && !phase) return null
  if (!phase) return null

  return (
    <TaskSheetBody
      open={open}
      onOpenChange={onOpenChange}
      workspace={workspace}
      phase={phase}
    />
  )
}

function TaskSheetBody({
  open,
  onOpenChange,
  workspace,
  phase,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  workspace: Workspace
  phase: Phase
}) {
  const updatePhaseDetails = useDanceStore((s) => s.updatePhaseDetails)
  const toggleChecklistTask = useDanceStore((s) => s.toggleChecklistTask)
  const setPhaseQuickDialog = useDanceStore((s) => s.setPhaseQuickDialog)
  const activityLog = useDanceStore((s) => s.activityLog)
  const livePhase = useDanceStore((s) => s.workspace.phases[phase.id] ?? phase)
  const plan = workspace.plans[livePhase.planId]
  const budgetCurrency = plan ? planBudgetCurrency(plan) : undefined
  const storedStatus = normalizeTaskStatus(livePhase.status)
  const status = getEffectiveTaskStatus(livePhase)

  const [title, setTitle] = useState(phase.title)
  const [description, setDescription] = useState(phase.description)
  const [activityExpansion, setActivityExpansion] = useState<number | 'all'>(
    ACTIVITY_INITIAL_VISIBLE,
  )

  const descRef = useRef<HTMLTextAreaElement>(null)
  const [descFade, setDescFade] = useState(false)

  const syncDescriptionSizing = useCallback(() => {
    const el = descRef.current
    if (!el) return
    el.style.height = 'auto'
    const natural = el.scrollHeight
    const capped = Math.min(natural, DESCRIPTION_MAX_PX)
    el.style.height = `${Math.max(capped, DESCRIPTION_MIN_PX)}px`
    const canScroll = natural > DESCRIPTION_MAX_PX + 0.5
    const notAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight > 6
    setDescFade(canScroll && notAtBottom)
  }, [])

  useLayoutEffect(() => {
    syncDescriptionSizing()
  }, [description, phase.id, syncDescriptionSizing])

  const phaseEvents = activityLog.filter(
    (e) => e.objectId === phase.id && e.planId === phase.planId,
  )

  useEffect(() => {
    setActivityExpansion(ACTIVITY_INITIAL_VISIBLE)
  }, [phase.id])

  const activityVisibleCount =
    activityExpansion === 'all'
      ? phaseEvents.length
      : Math.min(activityExpansion, phaseEvents.length)
  const displayedActivity = phaseEvents.slice(0, activityVisibleCount)
  const hasMoreActivity = phaseEvents.length > activityVisibleCount

  const leadUserId = phase.assigneeUserIds[0]
  const leadUser = leadUserId ? workspace.users[leadUserId] : undefined
  const leadAgentId = !leadUser && phase.assigneeAgentIds[0] ? phase.assigneeAgentIds[0] : undefined
  const leadAgent = leadAgentId ? workspace.agents[leadAgentId] : undefined
  const teamAgent =
    phase.assigneeAgentIds.map((id) => workspace.agents[id]).filter(Boolean)[0] ??
    workspace.agents.a1
  const project = workspace.plans[phase.planId]

  const coral = leadUser ? leadUser.id.charCodeAt(1) % 2 === 0 : false

  const bodyPadStyle = {
    paddingLeft: SHEET_BODY_PAD_X_PX,
    paddingRight: SHEET_BODY_PAD_X_PX,
  } as const

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        onInteractOutside={(e) => {
          if (isRadixOverlayContentTarget(e.target)) e.preventDefault()
        }}
        onFocusOutside={(e) => {
          if (isRadixOverlayContentTarget(e.target)) e.preventDefault()
        }}
      >
        <SheetTitle className="sr-only">Edit phase</SheetTitle>
        <div className="flex shrink-0 items-center px-3 pt-4">
          <SheetClose
            className={cn(
              'pressable dance-focus-ring inline-flex size-9 shrink-0 items-center justify-center rounded-sm opacity-70 transition-surface duration-150 ease-hover hover:opacity-100',
            )}
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-5 pb-6 pt-2" style={bodyPadStyle}>
            <input
              id="t-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => updatePhaseDetails(phase.id, { title })}
              placeholder="Title"
              className="w-full border-0 bg-transparent p-0 text-xl leading-snug font-semibold tracking-tight text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none"
            />
            <div className="relative">
              <textarea
                ref={descRef}
                id="t-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => updatePhaseDetails(phase.id, { description })}
                onScroll={syncDescriptionSizing}
                placeholder="Add a description…"
                className="w-full resize-none overflow-y-auto border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground [scrollbar-width:thin] placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none"
              />
              <div
                className={cn(
                  'pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent transition-opacity duration-200 ease-out',
                  descFade ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden
              />
            </div>

            <div className="rounded-lg border border-border bg-muted/35">
              <div className="px-3 pb-1 pt-0.5">
                <PropRow label="Status">
                  <TaskStatusDropdown phaseId={phase.id} currentStatus={storedStatus} modal={false}>
                    <button
                      type="button"
                      className="pressable dance-focus-ring flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-sm py-0.5 text-left text-sm text-foreground outline-none transition-surface duration-150 ease-hover hover:bg-muted/50"
                      aria-label={`Status: ${taskStatusMenuLabel(status)}. Change status`}
                    >
                      <TaskStatusIcon status={status} className="size-4 shrink-0" />
                      <span className="min-w-0 truncate">{taskStatusMenuLabel(status)}</span>
                    </button>
                  </TaskStatusDropdown>
                </PropRow>

                <PropRow label="Schedule">
                  <Checkbox
                    id="task-status-infer"
                    checked={livePhase.statusIsManual === false}
                    onCheckedChange={(v) =>
                      updatePhaseDetails(phase.id, { statusIsManual: v !== true })
                    }
                  />
                  <Label htmlFor="task-status-infer" className="cursor-pointer font-normal text-foreground">
                    Infer Todo/Missed from end date (auto status)
                  </Label>
                </PropRow>

                <PropRow label="Priority">
                  <PriorityIcon priority={phase.priority} tone="muted" />
                  <select
                    aria-label="Priority"
                    className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent py-0 text-sm text-foreground outline-none transition-surface duration-150 ease-hover focus-visible:ring-0"
                    value={phase.priority}
                    onChange={(e) =>
                      updatePhaseDetails(phase.id, {
                        priority: e.target.value as Phase['priority'],
                      })
                    }
                  >
                    {TASK_PRIORITY_ORDER.map((p) => (
                      <option key={p} value={p}>
                        {taskPriorityLabel(p)}
                      </option>
                    ))}
                  </select>
                </PropRow>

                <PropRow label="Lead">
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
                      <span className="min-w-0 truncate">{leadUser.name}</span>
                    </>
                  ) : leadAgent ? (
                    <>
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/25 text-primary">
                        <Sparkles className="size-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0 truncate">{leadAgent.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Add lead</span>
                  )}
                </PropRow>

                <PropRow label="Members">
                  <UserPlus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="text-muted-foreground">Add members</span>
                </PropRow>

                <PropRow label="Issues">
                  <Layers2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span>{livePhase.tasks.length}</span>
                </PropRow>

                <PropRow label="Allocated" valueClassName="justify-start">
                  <BudgetAmountField
                    valueCents={livePhase.budgetAllocatedCents}
                    currency={budgetCurrency}
                    ariaLabel="Phase budget allocated"
                    className="w-fit max-w-full"
                    onCommit={(cents) =>
                      updatePhaseDetails(phase.id, {
                        budgetAllocatedCents: cents ?? undefined,
                      })
                    }
                  />
                </PropRow>

                <PropRow label="Spent" valueClassName="justify-start">
                  <BudgetAmountField
                    valueCents={livePhase.budgetActualCents}
                    currency={budgetCurrency}
                    ariaLabel="Phase budget spent"
                    className="w-fit max-w-full"
                    onCommit={(cents) =>
                      updatePhaseDetails(phase.id, {
                        budgetActualCents: cents ?? undefined,
                      })
                    }
                  />
                </PropRow>

                <PropRow label="Start date">
                  <TaskDatePickerField
                    value={livePhase.start}
                    ariaLabel="Start date"
                    labelFormat="long"
                    leading={<CalendarPlus className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
                    onChange={(v) => updatePhaseDetails(phase.id, { start: v })}
                  />
                </PropRow>

                <PropRow label="Target date">
                  <TaskDatePickerField
                    value={livePhase.end}
                    ariaLabel="Target date"
                    labelFormat="long"
                    leading={<CalendarPlus className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
                    onChange={(v) => updatePhaseDetails(phase.id, { end: v })}
                  />
                </PropRow>

                <PropRow label="Teams">
                  <Sparkles className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 truncate">{teamAgent?.name ?? '—'}</span>
                </PropRow>

                <PropRow label="Slack">
                  <MessageSquare className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="text-muted-foreground">Slack channel</span>
                </PropRow>

                <PropRow label="Labels">
                  <Tag className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="text-muted-foreground">Add label</span>
                </PropRow>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Tasks
              </p>
              <ul className="space-y-1">
                {livePhase.tasks.map((st) => (
                  <li key={st.id}>
                    <label
                      htmlFor={`checklist-${phase.id}-${st.id}`}
                      className="flex min-h-9 cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 transition-surface duration-150 ease-hover hover:bg-muted/40"
                    >
                      <Checkbox
                        id={`checklist-${phase.id}-${st.id}`}
                        checked={st.completed}
                        onCheckedChange={() => toggleChecklistTask(phase.id, st.id)}
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

            <div className="rounded-lg border border-border bg-muted/35">
              <div className="border-b border-border px-3 py-2.5">
                <p className="text-sm font-medium text-foreground">
                  Activity
                  {project ? (
                    <span className="font-normal text-muted-foreground"> · {project.name}</span>
                  ) : null}
                </p>
              </div>
              <div>
                {phaseEvents.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  <>
                    {displayedActivity.map((e) => (
                      <ActivityItem key={e.id} event={e} workspace={workspace} />
                    ))}
                    {hasMoreActivity ? (
                      <div className="flex flex-wrap gap-2 px-3 pb-2.5 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="pressable h-8 px-2 text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground"
                          onClick={() => {
                            if (activityExpansion === 'all') return
                            const next = activityExpansion + ACTIVITY_LOAD_MORE_STEP
                            setActivityExpansion(
                              next >= phaseEvents.length ? 'all' : next,
                            )
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

            <div className="border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="pressable cursor-pointer text-muted-foreground transition-surface duration-150 ease-out hover:border-destructive/40 hover:text-destructive"
                onClick={() => {
                  onOpenChange(false)
                  requestAnimationFrame(() => {
                    setPhaseQuickDialog({ kind: 'delete', phaseId: phase.id })
                  })
                }}
              >
                Delete phase
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
