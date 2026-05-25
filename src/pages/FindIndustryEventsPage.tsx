import { PageHeader } from '@/components/dance/PageHeader'
import { PageScrollArea, PageShell } from '@/components/dance/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatIsoCalendar } from '@/lib/dateDisplay'
import { FIND_INDUSTRY_CATALOG, type FindIndustryEvent } from '@/mock/findIndustryCatalog'
import { navigationDebug } from '@/lib/navigationDebug'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

function EventsEmptyState({ message }: { message: string }) {
  return (
    <p className="mx-auto max-w-6xl text-sm text-muted-foreground">{message}</p>
  )
}

function EventsCatalogGrid({ events }: { events: FindIndustryEvent[] }) {
  if (events.length === 0) {
    return <EventsEmptyState message="No events in this view yet." />
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {events.map((e) => {
        const start = formatIsoCalendar(e.startIso, 'MMM d')
        const end = formatIsoCalendar(e.endIso, 'MMM d, yyyy')
        const range = start !== '—' && end !== '—' ? `${start} – ${end}` : '—'

        return (
          <Link key={e.id} to={`/find/industry-events/${e.id}`}>
            <Card className="h-full transition-surface duration-150 ease-hover hover:bg-muted/30">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base leading-snug">{e.name}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">{e.organizer}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Est. ROI
                    </span>
                    <span className="text-2xl font-semibold tabular-nums leading-none text-foreground">
                      {e.estRoiIndex}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/100</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="line-clamp-2">{e.synopsis}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="min-w-0 truncate">{e.location}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">~{e.estAttendanceMid.toLocaleString()} attendees</span>
                </div>
                <p className="text-xs tabular-nums">{range}</p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

export function FindIndustryEventsPage() {
  useEffect(() => {
    navigationDebug('page/find', { catalogRows: FIND_INDUSTRY_CATALOG.length })
  }, [])

  const todayIso = new Date().toISOString().slice(0, 10)
  const pastEvents = FIND_INDUSTRY_CATALOG.filter((e) => e.endIso < todayIso)

  return (
    <Tabs defaultValue="discover" className="flex min-h-0 flex-1 flex-col">
      <PageShell>
        <PageHeader
          title="Events"
          meta={
            <TabsList aria-label="Events views">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="applied">Applied</TabsTrigger>
              <TabsTrigger value="attending">Attending</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
          }
        />
        <PageScrollArea>
          <TabsContent value="discover" className="mt-0">
            <EventsCatalogGrid events={FIND_INDUSTRY_CATALOG} />
          </TabsContent>
          <TabsContent value="applied" className="mt-0">
            <EventsEmptyState message="No sponsorship or badge applications yet." />
          </TabsContent>
          <TabsContent value="attending" className="mt-0">
            <EventsEmptyState message="You're not attending any events yet." />
          </TabsContent>
          <TabsContent value="past" className="mt-0">
            <EventsCatalogGrid events={pastEvents} />
          </TabsContent>
        </PageScrollArea>
      </PageShell>
    </Tabs>
  )
}
