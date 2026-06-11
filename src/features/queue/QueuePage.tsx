import { PlatformIcon } from '@/components/PlatformIcon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  TargetDetailDialog,
  accountLabel,
  postTitle,
  scheduledLabel,
} from '@/features/queue/TargetDetailDialog'
import { CenteredPageScroll } from '@/layouts/CenteredPageScroll'
import { PageHeader } from '@/layouts/PageHeader'
import { PageShell } from '@/layouts/PageShell'
import {
  deleteTarget,
  simulatePublish,
  updateTarget,
  useScheduler,
} from '@/lib/scheduler/data'
import type { Post, PostTarget, SocialAccount } from '@/lib/scheduler/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarClock, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const sectionClass =
  'flex flex-col gap-3 rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft bg-surface-contrast p-4'

export function QueuePage() {
  const { accounts, posts, targets } = useScheduler()
  const postsById = new Map(posts.map((p) => [p.id, p]))

  const queuedByAccount = (accountId: string) =>
    targets
      .filter((t) => t.accountId === accountId && t.status === 'queued')
      .sort((a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? ''))

  const history = targets
    .filter((t) => t.status === 'published' || t.status === 'failed')
    .sort((a, b) =>
      (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt),
    )

  const accountsById = new Map(accounts.map((a) => [a.id, a]))

  return (
    <PageShell>
      <PageHeader
        title="Queue"
        description="Each account fills its next available slots."
        layout="inline"
      />
      <CenteredPageScroll columnClassName="gap-4">
        <TooltipProvider delayDuration={300}>
          {accounts.length === 0 ? (
            <section className={cn(sectionClass, 'items-start')}>
              <p className="text-sm text-muted-foreground">
                Connect accounts and queue your first post from the composer.
              </p>
              <Button asChild size="sm" variant="secondary">
                <Link to="/new">New post</Link>
              </Button>
            </section>
          ) : (
            accounts.map((account) => (
              <AccountQueue
                key={account.id}
                account={account}
                queued={queuedByAccount(account.id)}
                postsById={postsById}
              />
            ))
          )}

          {history.length > 0 ? (
            <section className={sectionClass}>
              <h2 className="text-sm font-semibold text-foreground">History</h2>
              <ul className="flex flex-col gap-1.5">
                {history.map((target) => {
                  const account = accountsById.get(target.accountId)
                  return (
                    <li
                      key={target.id}
                      className="flex items-center gap-3 rounded-md inset-edge-ring inset-edge-ring-full inset-edge-softer bg-background/40 px-3 py-2"
                    >
                      {account ? (
                        <PlatformIcon
                          platform={account.platform}
                          className="text-muted-foreground"
                        />
                      ) : null}
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                        {postTitle(postsById.get(target.postId))}
                      </span>
                      <span className="text-xs whitespace-nowrap text-muted-foreground">
                        {target.publishedAt ? scheduledLabel(target.publishedAt) : null}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          target.status === 'published'
                            ? 'text-status-done'
                            : 'text-status-blocked',
                        )}
                      >
                        {target.status}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}
        </TooltipProvider>
      </CenteredPageScroll>
    </PageShell>
  )
}

function AccountQueue({
  account,
  queued,
  postsById,
}: {
  account: SocialAccount
  queued: PostTarget[]
  postsById: Map<string, Post>
}) {
  return (
    <section className={sectionClass}>
      <header className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-surface-3">
          <PlatformIcon platform={account.platform} />
        </span>
        <h2 className="text-sm font-semibold text-foreground">{accountLabel(account)}</h2>
        <span className="text-xs text-muted-foreground">
          {queued.length === 1 ? '1 post queued' : `${queued.length} posts queued`}
        </span>
      </header>

      {queued.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {queued.map((target) => (
            <QueueRow
              key={target.id}
              target={target}
              post={postsById.get(target.postId)}
              account={account}
            />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Queue is empty — add a post from the composer.
        </p>
      )}
    </section>
  )
}

function QueueRow({
  target,
  post,
  account,
}: {
  target: PostTarget
  post: Post | undefined
  account: SocialAccount
}) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <li className="flex items-center gap-3 rounded-md inset-edge-ring inset-edge-ring-full inset-edge-softer bg-background/40 py-1.5 pr-1.5 pl-3 transition-surface hover:bg-fill-hover">
      <button
        type="button"
        onClick={() => setDetailOpen(true)}
        className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5 py-0.5 text-left"
      >
        <span className="w-full truncate text-sm text-foreground">{postTitle(post)}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {target.scheduledAt ? scheduledLabel(target.scheduledAt) : 'Unscheduled'}
        </span>
      </button>

      <Tooltip>
        <Popover open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                aria-label="Reschedule"
              >
                <CalendarClock className="size-3.5" aria-hidden />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const value = new FormData(e.currentTarget).get('scheduledAt')
                if (typeof value === 'string' && value) {
                  updateTarget(target.id, { scheduledAt: new Date(value).toISOString() })
                  setRescheduleOpen(false)
                }
              }}
            >
              <input
                type="datetime-local"
                name="scheduledAt"
                defaultValue={
                  target.scheduledAt
                    ? format(new Date(target.scheduledAt), "yyyy-MM-dd'T'HH:mm")
                    : undefined
                }
                className="h-8 rounded-md bg-surface-3 px-2 text-xs text-foreground inset-edge-ring inset-edge-ring-full outline-none"
              />
              <Button type="submit" size="sm">
                Save
              </Button>
            </form>
          </PopoverContent>
        </Popover>
        <TooltipContent>Reschedule</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => simulatePublish(target.id)}
            aria-label="Publish now"
          >
            <Send className="size-3.5" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Publish now (simulated)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={() => deleteTarget(target.id)}
            aria-label="Remove from queue"
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove from queue</TooltipContent>
      </Tooltip>

      <TargetDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        target={target}
        post={post}
        account={account}
      />
    </li>
  )
}
