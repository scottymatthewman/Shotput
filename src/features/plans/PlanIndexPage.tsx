import { PLAN_TYPE_LABELS } from '@/config/planTemplates'
import { PageHeader } from '@/layouts/PageHeader'
import { PageScrollArea, PageShell } from '@/layouts/PageShell'
import { PlanStatusBadge } from '@/components/dance/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatIsoCalendar } from '@/lib/dateDisplay'
import { computePlanBudgetRollup, planBudgetStatusLabel } from '@/lib/budget'
import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
import { useUiStore } from '@/state/uiStore'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

export function PlanIndexPage() {
  const workspace = usePlansStore((s) => s.workspace)
  const lastCreatedPlanId = useUiStore((s) => s.lastCreatedPlanId)
  const setNewPlanDialogOpen = useUiStore((s) => s.setNewPlanDialogOpen)

  const planList = useMemo(() => {
    const list = Object.values(workspace.plans)
    if (!lastCreatedPlanId) return list
    const created = workspace.plans[lastCreatedPlanId]
    if (!created) return list
    return [created, ...list.filter((p) => p.id !== lastCreatedPlanId)]
  }, [workspace.plans, lastCreatedPlanId])

  return (
    <PageShell>
      <PageHeader
        title="Plans"
        description="Your workspace plans — each has one shared planner (Gantt / table)."
        actions={
          <Button
            type="button"
            size="sm"
            className="gap-1.5 transition-surface pressable"
            onClick={() => setNewPlanDialogOpen(true)}
          >
            <Plus className="size-4" aria-hidden />
            New plan
          </Button>
        }
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
                <Card
                  className={cn(
                    'h-full transition-surface duration-150 ease-hover hover:bg-muted/30',
                    p.id === lastCreatedPlanId && 'ring-2 ring-primary/30',
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <PlanStatusBadge status={healthiest} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>{p.description}</p>
                    {p.planType ? (
                      <p className="text-xs uppercase tracking-wide text-muted-foreground/80">
                        {PLAN_TYPE_LABELS[p.planType]}
                      </p>
                    ) : null}
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
