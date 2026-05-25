import type { Phase } from '@/types/domain'
import { addDays, differenceInCalendarDays, format, startOfDay } from 'date-fns'

export type GanttDragKind = 'move' | 'resize-start' | 'resize-end'

export type GanttGesture = {
  phaseId: string
  pointerId: number
  originX: number
  origStart: Date
  origEnd: Date
  origSpanDays: number
  trackWidth: number
  kind: GanttDragKind
  /** True once horizontal movement crosses the drag threshold. */
  moved: boolean
}

export function parseTaskCalendarDate(iso: string): Date {
  return startOfDay(new Date(`${iso}T12:00:00`))
}

export function taskCalendarSpanDays(phase: Phase) {
  return Math.max(
    1,
    differenceInCalendarDays(parseTaskCalendarDate(phase.end), parseTaskCalendarDate(phase.start)) + 1,
  )
}

export function createGesture(
  phase: Phase,
  pointerId: number,
  originX: number,
  trackWidth: number,
  kind: GanttDragKind,
): GanttGesture {
  return {
    phaseId: phase.id,
    pointerId,
    originX,
    origStart: parseTaskCalendarDate(phase.start),
    origEnd: parseTaskCalendarDate(phase.end),
    origSpanDays: taskCalendarSpanDays(phase),
    trackWidth,
    kind,
    moved: false,
  }
}

/** Preview delta in fractional days while dragging (no DB writes). */
export function previewDeltaDays(gesture: GanttGesture, clientX: number, totalDays: number): number {
  const dx = clientX - gesture.originX
  const pxPerDay = gesture.trackWidth / totalDays
  let delta = dx / pxPerDay
  if (gesture.kind === 'resize-start') {
    delta = Math.min(delta, gesture.origSpanDays - 1)
  } else if (gesture.kind === 'resize-end') {
    delta = Math.max(delta, -(gesture.origSpanDays - 1))
  }
  return delta
}

/** Rounded day change to commit on pointer up (only when `moved`). */
export function commitDayDelta(gesture: GanttGesture, clientX: number, totalDays: number): number {
  const dx = clientX - gesture.originX
  const pxPerDay = gesture.trackWidth / totalDays
  let days = Math.round(dx / pxPerDay)
  if (gesture.kind === 'resize-start') {
    days = Math.min(days, gesture.origSpanDays - 1)
  } else if (gesture.kind === 'resize-end') {
    days = Math.max(days, -(gesture.origSpanDays - 1))
  }
  return days
}

export function datesAfterCommit(
  gesture: GanttGesture,
  days: number,
): { start: string; end: string } | null {
  if (days === 0) return null
  if (gesture.kind === 'move') {
    return {
      start: format(addDays(gesture.origStart, days), 'yyyy-MM-dd'),
      end: format(addDays(gesture.origEnd, days), 'yyyy-MM-dd'),
    }
  }
  if (gesture.kind === 'resize-start') {
    return {
      start: format(addDays(gesture.origStart, days), 'yyyy-MM-dd'),
      end: format(gesture.origEnd, 'yyyy-MM-dd'),
    }
  }
  return {
    start: format(gesture.origStart, 'yyyy-MM-dd'),
    end: format(addDays(gesture.origEnd, days), 'yyyy-MM-dd'),
  }
}
