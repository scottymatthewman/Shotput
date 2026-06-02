import { PhaseStatusGlyph } from '@/components/dance/phaseStatusGlyphs'
import { phaseStatusBadgeDefinition } from '@/components/dance/phaseStatusBadgeStyles'
import { Badge } from '@/components/ui/badge'
import type { PhaseStatus, PlanStatus } from '@/types/domain'
import { cn } from '@/lib/utils'
import { CircleAlert, CircleCheck, CircleDashed, type LucideIcon } from 'lucide-react'

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

const planStatusIconMap: Record<
  PlanStatus,
  { Icon: LucideIcon; iconClassName: string; label: string }
> = {
  healthy: { Icon: CircleCheck, iconClassName: 'text-primary', label: 'Healthy' },
  at_risk: { Icon: CircleAlert, iconClassName: 'text-destructive', label: 'At risk' },
  paused: { Icon: CircleDashed, iconClassName: 'text-muted-foreground', label: 'Paused' },
}

/** Plan health glyph for dense list rows (e.g. plan index cards). */
export function PlanStatusIcon({
  status,
  className,
}: {
  status: PlanStatus | string
  className?: string
}) {
  const cfg = isPlanStatus(status) ? planStatusIconMap[status] : planStatusIconMap.paused
  const Icon = cfg.Icon
  return (
    <span
      className={cn('flex size-7 shrink-0 items-center justify-center', className)}
      title={cfg.label}
    >
      <Icon className={cn('size-6', cfg.iconClassName)} aria-hidden />
      <span className="sr-only">{cfg.label}</span>
    </span>
  )
}
