import type { Phase, Plan, Workspace } from '@/types/domain'
import type { PlansStoreSlice } from '@/state/plansStore'

export function selectSidebarNav(s: Pick<PlansStoreSlice, 'workspace'>) {
  return {
    name: s.workspace.name,
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

export function selectWorkspaceUsers(s: Pick<PlansStoreSlice, 'workspace'>) {
  return s.workspace.users
}

export function selectWorkspaceAgents(s: Pick<PlansStoreSlice, 'workspace'>) {
  return s.workspace.agents
}
