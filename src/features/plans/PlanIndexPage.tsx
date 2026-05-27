import { PageHeader } from '@/layouts/PageHeader'
import { PageScrollArea, PageShell } from '@/layouts/PageShell'
import { PlanStatusBadge } from '@/components/dance/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatIsoCalendar } from '@/lib/dateDisplay'
import { computePlanBudgetRollup, planBudgetStatusLabel } from '@/lib/budget'
import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
import { Link } from 'react-router-dom'

export function PlanIndexPage() {
  const workspace = usePlansStore((s) => s.workspace)
  const plans = workspace.plans
  const planList = Object.values(plans)

  return (
    <PageShell>
      <PageHeader
        title="Plans"
        description="Your workspace plans — each has one shared planner (Gantt / table)."
      />
      <PageScrollArea>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {planList.map((p) => {
            let rangeCompact = '—'
            if (p.start && p.end) {
              const a = formatIsoCalendar(p.start, 'MMM d')
              const b = formatIsoCalendar(p.end, 'MMM d, yyyy')
              if (a !== '—' && b !== '—') {
                rangeCompact = `${a} – ${b}`
              }
            }

            const healthiest: 'healthy' | 'at_risk' | 'paused' = p.status ?? 'healthy'
            const budgetLabel = planBudgetStatusLabel(computePlanBudgetRollup(p, workspace))

            return (
              <Link key={p.id} to={`/plans/${p.id}`}>
                <Card className="h-full transition-surface duration-150 ease-hover hover:bg-muted/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <PlanStatusBadge status={healthiest} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>{p.description}</p>
                    <p>Planner · {rangeCompact}</p>
                    {budgetLabel ? (
                      <p
                        className={cn(
                          'tabular-nums',
                          computePlanBudgetRollup(p, workspace).overSpent && 'text-destructive',
                        )}
                      >
                        Budget · {budgetLabel}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </PageScrollArea>
    </PageShell>
  )
}
