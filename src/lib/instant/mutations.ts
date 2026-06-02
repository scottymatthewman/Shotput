import { addDays, format, startOfDay } from 'date-fns'
import { PLAN_TEMPLATE_RECIPES } from '@/config/planTemplates'
import type {
  ActivityEvent,
  Phase,
  PhaseProperties,
  PhaseStatus,
  Plan,
  PlanOverviewPatch,
  PlanType,
} from '@/types/domain'
import { clampPhaseDatesAfterMerge, coerceOrderedPhaseDates } from '@/lib/phaseDateOrder'
import { phaseToInstantUpdate } from '@/lib/instant/phaseEntity'
import { mergePhaseProperties } from '@/lib/phaseProperties'
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
      | 'phaseKind'
      | 'hardStop'
      | 'dependencyIds'
      | 'assigneeUserIds'
      | 'statusIsManual'
      | 'budgetAllocatedCents'
      | 'budgetActualCents'
      | 'properties'
    >
  >,
) {
  const merged = { ...phase, ...patch }
  merged.status = normalizePhaseStatus(merged.status)
  clampPhaseDatesAfterMerge(merged, {
    start: Object.prototype.hasOwnProperty.call(patch, 'start'),
    end: Object.prototype.hasOwnProperty.call(patch, 'end'),
  })

  const phaseUpdate = phaseToInstantUpdate(merged)

  if ('budgetAllocatedCents' in patch) {
    phaseUpdate.budgetAllocatedCents = merged.budgetAllocatedCents ?? undefined
  }
  if ('budgetActualCents' in patch) {
    phaseUpdate.budgetActualCents = merged.budgetActualCents ?? undefined
  }

  transact(db.tx.phases[phase.id].update(phaseUpdate))
}

export function updatePhaseProperties(phase: Phase, patch: PhaseProperties) {
  const properties = mergePhaseProperties(phase.properties, patch)
  transact(
    db.tx.phases[phase.id].update({
      propertiesJson: json(properties),
    }),
  )
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
          ...phaseToInstantUpdate(phase),
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

export interface CreatePlanInput {
  name: string
  description?: string
  start?: string
  end?: string
  ownerUserId?: string
  location?: string
}

function defaultPlanSpan(): { start: string; end: string } {
  const start = startOfDay(new Date())
  const end = addDays(start, 90)
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

function phaseDatesFromTemplate(
  planStart: string,
  startOffsetDays: number,
  durationDays: number,
): { start: string; end: string } {
  const base = startOfDay(new Date(`${planStart}T12:00:00`))
  const start = addDays(base, startOffsetDays)
  const end = addDays(start, Math.max(durationDays - 1, 0))
  return coerceOrderedPhaseDates(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'))
}

/** Build plan + template phases in memory (no Instant write). */
export function buildPlanFromTemplate(
  planType: PlanType,
  input: CreatePlanInput,
): { plan: Plan; phases: Phase[] } {
  const recipe = PLAN_TEMPLATE_RECIPES[planType]
  const span = defaultPlanSpan()
  const start = input.start ?? span.start
  const end = input.end ?? span.end
  const ordered = coerceOrderedPhaseDates(start, end)
  const planId = crypto.randomUUID()
  const ownerUserId = input.ownerUserId ?? CURRENT_USER_ID

  const plan: Plan = {
    id: planId,
    name: input.name.trim() || recipe.label,
    description: input.description?.trim() ?? recipe.description,
    phaseIds: [],
    status: 'healthy',
    ownerUserId,
    start: ordered.start,
    end: ordered.end,
    planType,
    ...(input.location?.trim() ? { location: input.location.trim() } : {}),
  }

  const phases: Phase[] = recipe.defaultPhases.map((seed) => {
    const id = crypto.randomUUID()
    const { start: phStart, end: phEnd } = phaseDatesFromTemplate(
      ordered.start,
      seed.startOffsetDays,
      seed.durationDays,
    )
    const status = seed.status ?? (seed.startOffsetDays === 0 ? 'todo' : 'backlog')
    return {
      id,
      planId,
      title: seed.title,
      description: '',
      status,
      statusIsManual: true,
      priority: 'medium',
      phaseKind: seed.phaseKind,
      section: seed.section,
      start: phStart,
      end: phEnd,
      assigneeUserIds: [],
      assigneeAgentIds: [],
      tasks: [],
    }
  })

  plan.phaseIds = phases.map((p) => p.id)

  return { plan, phases }
}

/** Persist a newly built plan to Instant (call after optimistic overlay). */
export function transactPlanFromTemplate(
  workspaceId: string,
  plan: Plan,
  phases: Phase[],
): void {
  if (!hasInstantConfig) return

  const planRow: Record<string, unknown> = {
    name: plan.name,
    description: plan.description,
    status: plan.status,
    ownerUserId: plan.ownerUserId,
    start: plan.start,
    end: plan.end,
  }
  if (plan.planType) planRow.planType = plan.planType
  if (plan.location) planRow.location = plan.location

  const ops: unknown[] = [
    db.tx.plans[plan.id].update(planRow).link({ workspace: workspaceId }),
  ]

  phases.forEach((phase, sortOrder) => {
    ops.push(
      db.tx.phases[phase.id]
        .update({
          ...phaseToInstantUpdate(phase),
          sortOrder,
        })
        .link({ plan: plan.id }),
    )
  })

  ops.push(
    appendActivity({
      timestamp: new Date().toISOString(),
      actorId: CURRENT_USER_ID,
      actorIsAgent: false,
      verb: 'created',
      objectType: 'plan',
      objectId: plan.id,
      objectLabel: plan.name,
      planId: plan.id,
      payload: { planType: plan.planType },
    }),
  )

  transact(...ops)
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
  if (patch.ownerUserId !== undefined) planPatch.ownerUserId = patch.ownerUserId
  if ('budgetCents' in patch) {
    planPatch.budgetCents = patch.budgetCents ?? undefined
  }
  if ('budgetCurrency' in patch) {
    planPatch.budgetCurrency = patch.budgetCurrency ?? undefined
  }
  if (patch.planType !== undefined) {
    planPatch.planType = patch.planType
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
