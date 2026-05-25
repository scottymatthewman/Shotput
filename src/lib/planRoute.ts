import type { Workspace } from '@/types/domain'

export function resolvePlanWorkspaceRoute(
  pathname: string,
  workspace: Workspace,
): { planId: string } | null {
  const m = pathname.match(/^\/plan\/([^/]+)\/?$/)
  if (!m?.[1]) return null
  const planId = m[1]
  if (!workspace.plans[planId]) return null
  return { planId }
}

/** @deprecated Use resolvePlanWorkspaceRoute */
export function resolvePlanId(workspace: Workspace, planId: string): string | undefined {
  return workspace.plans[planId] ? planId : undefined
}

/** @deprecated Use resolvePlanWorkspaceRoute */
export function resolveEventPlannerRoute(
  pathname: string,
  workspace: Workspace,
): { eventId: string; timelineId: string } | null {
  const route = resolvePlanWorkspaceRoute(pathname, workspace)
  if (!route) return null
  return { eventId: route.planId, timelineId: route.planId }
}

/** @deprecated Use resolvePlanId */
export const getPlannerTimelineIdForEvent = resolvePlanId
