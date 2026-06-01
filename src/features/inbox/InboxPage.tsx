import { CenteredPageScroll } from '@/layouts/CenteredPageScroll'
import { PageHeader } from '@/layouts/PageHeader'
import { PageShell } from '@/layouts/PageShell'

export function InboxPage() {
  return (
    <PageShell>
      <PageHeader
        title="Inbox"
        description="Messages and updates from your plans."
      />
      <CenteredPageScroll>
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      </CenteredPageScroll>
    </PageShell>
  )
}
