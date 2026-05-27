import { Button } from '@/components/ui/button'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { armTimelineRowClickSuppression } from '@/components/dance/phaseStatusMenu'
import {
  applyTargetEndYearToRange,
  getIsoDayYear,
} from '@/lib/phaseDateOrder'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const yearButtonClass =
  'pressable inline-flex shrink-0 cursor-pointer items-center rounded-sm border-0 bg-transparent p-0 text-left text-sm tabular-nums text-muted-foreground shadow-none outline-none transition-surface duration-150 ease-hover hover:text-foreground dance-focus-ring'

const YEAR_SCRUB_THRESHOLD_PX = 6
const YEAR_SCRUB_PIXELS_PER_YEAR = 28
const YEARS_PER_PAGE = 12

type YearScrubGesture = {
  pointerId: number
  originX: number
  anchorYear: number
  maxAbsDx: number
  lastEmittedDelta: number | null
}

export type ScheduleYearPickerFieldProps = {
  startDate: string
  endDate: string
  onChange: (next: { start: string; end: string }) => void
  /** Horizontal drag on the trigger shifts both dates by whole years. */
  scrub?: boolean
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function ScheduleYearPickerField({
  startDate,
  endDate,
  onChange,
  scrub = true,
  align = 'end',
  className,
}: ScheduleYearPickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [scrubEwCursor, setScrubEwCursor] = useState(false)
  const [pageStartYear, setPageStartYear] = useState(() => new Date().getFullYear() - 5)
  const scrubRef = useRef<YearScrubGesture | null>(null)
  const suppressPopoverClickRef = useRef(false)

  const displayYear = useMemo(() => getIsoDayYear(endDate), [endDate])

  useEffect(() => {
    if (open && displayYear != null) setPageStartYear(displayYear - 5)
  }, [open, displayYear])

  const commitTargetYear = useCallback(
    (targetYear: number) => {
      if (displayYear == null || targetYear === displayYear) return
      const next = applyTargetEndYearToRange(startDate, endDate, targetYear)
      if (next.start === startDate && next.end === endDate) return
      onChange(next)
      armTimelineRowClickSuppression()
    },
    [displayYear, endDate, onChange, startDate],
  )

  const endScrubGesture = useCallback((el: HTMLElement, pointerId: number) => {
    const g = scrubRef.current
    if (g && g.pointerId === pointerId && g.maxAbsDx >= YEAR_SCRUB_THRESHOLD_PX) {
      suppressPopoverClickRef.current = true
    }
    scrubRef.current = null
    setScrubEwCursor(false)
    if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId)
  }, [])

  const yearOptions = useMemo(
    () => Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStartYear + i),
    [pageStartYear],
  )

  if (displayYear == null) return null

  return (
    <span data-phase-row-action className="inline-flex min-w-0 items-center" onClick={(e) => e.stopPropagation()}>
      <Popover
        modal={false}
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) armTimelineRowClickSuppression()
        }}
      >
        <PopoverAnchor asChild>
          <button
            type="button"
            className={cn(yearButtonClass, scrub && scrubEwCursor && 'cursor-ew-resize', className)}
            aria-label={`Year ${displayYear}. Open year selector`}
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
              if (!scrub || e.button !== 0) return
              suppressPopoverClickRef.current = false
              setScrubEwCursor(false)
              scrubRef.current = {
                pointerId: e.pointerId,
                originX: e.clientX,
                anchorYear: displayYear,
                maxAbsDx: 0,
                lastEmittedDelta: null,
              }
            }}
            onPointerMove={(e) => {
              if (!scrub) return
              const g = scrubRef.current
              if (!g || g.pointerId !== e.pointerId) return
              const dx = e.clientX - g.originX
              g.maxAbsDx = Math.max(g.maxAbsDx, Math.abs(dx))
              if (g.maxAbsDx >= YEAR_SCRUB_THRESHOLD_PX) {
                try {
                  if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
                    e.currentTarget.setPointerCapture(e.pointerId)
                  }
                } catch {
                  /* ignore */
                }
                setScrubEwCursor(true)
              }
              if (g.maxAbsDx < YEAR_SCRUB_THRESHOLD_PX) return
              const deltaYears = Math.trunc(dx / YEAR_SCRUB_PIXELS_PER_YEAR)
              if (deltaYears === g.lastEmittedDelta) return
              g.lastEmittedDelta = deltaYears
              commitTargetYear(g.anchorYear + deltaYears)
            }}
            onPointerUp={(e) => endScrubGesture(e.currentTarget, e.pointerId)}
            onPointerCancel={(e) => endScrubGesture(e.currentTarget, e.pointerId)}
          >
            {displayYear}
          </button>
        </PopoverAnchor>
        <PopoverContent
          align={align}
          sideOffset={6}
          className="w-auto bg-popover p-2 shadow-md"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-1 px-0.5 pb-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-7 shrink-0"
              aria-label="Previous years"
              onClick={() => setPageStartYear((y) => y - YEARS_PER_PAGE)}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {yearOptions[0]}–{yearOptions[yearOptions.length - 1]}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-7 shrink-0"
              aria-label="Next years"
              onClick={() => setPageStartYear((y) => y + YEARS_PER_PAGE)}
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {yearOptions.map((year) => (
              <button
                key={year}
                type="button"
                className={cn(
                  'pressable dance-focus-ring inline-flex h-8 cursor-pointer items-center justify-center rounded-md text-sm tabular-nums transition-surface duration-150 ease-hover',
                  year === displayYear
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-foreground hover:bg-accent/40',
                )}
                aria-label={`Set year to ${year}`}
                aria-pressed={year === displayYear}
                onClick={() => {
                  commitTargetYear(year)
                  setOpen(false)
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </span>
  )
}
