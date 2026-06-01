import { PhaseStatusGlyph } from '@/components/dance/phaseStatusGlyphs'
import { phaseStatusBadgeDefinition } from '@/components/dance/phaseStatusBadgeStyles'
import { Badge } from '@/components/ui/badge'
import type { PhaseStatus, PlanStatus } from '@/types/domain'
import { cn } from '@/lib/utils'

const phaseStatusIconClass: Record<PhaseStatus, string> = {
  backlog: 'text-status-todo',
  todo: 'text-status-todo',
  in_progress: 'text-status-progress',
  in_review: 'text-status-review',
  blocked: 'text-status-blocked',
  done: 'text-status-done',
}

function isPhaseStatus(status: string): status is PhaseStatus {
  return (
    status === 'backlog' ||
    status === 'todo' ||
    status === 'in_progress' ||
    status === 'in_review' ||
    status === 'blocked' ||
    status === 'done'
  )
}

/** Compact status glyph for dense layouts (e.g. Gantt bars). */
export function PhaseStatusIcon({
  status,
  className,
}: {
  status: PhaseStatus
  className?: string
}) {
  const known = isPhaseStatus(status)
  const tone = known ? phaseStatusIconClass[status] : 'text-muted-foreground'
  return (
    <PhaseStatusGlyph status={known ? status : 'todo'} className={cn('size-4 shrink-0', tone, className)} aria-hidden />
  )
}

export function StatusBadge({ status }: { status: PhaseStatus }) {
  const cfg = phaseStatusBadgeDefinition(status)
  return (
    <Badge variant="status" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}

const UNKNOWN_PLAN_BADGE = {
  label: 'Unknown',
  className: 'plan-badge-paused',
} as const

const planStatusMap: Record<PlanStatus, { label: string; className: string }> = {
  healthy: {
    label: 'Healthy',
    className: 'plan-badge-healthy',
  },
  at_risk: {
    label: 'At risk',
    className: 'plan-badge-at-risk',
  },
  paused: {
    label: 'Paused',
    className: 'plan-badge-paused',
  },
}

function isPlanStatus(status: string): status is PlanStatus {
  return status === 'healthy' || status === 'at_risk' || status === 'paused'
}

export function PlanStatusBadge({ status }: { status: PlanStatus | string }) {
  const cfg = isPlanStatus(status) ? planStatusMap[status] : UNKNOWN_PLAN_BADGE
  return (
    <Badge variant="status" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}
