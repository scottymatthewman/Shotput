import { cn } from '@/lib/utils'
import { Fragment, type ReactNode } from 'react'

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
export const inkBody = cn(
  inkBase,
  'min-h-[72px] w-full resize-none py-2 text-sm leading-relaxed text-muted-foreground',
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
