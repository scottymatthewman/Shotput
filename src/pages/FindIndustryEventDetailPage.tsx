import { PageHeader } from '@/components/dance/PageHeader'
import { PageScrollArea, PageShell } from '@/components/dance/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatIsoCalendar } from '@/lib/dateDisplay'
import { navigationDebug } from '@/lib/navigationDebug'
import { getFindIndustryEvent } from '@/mock/findIndustryCatalog'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export function FindIndustryEventDetailPage() {
  const { catalogEventId } = useParams<{ catalogEventId: string }>()
  const navigate = useNavigate()
  const event = catalogEventId ? getFindIndustryEvent(catalogEventId) : undefined

  useEffect(() => {
    navigationDebug('page/find/industry-event', {
      catalogEventId: catalogEventId ?? null,
      found: Boolean(event),
    })
  }, [catalogEventId, event])

  if (!catalogEventId || !event) {
    return (
      <PageShell>
        <PageHeader title="Industry event" description="Catalog entry not found." />
        <PageScrollArea>
          <div className="mx-auto max-w-2xl space-y-4">
            <p className="text-sm text-muted-foreground">That industry event isn’t in the catalog yet.</p>
            <Button type="button" variant="outline" className="transition-surface duration-150" onClick={() => navigate('/find')}>
              Back to Find
            </Button>
          </div>
        </PageScrollArea>
      </PageShell>
    )
  }

  const start = formatIsoCalendar(event.startIso, 'MMM d, yyyy')
  const end = formatIsoCalendar(event.endIso, 'MMM d, yyyy')
  const range =
    start !== '—' && end !== '—' ? `${start} – ${end}` : '—'

  return (
    <PageShell>
      <PageHeader
        title={event.name}
        description={`${event.organizer} · ${range}`}
      />
      <PageScrollArea>
        <div className="mx-auto mb-6 max-w-3xl">
          <Link
            to="/find"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-surface duration-150 ease-hover hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden />
            All industry events
          </Link>
        </div>

        <div className="mx-auto grid max-w-3xl gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Est. ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">{event.estRoiIndex}</p>
                <p className="text-xs text-muted-foreground">Index /100 · placeholder model</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Est. attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">~{event.estAttendanceMid.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Mid estimate from enrichment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Industry sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-snug text-foreground">{event.sentimentSummary}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Synopsis</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              <p>{event.synopsis}</p>
              <p className="mt-4 text-xs">{event.location}</p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Next steps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-3">
                Applying for a sponsorship or badge will eventually create a workspace plan—you’ll wire that flow from catalog to Plan.
              </p>
              <Button type="button" variant="secondary" disabled className="transition-surface duration-150">
                Add to workspace (soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageScrollArea>
    </PageShell>
  )
}
