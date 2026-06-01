import { PageScrollArea } from '@/layouts/PageShell'
import { cn } from '@/lib/utils'
import type { CSSProperties, ReactNode } from 'react'

/** Tailwind class — keep literal string so the class is discoverable at build time. */
export const CENTERED_PAGE_MAX_W = 'max-w-[720px]'

export type CenteredPageScrollLayout = {
  maxWidth: number
  scrollPadding: number
  columnGap: number
  columnPaddingTop: number
  columnPaddingBottom: number
}

export function CenteredPageScroll({
  children,
  className,
  columnClassName,
  layout,
}: {
  children: ReactNode
  className?: string
  /** Extra classes on the inner column (e.g. `gap-4`). Ignored when `layout` is set. */
  columnClassName?: string
  /** Pixel layout overrides (e.g. DialKit). */
  layout?: CenteredPageScrollLayout
}) {
  const scrollStyle: CSSProperties | undefined = layout
    ? { padding: layout.scrollPadding }
    : undefined
  const columnStyle: CSSProperties | undefined = layout
    ? {
        maxWidth: layout.maxWidth,
        gap: layout.columnGap,
        paddingTop: layout.columnPaddingTop,
        paddingBottom: layout.columnPaddingBottom,
      }
    : undefined

  return (
    <PageScrollArea className={cn(layout && 'p-0', !layout && 'p-4', className)} style={scrollStyle}>
      <div className="flex justify-center">
        <div
          className={cn(
            'flex w-full flex-col',
            !layout && 'gap-2 pt-2 pb-12',
            !layout && CENTERED_PAGE_MAX_W,
            !layout && columnClassName,
          )}
          style={columnStyle}
        >
          {children}
        </div>
      </div>
    </PageScrollArea>
  )
}
