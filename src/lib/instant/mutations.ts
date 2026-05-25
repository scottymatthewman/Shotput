import { addDays, format, startOfDay } from 'date-fns'
import type {
  ActivityEvent,
  Phase,
  PhaseStatus,
  Plan,
} from '@/types/domain'
import { clampTaskDatesAfterMerge, coerceOrderedTaskDates } from '@/lib/taskDateOrder'
import { normalizePhaseStatus } from '@/lib/phaseStatus'
import { CURRENT_USER_ID } from '@/state/uiStore'
import { db, hasInstantConfig } from '@/lib/instant/db'

function json(value: unknown): string {
  return JSON.stringify(value)
}

function planExpandedForPhaseDates(
  plan: Plan,
  phaseStart: string,
  phaseEnd: string,
): Partial<Plan> | undefined {
  const ps = startOfDay(new Date(`${phaseStart}T12:00:00`))
  const pe = startOfDay(new Date(`${phaseEnd}T12:00:00`))
  const pls = startOfDay(new Date(`${plan.start}T12:00:00`))
  const ple = startOfDay(new Date(`${plan.end}T12:00:00`))

  let nextStart = pls
  let nextEnd = ple

  if (ps < pls) nextStart = addDays(ps, -7)
  if (pe > ple) nextEnd = addDays(pe, 7)

  if (nextStart.getTime() === pls.getTime() && nextEnd.getTime() === ple.getTime()) {
    return undefined
  }

  return {
    start: format(nextStart, 'yyyy-MM-dd'),
    end: format(nextEnd, 'yyyy-MM-dd'),
  }
}

function appendActivity(ev: Omit<ActivityEvent, 'id'>) {
  const id = crypto.randomUUID()
  return db.tx.activityEvents[id].update({
    timestamp: ev.timestamp,
    actorId: ev.actorId,
    actorIsAgent: ev.actorIsAgent,
    verb: ev.verb,
    objectType: ev.objectType,
    objectId: ev.objectId,
    objectLabel: ev.objectLabel,
    ...(ev.planId ? { planId: ev.planId } : {}),
    ...(ev.payload ? { payloadJson: json(ev.payload) } : {}),
  })
}

function transact(...ops: unknown[]) {
  if (ops.length === 0) return
  db.transact(ops as Parameters<typeof db.transact>[0])
}

export function updatePhaseDates(phase: Phase, start: string, end: string) {
  const ordered = coerceOrderedTaskDates(start, end)
  if (phase.start === ordered.start && phase.end === ordered.end) return

  transact(
    db.tx.phases[phase.id].update({ start: ordered.start, end: ordered.end }),
    appendActivity({
      timestamp: new Date().toISOString(),
      actorId: CURRENT_USER_ID,
      actorIsAgent: false,
      verb: 'rescheduled',
      objectType: 'phase',
      objectId: phase.id,
      objectLabel: phase.title,
      planId: phase.planId,
      payload: { start: ordered.start, end: ordered.end },
    }),
  )
}

export function setPhaseStatus(phase: Phase, status: PhaseStatus) {
  const normalized = normalizePhaseStatus(status)
  transact(
    db.tx.phases[phase.id].update({
      status: normalized,
      statusIsManual: true,
    }),
    appendActivity({
      timestamp: new Date().toISOString(),
      actorId: CURRENT_USER_ID,
      actorIsAgent: false,
      verb: 'changed_status',
      objectType: 'phase',
      objectId: phase.id,
      objectLabel: phase.title,
      planId: phase.planId,
      payload: { status: normalized },
    }),
  )
}

export function updatePhaseDetails(
  phase: Phase,
  patch: Partial<
    Pick<
      Phase,
      | 'title'
      | 'description'
      | 'start'
      | 'end'
      | 'priority'
      | 'assigneeUserIds'
      | 'statusIsManual'
      | 'budgetAllocatedCents'
      | 'budgetActualCents'
    >
  >,
) {
  const merged = { ...phase, ...patch }
  merged.status = normalizePhaseStatus(merged.status)
  clampTaskDatesAfterMerge(merged, {
    start: Object.prototype.hasOwnProperty.call(patch, 'start'),
    end: Object.prototype.hasOwnProperty.call(patch, 'end'),
  })

  const phaseUpdate: Record<string, unknown> = {
    title: merged.title,
    description: merged.description,
    status: merged.status,
    statusIsManual: merged.statusIsManual ?? true,
    priority: merged.priority,
    start: merged.start,
    end: merged.end,
    assigneeUserIdsJson: json(merged.assigneeUserIds),
  }

  if ('budgetAllocatedCents' in patch) {
    phaseUpdate.budgetAllocatedCents = merged.budgetAllocatedCents
  }
  if ('budgetActualCents' in patch) {
    phaseUpdate.budgetActualCents = merged.budgetActualCents
  }

  db.transact(db.tx.phases[phase.id].update(phaseUpdate))
}

export function toggleChecklistTask(phase: Phase, checklistTaskId: string) {
  const tasks = phase.tasks.map((t) =>
    t.id === checklistTaskId ? { ...t, completed: !t.completed } : t,
  )
  db.transact(db.tx.phases[phase.id].update({ tasksJson: json(tasks) }))
}

export function deletePhase(phase: Phase) {
  db.transact(db.tx.phases[phase.id].delete())
  appendActivity({
    timestamp: new Date().toISOString(),
    actorId: CURRENT_USER_ID,
    actorIsAgent: false,
    verb: 'deleted',
    objectType: 'phase',
    objectId: phase.id,
    objectLabel: phase.title,
    planId: phase.planId,
  })
}

