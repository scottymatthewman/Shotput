const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

export function isTaskCalendarDayString(s: string): boolean {
  if (!ISO_DAY.test(s)) return false
  return !Number.isNaN(new Date(`${s}T12:00:00`).getTime())
}

/**
 * Caller sets both boundaries at once (e.g. Gantt drag). If they arrive inverted, coerce to chronological order.
 */
export function coerceOrderedTaskDates(start: string, end: string): { start: string; end: string } {
  if (!isTaskCalendarDayString(start) || !isTaskCalendarDayString(end)) {
    return { start, end }
  }
  if (start.localeCompare(end) <= 0) return { start, end }
  return { start: end, end: start }
}

/**
 * After merging a patch, enforce start ≤ end. Uses which fields were patched so a single-boundary edit clamps
 * toward the untouched opposite date instead of rewriting both.
 */
export function clampTaskDatesAfterMerge(
  task: { start: string; end: string },
  touched: { start: boolean; end: boolean },
): void {
  if (!touched.start && !touched.end) return

  const s = task.start
  const e = task.end
  if (!isTaskCalendarDayString(s) || !isTaskCalendarDayString(e)) return
  if (s.localeCompare(e) <= 0) return

  if (touched.start && !touched.end) {
    task.start = e
  } else if (!touched.start && touched.end) {
    task.end = s
  } else {
    task.start = s.localeCompare(e) < 0 ? s : e
    task.end = s.localeCompare(e) < 0 ? e : s
  }
}
