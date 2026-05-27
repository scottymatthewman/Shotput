import {
  GANTT_BAR_HEIGHT_CLASS,
  GANTT_BAR_INNER_ROW_CLASS,
  GANTT_BAR_SURFACE_CLASS,
} from '@/features/plans/gantt/ganttBarPhaseTokens'
import { cn } from '@/lib/utils'
import type { PhaseStatus } from '@/types/domain'
import {
  forwardRef,
  type CSSProperties,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from 'react'

/** Space between colored bar edge and inner side of the handle (px). */
const HANDLE_GAP_PX = 4
/** Resize handle width (px). Drives the white pill `width`; keep in sync with layout math below. */
const HANDLE_W_PX = 2
/** Hit zone extends this far into the bar from each edge (px). */
const RESIZE_ZONE_INTO_BAR_PX = 10
/** Minimum touch width (px) for resize drag; centered on handle pill. */
const RESIZE_HIT_W_PX = 22

const RESIZE_PILL_BASE =
  'gantt-resize-pill pointer-events-none absolute top-1/2 h-7 max-w-none -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150 ease-out peer-hover:opacity-100 peer-active:opacity-100 peer-focus-visible:opacity-100 motion-reduce:opacity-100'

/**
 * Hit + hover strip at the start/end of the bar: handle + gap + band into the bar.
 */
function ResizeEndZone({
  align,
  ariaLabel,
  onPointerDown,
}: {
  align: 'left' | 'right'
  ariaLabel: string
  onPointerDown: PointerEventHandler<HTMLButtonElement>
}) {
  const out = HANDLE_GAP_PX + HANDLE_W_PX
  const zoneW = HANDLE_W_PX + HANDLE_GAP_PX + RESIZE_ZONE_INTO_BAR_PX
  /** Horizontal center of the 2px pill within the zone (for hit target alignment). */
  const pillCenterX = align === 'left' ? HANDLE_W_PX / 2 : zoneW - HANDLE_W_PX / 2

  return (
    <div
      className="pointer-events-none absolute top-1/2 z-30 h-[52px] -translate-y-1/2"
      style={
        align === 'left'
          ? { left: `-${out}px`, width: `${zoneW}px` }
          : { right: `-${out}px`, width: `${zoneW}px` }
      }
    >
      <button
        type="button"
        tabIndex={-1}
        className="peer dance-focus-ring pointer-events-auto absolute -top-1.5 -bottom-1.5 max-w-none -translate-x-1/2 cursor-ew-resize touch-none rounded-md border-0 bg-transparent p-0 outline-none transition-surface duration-150 ease-out pressable"
        style={{ left: `${pillCenterX}px`, width: `${RESIZE_HIT_W_PX}px` }}
        aria-label={ariaLabel}
        onPointerDown={(e) => {
          e.stopPropagation()
          onPointerDown(e)
        }}
      />
      <span
        className={cn(RESIZE_PILL_BASE, align === 'left' && 'left-0', align === 'right' && 'right-0')}
        style={{ width: HANDLE_W_PX }}
        aria-hidden
      />
    </div>
  )
}

export type GanttBarProps = {
  status: PhaseStatus
  className?: string
  style?: CSSProperties
  /** Renders above the draggable body (z-10 vs z-0) — e.g. status dropdown trigger. */
  toolbar?: ReactNode
  /** Draggable lane content (typically task title). */
  children?: ReactNode
  onClick?: MouseEventHandler<HTMLDivElement>
  /** Move whole bar (start + end). */
  onBodyPointerDown?: PointerEventHandler<HTMLDivElement>
  /** Drag left edge to change start date. */
  onResizeStartPointerDown?: PointerEventHandler<HTMLButtonElement>
  /** Drag right edge to change end date. */
  onResizeEndPointerDown?: PointerEventHandler<HTMLButtonElement>
}

/**
 * Gantt task bar: solid surface with white pill handles outside the ends
 * (visible only when hovering near each end).
 * Drag move/end is handled on the Gantt track row via pointer capture (see GanttView).
 */
export const GanttBar = forwardRef<HTMLDivElement, GanttBarProps>(function GanttBar(
  {
    status: _status,
    className,
    style,
    toolbar,
    children,
    onClick,
    onBodyPointerDown,
    onResizeStartPointerDown,
    onResizeEndPointerDown,
  },
  ref,
) {
  return (
    <div ref={ref} className={cn('relative min-w-0 select-none', className)} style={style}>
      <ResizeEndZone
        align="left"
        ariaLabel="Drag to change start date"
        onPointerDown={(e) => onResizeStartPointerDown?.(e)}
      />
      <ResizeEndZone
        align="right"
        ariaLabel="Drag to change end date"
        onPointerDown={(e) => onResizeEndPointerDown?.(e)}
      />

      <div className={GANTT_BAR_SURFACE_CLASS}>
        <div className="gantt-bar-fill pointer-events-none absolute inset-0 z-0" aria-hidden />
        <div className={cn(GANTT_BAR_INNER_ROW_CLASS, GANTT_BAR_HEIGHT_CLASS, 'relative z-[1]')}>

          {toolbar ? (
            <div className="relative z-10 flex shrink-0 items-stretch">{toolbar}</div>
          ) : null}

          <div
            className={cn(
              'relative z-[2] flex min-h-0 min-w-0 flex-1 cursor-pointer touch-none items-center gap-1 p-1 active:cursor-grabbing',
              !children ? 'min-h-6' : '',
            )}
            role="slider"
            aria-valuemin={0}
            onClick={onClick}
            onPointerDown={(e) => {
              e.stopPropagation()
              onBodyPointerDown?.(e)
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
})
