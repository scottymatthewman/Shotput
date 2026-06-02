import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function InboxPagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  className,
}: {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = total === 0 ? 0 : Math.min(page * pageSize, total)

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-between gap-2 inset-edge-ring inset-edge-ring-t px-3 py-2',
        className,
      )}
    >
      <p className="text-xs text-muted-foreground tabular-nums">
        {total === 0 ? 'No messages' : `${start}–${end} of ${total}`}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs transition-surface duration-150"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs transition-surface duration-150"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
