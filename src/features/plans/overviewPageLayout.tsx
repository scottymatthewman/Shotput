import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { ActivityEvent, User, Workspace } from '@/types/domain'
import { formatDistanceToNow } from 'date-fns'
import { Bot, ChevronDown, Circle, Plus, type LucideIcon } from 'lucide-react'
import { Fragment, useCallback, useLayoutEffect, useRef, type ComponentPropsWithoutRef, type ReactNode, type TextareaHTMLAttributes } from 'react'

/** Hero card: uniform `p-3` + `gap-3`; light edge to separate from canvas. */
export const overviewSectionShell = cn(
  'flex flex-col gap-3 rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft bg-muted p-3',
)

export const overviewMetricCardBase = cn(
  'rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft bg-muted px-5',
)

/** Progress / Location: symmetric vertical padding. */
export const overviewMetricSectionShell = cn(overviewMetricCardBase, 'py-3')

/** Team: extra bottom padding (~`px-5`) so the badge row clears the card like the sides. */
export const overviewTeamSectionShell = cn(overviewMetricCardBase, 'space-y-2 pt-3 pb-5')

export const inkBase = cn(
  'border-0 bg-transparent px-2 py-1.5 text-foreground shadow-none outline-none ring-0 transition-surface duration-150',
  'rounded-md placeholder:text-muted-foreground',
  'motion-reduce:transition-none',
  'focus-visible:!bg-gantt-canvas focus-visible:outline-none focus-visible:ring-0',
)

export const inkTitle = cn(inkBase, 'w-full py-2 text-xl font-semibold tracking-tight')

/** Plan overview hero title — Figma 28px / medium. */
export const inkOverviewTitle = cn(
  inkBase,
  'w-full px-0 py-0 text-[1.75rem] font-medium leading-tight tracking-tight',
)

/** Plan overview description — grows with content up to 200px, then scrolls. */
export const inkOverviewDescription = cn(
  inkBase,
  'min-h-[1.25rem] w-full resize-none overflow-hidden rounded-none px-0 py-0 text-sm leading-relaxed',
)

const OVERVIEW_DESCRIPTION_MAX_HEIGHT_PX = 200

export function OverviewDescriptionField({
  value,
  onChange,
  onBlur,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const syncHeight = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    const next = Math.min(el.scrollHeight, OVERVIEW_DESCRIPTION_MAX_HEIGHT_PX)
    el.style.height = `${next}px`
    el.style.overflowY = el.scrollHeight > OVERVIEW_DESCRIPTION_MAX_HEIGHT_PX ? 'auto' : 'hidden'
  }, [])

  useLayoutEffect(() => {
    syncHeight()
  }, [value, syncHeight])

  return (
    <textarea
      ref={ref}
      value={value}
      rows={1}
      onChange={(e) => {
        onChange?.(e)
        syncHeight()
      }}
      onBlur={onBlur}
      className={cn(inkOverviewDescription, className)}
      {...props}
    />
  )
}

export const inkBody = cn(
  inkBase,
  'min-h-[72px] w-full resize-none py-2 text-sm leading-relaxed text-muted-foreground',
)

/** Right-aligned value inside the metadata grid. */
export const inkOverviewGridValue = cn(
  inkBase,
  'w-auto min-w-0 px-0 py-0 text-right text-sm tabular-nums',
  'ease-hover hover:bg-accent/40',
)

export const inkLocation = cn(
  inkBase,
  'w-full px-0 py-2 text-right text-sm tabular-nums',
  'ease-hover hover:bg-accent/40',
)

export const inkDatePickers = cn(
  'text-foreground/80 hover:text-foreground',
  '!rounded-md !px-2 !py-1 focus-visible:!bg-secondary focus-visible:!outline-none !ring-0',
)

export const overviewIconButtonClass = cn(
  'cursor-pointer pressable size-8 shrink-0 rounded-md border-0 bg-transparent p-0 text-muted-foreground shadow-none outline-none ring-0 transition-surface duration-150',
  'hover:text-foreground focus-visible:bg-secondary focus-visible:outline-none focus-visible:ring-0 motion-reduce:transition-none',
)

/** Outline actions on Overview (CRM row + Share): white border + darker canvas fill on hover. */
export const overviewCrmOutlineButtonClass = cn(
  'inset-edge-ring inset-edge-ring-full inset-edge-chrome inset-edge-chrome-hover transition-surface duration-150 ease-hover motion-reduce:transition-none',
  'hover:bg-gantt-canvas hover:text-foreground',
)

export function OverviewRow({
  label,
  children,
  className,
}: {
  label: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-2',
        className,
      )}
    >
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="min-w-0 flex flex-1 flex-wrap items-center justify-end gap-2">{children}</div>
    </div>
  )
}

type OverviewReceiptRow = {
  id: string
  label: string
  value: ReactNode
  valueClassName?: string
}

/** 6px dash, 8px gap — receipt-style row divider. */
function OverviewReceiptDashDivider() {
  return (
    <div
      aria-hidden
      className="h-px w-full bg-[repeating-linear-gradient(90deg,var(--color-border)_0_6px,transparent_6px_14px)]"
    />
  )
}

export const overviewGridMenuPlacement = {
  direction: 'bottom',
  anchor: 'center',
} as const

