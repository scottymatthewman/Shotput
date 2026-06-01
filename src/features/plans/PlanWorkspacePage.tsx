import { PlanBudgetTracker } from '@/features/plans/PlanBudgetTracker'
import { PageHeader } from '@/layouts/PageHeader'
import { PageShell } from '@/layouts/PageShell'
import { NewPhaseModal } from '@/features/plans/NewPhaseModal'
import { phaseDetailPath } from '@/lib/planRoute'
import { PhaseQuickActionDialogs } from '@/features/plans/PhaseQuickActionDialogs'
import { TimelineViewToggle } from '@/features/plans/TimelineViewToggle'
import { GanttView } from '@/features/plans/gantt/GanttView'
import { TimelineTableView } from '@/features/plans/gantt/TimelineTableView'
import { Button } from '@/components/ui/button'
import { formatIsoCalendar } from '@/lib/dateDisplay'
import { comparePhasesByStartThenTitle } from '@/lib/phaseOrdering'
import { usePlansStore } from '@/state/store'
import { ChevronLeft, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { selectPlanBundle } from '@/state/selectors'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

export function PlanWorkspacePage() {
  const { planId: planIdParam, eventId: legacyEventId } = useParams<{
    planId?: string
    eventId?: string
  }>()
  const planId = planIdParam ?? legacyEventId
  const navigate = useNavigate()

  const workspace = usePlansStore((s) => s.workspace)
  const bundle = usePlansStore(
    useShallow((s) => (planId ? selectPlanBundle(s.workspace, planId) : null)),
  )
  const plan = bundle?.plan

  const [searchParams] = useSearchParams()
  const phaseParam = searchParams.get('phase') ?? searchParams.get('task')
  const viewMode = usePlansStore((s) => s.timelineViewMode)
  const setViewMode = usePlansStore((s) => s.setTimelineViewMode)
  const [tableSelectionCount, setTableSelectionCount] = useState(0)
  const selectedPhaseId = usePlansStore((s) => s.selectedPhaseId)
  const focusedPhaseId = usePlansStore((s) => s.focusedPhaseId)
  const setSelectedPhaseId = usePlansStore((s) => s.setSelectedPhaseId)
  const openNewPhaseModal = usePlansStore((s) => s.openNewPhaseModal)
  const setHoveredPhaseId = usePlansStore((s) => s.setHoveredPhaseId)
  const setPhaseQuickDialog = usePlansStore((s) => s.setPhaseQuickDialog)

  const phases = useMemo(() => {
    if (!bundle) return []
    return bundle.phaseIds
      .map((id) => bundle.phases[id])
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .sort(comparePhasesByStartThenTitle)
  }, [bundle])

  useEffect(() => {
    if (!phaseParam || !planId) return
    setSelectedPhaseId(phaseParam)
    navigate(phaseDetailPath(planId, phaseParam), { replace: true })
  }, [navigate, phaseParam, planId, setSelectedPhaseId])

  useEffect(() => {
    return () => {
      setHoveredPhaseId(null)
      setPhaseQuickDialog(null)
    }
  }, [planId, setHoveredPhaseId, setPhaseQuickDialog])

  useEffect(() => {
    if (viewMode !== 'table') setTableSelectionCount(0)
  }, [viewMode])

  const openPhase = useCallback(
    (id: string | null) => {
      if (!id || !planId) return
      setSelectedPhaseId(id)
      navigate(phaseDetailPath(planId, id))
    },
    [navigate, planId, setSelectedPhaseId],
  )

  if (!planId || !plan) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Missing plan.</p>
        <Link to="/plans" className="text-primary text-sm transition-surface duration-150 ease-hover hover:underline">
          Plans
        </Link>
      </div>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={plan.name}
        description={`${formatIsoCalendar(plan.start, 'MMM d')} – ${formatIsoCalendar(plan.end, 'MMM d, yyyy')}`}
        descriptionInline
        leading={
          <Link to="/plans">
            <Button variant="pageChrome" size="icon" aria-label="Back to plans">
              <ChevronLeft aria-hidden />
            </Button>
          </Link>
        }
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="pageChromeLg"
              className="!inline-flex !h-10 !min-h-10 !max-h-10 !w-max !min-w-0 !max-w-none shrink-0 whitespace-nowrap px-3 text-sm font-medium !text-chrome-fg hover:!text-chrome-fg-hover"
              aria-label="Plan overview"
              asChild
            >
              <Link to={`/plans/${planId}/overview`}>Overview</Link>
            </Button>
            <Button
              type="button"
              variant="pageChromeLg"
              size="icon"
              aria-label="Add phase"
              title="Add phase"
              onClick={() => openNewPhaseModal(planId)}
            >
              <Plus className="size-4" aria-hidden />
            </Button>
          </div>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {viewMode === 'gantt' ? (
            <GanttView
              workspace={workspace}
              planId={planId}
              phases={phases}
              selectedPhaseId={selectedPhaseId}
              focusedPhaseId={focusedPhaseId}
              onSelectPhase={openPhase}
            />
          ) : null}
          {viewMode === 'table' ? (
            <TimelineTableView
              workspace={workspace}
              phases={phases}
              selectedPhaseId={selectedPhaseId}
              focusedPhaseId={focusedPhaseId}
              onSelectPhase={openPhase}
              onSelectionCountChange={setTableSelectionCount}
            />
          ) : null}
        </div>
      </div>
      <footer className="flex shrink-0 items-center justify-between gap-4 inset-edge-ring inset-edge-ring-t px-3 py-2.5 text-xs text-muted-foreground">
        <PlanBudgetTracker plan={plan} workspace={workspace} planId={planId} />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
          {viewMode === 'table' && tableSelectionCount > 0 ? (
            <span className="shrink-0 tabular-nums text-foreground">
              {tableSelectionCount} selected
            </span>
          ) : null}
          <TimelineViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </footer>
      <NewPhaseModal />
      <PhaseQuickActionDialogs planId={planId} />
    </PageShell>
  )
}
