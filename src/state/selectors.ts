import type { Phase, Plan, Workspace } from '@/types/domain'
import type { DanceStore } from '@/state/store'

export function selectSidebarNav(s: Pick<DanceStore, 'workspace'>) {
  return {
    name: s.workspace.name,
    plans: s.workspace.plans,
  }
}

export interface PlanBundle {
  plan: Plan
  phaseIds: string[]
  phases: Record<string, Phase>
}

export function selectPlanBundle(workspace: Workspace, planId: string): PlanBundle | null {
  const plan = workspace.plans[planId]
  if (!plan) return null
  const phases: Record<string, Phase> = {}
  for (const id of plan.phaseIds) {
    const ph = workspace.phases[id]
    if (ph) phases[id] = ph
  }
  return { plan, phaseIds: plan.phaseIds, phases }
}

/** @deprecated Use selectPlanBundle */
export function selectTimelineBundle(
  workspace: Workspace,
  planId: string,
): {
  project: Plan
  timeline: Plan
  taskIds: string[]
  tasks: Record<string, Phase>
} | null {
  const bundle = selectPlanBundle(workspace, planId)
  if (!bundle) return null
  return {
    project: bundle.plan,
    timeline: bundle.plan,
    taskIds: bundle.phaseIds,
    tasks: bundle.phases,
  }
}

export function selectWorkspaceUsers(s: Pick<DanceStore, 'workspace'>) {
  return s.workspace.users
}

export function selectWorkspaceAgents(s: Pick<DanceStore, 'workspace'>) {
  return s.workspace.agents
}
