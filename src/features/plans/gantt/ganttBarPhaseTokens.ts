import type { PhaseStatus } from '@/types/domain'

/** Row height (see `--dance-gantt-bar-height` in colors.css). */
export const GANTT_BAR_HEIGHT_CLASS = 'min-h-[var(--dance-gantt-bar-height)]'

/** Shared Gantt bar chrome — inset edge overlay (see `.inset-edge` in index.css). */
export const GANTT_BAR_SURFACE_CLASS =
  'gantt-bar-surface inset-edge inset-edge-full inset-edge-hover w-full rounded-sm'

/** Inner row — status rail stretches to full bar height. */
export const GANTT_BAR_INNER_ROW_CLASS =
  'relative flex w-full cursor-pointer items-stretch gap-1 pr-1 active:cursor-grabbing'

/** Status rail — full-height hit target; horizontal inset only. */
export const GANTT_BAR_STATUS_BUTTON_CLASS =
  'flex w-9 shrink-0 self-stretch items-center justify-center rounded-l-[var(--radius-sm)] rounded-r-[1px] pl-[var(--dance-gantt-bar-status-touch-inset-x)] pr-0 py-0'

export const GANTT_BAR_AVATAR_RING_CLASS = 'ring-2 ring-border'

/** @deprecated Use `GANTT_BAR_SURFACE_CLASS` — borders are status-agnostic. */
export function ganttBarOuterRingClass(_status: PhaseStatus): string {
  return GANTT_BAR_SURFACE_CLASS
}

/** @deprecated Use `GANTT_BAR_AVATAR_RING_CLASS`. */
export const ganttBarStackRingByStatus: Record<PhaseStatus, string> = {
  backlog: GANTT_BAR_AVATAR_RING_CLASS,
  todo: GANTT_BAR_AVATAR_RING_CLASS,
  in_progress: GANTT_BAR_AVATAR_RING_CLASS,
  in_review: GANTT_BAR_AVATAR_RING_CLASS,
  blocked: GANTT_BAR_AVATAR_RING_CLASS,
  done: GANTT_BAR_AVATAR_RING_CLASS,
}

/** Title on Gantt bars. */
export function ganttBarForegroundClass(_status: PhaseStatus): string {
  return 'text-foreground'
}
