import type { InstaQLParams, InstaQLResult } from '@instantdb/react'
import type {
  ActivityEvent,
  Agent,
  ExternalCrmRecord,
  Phase,
  Plan,
  Task,
  User,
  Workspace,
} from '@/types/domain'
import type { AppSchema } from '@/instant.schema'
import type { PlanNavGlyph } from '@/lib/planIconRegistry'
import {
  DEFAULT_PLAN_NAV_COLOR,
  DEFAULT_PLAN_NAV_ICON_ID,
} from '@/lib/planIconRegistry'
import { normalizePlanType } from '@/lib/planType'
import { parsePhaseProperties } from '@/lib/phaseProperties'
import { normalizePhaseKind } from '@/lib/phaseKind'
import { normalizePhaseStatus } from '@/lib/phaseStatus'

export const workspaceQuery = {
  workspaces: {
    users: {},
    agents: {},
    plans: {
      phases: {},
    },
  },
  activityEvents: {},
} satisfies InstaQLParams<AppSchema>

export type WorkspaceQueryResult = InstaQLResult<AppSchema, typeof workspaceQuery>

type InstantPhase = NonNullable<
  NonNullable<WorkspaceQueryResult['workspaces'][number]['plans']>[number]['phases']
>[number]

type InstantWorkspace = WorkspaceQueryResult['workspaces'][number]

type InstantActivity = WorkspaceQueryResult['activityEvents'][number]

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function mapPhase(p: InstantPhase, planId: string): Phase {
  const phaseKind = normalizePhaseKind(p.phaseKind)
  const properties = parsePhaseProperties(p.propertiesJson)
  const dependencyIds = parseJson<string[]>(p.dependencyIdsJson, [])

  return {
    id: p.id,
    planId,
    title: p.title,
    description: p.description,
    status: normalizePhaseStatus(p.status),
    statusIsManual: p.statusIsManual,
    priority: p.priority as Phase['priority'],
    ...(phaseKind ? { phaseKind } : {}),
    section: p.section,
    start: p.start,
    end: p.end,
    ...(p.hardStop ? { hardStop: p.hardStop } : {}),
    ...(dependencyIds.length ? { dependencyIds } : {}),
    assigneeUserIds: parseJson<string[]>(p.assigneeUserIdsJson, []),
    assigneeAgentIds: parseJson<string[]>(p.assigneeAgentIdsJson, []),
    tasks: parseJson<Task[]>(p.tasksJson, []),
    ...(properties ? { properties } : {}),
    ...(p.budgetAllocatedCents != null ? { budgetAllocatedCents: p.budgetAllocatedCents } : {}),
    ...(p.budgetActualCents != null ? { budgetActualCents: p.budgetActualCents } : {}),
  }
}

export function assembleWorkspaceFromInstant(
  workspaces: InstantWorkspace[] | undefined,
  activityRows: InstantActivity[] | undefined,
): {
  workspace: Workspace | null
  activityLog: ActivityEvent[]
  planNavGlyph: Record<string, PlanNavGlyph>
} {
  const ws = workspaces?.[0]
  if (!ws) {
    return { workspace: null, activityLog: [], planNavGlyph: {} }
  }

  const users: Record<string, User> = {}
  for (const u of ws.users ?? []) {
    users[u.id] = { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl }
  }

  const agents: Record<string, Agent> = {}
  for (const a of ws.agents ?? []) {
    agents[a.id] = { id: a.id, name: a.name, description: a.description }
  }

  const plans: Record<string, Plan> = {}
  const phases: Record<string, Phase> = {}
  const planNavGlyph: Record<string, PlanNavGlyph> = {}

  for (const p of ws.plans ?? []) {
    const phaseIds = (p.phases ?? [])
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((ph) => ph.id)
    for (const ph of p.phases ?? []) {
      phases[ph.id] = mapPhase(ph, p.id)
    }

    const externalRecord = parseJson<ExternalCrmRecord | undefined>(
      p.externalRecordJson,
      undefined,
    )
    const teamMemberUserIds = parseJson<string[] | undefined>(
      p.teamMemberUserIdsJson,
      undefined,
    )

    plans[p.id] = {
      id: p.id,
      name: p.name,
      description: p.description,
      phaseIds,
      status: p.status as Plan['status'],
      ownerUserId: p.ownerUserId,
      start: p.start,
      end: p.end,
      ...(p.location ? { location: p.location } : {}),
      ...(externalRecord ? { externalRecord } : {}),
      ...(teamMemberUserIds ? { teamMemberUserIds } : {}),
      ...(p.industryEventId ? { industryEventId: p.industryEventId } : {}),
      ...(p.budgetCents != null ? { budgetCents: p.budgetCents } : {}),
      ...(p.budgetCurrency ? { budgetCurrency: p.budgetCurrency } : {}),
      ...(normalizePlanType(p.planType) ? { planType: normalizePlanType(p.planType) } : {}),
    }

    planNavGlyph[p.id] = {
      iconId: p.navIconId ?? DEFAULT_PLAN_NAV_ICON_ID,
      color: p.navColor ?? DEFAULT_PLAN_NAV_COLOR,
    }
  }

  const workspace: Workspace = {
    id: ws.id,
    name: ws.name,
    userIds: Object.keys(users),
    agentIds: Object.keys(agents),
    users,
    agents,
    plans,
    phases,
  }

  const activityLog: ActivityEvent[] = (activityRows ?? [])
    .map((e) => ({
      id: e.id,
      timestamp: e.timestamp,
      actorId: e.actorId,
      actorIsAgent: e.actorIsAgent,
      verb: e.verb as ActivityEvent['verb'],
      objectType: e.objectType as ActivityEvent['objectType'],
      objectId: e.objectId,
      objectLabel: e.objectLabel,
      planId: e.planId,
      payload: parseJson<Record<string, unknown> | undefined>(e.payloadJson, undefined),
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return { workspace, activityLog, planNavGlyph }
}
