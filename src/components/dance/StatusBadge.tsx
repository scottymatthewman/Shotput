import { TaskStatusGlyph } from '@/components/dance/taskStatusGlyphs'
import { taskStatusBadgeDefinition } from '@/components/dance/taskStatusBadgeStyles'
import { Badge } from '@/components/ui/badge'
import type { TaskStatus, PlanStatus } from '@/types/domain'
import { cn } from '@/lib/utils'

const taskStatusIconClass: Record<TaskStatus, string> = {
  todo: 'text-muted-foreground',
  in_progress: 'text-white',
  in_review: 'text-assignee-blue',
  blocked: 'text-coral',
  done: 'text-[#34FFB4]',
}

function isTaskStatus(status: string): status is TaskStatus {
  return (
    status === 'todo' ||
    status === 'in_progress' ||
    status === 'in_review' ||
    status === 'blocked' ||
    status === 'done'
  )
}

/** Compact status glyph for dense layouts (e.g. Gantt bars). */
export function TaskStatusIcon({
  status,
  className,
}: {
  status: TaskStatus
  className?: string
}) {
  const known = isTaskStatus(status)
  const tone = known ? taskStatusIconClass[status] : 'text-muted-foreground'
  return (
    <TaskStatusGlyph status={known ? status : 'todo'} className={cn('size-4 shrink-0', tone, className)} aria-hidden />
  )
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = taskStatusBadgeDefinition(status)
  return (
    <Badge variant="outline" className={cn('font-normal', cfg.className)}>
      {cfg.label}
    </Badge>
  )
}

const UNKNOWN_TIMELINE_BADGE = {
  label: 'Unknown',
  className: 'border-border bg-muted text-muted-foreground',
} as const

const timelineMap: Record<PlanStatus, { label: string; className: string }> = {
  healthy: {
    label: 'Healthy',
    className: 'border-primary/40 bg-primary/15 text-primary',
  },
  at_risk: {
    label: 'At risk',
    className: 'border-destructive/40 bg-destructive/15 text-destructive',
  },
  paused: {
    label: 'Paused',
    className: 'border-border bg-muted text-muted-foreground',
  },
}

function isPlanStatus(status: string): status is PlanStatus {
  return status === 'healthy' || status === 'at_risk' || status === 'paused'
}

export function PlanStatusBadge({ status }: { status: PlanStatus | string }) {
  const cfg = isPlanStatus(status) ? timelineMap[status] : UNKNOWN_TIMELINE_BADGE
  return (
    <Badge variant="outline" className={cn('font-normal', cfg.className)}>
      {cfg.label}
    </Badge>
  )
}

/** @deprecated Use PlanStatusBadge */
export const TimelineStatusBadge = PlanStatusBadge
