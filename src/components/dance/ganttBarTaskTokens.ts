import { normalizeTaskStatus } from '@/lib/taskStatus'
import type { TaskStatus } from '@/types/domain'
import type { CSSProperties } from 'react'

/**
 * **Interior fill** only (`getGanttBarFillStyle`).
 * Stroke is a Tailwind **ring** (`ganttBarOuterRingClass`) — outside the rounded box, so nothing
 * is painted on top of translucent fill pixels and the lane stays the backdrop for the glass.
 */
const T = {
  /** Neutral glass (todo / in-progress fill): white */
  w: 0.01,
  /** Blocked / done accent end (fill gradient) */
  accent: 0.04,
} as const

const W = (a: number) => `rgba(255,255,255,${a})`
/** @see `--color-coral` in `index.css` (#FF886A) */
const CORAL = (a: number) => `rgba(255,136,106,${a})`
/** In-progress accent / `--color-task-bar-progress` (#E7FF97) */
const LIME = (a: number) => `rgba(231,255,151,${a})`
const MINT = (a: number) => `rgba(52,255,180,${a})`
/** In-review accent / `--color-assignee-blue` (#5c6bc0) */
const REVIEW_BLUE = (a: number) => `rgba(92,107,192,${a})`

/** Glass base fill: white @ `T.w`. */
const baseFillGradient = `linear-gradient(to right, ${W(T.w)}, ${W(T.w)})`

/** Fill only. Uses `T.w` / `T.accent`. */
export function getGanttBarFillStyle(status: TaskStatus): CSSProperties {
  const s = normalizeTaskStatus(status)

  let fill: string
  switch (s) {
    case 'in_progress':
      fill = `linear-gradient(to right, ${W(T.w)}, ${LIME(T.accent)})`
      break
    case 'in_review':
      fill = `linear-gradient(to right, ${W(T.w)}, ${REVIEW_BLUE(T.accent)})`
      break
    case 'blocked':
      fill = `linear-gradient(to right, ${W(T.w)}, ${CORAL(T.accent)})`
      break
    case 'done':
      fill = `linear-gradient(to right, ${W(T.w)}, ${MINT(T.accent)})`
      break
    default:
      fill = baseFillGradient
      break
  }

  return {
    backgroundImage: fill,
  }
}

/**
 * Outside `ring-*` only — no stacked border layer over the fill.
 * Tune opacities in the class strings below.
 */
export function ganttBarOuterRingClass(status: TaskStatus): string {
  const s = normalizeTaskStatus(status)
  switch (s) {
    case 'in_progress':
      return 'ring-1 ring-[#FFF]/45'
    case 'in_review':
      return 'ring-1 ring-assignee-blue/35'
    case 'blocked':
      return 'ring-1 ring-coral/35'
    case 'done':
      return 'ring-1 ring-[#34FFB4]/35'
    default:
      return 'ring-1 ring-white/15'
  }
}

/** Ring around assignee stack avatars — tuned for glass Gantt lanes. */
export const ganttBarStackRingByStatus: Record<TaskStatus, string> = {
  todo: 'ring-white/35',
  in_progress: 'ring-white/50',
  in_review: 'ring-assignee-blue/50',
  blocked: 'ring-coral/50',
  done: 'ring-[#34FFB4]/50',
}

/** Title + toolbar icon on glass Gantt lanes — one tone across statuses (`text-foreground`). */
export function ganttBarForegroundClass(_status: TaskStatus): string {
  return 'text-foreground'
}
