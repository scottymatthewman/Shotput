import { cn } from '@/lib/utils'
import { GanttChartSquare, Table2 } from 'lucide-react'
import type { TimelineViewMode } from '@/state/store'

const modes: { id: TimelineViewMode; label: string; icon: typeof GanttChartSquare }[] = [
  { id: 'gantt', label: 'Timeline', icon: GanttChartSquare },
  { id: 'table', label: 'Table', icon: Table2 },
]

export function TimelineViewToggle({
  value,
  onChange,
  className,
}: {
  value: TimelineViewMode
  onChange: (v: TimelineViewMode) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-md inset-edge-ring inset-edge-ring-full bg-muted/50 p-1',
        className,
      )}
      role="tablist"
      aria-label="Timeline view"
    >
      <div className="relative grid min-h-8 grid-cols-2">
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 z-0 w-1/2 rounded-[var(--radius-nested-md-p1)] bg-card inset-edge-ring inset-edge-ring-full',
            'transition-transform duration-200 ease-out motion-reduce:transition-none',
            value === 'table' && 'translate-x-full',
          )}
        />
        {modes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={value === id}
            onClick={() => onChange(id)}
            className={cn(
              'relative z-10 pressable dance-focus-ring cursor-pointer outline-none inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-[var(--radius-nested-md-p1)] px-2 text-xs font-medium transition-[color,transform] duration-200 ease-out motion-reduce:transition-none',
              value === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon
              className={cn(
                'size-3.5 shrink-0 transition-opacity duration-200 ease-out',
                value === id ? 'opacity-100' : 'opacity-70',
              )}
              aria-hidden
            />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
