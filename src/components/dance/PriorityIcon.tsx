import { UrgentPriorityGlyph } from '@/components/dance/priorityGlyphs'
import { cn } from '@/lib/utils'
import type { Phase } from '@/types/domain'
import { SignalHigh, SignalLow, SignalMedium } from 'lucide-react'

export function PriorityIcon({
  priority,
  tone = 'current',
  className,
}: {
  priority: Phase['priority']
  /** `current`: inherits surrounding text colour (menus). `muted`: sheet/neutral contexts. */
  tone?: 'current' | 'muted'
  className?: string
}) {
  const iconCls = cn('size-4 shrink-0', tone === 'muted' ? 'text-muted-foreground' : 'text-current', className)

  if (priority === 'urgent') {
    return <UrgentPriorityGlyph />
  }
  if (priority === 'high') {
    return <SignalHigh className={iconCls} aria-hidden />
  }
  if (priority === 'medium') {
    return <SignalMedium className={iconCls} aria-hidden />
  }
  return <SignalLow className={iconCls} aria-hidden />
}
