import { PlanBudgetTracker } from '@/components/dance/PlanBudgetTracker'
import { PageHeader } from '@/components/dance/PageHeader'
import { PageShell } from '@/components/dance/PageShell'
import { TaskQuickActionDialogs } from '@/components/dance/TaskQuickActionDialogs'
import { TaskSheet } from '@/components/dance/TaskSheet'
import { TimelineViewToggle } from '@/components/dance/TimelineViewToggle'
import { GanttView } from '@/components/dance/timeline/GanttView'
import { TimelineTableView } from '@/components/dance/timeline/TimelineTableView'
import { Button } from '@/components/ui/button'
import { formatIsoCalendar } from '@/lib/dateDisplay'
import { comparePhasesByStartThenTitle } from '@/lib/taskOrdering'
import { navigationDebug } from '@/lib/navigationDebug'
import { registerPhaseSheetAnimatedCloseHandler, useDanceStore } from '@/state/store'
import { ChevronLeft, Plus } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { selectPlanBundle } from '@/state/selectors'
import { Link, useParams, useSearchParams } from 'react-router-dom'

/** Slightly longer than sheet panel animation (300ms) so Radix can finish exit before unmount. */
const SHEET_CLOSE_CLEAR_MS = 320

export function TimelineWorkspacePage() {
  const { planId: planIdParam, eventId: legacyEventId } = useParams<{
    planId?: string
    eventId?: string
  }>()
  const planId = planIdParam ?? legacyEventId

  const workspace = useDanceStore((s) => s.workspace)
  const bundle = useDanceStore(
    useShallow((s) => (planId ? selectPlanBundle(s.workspace, planId) : null)),
  )
  const plan = bundle?.plan

  const [searchParams, setSearchParams] = useSearchParams()
  const phaseParam = searchParams.get('phase') ?? searchParams.get('task')
  const viewMode = useDanceStore((s) => s.timelineViewMode)
  const setViewMode = useDanceStore((s) => s.setTimelineViewMode)
  const [tableSelectionCount, setTableSelectionCount] = useState(0)
  const selectedPhaseId = useDanceStore((s) => s.selectedPhaseId)
  const setSelectedPhaseId = useDanceStore((s) => s.setSelectedPhaseId)
  const focusedPhaseId = useDanceStore((s) => s.focusedPhaseId)

  const createPhaseInPlan = useDanceStore((s) => s.createPhaseInPlan)
  const setHoveredPhaseId = useDanceStore((s) => s.setHoveredPhaseId)
  const setPhaseQuickDialog = useDanceStore((s) => s.setPhaseQuickDialog)

  const phases = useMemo(() => {
    if (!bundle) return []
    return bundle.phaseIds
      .map((id) => bundle.phases[id])
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .sort(comparePhasesByStartThenTitle)
  }, [bundle])

  useEffect(() => {
    navigationDebug(plan ? 'page/plan-workspace (content)' : 'page/plan-workspace (blocked)', {
      planId,
      gates: { hasPlan: !!plan },
      phaseCount: phases.length,
      viewMode,
      phaseSheetParam: phaseParam,
      selectedPhaseId: selectedPhaseId ?? null,
    })
  }, [planId, plan, phases.length, viewMode, phaseParam, selectedPhaseId])

  const phaseForSheet = selectedPhaseId ? workspace.phases[selectedPhaseId] ?? null : null
  const [sheetOpen, setSheetOpen] = useState(false)
  const sheetCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!phaseParam) return
    setSelectedPhaseId(phaseParam)
    const id = requestAnimationFrame(() => {
      setSheetOpen(true)
    })
    return () => cancelAnimationFrame(id)
  }, [phaseParam, setSelectedPhaseId])

  useEffect(() => {
    return () => {
      if (sheetCloseTimerRef.current !== null) {
        clearTimeout(sheetCloseTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      setHoveredPhaseId(null)
      setPhaseQuickDialog(null)
    }
  }, [planId, setHoveredPhaseId, setPhaseQuickDialog])

  useEffect(() => {
    if (viewMode !== 'table') setTableSelectionCount(0)
  }, [viewMode])

  const setPhaseInUrl = useCallback(
    (id: string | null) => {
      if (id) {
        if (sheetCloseTimerRef.current !== null) {
          clearTimeout(sheetCloseTimerRef.current)
          sheetCloseTimerRef.current = null
        }
        setSheetOpen(true)
      }
      setSelectedPhaseId(id)
      const next = new URLSearchParams(searchParams)
      if (id) {
        next.set('phase', id)
        next.delete('task')
      } else {
        next.delete('phase')
        next.delete('task')
      }
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams, setSelectedPhaseId],
  )

  const handleSheetOpenChange = useCallback(
    (v: boolean) => {
      if (v) {
        if (sheetCloseTimerRef.current !== null) {
          clearTimeout(sheetCloseTimerRef.current)
          sheetCloseTimerRef.current = null
        }
        setSheetOpen(true)
        return
      }
      setSheetOpen(false)
      if (sheetCloseTimerRef.current !== null) {
        clearTimeout(sheetCloseTimerRef.current)
      }
      sheetCloseTimerRef.current = setTimeout(() => {
        setPhaseInUrl(null)
        sheetCloseTimerRef.current = null
      }, SHEET_CLOSE_CLEAR_MS)
    },
    [setPhaseInUrl],
  )

  useLayoutEffect(() => {
    registerPhaseSheetAnimatedCloseHandler(() => handleSheetOpenChange(false))
    return () => registerPhaseSheetAnimatedCloseHandler(null)
  }, [handleSheetOpenChange])

  if (!planId || !plan) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Missing plan.</p>
        <Link to="/plan" className="text-primary text-sm transition-surface duration-150 ease-hover hover:underline">
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
          <Link to="/plan">
            <Button variant="pageChrome" size="icon" aria-label="Back to plans">
              <ChevronLeft aria-hidden />
            </Button>
          </Link>
        }
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="pageChromeLg"
              className="!inline-flex !h-10 !min-h-10 !max-h-10 !w-max !min-w-0 !max-w-none shrink-0 whitespace-nowrap px-3 text-sm font-medium !text-white/70 hover:!text-white"
              aria-label="Plan overview"
              asChild
            >
              <Link to={`/plan/${planId}/overview`}>Overview</Link>
            </Button>
            <Button
              type="button"
              variant="pageChromeLg"
              size="icon"
              aria-label="Add phase"
              title="Add phase"
              onClick={() => {
                const id = createPhaseInPlan(planId)
                if (id) setPhaseInUrl(id)
              }}
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
              onSelectPhase={setPhaseInUrl}
            />
          ) : null}
          {viewMode === 'table' ? (
            <TimelineTableView
              workspace={workspace}
              phases={phases}
              selectedPhaseId={selectedPhaseId}
              focusedPhaseId={focusedPhaseId}
              onSelectPhase={setPhaseInUrl}
              onSelectionCountChange={setTableSelectionCount}
            />
          ) : null}
        </div>
      </div>
      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-border px-3 py-2.5 text-xs text-muted-foreground">
        <TimelineViewToggle value={viewMode} onChange={setViewMode} />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
          {viewMode === 'table' && tableSelectionCount > 0 ? (
            <span className="shrink-0 tabular-nums text-foreground">
              {tableSelectionCount} selected
            </span>
          ) : null}
          <PlanBudgetTracker plan={plan} workspace={workspace} planId={planId} />
        </div>
      </footer>
      <TaskSheet
        key={phaseForSheet?.id ?? 'idle'}
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        workspace={workspace}
        phase={phaseForSheet}
      />
      {planId ? <TaskQuickActionDialogs planId={planId} /> : null}
    </PageShell>
  )
}
