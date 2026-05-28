import { navTableIcon, navTimelineIcon, type SidebarNavIcon } from '@/components/nav/navIcons'
import { sidebarNavDensity } from '@/components/nav/sidebarNavStyles'
import { cn } from '@/lib/utils'
import type { TimelineViewMode } from '@/state/store'
import { useLayoutEffect, useRef, useState } from 'react'

const modes: { id: TimelineViewMode; label: string; icon: SidebarNavIcon }[] = [
  { id: 'gantt', label: 'Timeline', icon: navTimelineIcon },
  { id: 'table', label: 'Table', icon: navTableIcon },
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
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Partial<Record<TimelineViewMode, HTMLButtonElement | null>>>({})
  const [pill, setPill] = useState({ width: 0, left: 0 })

  useLayoutEffect(() => {
    const updatePill = () => {
      const container = containerRef.current
      const tab = tabRefs.current[value]
      if (!container || !tab) return
      const containerRect = container.getBoundingClientRect()
      const tabRect = tab.getBoundingClientRect()
      setPill({
        width: tabRect.width,
        left: tabRect.left - containerRect.left,
      })
    }
    updatePill()
    window.addEventListener('resize', updatePill)
    return () => window.removeEventListener('resize', updatePill)
  }, [value])

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-flex h-8 items-stretch', className)}
      role="tablist"
      aria-label="Timeline view"
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 z-0 rounded-full bg-surface-3',
          'transition-[transform,width] duration-200 ease-in-out motion-reduce:transition-none',
        )}
        style={{
          width: pill.width,
          transform: `translateX(${pill.left}px)`,
        }}
      />
      {modes.map(({ id, label, icon }) => (
        <button
          key={id}
          ref={(el) => {
            tabRefs.current[id] = el
          }}
          type="button"
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={cn(
            'relative z-10 pressable dance-focus-ring inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-xs font-medium outline-none',
            'text-foreground transition-opacity duration-200 ease-out motion-reduce:transition-none',
            value !== id && 'opacity-50',
          )}
        >
          {icon({ className: cn(sidebarNavDensity.icon, 'text-foreground'), 'aria-hidden': true })}
          <span className="truncate">{label}</span>
        </button>
      ))}
    </div>
  )
}
