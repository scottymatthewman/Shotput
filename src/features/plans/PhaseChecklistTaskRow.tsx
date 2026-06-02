import { PhaseStatusIcon } from '@/components/dance/StatusBadge'
import { OverviewOwnerPill } from '@/features/plans/overviewPageLayout'
import { cn } from '@/lib/utils'
import type { Task, User } from '@/types/domain'
import { ChevronRight, MessageSquare } from 'lucide-react'

export function PhaseChecklistTaskRow({
  task,
  assignee,
  onToggle,
}: {
  task: Task
  assignee?: User
  onToggle: () => void
}) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="pressable shrink-0 transition-surface duration-150 ease-hover"
          aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
          onClick={onToggle}
        >
          <PhaseStatusIcon
            status={task.completed ? 'done' : 'todo'}
            className="size-6"
          />
        </button>
        <span
          className={cn(
            'min-w-0 truncate text-[15px] leading-snug',
            task.completed ? 'text-muted-foreground line-through' : 'text-foreground',
          )}
        >
          {task.title}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {assignee ? <OverviewOwnerPill user={assignee} /> : null}
        <MessageSquare
          className="size-5 shrink-0 text-muted-foreground/60"
          aria-hidden
        />
        <ChevronRight className="size-5 shrink-0 text-muted-foreground/60" aria-hidden />
      </div>
    </div>
  )
}
