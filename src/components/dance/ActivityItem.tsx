import { cn } from '@/lib/utils'
import type { ActivityEvent, Workspace } from '@/types/domain'
import { formatDistanceToNow } from 'date-fns'

function actorLabel(ev: ActivityEvent, workspace: Workspace) {
  if (ev.actorIsAgent) {
    return workspace.agents[ev.actorId]?.name ?? 'Agent'
  }
  return workspace.users[ev.actorId]?.name ?? 'Someone'
}

function verbPhrase(ev: ActivityEvent) {
  switch (ev.verb) {
    case 'changed_status':
      return `updated status on`
    case 'rescheduled':
      return `rescheduled`
    case 'commented':
      return `commented on`
    case 'assigned':
      return `assigned`
    case 'moved':
      return `moved`
    case 'created':
      return `created`
    case 'updated':
      return `updated`
    case 'deleted':
      return `deleted`
  }
}

export function ActivityItem({
  event,
  workspace,
  className,
}: {
  event: ActivityEvent
  workspace: Workspace
  className?: string
}) {
  const rel = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })
  const payloadBody =
    typeof event.payload?.body === 'string' ? event.payload.body.trim() : ''

  return (
    <article
      className={cn(
        'border-b border-border px-3 py-2.5 text-sm transition-surface duration-150 ease-hover last:border-b-0 hover:bg-muted/40',
        className,
      )}
    >
      <p className="text-foreground">
        <span className={event.actorIsAgent ? 'text-primary' : ''}>{actorLabel(event, workspace)}</span>{' '}
        <span className="text-muted-foreground">{verbPhrase(event)}</span>{' '}
        <span className="font-medium text-foreground">{event.objectLabel}</span>
      </p>
      {payloadBody ? (
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-snug text-foreground">{payloadBody}</p>
      ) : null}
      <p className="mt-1 text-xs text-muted-foreground">{rel}</p>
    </article>
  )
}
