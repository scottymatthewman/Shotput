import { addDays, format, startOfDay } from 'date-fns'
import type {
  ActivityEvent,
  Phase,
  PhaseStatus,
  Plan,
  PlanOverviewPatch,
} from '@/types/domain'
import { clampPhaseDatesAfterMerge, coerceOrderedPhaseDates } from '@/lib/phaseDateOrder'
import { normalizePhaseStatus } from '@/lib/phaseStatus'
import { CURRENT_USER_ID } from '@/state/uiStore'
import { db, hasInstantConfig } from '@/lib/instant/db'

function json(value: unknown): string {
  return JSON.stringify(value)
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
  if (!hasInstantConfig || ops.length === 0) return
  db.transact(ops as Parameters<typeof db.transact>[0])
}

export function updatePhaseDates(phase: Phase, start: string, end: string) {
  const ordered = coerceOrderedPhaseDates(start, end)
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
  clampPhaseDatesAfterMerge(merged, {
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

  transact(db.tx.phases[phase.id].update(phaseUpdate))
}

export function toggleChecklistTask(phase: Phase, checklistTaskId: string) {
  const tasks = phase.tasks.map((t) =>
    t.id === checklistTaskId ? { ...t, completed: !t.completed } : t,
  )
  transact(db.tx.phases[phase.id].update({ tasksJson: json(tasks) }))
}

export function deletePhase(phase: Phase) {
  transact(
    db.tx.phases[phase.id].delete(),
    appendActivity({
    timestamp: new Date().toISOString(),
    actorId: CURRENT_USER_ID,
    actorIsAgent: false,
    verb: 'deleted',
    objectType: 'phase',
    objectId: phase.id,
    objectLabel: phase.title,
    planId: phase.planId,
    }),
  )
}

export function buildNewPhaseForPlan(plan: Plan, id: string): Phase {
  const planStart = startOfDay(new Date(`${plan.start}T12:00:00`))
  const planEnd = startOfDay(new Date(`${plan.end}T12:00:00`))
  let spanEnd = addDays(planStart, 2)
  if (spanEnd > planEnd) spanEnd = planEnd
  const { start, end } = coerceOrderedPhaseDates(
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

export function createPhaseInPlan(plan: Plan, overrides?: Partial<Phase>): Phase {
  const id = crypto.randomUUID()
  const phase = { ...buildNewPhaseForPlan(plan, id), ...overrides, id, planId: plan.id }
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
  transact(
    ...ops,
    appendActivity({
      timestamp: new Date().toISOString(),
      actorId: CURRENT_USER_ID,
      actorIsAgent: false,
      verb: 'deleted',
      objectType: 'plan',
      objectId: planId,
      objectLabel: planName,
      planId,
    }),
  )
}

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
    const ordered = coerceOrderedPhaseDates(patch.start ?? '', patch.end ?? '')
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

  transact(db.tx.plans[planId].update(planPatch))
}

export function setPlanNavGlyph(
  planId: string,
  glyph: { iconId?: string; color?: string },
) {
  transact(
    db.tx.plans[planId].update({
      ...(glyph.iconId !== undefined ? { navIconId: glyph.iconId } : {}),
      ...(glyph.color !== undefined ? { navColor: glyph.color } : {}),
    }),
  )
}
