import { cn } from '@/lib/utils'
import { Menu, useBloomContext, type Anchor, type Direction } from 'bloom-menu'
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

export type BloomPlacement = {
  direction?: Direction
  anchor?: Anchor
}

export type RadixLikePlacement = {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  alignOffset?: number
}

export function bloomPlacementFromRadix(
  placement?: RadixLikePlacement,
): BloomPlacement | undefined {
  if (!placement?.side && !placement?.align) return undefined
  const direction = placement.side ?? 'bottom'
  if (direction === 'left' || direction === 'right') {
    return { direction, anchor: 'center' }
  }
  return {
    direction,
    anchor: placement.align ?? 'start',
  }
}

const menuItemClass = cn(
  'flex w-full min-w-0 items-center gap-2 rounded-sm px-2 py-2 text-sm text-foreground',
  'transition-surface duration-150 ease-hover hover:bg-fill-hover',
)

const menuPanelClass = cn(
  '!shadow-none [box-shadow:none!important]',
  'bg-surface-1 text-foreground',
)

function BloomDropdownBody({
  menuWidth,
  menuRadius,
  trigger,
  children,
}: {
  menuWidth: number
  menuRadius: number
  trigger: ReactElement
  children: ReactNode
}) {
  const { open } = useBloomContext()
  const measureRef = useRef<HTMLSpanElement>(null)
  const [buttonSize, setButtonSize] = useState({ width: 32, height: 32 })

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    const measure = () => {
      const w = Math.max(1, Math.ceil(el.offsetWidth))
      const h = Math.max(1, Math.ceil(el.offsetHeight))
      setButtonSize((prev) =>
        prev.width === w && prev.height === h ? prev : { width: w, height: h },
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [trigger])

  return (
    <span className="relative inline-flex h-full self-stretch overflow-visible align-middle">
      {/* Intrinsic width + stretched height (Gantt status rail uses self-stretch). */}
      <span
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute right-0 top-0 inline-flex w-max max-w-none items-stretch whitespace-nowrap min-h-[var(--dance-gantt-bar-height)]"
      >
        {trigger}
      </span>
      <Menu.Container
        buttonSize={buttonSize}
        menuWidth={menuWidth}
        menuRadius={menuRadius}
        buttonRadius={8}
        className={cn(menuPanelClass, 'h-full', open && 'z-50 border border-border')}
      >
        <Menu.Trigger className="inline-flex h-full w-full items-stretch justify-end">
          {trigger}
        </Menu.Trigger>
        <Menu.Content className="bg-surface-1 min-w-full overflow-visible p-1">{children}</Menu.Content>
      </Menu.Container>
    </span>
  )
}

export function BloomDropdown({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  modal = false,
  placement,
  menuWidth = 200,
  menuRadius = 12,
  trigger,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  modal?: boolean
  placement?: BloomPlacement
  menuWidth?: number
  menuRadius?: number
  trigger: ReactElement
  children: ReactNode
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = useCallback(
    (next: boolean) => {
      onOpenChange?.(next)
      if (controlledOpen === undefined) setUncontrolledOpen(next)
    },
    [controlledOpen, onOpenChange],
  )

  return (
    <Menu.Root
      open={open}
      onOpenChange={setOpen}
      modal={modal}
      direction={placement?.direction ?? 'bottom'}
      anchor={placement?.anchor ?? 'start'}
    >
      <BloomDropdownBody menuWidth={menuWidth} menuRadius={menuRadius} trigger={trigger}>
        {children}
      </BloomDropdownBody>
    </Menu.Root>
  )
}

export function BloomDropdownMenuLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2 pb-1 pt-1.5 text-xs font-medium text-muted-foreground">{children}</p>
  )
}

export function BloomDropdownItem({
  children,
  className,
  onSelect,
  disabled,
}: {
  children: ReactNode
  className?: string
  onSelect?: () => void
  disabled?: boolean
}) {
  return (
    <Menu.Item className={cn(menuItemClass, className)} onSelect={onSelect} disabled={disabled}>
      {children}
    </Menu.Item>
  )
}

export function BloomDropdownRadioRow({
  children,
  selected,
  shortcut,
  onSelect,
  disabled,
}: {
  children: ReactNode
  selected?: boolean
  shortcut?: string
  onSelect?: () => void
  disabled?: boolean
}) {
  return (
    <Menu.Item
      className={cn(menuItemClass, selected && 'bg-fill-selected')}
      onSelect={onSelect}
      disabled={disabled}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {shortcut ? (
        <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{shortcut}</span>
      ) : null}
    </Menu.Item>
  )
}
