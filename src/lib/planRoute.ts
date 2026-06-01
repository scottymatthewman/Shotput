import type { Workspace } from '@/types/domain'

export function resolvePlanWorkspaceRoute(
  pathname: string,
  workspace: Workspace,
): { planId: string } | null {
  const m = pathname.match(/^\/plans\/([^/]+)\/?$/)
  if (!m?.[1]) return null
  const planId = m[1]
  if (!workspace.plans[planId]) return null
  return { planId }
}

export function resolvePlanId(workspace: Workspace, planId: string): string | undefined {
  return workspace.plans[planId] ? planId : undefined
}

/** Active plan from any `/plans/:planId/...` route. */
export function resolveActivePlanId(
  pathname: string,
  workspace: Workspace,
): string | null {
  const m = pathname.match(/^\/plans\/([^/]+)/)
  if (!m?.[1]) return null
  return workspace.plans[m[1]] ? m[1] : null
}

export function phaseDetailPath(planId: string, phaseId: string) {
  return `/plans/${planId}/phases/${phaseId}`
}

export type PhaseDetailLocationState = {
  autoFocusTitle?: boolean
}

export function resolvePhaseDetailRoute(
  pathname: string,
  workspace: Workspace,
): { planId: string; phaseId: string } | null {
  const m = pathname.match(/^\/plans\/([^/]+)\/phases\/([^/]+)\/?$/)
  if (!m?.[1] || !m[2]) return null
  const planId = m[1]
  const phaseId = m[2]
  const phase = workspace.phases[phaseId]
  if (!phase || phase.planId !== planId) return null
  return { planId, phaseId }
}
