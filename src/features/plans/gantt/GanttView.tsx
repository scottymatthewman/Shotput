import { GanttBar } from '@/features/plans/gantt/GanttBar'
import { ganttBarForegroundClass, GANTT_BAR_STATUS_BUTTON_CLASS } from '@/features/plans/gantt/ganttBarPhaseTokens'
import { armTimelineRowClickSuppression } from '@/components/dance/phaseStatusMenu'
import { PhaseStatusIcon } from '@/components/dance/StatusBadge'
import { PhaseStatusDropdown } from '@/features/plans/PhaseStatusDropdown'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { GanttCollisionBoundaryContext } from '@/features/plans/gantt/GanttCollisionBoundaryContext'
import {
  commitDayDelta,
  createGesture,
  datesAfterCommit,
  parsePhaseCalendarDate,
  previewDeltaDays,
  type GanttDragKind,
  type GanttGesture,
} from '@/features/plans/gantt/ganttDrag'
import { getEffectivePhaseStatus, normalizePhaseStatus } from '@/lib/phaseStatus'
import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
import type { Phase, Workspace } from '@/types/domain'
import {
  addDays,
  differenceInCalendarDays,
  eachWeekOfInterval,
  endOfWeek,
  format,
  max as dfMax,
  min as dfMin,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

const PX_PER_DAY = 22
const MIN_ZOOM = 0.35
const MAX_ZOOM = 2.5
const GANTT_DRAG_THRESHOLD_PX = 8

function weekFullyOutsideProject(weekStart: Date, projFirst: Date, projLast: Date): boolean {
  const ws = startOfDay(weekStart)
  const we = startOfDay(addDays(ws, 6))
  return we < projFirst || ws > projLast
}

/** e.g. "May 1 - 7" same month, or "May 31 - Jun 6" across months. */
function formatWeekRangeLabel(weekStart: Date) {
  const a = startOfDay(weekStart)
  const b = startOfDay(addDays(a, 6))
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) {
    return `${format(a, 'MMM d')} - ${format(b, 'd')}`
  }
  return `${format(a, 'MMM d')} - ${format(b, 'MMM d')}`
}

type GanttViewProps = {
  workspace: Workspace
  planId: string
  phases: Phase[]
  selectedPhaseId: string | null
  focusedPhaseId: string | null
  onSelectPhase: (id: string | null) => void
}

