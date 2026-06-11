import { PlatformIcon } from '@/components/PlatformIcon'
import { Button } from '@/components/ui/button'
import { TargetDetailDialog, postTitle } from '@/features/queue/TargetDetailDialog'
import { PageHeader } from '@/layouts/PageHeader'
import { PageScrollArea, PageShell } from '@/layouts/PageShell'
import { useScheduler } from '@/lib/scheduler/data'
import type { Post, PostTarget, SocialAccount } from '@/lib/scheduler/types'
import { cn } from '@/lib/utils'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type CalendarEvent = {
  target: PostTarget
  date: Date
}

type SelectedTarget = {
  target: PostTarget
  post: Post | undefined
  account: SocialAccount
}

function eventDate(target: PostTarget): string | undefined {
  if (target.status === 'queued') return target.scheduledAt
  return target.publishedAt ?? target.scheduledAt
}

export function HomePage() {
  const { accounts, posts, targets } = useScheduler()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<SelectedTarget | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const postsById = new Map(posts.map((p) => [p.id, p]))
  const accountsById = new Map(accounts.map((a) => [a.id, a]))

  const eventsByDay = new Map<string, CalendarEvent[]>()
  for (const target of targets) {
    const iso = eventDate(target)
    if (!iso) continue
    const date = new Date(iso)
    const key = format(date, 'yyyy-MM-dd')
    const events = eventsByDay.get(key) ?? []
    events.push({ target, date })
    eventsByDay.set(key, events)
  }
  for (const events of eventsByDay.values()) {
    events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  })

  function openDetail(target: PostTarget) {
    const account = accountsById.get(target.accountId)
    if (!account) return
    setSelected({ target, post: postsById.get(target.postId), account })
    setDetailOpen(true)
  }

  return (
    <PageShell>
      <PageHeader
        title={format(month, 'MMMM yyyy')}
        className="items-center"
        actions={
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setMonth((m) => addMonths(m, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMonth(startOfMonth(new Date()))}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
            >
              <ChevronRight aria-hidden />
            </Button>
            <Button asChild size="sm" className="ml-2">
              <Link to="/new">
                <Plus aria-hidden />
                New post
              </Link>
            </Button>
          </div>
        }
      />
      <PageScrollArea className="flex flex-col p-0">
        <div className="relative flex min-h-0 flex-1 flex-col gap-px bg-border-subtle">
          <div className="grid shrink-0 grid-cols-7 gap-px">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="bg-surface-2 px-3 py-2.5 text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7 gap-px">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const events = eventsByDay.get(key) ?? []
              const inMonth = isSameMonth(day, month)
              const today = isToday(day)
              return (
                <div
                  key={key}
                  className={cn(
                    'flex min-h-24 flex-col gap-1 p-2.5',
                    inMonth ? 'bg-surface-contrast' : 'bg-surface-2',
                  )}
                >
                  <span
                    className={cn(
                      'self-start text-xs tabular-nums',
                      today
                        ? 'flex size-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground'
                        : inMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground/60',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {events.map(({ target, date }) => {
                    const account = accountsById.get(target.accountId)
                    if (!account) return null
                    const published = target.status !== 'queued'
                    return (
                      <button
                        key={target.id}
                        type="button"
                        onClick={() => openDetail(target)}
                        title={postTitle(postsById.get(target.postId))}
                        className={cn(
                          'transition-surface flex w-full cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-left text-[11px] leading-tight hover:bg-fill-hover',
                          published ? 'text-muted-foreground' : 'text-foreground',
                          target.status === 'failed' && 'text-status-blocked',
                        )}
                      >
                        <PlatformIcon
                          platform={account.platform}
                          className="size-2.5 shrink-0"
                        />
                        <span className="shrink-0 tabular-nums">
                          {format(date, 'h:mm a')}
                        </span>
                        <span className="min-w-0 truncate">
                          {postTitle(postsById.get(target.postId))}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {targets.length === 0 ? (
            <p className="absolute inset-x-0 bottom-6 text-center text-sm text-muted-foreground">
              Nothing scheduled yet —{' '}
              <Link to="/new" className="text-foreground underline underline-offset-4">
                write your first post
              </Link>
              .
            </p>
          ) : null}
        </div>
      </PageScrollArea>

      {selected ? (
        <TargetDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          target={selected.target}
          post={selected.post}
          account={selected.account}
        />
      ) : null}
    </PageShell>
  )
}
