import { PageHeader } from '@/components/dance/PageHeader'
import { PageScrollArea, PageShell } from '@/components/dance/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { navigationDebug } from '@/lib/navigationDebug'
import { useEffect } from 'react'

export function ReportPlaceholderPage() {
  useEffect(() => {
    navigationDebug('page/report', {})
  }, [])

  return (
    <PageShell>
      <PageHeader
        title="Report"
        description="Rollups across plans and outcomes will land here."
      />
      <PageScrollArea>
        <div className="mx-auto max-w-2xl space-y-4">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Coming soon</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-2">
                Planned: spend vs pipeline, attendee engagement, recap exports, and shareable stakeholder views.
              </p>
              <p>This route is reachable by URL (`/report`) but not linked from primary navigation.</p>
            </CardContent>
          </Card>
        </div>
      </PageScrollArea>
    </PageShell>
  )
}
