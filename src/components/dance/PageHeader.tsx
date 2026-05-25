import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  descriptionInline,
  meta,
  actions,
  leading,
  className,
}: {
  title: string
  description?: string
  /** Put title + description on one row (e.g. timeline name · dates); keeps actions on the same horizontal band. */
  descriptionInline?: boolean
  meta?: ReactNode
  actions?: ReactNode
  leading?: ReactNode
  className?: string
}) {
  const inline = !!descriptionInline && !!description

  return (
    <header
      className={cn(
        'flex justify-between gap-3 border-b border-border bg-transparent px-4 py-3',
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
          <h1 className="min-w-0 shrink truncate text-base font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {inline ? (
            <span className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
              · {description}
            </span>
          ) : null}
        </div>
        {!inline && description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
        {meta ? (
          <div className={cn('flex flex-wrap items-stretch gap-2', !inline && 'pt-1')}>{meta}</div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </header>
  )
}
