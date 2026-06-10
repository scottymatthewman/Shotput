import { cn } from '@/lib/utils'

/**
 * Page header layout + type — edit here to change every route header.
 *
 * Geometry: `px-4` inset + 32×32 `pageChrome` leading control → center at 32px from
 * the header’s left edge. Table checkbox column uses `PAGE_HEADER_LEADING_ALIGN_CLASS`.
 */
export const PAGE_HEADER_INSET_X_PX = 16
/** Matches `pageHeaderRootClass` vertical inset (`py-3`). */
export const PAGE_HEADER_INSET_Y_PX = 12
export const PAGE_HEADER_LEADING_CONTROL_PX = 32
export const PAGE_HEADER_LEADING_CENTER_Y_PX =
  PAGE_HEADER_INSET_Y_PX + PAGE_HEADER_LEADING_CONTROL_PX / 2
export const PAGE_HEADER_LEADING_CENTER_PX =
  PAGE_HEADER_INSET_X_PX + PAGE_HEADER_LEADING_CONTROL_PX / 2

/** Tailwind padding-left so a 16px-wide control’s center lines up with the back button. */
export const PAGE_HEADER_LEADING_ALIGN_CLASS = 'pl-6'

export const pageHeaderRootClass = cn(
  'flex justify-between gap-3 inset-edge-ring inset-edge-ring-b bg-transparent px-4 py-3',
)

export const pageHeaderTitleClass = cn(
  'min-w-0 shrink truncate text-base font-semibold tracking-tight text-foreground',
)

export const pageHeaderDescriptionClass = cn('text-sm text-muted-foreground')

export const pageHeaderDescriptionBlockClass = cn(pageHeaderDescriptionClass, 'max-w-2xl')

export const pageHeaderDescriptionInlineClass = cn(
  pageHeaderDescriptionClass,
  'shrink-0 whitespace-nowrap',
)

export const pageHeaderActionsClass = cn('relative z-20 flex shrink-0 items-center gap-3')

export const pageHeaderMetaClass = cn('flex flex-wrap items-stretch gap-2')
