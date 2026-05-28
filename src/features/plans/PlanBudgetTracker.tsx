import {
  computePlanBudgetRollup,
  formatBudgetCentsCompact,
  planBudgetStatusLabel,
} from '@/lib/budget'
import { cn } from '@/lib/utils'
import type { Plan, Workspace } from '@/types/domain'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

type PlanBudgetTrackerProps = {
  plan: Plan
  workspace: Workspace
  planId: string
  className?: string
}

export function PlanBudgetTracker({ plan, workspace, planId, className }: PlanBudgetTrackerProps) {
  const rollup = useMemo(() => computePlanBudgetRollup(plan, workspace), [plan, workspace])
  const statusLabel = planBudgetStatusLabel(rollup)
  const hasActivity =
    rollup.actualCents > 0 || rollup.allocatedCents > 0 || rollup.ceilingCents != null
  const progressPct =
    rollup.ceilingCents != null && rollup.ceilingCents > 0
      ? Math.min(100, (rollup.actualCents / rollup.ceilingCents) * 100)
      : null

  return (
    <div className={cn('flex min-w-0 max-w-md flex-col items-start gap-1.5', className)}>
      {progressPct != null ? (
        <div
          className="h-1 w-32 max-w-full overflow-hidden rounded-full bg-progress-track"
          role="progressbar"
          aria-valuenow={Math.round(progressPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Budget spent"
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-200 ease-out motion-reduce:transition-none',
              rollup.overSpent ? 'bg-destructive' : 'bg-progress-fill',
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-wrap items-center justify-start gap-x-2 gap-y-0.5 text-sm">
        {statusLabel ? (
          <span
            className={cn(
              'min-w-0 truncate tabular-nums',
              rollup.overSpent ? 'font-medium text-destructive' : 'text-foreground',
            )}
          >
            {statusLabel}
          </span>
        ) : hasActivity ? (
          <span className="tabular-nums text-foreground">
            {formatBudgetCentsCompact(rollup.actualCents, rollup.currency)} spent
          </span>
        ) : (
          <Link
            to={`/plans/${planId}/overview`}
            className="text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground"
          >
            Set in overview
          </Link>
        )}
      </div>
    </div>
  )
}
