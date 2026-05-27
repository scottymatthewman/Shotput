import { PhaseDetailPanel } from '@/features/plans/PhaseDetailPanel'
import { PhaseQuickActionDialogs } from '@/features/plans/PhaseQuickActionDialogs'
import { CenteredPageScroll } from '@/layouts/CenteredPageScroll'
import { PageHeader } from '@/layouts/PageHeader'
import { PageShell } from '@/layouts/PageShell'
import { Button } from '@/components/ui/button'
import { phaseDetailPath } from '@/lib/planRoute'
import { usePlansStore } from '@/state/store'
import { ChevronLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export function PhaseDetailPage() {
  const { planId: planIdParam, phaseId, eventId: legacyEventId } = useParams<{
    planId?: string
    phaseId?: string
    eventId?: string
  }>()
  const planId = planIdParam ?? legacyEventId
  const navigate = useNavigate()

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
      <PageHeader
        title="Phase"
        description={plan.name}
        descriptionInline
        leading={
          <Link to={`/plans/${planId}`}>
            <Button variant="pageChrome" size="icon" aria-label="Back to planner">
              <ChevronLeft aria-hidden />
            </Button>
          </Link>
        }
      />
      <CenteredPageScroll columnClassName="gap-2">
        <PhaseDetailPanel planId={planId} phaseId={phaseId} />
      </CenteredPageScroll>
      <PhaseQuickActionDialogs planId={planId} />
    </PageShell>
  )
}

export function phaseDetailShareUrl(planId: string, phaseId: string) {
  return `${window.location.origin}${phaseDetailPath(planId, phaseId)}`
}
