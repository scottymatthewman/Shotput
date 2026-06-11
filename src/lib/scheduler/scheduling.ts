import type { ScheduleSlot } from '@/lib/scheduler/types'

const MAX_LOOKAHEAD_DAYS = 370

function slotDateOn(day: Date, time: string): Date {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  const result = new Date(day)
  result.setHours(hours, minutes, 0, 0)
  return result
}

/** Minute-granularity key so two targets never share a slot. */
export function slotKey(date: Date): string {
  const copy = new Date(date)
  copy.setSeconds(0, 0)
  return copy.toISOString()
}

/**
 * Next unoccupied default slot for an account, strictly after `after`.
 * `occupied` is the set of `slotKey()`s already taken in that account's queue.
 * Returns null when the account has no schedule slots configured.
 */
export function nextAvailableSlot(
  slots: ScheduleSlot[],
  occupied: ReadonlySet<string>,
  after: Date = new Date(),
): Date | null {
  if (slots.length === 0) return null

  for (let offset = 0; offset < MAX_LOOKAHEAD_DAYS; offset++) {
    const day = new Date(after)
    day.setDate(day.getDate() + offset)

    const candidates = slots
      .filter((slot) => slot.dayOfWeek === day.getDay())
      .map((slot) => slotDateOn(day, slot.time))
      .sort((a, b) => a.getTime() - b.getTime())

    for (const candidate of candidates) {
      if (candidate <= after) continue
      if (occupied.has(slotKey(candidate))) continue
      return candidate
    }
  }
  return null
}

/** Fallback when no slots are configured — the next top of the hour. */
export function nextTopOfHour(after: Date = new Date()): Date {
  const result = new Date(after)
  result.setMinutes(0, 0, 0)
  result.setHours(result.getHours() + 1)
  return result
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const DEFAULT_SCHEDULE_SLOTS: ScheduleSlot[] = [1, 2, 3, 4, 5].flatMap((dayOfWeek) => [
  { dayOfWeek, time: '09:00' },
  { dayOfWeek, time: '17:00' },
])
