import type { TaskStatus } from '@/types/domain'

const UNKNOWN_TASK_BADGE = {
  label: 'Unknown',
  className: 'border-[0.5px] border-border bg-muted text-muted-foreground',
} as const

/** Row / badge surfaces: translucent fill + hairline border + full-strength text (same recipe as Missed). */
const TASK_BADGE_MAP: Record<TaskStatus, { label: string; className: string }> = {
  todo: {
    label: 'Todo',
    className: 'border-[0.5px] border-muted-foreground/50 bg-muted/25 text-white',
  },
  in_progress: {
    label: 'In progress',
    className: 'border-[0.5px] border-white bg-white/[0.07] text-white',
  },
  in_review: {
    label: 'In review',
    className:
      'border-[0.5px] border-[#d8cafd] bg-[#d8cafd]/20 text-[#f3efff]',
  },
  blocked: {
    label: 'Missed',
    className: 'border-[0.5px] border-coral bg-coral/12 text-coral',
  },
  done: {
    label: 'Done',
    className: 'border-[0.5px] border-[#34FFB4] bg-[#34FFB4]/12 text-[#34FFB4]',
  },
}

export function taskStatusBadgeTone(status: string): string {
  const row = TASK_BADGE_MAP[status as TaskStatus]
  return row?.className ?? UNKNOWN_TASK_BADGE.className
}

export function taskStatusBadgeDefinition(status: string): { label: string; className: string } {
  return TASK_BADGE_MAP[status as TaskStatus] ?? UNKNOWN_TASK_BADGE
}
