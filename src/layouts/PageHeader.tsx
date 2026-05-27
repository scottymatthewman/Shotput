import {
  pageHeaderActionsClass,
  pageHeaderDescriptionBlockClass,
  pageHeaderDescriptionInlineClass,
  pageHeaderMetaClass,
  pageHeaderRootClass,
  pageHeaderTitleClass,
} from '@/layouts/pageHeaderStyles'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type PageHeaderLayout = 'stacked' | 'inline'

export type PageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  /**
   * `inline` — title and description on one row (planner name · dates).
   * `stacked` — description under title (default).
   */
  layout?: PageHeaderLayout
  /** @deprecated Prefer `layout="inline"`. */
  descriptionInline?: boolean
  meta?: ReactNode
  actions?: ReactNode
  leading?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  layout: layoutProp,
  descriptionInline,
  meta,
  actions,
  leading,
  className,
}: PageHeaderProps) {
  const layout: PageHeaderLayout =
    layoutProp ?? (descriptionInline ? 'inline' : 'stacked')
  const inline = layout === 'inline' && description != null && description !== ''

  return (
    <header
      className={cn(
        pageHeaderRootClass,
        inline ? 'flex-nowrap items-center' : 'flex-wrap items-start',
        className,
      )}
    >
      <div className={cn('min-w-0', inline && 'flex-1', !inline && 'space-y-1')}>
        <div
          className={cn(
            'flex min-w-0 items-center gap-3',
            inline && 'min-w-0 flex-1',
          )}
        >
          {leading ? <div className="shrink-0">{leading}</div> : null}
          <h1 className={pageHeaderTitleClass}>{title}</h1>
          {inline ? (
            <span className={pageHeaderDescriptionInlineClass}>
              <span aria-hidden> · </span>
              {description}
            </span>
          ) : null}
        </div>
        {!inline && description ? (
          <p className={pageHeaderDescriptionBlockClass}>{description}</p>
        ) : null}
        {meta ? (
          <div className={cn(pageHeaderMetaClass, !inline && 'pt-1')}>{meta}</div>
        ) : null}
      </div>
      {actions ? <div className={pageHeaderActionsClass}>{actions}</div> : null}
    </header>
  )
}