export function buildNewPhaseForPlan(plan: Plan, id: string): Phase {
  const planStart = startOfDay(new Date(`${plan.start}T12:00:00`))
  const planEnd = startOfDay(new Date(`${plan.end}T12:00:00`))
  let spanEnd = addDays(planStart, 2)
  if (spanEnd > planEnd) spanEnd = planEnd
  const { start, end } = coerceOrderedTaskDates(
    plan.start,
    format(spanEnd, 'yyyy-MM-dd'),
  )

  return {
    id,
    planId: plan.id,
    title: 'New phase',
    description: '',
    status: 'todo',
    statusIsManual: true,
    priority: 'medium',
    section: 'Planning',
    start,
    end,
    assigneeUserIds: [],
    assigneeAgentIds: [],
    tasks: [],
  }
}

export function createPhaseInPlan(plan: Plan): Phase {
  const id = crypto.randomUUID()
  const phase = buildNewPhaseForPlan(plan, id)
  const sortOrder = plan.phaseIds.length

  if (hasInstantConfig) {
    transact(
      db.tx.phases[id]
        .update({
          title: phase.title,
          description: phase.description,
          status: phase.status,
          statusIsManual: phase.statusIsManual,
          priority: phase.priority,
          section: phase.section,
          start: phase.start,
          end: phase.end,
          assigneeUserIdsJson: json(phase.assigneeUserIds),
          assigneeAgentIdsJson: json(phase.assigneeAgentIds),
          tasksJson: json(phase.tasks),
          sortOrder,
        })
        .link({ plan: plan.id }),
      appendActivity({
        timestamp: new Date().toISOString(),
        actorId: CURRENT_USER_ID,
        actorIsAgent: false,
        verb: 'created',
        objectType: 'phase',
        objectId: id,
        objectLabel: phase.title,
        planId: plan.id,
      }),
    )
  }

  return phase
}

export function addPlanNote(planId: string, planName: string, body: string) {
  const trimmed = body.trim()
  if (!trimmed) return
  appendActivity({
    timestamp: new Date().toISOString(),
    actorId: CURRENT_USER_ID,
    actorIsAgent: false,
    verb: 'commented',
    objectType: 'plan',
    objectId: planId,
    objectLabel: planName,
    planId,
    payload: { body: trimmed },
  })
}

export function deletePlan(
  planId: string,
  planName: string,
  phaseIdsToRemove: string[],
) {
  const ops: unknown[] = [
    ...phaseIdsToRemove.map((id) => db.tx.phases[id].delete()),
    db.tx.plans[planId].delete(),
  ]
  db.transact(ops as Parameters<typeof db.transact>[0])
  appendActivity({
    timestamp: new Date().toISOString(),
    actorId: CURRENT_USER_ID,
    actorIsAgent: false,
    verb: 'deleted',
    objectType: 'plan',
    objectId: planId,
    objectLabel: planName,
    planId,
  })
}

import type { PlanOverviewPatch } from '@/state/domainStore'

export function patchPlanOverview(planId: string, patch: PlanOverviewPatch) {
  const planPatch: Record<string, string | number | undefined> = {}
  if (patch.name !== undefined) {
    const n = patch.name.trim()
    if (n) planPatch.name = n
  }
  if (patch.description !== undefined) planPatch.description = patch.description
  if (patch.location !== undefined) {
    const loc = patch.location.trim()
    planPatch.location = loc || undefined
  }
  if ('externalRecord' in patch) {
    planPatch.externalRecordJson =
      patch.externalRecord === null
        ? undefined
        : patch.externalRecord
          ? json(patch.externalRecord)
          : undefined
  }
  if (patch.teamMemberUserIds !== undefined) {
    planPatch.teamMemberUserIdsJson = json(patch.teamMemberUserIds)
  }
  if (patch.start !== undefined || patch.end !== undefined) {
    const ordered = coerceOrderedTaskDates(patch.start ?? '', patch.end ?? '')
    if (patch.start !== undefined) planPatch.start = ordered.start
    if (patch.end !== undefined) planPatch.end = ordered.end
  }
  if (patch.status !== undefined) planPatch.status = patch.status
  if ('budgetCents' in patch) {
    planPatch.budgetCents = patch.budgetCents ?? undefined
  }
  if ('budgetCurrency' in patch) {
    planPatch.budgetCurrency = patch.budgetCurrency ?? undefined
  }

  db.transact(db.tx.plans[planId].update(planPatch))
}

export function setPlanNavGlyph(
  planId: string,
  glyph: { iconId?: string; color?: string },
) {
  db.transact(
    db.tx.plans[planId].update({
      ...(glyph.iconId !== undefined ? { navIconId: glyph.iconId } : {}),
      ...(glyph.color !== undefined ? { navColor: glyph.color } : {}),
    }),
  )
}

export { planExpandedForPhaseDates as timelineExpandedForTaskDates }

/** @deprecated Use updatePhaseDates */
export const updateTaskDates = updatePhaseDates

/** @deprecated Use setPhaseStatus */
export const setTaskStatus = setPhaseStatus

/** @deprecated Use updatePhaseDetails */
export const updateTaskDetails = updatePhaseDetails

/** @deprecated Use toggleChecklistTask */
export const toggleSubtask = toggleChecklistTask

/** @deprecated Use deletePhase */
export const deleteTask = deletePhase

/** @deprecated Use createPhaseInPlan */
export const createTaskInTimeline = createPhaseInPlan

/** @deprecated Use addPlanNote */
export const addTimelineEventNote = addPlanNote

/** @deprecated Use deletePlan */
export const deleteEvent = deletePlan

/** @deprecated Use patchPlanOverview */
export const patchEventOverview = patchPlanOverview

/** @deprecated Use setPlanNavGlyph */
export const setEventNavGlyph = setPlanNavGlyph
