import type { Phase, Plan } from '@/types/domain'
import {
  datesAfterCommit,
  parsePhaseCalendarDate,
  type GanttGesture,
} from '@/features/plans/gantt/ganttDrag'
import {
  addDays,
  eachWeekOfInterval,
  endOfWeek,
  max as dfMax,
  min as dfMin,
  startOfDay,
  startOfWeek,
} from 'date-fns'

/** Padding before earliest phase start and after latest phase end. */
export const GANTT_TIMELINE_WEEK_BUFFER_DAYS = 7

const WEEK_OPTS = { weekStartsOn: 1 as const }

/** Phase calendar span, optionally including an in-progress gantt drag preview. */
export function phaseDatesWithGanttPreview(
  phase: Phase,
  gesture: GanttGesture | null,
  previewDayDelta: number,
): { start: Date; end: Date } {
  if (!gesture || gesture.phaseId !== phase.id) {
    return {
      start: parsePhaseCalendarDate(phase.start),
      end: parsePhaseCalendarDate(phase.end),
    }
  }

  const { origStart, origEnd } = gesture
  if (!gesture.moved || previewDayDelta === 0) {
    return { start: origStart, end: origEnd }
  }

  const dates = datesAfterCommit(gesture, Math.round(previewDayDelta))
  if (!dates) return { start: origStart, end: origEnd }
  return {
    start: parsePhaseCalendarDate(dates.start),
    end: parsePhaseCalendarDate(dates.end),
  }
}

/** Earliest start and latest end across phases (with optional drag preview). */
export function phaseExtentFromPhases(
  phases: Phase[],
  gesture: GanttGesture | null = null,
  previewDayDelta = 0,
): { first: Date; last: Date } | null {
  if (phases.length === 0) return null

  let first: Date | null = null
  let last: Date | null = null
  for (const phase of phases) {
    const { start, end } = phaseDatesWithGanttPreview(phase, gesture, previewDayDelta)
    first = first ? dfMin([first, start]) : start
    last = last ? dfMax([last, end]) : end
  }
  return first && last ? { first, last } : null
}

/**
 * Visible gantt range: one calendar week before the earliest phase start and one week
 * after the latest phase end, snapped to Monday–Sunday week boundaries.
 */
export function computeGanttTimelineRange(
  phases: Phase[],
  plan: Plan | undefined,
  gesture: GanttGesture | null = null,
  previewDayDelta = 0,
): { min: Date; max: Date; ticks: Date[] } {
  const extent = phaseExtentFromPhases(phases, gesture, previewDayDelta)

  let coreFirst: Date
  let coreLast: Date
  if (extent) {
    coreFirst = extent.first
    coreLast = extent.last
  } else if (plan) {
    coreFirst = parsePhaseCalendarDate(plan.start)
    coreLast = parsePhaseCalendarDate(plan.end)
  } else {
    const today = startOfDay(new Date())
    coreFirst = today
    coreLast = today
  }

  const bufferedStart = startOfDay(
    addDays(coreFirst, -GANTT_TIMELINE_WEEK_BUFFER_DAYS),
  )
  const bufferedEnd = startOfDay(addDays(coreLast, GANTT_TIMELINE_WEEK_BUFFER_DAYS))
  const min = startOfWeek(bufferedStart, WEEK_OPTS)
  const max = endOfWeek(bufferedEnd, WEEK_OPTS)
  const ticks = eachWeekOfInterval({ start: min, end: max }, WEEK_OPTS)
  return { min, max, ticks }
}
