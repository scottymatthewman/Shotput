import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteTarget, simulatePublish } from '@/lib/scheduler/data'
import { PLATFORMS } from '@/lib/scheduler/platforms'
import type { Post, PostTarget, SocialAccount } from '@/lib/scheduler/types'
import { format, isToday, isTomorrow } from 'date-fns'

export function scheduledLabel(iso: string): string {
  const date = new Date(iso)
  if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`
  if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`
  return format(date, 'EEE MMM d, h:mm a')
}

export function postTitle(post: Post | undefined): string {
  if (!post) return 'Untitled post'
  return post.title || post.body.slice(0, 80) || 'Untitled post'
}

export function accountLabel(account: SocialAccount): string {
  return account.platform === 'x' ? `@${account.handle}` : account.displayName
}

export function TargetDetailDialog({
  open,
  onOpenChange,
  target,
  post,
  account,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: PostTarget
  post: Post | undefined
  account: SocialAccount
}) {
  const isQueued = target.status === 'queued'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{postTitle(post)}</DialogTitle>
          <DialogDescription>
            {PLATFORMS[account.platform].label} · {accountLabel(account)}
            {target.scheduledAt ? ` · ${scheduledLabel(target.scheduledAt)}` : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {target.status}
            </Badge>
            {target.error ? (
              <span className="text-xs text-status-blocked">{target.error}</span>
            ) : null}
          </div>

          {target.overrideBody || post?.body ? (
            <div className="flex flex-col gap-1.5">
              {target.overrideBody ? (
                <span className="text-xs text-muted-foreground">
                  Customized for {PLATFORMS[account.platform].label}
                </span>
              ) : null}
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {target.overrideBody ?? post?.body}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No content.</p>
          )}

          {post && post.media.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {post.media.map((media) => (
                <img
                  key={media.id}
                  src={media.url}
                  alt={media.name}
                  className="h-24 w-24 rounded-lg object-cover inset-edge-ring inset-edge-ring-full"
                />
              ))}
            </div>
          ) : null}

          {isQueued ? (
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                  deleteTarget(target.id)
                  onOpenChange(false)
                }}
              >
                Remove
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  simulatePublish(target.id)
                  onOpenChange(false)
                }}
              >
                Publish now
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
