import { PhaseDetailPanel } from '@/features/plans/PhaseDetailPanel'
import { PhaseQuickActionDialogs } from '@/features/plans/PhaseQuickActionDialogs'
import { CenteredPageScroll } from '@/layouts/CenteredPageScroll'
import { PageShell } from '@/layouts/PageShell'
import { phaseDetailPath, type PhaseDetailLocationState } from '@/lib/planRoute'
import { usePlansStore } from '@/state/store'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

export function PhaseDetailPage() {
  const { planId: planIdParam, phaseId, eventId: legacyEventId } = useParams<{
    planId?: string
    phaseId?: string
    eventId?: string
  }>()
  const planId = planIdParam ?? legacyEventId
  const navigate = useNavigate()
  const location = useLocation()
  const autoFocusTitle = Boolean(
    (location.state as PhaseDetailLocationState | null)?.autoFocusTitle,
  )

  const workspace = usePlansStore((s) => s.workspace)
  const setSelectedPhaseId = usePlansStore((s) => s.setSelectedPhaseId)

  const phase = phaseId ? workspace.phases[phaseId] : undefined
  const plan = planId ? workspace.plans[planId] : undefined

  useEffect(() => {
    if (!phaseId) return
    setSelectedPhaseId(phaseId)
    return () => setSelectedPhaseId(null)
  }, [phaseId, setSelectedPhaseId])

  useEffect(() => {
    if (!planId || !phaseId) return
    if (!phase || phase.planId !== planId) {
      navigate(`/plans/${planId}`, { replace: true })
    }
  }, [navigate, phase, phaseId, planId])

  if (!planId || !phaseId || !plan || !phase || phase.planId !== planId) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Phase not found.</p>
        <Link
          to={planId ? `/plans/${planId}` : '/plans'}
          className="text-primary text-sm transition-surface duration-150 ease-hover hover:underline"
        >
          Back to planner
        </Link>
      </div>
    )
  }

  return (
    <PageShell>
      <CenteredPageScroll columnClassName="max-w-[700px] gap-10 pt-2 pb-12">
        <PhaseDetailPanel
          planId={planId}
          phaseId={phaseId}
          autoFocusTitle={autoFocusTitle}
        />
      </CenteredPageScroll>
      <PhaseQuickActionDialogs planId={planId} />
    </PageShell>
  )
}

export function phaseDetailShareUrl(planId: string, phaseId: string) {
  return `${window.location.origin}${phaseDetailPath(planId, phaseId)}`
}