export function GanttView({
  workspace,
  planId,
  phases,
  selectedPhaseId,
  focusedPhaseId,
  onSelectPhase,
}: GanttViewProps) {
  const updatePhaseDates = usePlansStore((s) => s.updatePhaseDates)
  const onSelectPhaseRef = useRef(onSelectPhase)
  onSelectPhaseRef.current = onSelectPhase
  const plan = workspace.plans[planId]

  const { min, max, ticks } = useMemo(() => {
    if (plan) {
      const start = startOfDay(new Date(`${plan.start}T12:00:00`))
      const end = startOfDay(new Date(`${plan.end}T12:00:00`))
      const from = startOfWeek(start, { weekStartsOn: 1 })
      const to = endOfWeek(end, { weekStartsOn: 1 })
      const weeks = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 })
      return { min: from, max: to, ticks: weeks }
    }
    const dates = phases.flatMap((p) => [new Date(p.start), new Date(p.end)])
    const start = dfMin(dates) ?? new Date()
    const end = dfMax(dates) ?? new Date()
    const from = startOfWeek(start, { weekStartsOn: 1 })
    const to = endOfWeek(end, { weekStartsOn: 1 })
    const weeks = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 })
    return { min: from, max: to, ticks: weeks }
  }, [phases, plan])

  const totalDaysH = Math.max(1, differenceInCalendarDays(max, min) + 1)

  const projectBounds = useMemo(() => {
    if (!plan) return null
    const projFirst = startOfDay(new Date(`${plan.start}T12:00:00`))
    const projLast = startOfDay(new Date(`${plan.end}T12:00:00`))
    return { projFirst, projLast }
  }, [plan])

  const today = startOfDay(new Date())
  const todayOffsetDays = differenceInCalendarDays(today, min)
  const showTodayLine = todayOffsetDays >= 0 && todayOffsetDays < totalDaysH
  const todayLeftPct = (todayOffsetDays / totalDaysH) * 100

  const [zoom, setZoom] = useState(1)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [ganttCollisionBoundary, setGanttCollisionBoundary] = useState<HTMLDivElement | null>(null)
  const [viewportW, setViewportW] = useState(0)

  const baseTimelineWidthPx = totalDaysH * PX_PER_DAY * zoom
  const rawZoomFloor =
    viewportW > 0 && totalDaysH > 0 ? viewportW / (totalDaysH * PX_PER_DAY) : MIN_ZOOM
  /** Can't zoom out so far the timeline is narrower than the viewport; capped at MAX_ZOOM. */
  const zoomMinEffective = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, rawZoomFloor))
  const timelineWidthPx = Math.max(480, baseTimelineWidthPx, viewportW || 0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setViewportW(el.clientWidth))
    ro.observe(el)
    setViewportW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    setZoom((z) => Number(Math.min(MAX_ZOOM, Math.max(zoomMinEffective, z)).toFixed(3)))
  }, [zoomMinEffective])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      e.preventDefault()
      const step = 0.085
      const delta = e.deltaY > 0 ? -step : step
      setZoom((z) =>
        Number(Math.min(MAX_ZOOM, Math.max(zoomMinEffective, z + delta)).toFixed(3)),
      )
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomMinEffective])

  const [gesture, setGesture] = useState<GanttGesture | null>(null)
  const [previewDayDelta, setPreviewDayDelta] = useState(0)
  const gestureRef = useRef<GanttGesture | null>(null)
  const captureElRef = useRef<HTMLElement | null>(null)
  const totalDaysHRef = useRef(totalDaysH)
  totalDaysHRef.current = totalDaysH

  const detachDocumentListeners = useRef<(() => void) | null>(null)

  const finishGesture = useCallback(
    (pointerId: number, clientX: number) => {
      const g = gestureRef.current
      if (!g || g.pointerId !== pointerId) return

      const captureEl = captureElRef.current
      gestureRef.current = null
      captureElRef.current = null
      setPreviewDayDelta(0)
      setGesture(null)

      detachDocumentListeners.current?.()
      detachDocumentListeners.current = null

      try {
        if (captureEl?.hasPointerCapture(pointerId)) {
          captureEl.releasePointerCapture(pointerId)
        }
      } catch {
        /* ignore */
      }

      if (g.moved) {
        const days = commitDayDelta(g, clientX, totalDaysHRef.current)
        const dates = datesAfterCommit(g, days)
        if (dates) {
          updatePhaseDates(g.phaseId, dates.start, dates.end)
          armTimelineRowClickSuppression()
        }
      } else if (g.kind === 'move') {
        onSelectPhaseRef.current(g.phaseId)
        armTimelineRowClickSuppression()
      }
    },
    [updatePhaseDates],
  )

  useEffect(() => {
    return () => {
      detachDocumentListeners.current?.()
      detachDocumentListeners.current = null
    }
  }, [])

  const startGesture = useCallback(
    (
      e: ReactPointerEvent,
      trackEl: HTMLDivElement,
      phase: Phase,
      kind: GanttDragKind,
    ) => {
      if (e.button !== 0) return

      detachDocumentListeners.current?.()
      detachDocumentListeners.current = null

      const prev = gestureRef.current
      if (prev) finishGesture(prev.pointerId, e.clientX)

      try {
        trackEl.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      captureElRef.current = trackEl

      const next = createGesture(
        phase,
        e.pointerId,
        e.clientX,
        timelineWidthPx,
        kind,
      )
      gestureRef.current = next
      setGesture(next)
      setPreviewDayDelta(0)

      const onPointerMove = (ev: PointerEvent) => {
        const current = gestureRef.current
        if (!current || current.pointerId !== ev.pointerId) return

        const dx = ev.clientX - current.originX
        if (!current.moved) {
          if (Math.abs(dx) < GANTT_DRAG_THRESHOLD_PX) return
          const moved = { ...current, moved: true }
          gestureRef.current = moved
          setGesture(moved)
        }

        setPreviewDayDelta(
          previewDeltaDays(gestureRef.current!, ev.clientX, totalDaysHRef.current),
        )
      }

      const onPointerEnd = (ev: PointerEvent) => {
        finishGesture(ev.pointerId, ev.clientX)
      }

      document.addEventListener('pointermove', onPointerMove)
      document.addEventListener('pointerup', onPointerEnd)
      document.addEventListener('pointercancel', onPointerEnd)

      detachDocumentListeners.current = () => {
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerup', onPointerEnd)
        document.removeEventListener('pointercancel', onPointerEnd)
      }
    },
    [timelineWidthPx, finishGesture],
  )

  return (
    <GanttCollisionBoundaryContext.Provider value={ganttCollisionBoundary}>
      <div className="flex min-h-0 flex-1 flex-col overflow-clip">
        <div
          ref={(el) => {
            scrollRef.current = el
            setGanttCollisionBoundary(el)
          }}
          className="relative min-h-0 min-w-0 flex-1 basis-0 overflow-x-auto overflow-y-auto overscroll-y-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
        <div
          className="flex min-h-full flex-col pb-0"
          style={{ width: timelineWidthPx, minWidth: timelineWidthPx }}
        >
          <div className="sticky top-0 z-30 shrink-0 overflow-clip">
            <div className="relative isolate flex min-h-10">
              {/* Behind labels: solid for upper 75%, quick linear fade in bottom 25%. */}
              <div
                className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_bottom,var(--color-surface-1)_0%,var(--color-surface-1)_75%,transparent_100%)]"
                aria-hidden
              />
              {ticks.map((w) => {
                const outside =
                  projectBounds &&
                  weekFullyOutsideProject(w, projectBounds.projFirst, projectBounds.projLast)
                return (
                  <div
                    key={w.toISOString()}
                    className={cn(
                      'relative z-10 flex shrink-0 items-center justify-center px-1 py-2 text-center text-xs leading-snug text-muted-foreground',
                      outside && 'text-muted-foreground/70',
                    )}
                    style={{ width: `${(7 / totalDaysH) * 100}%` }}
                  >
                    {formatWeekRangeLabel(w)}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
              {ticks.map((w, i) => (
                <div
                  key={`week-vline-${w.toISOString()}`}
                  className="absolute top-0 bottom-0 w-px"
                  style={{
                    left: `${((i * 7) / totalDaysH) * 100}%`,
                    background:
                      'repeating-linear-gradient(to bottom, color-mix(in srgb, var(--color-border) 50%, transparent) 0, color-mix(in srgb, var(--color-border) 50%, transparent) 8px, transparent 8px, transparent 20px)',
                  }}
                />
              ))}
            </div>

            <div className="relative isolate z-[1] min-h-0 flex-1">
              {showTodayLine ? (
                <div
                  className="pointer-events-none absolute inset-y-0 z-[2] w-px -translate-x-1/2 bg-[var(--dance-gantt-today-line)]"
                  style={{ left: `${todayLeftPct}%` }}
                />
              ) : null}

              {phases.map((phase) => (
                <GanttTimelineRow
                  key={phase.id}
                  phase={phase}
                  chartStart={min}
                  totalDaysH={totalDaysH}
                  selectedPhaseId={selectedPhaseId}
                  focusedPhaseId={focusedPhaseId}
                  gesture={gesture}
                  previewDayDelta={previewDayDelta}
                  startGesture={startGesture}
                  onSelectPhase={onSelectPhase}
                />
              ))}
            </div>
          </div>
        </div>
        </div>
    </div>
    </GanttCollisionBoundaryContext.Provider>
  )
}

const GanttTimelineRow = memo(function GanttTimelineRow({
  phase,
  chartStart,
  totalDaysH,
  selectedPhaseId,
  focusedPhaseId,
  gesture,
  previewDayDelta,
  startGesture,
  onSelectPhase,
}: {
  phase: Phase
  chartStart: Date
  totalDaysH: number
  selectedPhaseId: string | null
  focusedPhaseId: string | null
  gesture: GanttGesture | null
  previewDayDelta: number
  startGesture: (
    e: ReactPointerEvent,
    trackEl: HTMLDivElement,
    phase: Phase,
    kind: GanttDragKind,
  ) => void
  onSelectPhase: (id: string | null) => void
}) {
  /** Live phase + effective status (auto todo/missed when `statusIsManual` is false). */
  const livePhase = usePlansStore((s) => s.workspace.phases[phase.id] ?? phase)
  const storedStatus = normalizePhaseStatus(livePhase.status)
  const status = getEffectivePhaseStatus(livePhase)
  const setHoveredPhaseId = usePlansStore((s) => s.setHoveredPhaseId)

  const dragging = gesture?.phaseId === phase.id && gesture?.moved
  const frozen = gesture?.phaseId === phase.id ? gesture : null
  const start = frozen ? frozen.origStart : parsePhaseCalendarDate(livePhase.start)
  const end = frozen ? frozen.origEnd : parsePhaseCalendarDate(livePhase.end)
  const offsetDays = Math.max(0, differenceInCalendarDays(start, chartStart))
  const spanDays = Math.max(1, differenceInCalendarDays(end, start) + 1)
  let visualOffset = offsetDays
  let visualSpan = spanDays
  if (dragging && frozen) {
    if (frozen.kind === 'move') {
      visualOffset = Math.max(0, offsetDays + previewDayDelta)
      visualSpan = spanDays
    } else if (frozen.kind === 'resize-start') {
      const o0 = Math.max(0, differenceInCalendarDays(frozen.origStart, chartStart))
      visualOffset = Math.max(0, o0 + previewDayDelta)
      visualSpan = Math.max(1, frozen.origSpanDays - previewDayDelta)
    } else {
      visualOffset = Math.max(0, offsetDays)
      visualSpan = Math.max(1, frozen.origSpanDays + previewDayDelta)
    }
  }
  return (
    <div
      data-gantt-task-hover={phase.id}
      className={cn(
        'relative flex cursor-default transition-surface duration-150 ease-hover',
        dragging ? 'z-20' : 'z-[3]',
        selectedPhaseId === phase.id && 'bg-accent/20',
        focusedPhaseId === phase.id && 'ring-1 ring-inset ring-ring/50',
      )}
      onMouseEnter={() => setHoveredPhaseId(phase.id)}
      onMouseLeave={() => setHoveredPhaseId(null)}
    >
      <TrackBody
        phase={livePhase}
        barStatus={status}
        storedStatus={storedStatus}
        totalDays={totalDaysH}
        visualOffset={visualOffset}
        visualSpanDays={visualSpan}
        startGesture={startGesture}
        onSelectPhase={onSelectPhase}
      />
    </div>
  )
})

function TrackBody({
  phase,
  barStatus,
  storedStatus,
  totalDays,
  visualOffset,
  visualSpanDays,
  startGesture,
  onSelectPhase,
}: {
  phase: Phase
  barStatus: Phase['status']
  storedStatus: Phase['status']
  totalDays: number
  visualOffset: number
  visualSpanDays: number
  startGesture: (
    e: ReactPointerEvent,
    trackEl: HTMLDivElement,
    phase: Phase,
    kind: GanttDragKind,
  ) => void
  onSelectPhase: (id: string | null) => void
}) {
  const nudgePhaseByDays = usePlansStore((s) => s.nudgePhaseByDays)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const leftPct = (visualOffset / totalDays) * 100
  const widthPct = Math.max((visualSpanDays / totalDays) * 100, 100 / totalDays)

  const captureAndBegin = (e: ReactPointerEvent, kind: GanttDragKind) => {
    if (!trackRef.current) return
    startGesture(e, trackRef.current, phase, kind)
  }

  return (
    <div
      ref={trackRef}
      className="relative min-h-12 w-full flex-1 touch-none py-2.5 pr-1 pl-1"
    >
      <div
        className="absolute top-1/2 max-w-[calc(100%-8px)] min-w-[72px] -translate-y-1/2"
        style={{
          left: `${leftPct}%`,
          width: `${Math.min(widthPct, 100 - leftPct)}%`,
        }}
      >
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <GanttBar
              status={barStatus}
              className="relative min-w-0"
              toolbar={
                <PhaseStatusDropdown
                  phaseId={phase.id}
                  currentStatus={storedStatus}
                  modal={false}
                  hotkeyOpensDropdown
                  menuPlacement={{
                    side: 'left',
                    align: 'start',
                    sideOffset: 8,
                  }}
                >
                  <button
                    type="button"
                    className={cn(
                      'dance-focus-ring cursor-pointer outline-none transition-surface duration-150 ease-hover hover:bg-[var(--dance-gantt-row-hover)] data-[state=open]:bg-[var(--dance-gantt-row-hover)] pressable',
                      GANTT_BAR_STATUS_BUTTON_CLASS,
                    )}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label="Change phase status"
                  >
                    <PhaseStatusIcon
                      status={barStatus}
                      className="pointer-events-none size-4 shrink-0"
                    />
                  </button>
                </PhaseStatusDropdown>
              }
              onBodyPointerDown={(e) => captureAndBegin(e, 'move')}
              onResizeStartPointerDown={(e) => captureAndBegin(e, 'resize-start')}
              onResizeEndPointerDown={(e) => captureAndBegin(e, 'resize-end')}
            >
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-left text-xs font-medium',
                  ganttBarForegroundClass(barStatus),
                )}
              >
                {phase.title}
              </span>
            </GanttBar>
          </ContextMenuTrigger>
          <ContextMenuContent className="min-w-[12rem]">
            <ContextMenuItem
              onSelect={() => {
                onSelectPhase(phase.id)
                armTimelineRowClickSuppression()
              }}
            >
              Open details
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onSelect={() => {
                nudgePhaseByDays(phase.id, -1)
                armTimelineRowClickSuppression()
              }}
            >
              Move −1 day
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => {
                nudgePhaseByDays(phase.id, 1)
                armTimelineRowClickSuppression()
              }}
            >
              Move +1 day
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  )
}
