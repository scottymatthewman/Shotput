const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

export function isPhaseCalendarDayString(s: string): boolean {
  if (!ISO_DAY.test(s)) return false
  return !Number.isNaN(new Date(`${s}T12:00:00`).getTime())
}

/**
 * Caller sets both boundaries at once (e.g. Gantt drag). If they arrive inverted, coerce to chronological order.
 */
export function coerceOrderedPhaseDates(start: string, end: string): { start: string; end: string } {
  if (!isPhaseCalendarDayString(start) || !isPhaseCalendarDayString(end)) {
    return { start, end }
  }
  if (start.localeCompare(end) <= 0) return { start, end }
  return { start: end, end: start }
}

/** Clamp a single ISO day to optional min/max (inclusive). Used by date scrub + calendar. */
export function clampIsoDayToRange(day: string, min?: string, max?: string): string {
  if (!isPhaseCalendarDayString(day)) return day
  let result = day
  if (min && isPhaseCalendarDayString(min) && result.localeCompare(min) < 0) result = min
  if (max && isPhaseCalendarDayString(max) && result.localeCompare(max) > 0) result = max
  return result
}

export function getIsoDayYear(iso: string): number | null {
  if (!isPhaseCalendarDayString(iso)) return null
  return new Date(`${iso}T12:00:00`).getFullYear()
}

function formatIsoDayFromDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Shift one ISO calendar day by whole years (noon anchor avoids DST drift). */
export function shiftIsoDayByYears(iso: string, yearDelta: number): string {
  if (!isPhaseCalendarDayString(iso) || yearDelta === 0) return iso
  const d = new Date(`${iso}T12:00:00`)
  d.setFullYear(d.getFullYear() + yearDelta)
  return formatIsoDayFromDate(d)
}

/** Shift start/end together, preserving span and order. */
export function applyYearDeltaToRange(
  start: string,
  end: string,
  yearDelta: number,
): { start: string; end: string } {
  if (yearDelta === 0) return { start, end }
  return {
    start: shiftIsoDayByYears(start, yearDelta),
    end: shiftIsoDayByYears(end, yearDelta),
  }
}

/** Set the range to a target end-year (both dates move by the same delta). */
export function applyTargetEndYearToRange(
  start: string,
  end: string,
  targetEndYear: number,
): { start: string; end: string } {
  const endYear = getIsoDayYear(end)
  if (endYear == null) return { start, end }
  return applyYearDeltaToRange(start, end, targetEndYear - endYear)
}

/**
 * After merging a patch, enforce start ≤ end. Uses which fields were patched so a single-boundary edit clamps
 * toward the untouched opposite date instead of rewriting both.
 */
export function clampPhaseDatesAfterMerge(
  phase: { start: string; end: string },
  touched: { start: boolean; end: boolean },
): void {
  if (!touched.start && !touched.end) return

  const s = phase.start
  const e = phase.end
  if (!isPhaseCalendarDayString(s) || !isPhaseCalendarDayString(e)) return
  if (s.localeCompare(e) <= 0) return

  if (touched.start && !touched.end) {
    phase.start = e
  } else if (!touched.start && touched.end) {
    phase.end = s
  } else {
    phase.start = s.localeCompare(e) < 0 ? s : e
    phase.end = s.localeCompare(e) < 0 ? e : s
  }
}
