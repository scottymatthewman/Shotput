import { ganttBarStackRingByStatus } from '@/components/dance/ganttBarTaskTokens'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getEffectiveTaskStatus } from '@/lib/taskStatus'
import { cn } from '@/lib/utils'
import type { Agent, Phase, User, Workspace } from '@/types/domain'
import { Plus, Sparkles } from 'lucide-react'
import type { CSSProperties } from 'react'

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AssigneePill({
  user,
  agent,
  className,
}: {
  user?: User
  agent?: Agent
  className?: string
}) {
  if (agent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'inline-flex max-w-40 items-center gap-1 rounded-full border border-primary/50 bg-primary/10 py-1 pl-1 pr-[10px] text-xs text-primary',
                className,
              )}
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/30">
                <Sparkles className="size-3" />
              </span>
              <span className="truncate">{agent.name}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>AI coworker — {agent.description}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  if (!user) return null
  const coral = user.id.charCodeAt(1) % 2 === 0
  return (
    <span
      className={cn(
        'inline-flex max-w-36 items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-1 pr-[10px] text-xs',
        className,
      )}
    >
      <Avatar
        className={cn(
          'size-5 rounded-full text-[10px]',
          coral ? 'bg-assignee-coral' : 'bg-assignee-blue',
        )}
      >
        <AvatarFallback className="rounded-full text-primary-foreground">
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-foreground">{user.name}</span>
    </span>
  )
}

type StackEntry = { key: string; user?: User; agent?: Agent }

export function AssigneeAvatarStack({
  workspace,
  phase,
  maxVisible = 3,
  className,
  onDarkBackground = false,
}: {
  workspace: Workspace
  phase: Phase
  maxVisible?: number
  className?: string
  /** Stronger rings when avatars sit on saturated Gantt bar colors. */
  onDarkBackground?: boolean
}) {
  const entries: StackEntry[] = []
  for (const uid of phase.assigneeUserIds) {
    entries.push({ key: `u:${uid}`, user: workspace.users[uid] })
  }
  for (const aid of phase.assigneeAgentIds) {
    entries.push({ key: `a:${aid}`, agent: workspace.agents[aid] })
  }

  const visible = entries.slice(0, maxVisible)
  const overflow = entries.length - visible.length
  const eff = getEffectiveTaskStatus(phase)
  const ring = ganttBarStackRingByStatus[eff] ?? ganttBarStackRingByStatus.todo

  return (
    <div className={cn('flex shrink-0 items-center', className)}>
      {visible.map((e, i) => (
        <StackAvatar key={e.key} entry={e} ringClass={ring} style={{ marginLeft: i === 0 ? 0 : -4 }} />
      ))}
      {overflow > 0 ? (
        <span
          className={cn(
            'relative z-[1] flex size-5 shrink-0 items-center justify-center rounded-full ring-2',
            ring,
            onDarkBackground ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground',
          )}
          style={{ marginLeft: visible.length === 0 ? 0 : -4 }}
          title={`${overflow} more`}
        >
          <Plus className="size-3" aria-hidden />
          <span className="sr-only">{overflow} more assignees</span>
        </span>
      ) : null}
    </div>
  )
}

function StackAvatar({
  entry,
  ringClass,
  style,
}: {
  entry: StackEntry
  ringClass: string
  style?: CSSProperties
}) {
  if (entry.agent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'relative z-[1] flex size-5 shrink-0 items-center justify-center rounded-full bg-white/25 ring-2',
                ringClass,
              )}
              style={style}
            >
              <Sparkles className="size-2.5 text-primary-foreground" aria-hidden />
            </span>
          </TooltipTrigger>
          <TooltipContent>AI — {entry.agent.name}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  const user = entry.user
  if (!user) return null
  const coral = user.id.charCodeAt(1) % 2 === 0
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className={cn('relative z-[1] size-5 ring-2', ringClass)} style={style}>
            <AvatarFallback
              className={cn(
                'text-[9px] text-primary-foreground',
                coral ? 'bg-assignee-coral' : 'bg-assignee-blue',
              )}
            >
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>{user.name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
