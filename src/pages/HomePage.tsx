import { PageHeader } from '@/components/dance/PageHeader'
import { PageScrollArea, PageShell } from '@/components/dance/PageShell'
import { CURRENT_USER_ID, useDanceStore } from '@/state/store'
import { taskStatusMenuLabel } from '@/components/dance/taskStatusMenu'
import { compareTasksAssignedDigest } from '@/lib/taskOrdering'
import { getEffectiveTaskStatus } from '@/lib/taskStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatIsoCalendar } from '@/lib/dateDisplay'
import { navigationDebug } from '@/lib/navigationDebug'
import { cn } from '@/lib/utils'
import { MessageSquare, ClipboardList } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function HomePage() {
  const digestRows = useDanceStore((s) => {
    const tasks = Object.values(s.workspace.phases).filter((t) =>
      t.assigneeUserIds.includes(CURRENT_USER_ID),
    )
    return [...tasks].sort(compareTasksAssignedDigest).slice(0, 6)
  })
  const projects = useDanceStore((s) => s.workspace.plans)

  const projectName = (projectId: string) => projects[projectId]?.name ?? projectId

  useEffect(() => {
    navigationDebug('page/home', {
      assignedTasksPeek: digestRows.length,
      messagesPlaceholder: true,
      remindersPlaceholder: true,
    })
  }, [digestRows.length])

  const placeholderAlerts = [
    { id: 'm1', label: '3 unread workspace messages', detail: 'Placeholder inbox — wire Slack or email ingestion later.' },
    { id: 'r1', label: 'Reminder: Sponsor deck due tomorrow', detail: 'Demo reminder surfacing.' },
    { id: 'r2', label: '2 vendor invoices pending approval', detail: 'Placeholder finance nudge.' },
  ]

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Your inbox for tasks, messages, reminders, and workspace chat—all wiring ahead of live integrations."
      />
      <PageScrollArea>
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
          <Card className="border-primary/40 lg:col-span-1 lg:row-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
              <CardTitle className="text-base">Workspace chat</CardTitle>
              <MessageSquare className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Jump into a focused thread for queries across plans, timelines, and tasks — ready for AI when you connect
                a model.
              </p>
              <Button type="button" variant="secondary" size="sm" className="transition-surface pressable duration-150" asChild>
                <Link to="/chat">Open chat</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
              <CardTitle className="text-base">Tasks assigned to you</CardTitle>
              <ClipboardList className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              {digestRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks assigned to you yet.</p>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {digestRows.map((t) => {
                    const eff = getEffectiveTaskStatus(t)
                    const href = `/plan/${t.planId}?task=${encodeURIComponent(t.id)}`
                    return (
                      <li key={t.id}>
                        <Link
                          to={href}
                          className="flex flex-col gap-1 px-3 py-2.5 text-left transition-surface duration-150 ease-hover hover:bg-muted/30 sm:flex-row sm:items-center sm:gap-4 sm:py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{projectName(t.planId)}</p>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                            <span className="rounded-md border border-border/80 px-2 py-0.5 text-xs text-muted-foreground">
                              {taskStatusMenuLabel(eff)}
                            </span>
                            <span className="text-xs capitalize text-muted-foreground">{t.priority}</span>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              Due {formatIsoCalendar(t.end, 'MMM d')}
                            </span>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                <Link to="/plan" className="font-medium text-primary transition-surface duration-150 ease-hover hover:underline">
                  View all plans
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Messages &amp; reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {placeholderAlerts.map((a, i) => (
                <div
                  key={a.id}
                  className={cn(
                    'rounded-lg border border-dashed border-border px-3 py-2 transition-surface duration-150',
                    i === 0 && 'border-primary/35 bg-muted/20',
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageScrollArea>
    </PageShell>
  )
}