/** Two-column metadata grid (Owner, Timeline, Status, …). */
export const overviewMetadataGrid = cn(
  'grid grid-cols-1 divide-y divide-border overflow-visible rounded-xl inset-edge-ring inset-edge-ring-full sm:grid-cols-2 sm:divide-x sm:divide-y',
)

export function OverviewMetadataCell({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: LucideIcon
  label: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-11 items-center gap-2.5 px-3 py-2',
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-visible">{children}</div>
    </div>
  )
}

export function OverviewOwnerPill({
  user,
  className,
  as = 'span',
  ...props
}: {
  user: User
  as?: 'span' | 'button'
} & Omit<ComponentPropsWithoutRef<'button'>, 'children'> &
  Omit<ComponentPropsWithoutRef<'span'>, 'children'>) {
  const parts = user.name.trim().split(/\s+/)
  const initials =
    parts.length <= 1
      ? parts[0]?.slice(0, 2).toUpperCase() ?? '—'
      : `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()

  const shellClass = cn(
    'inline-flex max-w-full min-w-0 items-center gap-2 rounded-full inset-edge-ring inset-edge-ring-full px-2 py-1',
    as === 'button' &&
      'pressable cursor-pointer border-0 bg-transparent transition-surface duration-150 ease-hover hover:bg-fill-hover',
    className,
  )

  const content = (
    <>
      <Avatar className="size-4 shrink-0">
        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
        <AvatarFallback className="bg-muted text-[9px] text-muted-foreground">{initials}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 truncate text-sm text-foreground">{user.name}</span>
    </>
  )

  if (as === 'button') {
    return (
      <button type="button" className={shellClass} {...props}>
        {content}
      </button>
    )
  }

  return (
    <span className={shellClass} {...props}>
      {content}
    </span>
  )
}

function overviewActivityPhrase(event: ActivityEvent, workspace: Workspace): string {
  const actor = event.actorIsAgent
    ? (workspace.agents[event.actorId]?.name ?? 'Agent')
    : (workspace.users[event.actorId]?.name ?? 'Someone')

  switch (event.verb) {
    case 'created':
      return event.objectType === 'plan'
        ? `${actor} created this plan`
        : `${actor} created ${event.objectLabel}`
    case 'changed_status':
      return `Task started`
    case 'commented':
      return `${actor} commented on ${event.objectLabel}`
    case 'rescheduled':
      return `${actor} rescheduled ${event.objectLabel}`
    case 'assigned':
      return `${actor} assigned ${event.objectLabel}`
    case 'moved':
      return `${actor} moved ${event.objectLabel}`
    case 'updated':
      return `${actor} updated ${event.objectLabel}`
    case 'deleted':
      return `${actor} deleted ${event.objectLabel}`
    case 'changed_budget':
      return `${actor} updated budget on ${event.objectLabel}`
  }
}

function OverviewActivityIcon({ event }: { event: ActivityEvent }) {
  if (event.actorIsAgent) {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Bot className="size-2.5" aria-hidden />
      </span>
    )
  }
  if (event.verb === 'created') {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full inset-edge-ring inset-edge-ring-full text-muted-foreground">
        <Plus className="size-2.5" aria-hidden />
      </span>
    )
  }
  return (
    <Circle className="size-4 shrink-0 text-muted-foreground/50" strokeWidth={1.5} aria-hidden />
  )
}

function OverviewActivityConnector() {
  return (
    <div className="flex h-2 w-4 shrink-0 justify-center" aria-hidden>
      <div className="w-px bg-border" />
    </div>
  )
}

export function DetailCollapsibleSection({
  title,
  open,
  onOpenChange,
  children,
  className,
}: {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <button
        type="button"
        className="pressable inline-flex w-fit items-center gap-1 text-sm text-foreground transition-surface duration-150 ease-hover"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        {title}
        <ChevronDown
          className={cn(
            'size-4 shrink-0 rotate-0 text-muted-foreground transition-transform duration-150 ease-in-out motion-reduce:transition-none',
            !open && '-rotate-90',
          )}
          aria-hidden
        />
      </button>
      {open ? children : null}
    </section>
  )
}

export function OverviewActivityTimeline({
  events,
  workspace,
}: {
  events: ActivityEvent[]
  workspace: Workspace
}) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>
  }

  return (
    <div className="flex flex-col gap-1">
      {events.map((event, index) => (
        <Fragment key={event.id}>
          <div className="flex items-center gap-3">
            <OverviewActivityIcon event={event} />
            <p className="min-w-0 text-[13px] leading-snug text-muted-foreground">
              <span>{overviewActivityPhrase(event, workspace)}</span>
              <span aria-hidden> · </span>
              <span className="tabular-nums">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: false })}
              </span>
            </p>
          </div>
          {index < events.length - 1 ? <OverviewActivityConnector /> : null}
        </Fragment>
      ))}
    </div>
  )
}

export function OverviewReceiptSubrows({ rows }: { rows: OverviewReceiptRow[] }) {
  if (rows.length === 0) return null
  return (
    <div>
      {rows.map((row, index) => (
        <Fragment key={row.id}>
          {index > 0 ? <OverviewReceiptDashDivider /> : null}
          <div className="flex min-h-8 items-center justify-between gap-4 py-2 text-xs">
            <span className="text-muted-foreground">{row.label}</span>
            <span
              className={cn('shrink-0 tabular-nums font-medium text-foreground', row.valueClassName)}
            >
              {row.value}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  )
}
