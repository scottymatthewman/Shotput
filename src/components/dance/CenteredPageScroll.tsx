import { PageScrollArea } from '@/components/dance/PageShell'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

/** Tailwind class — keep literal string so the class is discoverable at build time. */
export const CENTERED_PAGE_MAX_W = 'max-w-[480px]'

export function CenteredPageScroll({
  children,
  className,
  columnClassName,
}: {
  children: ReactNode
  className?: string
  /** Extra classes on the inner column (e.g. `gap-4`). */
  columnClassName?: string
}) {
  return (
    <PageScrollArea className={cn('p-4', className)}>
      <div className="flex justify-center">
        <div
          className={cn(
            'flex w-full flex-col gap-2 pt-2 pb-12',
            CENTERED_PAGE_MAX_W,
            columnClassName,
          )}
        >
          {children}
        </div>
      </div>
    </PageScrollArea>
  )
}
