import { format, isValid, parseISO } from 'date-fns'

/** Avoids RangeError — `format` throws when the Date is invalid. */
export function formatIsoCalendar(
  isoDay: string | undefined,
  fmt: string,
  fallback = '—',
): string {
  if (!isoDay?.trim()) return fallback
  const d = parseISO(`${isoDay.trim()}T12:00:00`)
  if (!isValid(d)) return fallback
  try {
    return format(d, fmt)
  } catch {
    return fallback
  }
}
