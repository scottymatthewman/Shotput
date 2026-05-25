import { taskPrioritySortRank } from '@/lib/taskPriority'
import { getEffectivePhaseStatus } from '@/lib/phaseStatus'
import type { Phase, PhaseStatus, Workspace } from '@/types/domain'

export const PHASE_STATUS_TABLE_SORT_RANK: Record<PhaseStatus, number> = {
  todo: 1,
  in_progress: 2,
  in_review: 3,
  blocked: 4,
  done: 5,
}

/** @deprecated Use PHASE_STATUS_TABLE_SORT_RANK */
export const TASK_STATUS_TABLE_SORT_RANK = PHASE_STATUS_TABLE_SORT_RANK

export function comparePhasesDefaultPlanOrder(a: Phase, b: Phase, workspace: Workspace): number {
  const resolve = (p: Phase) => workspace.phases[p.id] ?? p
  const liveA = resolve(a)
  const liveB = resolve(b)
  const byStart = liveA.start.localeCompare(liveB.start)
  if (byStart !== 0) return byStart
  const byTitle = liveA.title.localeCompare(liveB.title, undefined, { sensitivity: 'base' })
  if (byTitle !== 0) return byTitle
  return a.id.localeCompare(b.id)
}

export function comparePhasesDefaultPlanTableOrder(
  a: Phase,
  b: Phase,
  workspace: Workspace,
): number {
  const resolve = (p: Phase) => workspace.phases[p.id] ?? p
  const pr =
    taskPrioritySortRank(resolve(a).priority) - taskPrioritySortRank(resolve(b).priority)
  if (pr !== 0) return pr
  return comparePhasesDefaultPlanOrder(a, b, workspace)
}

export function comparePhasesAssignedDigest(a: Phase, b: Phase): number {
  const sa = getEffectivePhaseStatus(a)
  const sb = getEffectivePhaseStatus(b)
  const incompleteA = sa === 'done' ? 1 : 0
  const incompleteB = sb === 'done' ? 1 : 0
  const inc = incompleteA - incompleteB
  if (inc !== 0) return inc
  const pr = taskPrioritySortRank(a.priority) - taskPrioritySortRank(b.priority)
  if (pr !== 0) return pr
  const end = a.end.localeCompare(b.end)
  if (end !== 0) return end
  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
}

export function comparePhasesByStartThenTitle(a: Phase, b: Phase): number {
  const byStart = a.start.localeCompare(b.start)
  if (byStart !== 0) return byStart
  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
}

/** @deprecated Use comparePhasesDefaultPlanOrder */
export const compareTasksDefaultTimelineOrder = comparePhasesDefaultPlanOrder

/** @deprecated Use comparePhasesDefaultPlanTableOrder */
export const compareTasksDefaultTimelineTableOrder = comparePhasesDefaultPlanTableOrder

/** @deprecated Use comparePhasesAssignedDigest */
export const compareTasksAssignedDigest = comparePhasesAssignedDigest

/** @deprecated Use comparePhasesByStartThenTitle */
export const compareTasksByStartThenTitle = comparePhasesByStartThenTitle
