import { AssigneePill } from '@/components/dance/AssigneePill'
import { PriorityIcon } from '@/components/dance/PriorityIcon'
import { PhaseStatusIcon } from '@/components/dance/StatusBadge'
import { phaseStatusMenuLabel } from '@/components/dance/phaseStatusMenu'
import { PhaseDatePickerField } from '@/features/plans/PhaseDatePickerField'
import { ScheduleYearPickerField } from '@/features/plans/ScheduleYearPickerField'
import { inkBody, inkDatePickers, inkTitle } from '@/features/plans/overviewPageLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildNewPhaseForPlan } from '@/lib/instant/mutations'
import { PHASE_PRIORITY_ORDER, phasePriorityLabel } from '@/lib/phasePriority'
import { cn } from '@/lib/utils'
import { selectWorkspaceUsers } from '@/state/selectors'
import { usePlansStore } from '@/state/store'
import type { Phase, PhaseStatus, Plan } from '@/types/domain'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

export type NewPhaseDraft = Pick<
  Phase,
  | 'title'
  | 'description'
  | 'start'
  | 'end'
  | 'status'
  | 'statusIsManual'
  | 'priority'
  | 'section'
  | 'assigneeUserIds'
  | 'assigneeAgentIds'
>

const STATUSES: PhaseStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'blocked',
  'done',
]

const fieldSelectClass =
  'min-w-0 flex-1 cursor-pointer appearance-none rounded-sm border-0 bg-surface-3 py-1.5 pl-2 pr-8 text-sm text-foreground outline-none transition-surface duration-150 ease-hover focus-visible:outline-none focus-visible:ring-0'

function draftFromPlan(plan: Plan): NewPhaseDraft {
  const template = buildNewPhaseForPlan(plan, 'draft')
  return {
    title: template.title,
    description: template.description,
    start: template.start,
    end: template.end,
    status: template.status,
    statusIsManual: template.statusIsManual,
    priority: template.priority,
    section: template.section,
    assigneeUserIds: template.assigneeUserIds,
    assigneeAgentIds: template.assigneeAgentIds,
  }
}

export function NewPhaseForm({
  planId,
  onCancel,
  onSaved,
}: {
  planId: string
  onCancel: () => void
  onSaved: (phaseId: string) => void
}) {
  const plan = usePlansStore((s) => s.workspace.plans[planId])
  const createPhaseInPlan = usePlansStore((s) => s.createPhaseInPlan)
  const { userIds, users } = usePlansStore(
    useShallow((s) => ({
      userIds: s.workspace.userIds,
      users: selectWorkspaceUsers(s),
    })),
  )

  const defaults = useMemo(() => (plan ? draftFromPlan(plan) : null), [plan])
  const [draft, setDraft] = useState<NewPhaseDraft | null>(defaults)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(defaults)
  }, [defaults])

  useEffect(() => {
    const t = window.setTimeout(() => {
      titleRef.current?.focus()
      titleRef.current?.select()
    }, 0)
    return () => window.clearTimeout(t)
  }, [planId])

  if (!plan || !draft) return null

  const patch = (next: Partial<NewPhaseDraft>) => setDraft((d) => (d ? { ...d, ...next } : d))
  const ownerId = draft.assigneeUserIds[0]

  const handleSave = () => {
    const title = draft.title.trim() || 'New phase'
    const id = createPhaseInPlan(planId, { ...draft, title })
    if (id) onSaved(id)
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-6 pt-5 pb-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <Input
              ref={titleRef}
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSave()
                }
              }}
              aria-label="Phase title"
              className={cn(inkTitle, 'focus-visible:!bg-transparent sm:min-w-0 sm:flex-1')}
            />
            <div className="flex shrink-0 flex-wrap items-center justify-start gap-1 text-sm sm:justify-end">
              <PhaseDatePickerField
                value={draft.start}
                ariaLabel="Start date"
                labelFormat="short"
                scrub
                align="end"
                maxDate={draft.end}
                onChange={(start) => patch({ start })}
                className={cn(inkDatePickers)}
              />
              <span className="shrink-0 text-muted-foreground" aria-hidden>
                –
              </span>
              <PhaseDatePickerField
                value={draft.end}
                ariaLabel="End date"
                labelFormat="short"
                scrub
                align="end"
                minDate={draft.start}
                onChange={(end) => patch({ end })}
                className={cn(inkDatePickers)}
              />
              <ScheduleYearPickerField
                startDate={draft.start}
                endDate={draft.end}
                align="end"
                onChange={({ start, end }) => patch({ start, end })}
              />
            </div>
          </div>
          <Textarea
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="Add a description…"
            aria-label="Phase description"
            className={cn(inkBody, 'focus-visible:!bg-transparent')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor="new-phase-status" className="text-xs text-muted-foreground">
              Status
            </Label>
            <div className="flex min-w-0 items-center gap-2">
              <PhaseStatusIcon status={draft.status} className="size-4 shrink-0" />
              <select
                id="new-phase-status"
                aria-label="Status"
                className={fieldSelectClass}
                value={draft.status}
                onChange={(e) => patch({ status: e.target.value as PhaseStatus })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {phaseStatusMenuLabel(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor="new-phase-priority" className="text-xs text-muted-foreground">
              Priority
            </Label>
            <div className="flex min-w-0 items-center gap-2">
              <PriorityIcon priority={draft.priority} tone="muted" className="size-4" />
              <select
                id="new-phase-priority"
                aria-label="Priority"
                className={fieldSelectClass}
                value={draft.priority}
                onChange={(e) =>
                  patch({ priority: e.target.value as Phase['priority'] })
                }
              >
                {PHASE_PRIORITY_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {phasePriorityLabel(p)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">Assignee</Label>
          <div className="max-h-[min(200px,30vh)] overflow-y-auto rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft bg-surface-3 px-2 py-2">
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant={ownerId ? 'ghost' : 'secondary'}
                className="h-auto min-h-9 w-full justify-start px-3 py-2 font-normal"
                onClick={() => patch({ assigneeUserIds: [] })}
              >
                <span className="text-sm text-muted-foreground">Unassigned</span>
              </Button>
              {userIds.map((uid) => {
                const user = users[uid]
                if (!user) return null
                const selected = ownerId === uid
                return (
                  <Button
                    key={uid}
                    type="button"
                    variant={selected ? 'secondary' : 'ghost'}
                    className="h-auto min-h-9 w-full justify-start px-3 py-2 font-normal"
                    onClick={() => patch({ assigneeUserIds: [uid] })}
                  >
                    <AssigneePill user={user} className="max-w-full" />
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 justify-end gap-2 inset-edge-ring inset-edge-ring-t px-6 py-4">
        <Button
          type="button"
          variant="outline"
          className="transition-surface pressable duration-150"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="transition-surface pressable duration-150"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </>
  )
}
