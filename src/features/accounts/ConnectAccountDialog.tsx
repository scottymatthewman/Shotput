import { PlatformIcon } from '@/components/PlatformIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { connectAccount } from '@/lib/scheduler/data'
import { PLATFORMS, PLATFORM_IDS } from '@/lib/scheduler/platforms'
import { DEFAULT_SCHEDULE_SLOTS } from '@/lib/scheduler/scheduling'
import type { Platform } from '@/lib/scheduler/types'
import { cn } from '@/lib/utils'
import { useState, type FormEvent } from 'react'

/**
 * Phase 1 simulated connect — captures platform + identity directly.
 * Phase 2 replaces the form submit with a real OAuth redirect.
 */
export function ConnectAccountDialog({
  open,
  onOpenChange,
  ownerId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ownerId: string | null
}) {
  const [platform, setPlatform] = useState<Platform>('x')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const handle = String(form.get('handle') ?? '').trim().replace(/^@/, '')
    const displayName = String(form.get('displayName') ?? '').trim()
    if (!handle) return
    connectAccount(
      {
        platform,
        handle,
        displayName: displayName || handle,
        scheduleSlots: DEFAULT_SCHEDULE_SLOTS,
      },
      ownerId,
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect an account</DialogTitle>
          <DialogDescription>
            Simulated for now — real OAuth arrives with the publishing backend. New accounts
            start with weekday 9:00 and 17:00 queue slots.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label>Platform</Label>
            <div className="flex gap-2">
              {PLATFORM_IDS.map((pid) => (
                <button
                  key={pid}
                  type="button"
                  onClick={() => setPlatform(pid)}
                  className={cn(
                    'transition-surface pressable flex h-9 flex-1 items-center justify-center gap-2 rounded-md text-sm font-medium',
                    'inset-edge-ring inset-edge-ring-full',
                    platform === pid
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-3 text-muted-foreground hover:text-foreground',
                  )}
                >
                  <PlatformIcon platform={pid} />
                  {PLATFORMS[pid].label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="connect-handle">Handle</Label>
            <Input
              id="connect-handle"
              name="handle"
              placeholder={platform === 'x' ? '@yourhandle' : 'your-profile'}
              autoComplete="off"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="connect-display-name">Display name</Label>
            <Input
              id="connect-display-name"
              name="displayName"
              placeholder="Optional — defaults to the handle"
              autoComplete="off"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Connect</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
