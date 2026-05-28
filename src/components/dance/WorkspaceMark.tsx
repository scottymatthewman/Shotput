import { cn } from '@/lib/utils'

export function workspaceInitial(name: string) {
  const t = name.trim()
  return t ? t.charAt(0).toUpperCase() : '—'
}

export function WorkspaceMark({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-sm',
        'inset-edge-ring inset-edge-ring-full bg-surface-3',
        'text-sm font-semibold text-foreground',
        className,
      )}
      aria-hidden
    >
      {workspaceInitial(name)}
    </div>
  )
}
