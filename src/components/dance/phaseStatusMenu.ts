import type { PhaseStatus } from '@/types/domain'

/** After closing a portaled menu, some browsers emit a click on the element below; skip opening the phase row. */
let suppressTimelineRowClickUntil = 0

export function shouldSuppressTimelineRowClick() {
  return Date.now() < suppressTimelineRowClickUntil
}

/** Called after selecting a new status so the synthesized click does not bubble into row navigation. */
export function armTimelineRowClickSuppression(durationMs = 400) {
  suppressTimelineRowClickUntil = Date.now() + durationMs
}

export function phaseStatusMenuLabel(status: string) {
  const m: Record<PhaseStatus, string> = {
    backlog: 'Backlog',
    todo: 'Todo',
    in_progress: 'In progress',
    in_review: 'In review',
    blocked: 'Missed',
    done: 'Done',
  }
  return (m as Partial<Record<string, string>>)[status] ?? 'Unknown'
}
