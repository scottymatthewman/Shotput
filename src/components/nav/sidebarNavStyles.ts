import { cn } from '@/lib/utils'

/**
 * Sidebar density — shared across all nav item variants.
 * 32px row (h-8) · 6px padding (p-1.5) · 18px icons · 4px between rows.
 */
export const sidebarNavDensity = {
  gutter: 'p-4',
  sectionGap: 'gap-6',
  blockGap: 'gap-3',
  listGap: 'gap-1',
  rowHeight: 'h-8 min-h-8',
  rowPad: 'p-1.5',
  text: 'text-sm font-medium',
  gap: 'gap-3',
  icon: 'size-[18px]',
  soonText: 'text-[13px] font-medium',
  rowRadius: 'rounded-sm',
  /** Search `/` chip — 4px (tighter than nav row 8px). */
  kbdRadius: 'rounded-[4px]',
  row: 'h-8 min-h-8',
  px: 'p-1.5',
  searchPy: 'py-1.5',
} as const

/**
 * Enabled route items — idle 70% → 100% on hover; route-active stays 100%.
 * Uses element opacity (not text-foreground/70) so light + dark match.
 */
export const availableNavToneIdle = cn(
  'text-foreground opacity-70 transition-surface duration-150 ease-hover',
  'hover:opacity-100',
)

export const availableNavToneActive = cn('text-foreground opacity-100')

function cnRowLayout(nested?: boolean) {
  return cn(
    'group flex w-full items-center',
    sidebarNavDensity.rowHeight,
    sidebarNavDensity.rowPad,
    sidebarNavDensity.rowRadius,
    sidebarNavDensity.text,
    nested ? 'gap-2 pl-6' : sidebarNavDensity.gap,
  )
}

/** All sidebar rows — route links, search, user, stubs, meta. */
export const sidebarNavItem = {
  link: {
    root: cnRowLayout(),
    tone: availableNavToneIdle,
    icon: cn(sidebarNavDensity.icon, 'shrink-0'),
  },
  nested: {
    root: cnRowLayout(true),
    tone: availableNavToneIdle,
    icon: cn(sidebarNavDensity.icon, 'shrink-0'),
  },
  user: {
    root: cnRowLayout(),
    avatar: 'shrink-0 opacity-100',
    label: cn(
      'min-w-0 flex-1 truncate text-foreground opacity-70 transition-surface duration-150 ease-hover',
      'group-hover:opacity-100',
    ),
  },
  stub: {
    root: cnRowLayout(),
    tone: 'cursor-default text-muted-foreground opacity-40',
    icon: cn(sidebarNavDensity.icon, 'shrink-0 text-muted-foreground'),
    soon: cn('shrink-0 text-muted-foreground', sidebarNavDensity.soonText),
  },
  search: {
    root: cn(
      cnRowLayout(),
      'cursor-pointer justify-between gap-2',
      'inset-edge-ring inset-edge-ring-full inset-edge-hover bg-surface-1',
      'text-foreground transition-surface duration-150 ease-hover',
      'app-focus-ring outline-none',
    ),
    leading: cn('flex min-w-0 flex-1 items-center', sidebarNavDensity.gap),
    icon: cn(sidebarNavDensity.icon, 'shrink-0 text-muted-foreground'),
    kbd: cn(
      'pointer-events-none flex size-5 shrink-0 items-center justify-center',
      sidebarNavDensity.kbdRadius,
      'inset-edge-ring inset-edge-ring-full bg-muted',
      'font-mono text-[10px] leading-none text-muted-foreground',
    ),
  },
  meta: {
    root: cn(cnRowLayout(), 'pointer-events-none opacity-40 text-muted-foreground'),
  },
} as const

export type SidebarNavItemVariant = keyof typeof sidebarNavItem

/** @deprecated Use `sidebarNavItem.link` / `.nested`. */
export const sidebarNavRow = {
  standard: sidebarNavItem.link,
  nested: sidebarNavItem.nested,
} as const

export type SidebarNavRowVariant = 'standard' | 'nested'
