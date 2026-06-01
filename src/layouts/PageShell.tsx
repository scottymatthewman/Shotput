import { cn } from '@/lib/utils'
import type { CSSProperties, ReactNode } from 'react'

export function PageShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('flex min-h-0 flex-1 flex-col overflow-clip', className)}>{children}</div>
}

export function PageScrollArea({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={cn('min-h-0 flex-1 overflow-auto p-4', className)} style={style}>
      {children}
    </div>
  )
}
