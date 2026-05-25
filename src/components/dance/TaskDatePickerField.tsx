import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { armTimelineRowClickSuppression } from '@/components/dance/taskStatusMenu'
import { cn } from '@/lib/utils'
import { addDays, format } from 'date-fns'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

const timelineDateButtonClass =
  'pressable inline-flex max-w-full cursor-pointer items-center truncate rounded-sm border-0 bg-transparent p-0 text-left tabular-nums text-foreground/60 shadow-none outline-none transition-surface duration-150 ease-hover hover:text-foreground dance-focus-ring'

const sheetDateButtonClass =
  'pressable inline-flex max-w-full cursor-pointer items-center gap-2 rounded-sm border-0 bg-transparent p-0 text-left text-sm tabular-nums text-foreground shadow-none outline-none transition-surface duration-150 ease-hover hover:bg-muted/40 dance-focus-ring'

/** Distinguish tap-to-open-calendar from horizontal scrub; ~Figma-style day steps. */
const DATE_SCRUB_THRESHOLD_PX = 6
const DATE_SCRUB_PIXELS_PER_DAY = 10

type DateScrubGesture = {
  pointerId: number
  originX: number
  anchorDate: Date
  maxAbsDx: number
  lastEmittedDelta: number | null
}

export type TaskDatePickerFieldProps = {
  value: string
  ariaLabel: string
  onChange: (next: string) => void
  /** When true, horizontal drag on the trigger updates the date (table cells). */
  scrub?: boolean
  onDatePointerSessionStart?: () => void
  onDatePointerSessionEnd?: () => void
  /** `short` = MMM d (timeline); `long` = MMM d, yyyy (sheet). */
  labelFormat?: 'short' | 'long'
  align?: 'start' | 'center' | 'end'
  /** Extra trigger chrome (e.g. calendar icon in the sheet). */
  leading?: ReactNode
  className?: string
}

/**
 * Popover + `Calendar` date field. Optional horizontal scrub for dense tables.
 * Pointer capture is only taken after scrub threshold so month nav clicks inside the popover work.
 */
export function TaskDatePickerField({
  value,
  ariaLabel,
  onChange,
  scrub = false,
  onDatePointerSessionStart,
  onDatePointerSessionEnd,
  labelFormat = 'short',
  align = 'start',
  leading,
  className,
}: TaskDatePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [scrubEwCursor, setScrubEwCursor] = useState(false)
  const [displayMonth, setDisplayMonth] = useState<Date>(() => new Date())
  const scrubRef = useRef<DateScrubGesture | null>(null)
  const suppressPopoverClickRef = useRef(false)
  const datePointerSessionArmedRef = useRef(false)

  const selectedDate = useMemo(() => {
    const d = new Date(`${value}T12:00:00`)
    return Number.isNaN(d.getTime()) ? undefined : d
  }, [value])

  useEffect(() => {
    if (selectedDate) setDisplayMonth(selectedDate)
  }, [value, selectedDate])

  const commit = useCallback(
    (next: string) => {
      onChange(next)
      armTimelineRowClickSuppression()
    },
    [onChange],
  )

  const label = useMemo(() => {
    if (!selectedDate) return '—'
    return format(selectedDate, labelFormat === 'long' ? 'MMM d, yyyy' : 'MMM d')
  }, [selectedDate, labelFormat])

  const triggerClass =
    labelFormat === 'long'
      ? cn(sheetDateButtonClass, className)
      : cn(timelineDateButtonClass, scrub && scrubEwCursor && 'cursor-ew-resize', className)

  const endScrubGesture = useCallback(
    (el: HTMLElement, pointerId: number) => {
      const g = scrubRef.current
      if (g && g.pointerId === pointerId && g.maxAbsDx >= DATE_SCRUB_THRESHOLD_PX) {
        suppressPopoverClickRef.current = true
      }
      scrubRef.current = null
      setScrubEwCursor(false)
      if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId)
      if (datePointerSessionArmedRef.current) {
        datePointerSessionArmedRef.current = false
        onDatePointerSessionEnd?.()
      }
    },
    [onDatePointerSessionEnd],
  )

  return (
    <span data-task-row-action className="inline-flex min-w-0 items-center" onClick={(e) => e.stopPropagation()}>
      <Popover
        modal={false}
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (next && selectedDate) setDisplayMonth(selectedDate)
          if (!next) armTimelineRowClickSuppression()
        }}
      >
        <PopoverAnchor asChild>
          <button
            type="button"
            className={triggerClass}
            aria-label={ariaLabel}
            aria-expanded={open}
            onClick={(e) => {
              if (suppressPopoverClickRef.current) {
                suppressPopoverClickRef.current = false
                e.preventDefault()
                e.stopPropagation()
                return
              }
              setOpen((o) => !o)
            }}
            onLostPointerCapture={(e) => {
              endScrubGesture(e.currentTarget, e.pointerId)
            }}
            onPointerDown={(e) => {
              if (!scrub || !selectedDate || e.button !== 0) return
              suppressPopoverClickRef.current = false
              setScrubEwCursor(false)
              scrubRef.current = {
                pointerId: e.pointerId,
                originX: e.clientX,
                anchorDate: selectedDate,
                maxAbsDx: 0,
                lastEmittedDelta: null,
              }
              datePointerSessionArmedRef.current = true
              onDatePointerSessionStart?.()
            }}
            onPointerMove={(e) => {
              if (!scrub) return
              const g = scrubRef.current
              if (!g || g.pointerId !== e.pointerId || !selectedDate) return
              const dx = e.clientX - g.originX
              g.maxAbsDx = Math.max(g.maxAbsDx, Math.abs(dx))
              if (g.maxAbsDx >= DATE_SCRUB_THRESHOLD_PX) {
                try {
                  if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
                    e.currentTarget.setPointerCapture(e.pointerId)
                  }
                } catch {
                  /* ignore */
                }
                setScrubEwCursor(true)
              }
              if (g.maxAbsDx < DATE_SCRUB_THRESHOLD_PX) return
              const deltaDays = Math.trunc(dx / DATE_SCRUB_PIXELS_PER_DAY)
              if (deltaDays === g.lastEmittedDelta) return
              g.lastEmittedDelta = deltaDays
              const nextDay = addDays(g.anchorDate, deltaDays)
              commit(format(nextDay, 'yyyy-MM-dd'))
            }}
            onPointerUp={(e) => endScrubGesture(e.currentTarget, e.pointerId)}
            onPointerCancel={(e) => endScrubGesture(e.currentTarget, e.pointerId)}
          >
            {leading}
            {label}
          </button>
        </PopoverAnchor>
        <PopoverContent
          align={align}
          sideOffset={6}
          className="w-auto border-border bg-popover p-0 shadow-md"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Calendar
            mode="single"
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            selected={selectedDate}
            onSelect={(d) => {
              if (!d) return
              commit(format(d, 'yyyy-MM-dd'))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </span>
  )
}
