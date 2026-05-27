import { createInitialWorkspace, initialActivityLog } from '@/mock/fixtures'
import type { ActivityEvent, Plan, Workspace } from '@/types/domain'
import { db, hasInstantConfig } from '@/lib/instant/db'
import { useLocalWorkspaceStore } from '@/state/localWorkspaceStore'

function json(value: unknown): string {
  return JSON.stringify(value)
}

export function buildWorkspaceTransact(
  workspace: Workspace,
  activityLog: ActivityEvent[],
) {
  const tx = db.tx
  const ops: unknown[] = []

  ops.push(tx.workspaces[workspace.id].update({ name: workspace.name }))

  for (const u of Object.values(workspace.users)) {
    ops.push(
      tx.users[u.id]
        .update({
          name: u.name,
          email: u.email,
          ...(u.avatarUrl ? { avatarUrl: u.avatarUrl } : {}),
        })
        .link({ workspace: workspace.id }),
    )
  }

  for (const a of Object.values(workspace.agents)) {
    ops.push(
      tx.agents[a.id]
        .update({ name: a.name, description: a.description })
        .link({ workspace: workspace.id }),
    )
  }

  for (const p of Object.values(workspace.plans)) {
    ops.push(
      tx.plans[p.id]
        .update({
          name: p.name,
          description: p.description,
          status: p.status,
          ownerUserId: p.ownerUserId,
          start: p.start,
          end: p.end,
          ...(p.location ? { location: p.location } : {}),
          ...(p.externalRecord
            ? { externalRecordJson: json(p.externalRecord) }
            : {}),
          ...(p.teamMemberUserIds
            ? { teamMemberUserIdsJson: json(p.teamMemberUserIds) }
            : {}),
          ...(p.industryEventId ? { industryEventId: p.industryEventId } : {}),
          ...(p.budgetCents != null ? { budgetCents: p.budgetCents } : {}),
          ...(p.budgetCurrency ? { budgetCurrency: p.budgetCurrency } : {}),
        })
        .link({ workspace: workspace.id }),
    )
  }

  for (const ph of Object.values(workspace.phases)) {
    const plan = workspace.plans[ph.planId]
    const order = plan?.phaseIds.indexOf(ph.id) ?? 0
    ops.push(
      tx.phases[ph.id]
        .update({
          title: ph.title,
          description: ph.description,
          status: ph.status,
          statusIsManual: ph.statusIsManual ?? true,
          priority: ph.priority,
          section: ph.section,
          start: ph.start,
          end: ph.end,
          assigneeUserIdsJson: json(ph.assigneeUserIds),
          assigneeAgentIdsJson: json(ph.assigneeAgentIds),
          tasksJson: json(ph.tasks),
          sortOrder: order >= 0 ? order : 0,
          ...(ph.budgetAllocatedCents != null
            ? { budgetAllocatedCents: ph.budgetAllocatedCents }
            : {}),
          ...(ph.budgetActualCents != null ? { budgetActualCents: ph.budgetActualCents } : {}),
        })
        .link({ plan: ph.planId }),
    )
  }

  for (const e of activityLog) {
    ops.push(
      tx.activityEvents[e.id].update({
        timestamp: e.timestamp,
        actorId: e.actorId,
        actorIsAgent: e.actorIsAgent,
        verb: e.verb,
        objectType: e.objectType,
        objectId: e.objectId,
        objectLabel: e.objectLabel,
        ...(e.planId ? { planId: e.planId } : {}),
        ...(e.payload ? { payloadJson: json(e.payload) } : {}),
      }),
    )
  }

  return ops
}

export function transactAll(ops: unknown[]) {
  if (!hasInstantConfig || ops.length === 0) return
  db.transact(ops as Parameters<typeof db.transact>[0])
}

export async function seedInstantIfEmpty(): Promise<boolean> {
  try {
    const resp = await db.queryOnce({ workspaces: {} })
    if (resp.data?.workspaces?.length) return false

    const workspace = createInitialWorkspace()
    const activityLog = initialActivityLog
    transactAll(buildWorkspaceTransact(workspace, activityLog))
    return true
  } catch (err) {
    console.error('[Dance] Instant seed failed:', err)
    return false
  }
}

export function restoreWorkspaceSnapshot(
  workspace: Workspace,
  activityLog: ActivityEvent[],
) {
  if (hasInstantConfig) {
    transactAll(buildWorkspaceTransact(workspace, activityLog))
    return
  }
  useLocalWorkspaceStore.getState().setSnapshot({
    workspace,
    activityLog,
    planNavGlyph: useLocalWorkspaceStore.getState().planNavGlyph,
  })
}

export function planNavPatchTx(plan: Plan, glyph: { iconId?: string; color?: string }) {
  return db.tx.plans[plan.id].update({
    ...(glyph.iconId !== undefined ? { navIconId: glyph.iconId } : {}),
    ...(glyph.color !== undefined ? { navColor: glyph.color } : {}),
  })
}
