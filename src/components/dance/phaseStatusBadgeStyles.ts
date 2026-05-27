import type { PhaseStatus } from '@/types/domain'

const UNKNOWN_PHASE_BADGE = {
  label: 'Unknown',
  className: 'phase-badge bg-muted text-muted-foreground',
} as const

const PHASE_BADGE_CLASS: Record<PhaseStatus, string> = {
  todo: 'phase-badge phase-badge-todo',
  in_progress: 'phase-badge phase-badge-in-progress',
  in_review: 'phase-badge phase-badge-in-review',
  blocked: 'phase-badge phase-badge-blocked',
  done: 'phase-badge phase-badge-done',
}

const PHASE_BADGE_LABEL: Record<PhaseStatus, string> = {
  todo: 'Todo',
  in_progress: 'In progress',
  in_review: 'In review',
  blocked: 'Missed',
  done: 'Done',
}

export function phaseStatusBadgeTone(status: string): string {
  const row = PHASE_BADGE_CLASS[status as PhaseStatus]
  return row ?? UNKNOWN_PHASE_BADGE.className
}

export function phaseStatusBadgeDefinition(status: string): { label: string; className: string } {
  const key = status as PhaseStatus
  if (PHASE_BADGE_CLASS[key]) {
    return { label: PHASE_BADGE_LABEL[key], className: PHASE_BADGE_CLASS[key] }
  }
  return UNKNOWN_PHASE_BADGE
}
