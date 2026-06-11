import { PlatformIcon } from '@/components/PlatformIcon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConnectAccountDialog } from '@/features/accounts/ConnectAccountDialog'
import { CenteredPageScroll } from '@/layouts/CenteredPageScroll'
import { PageHeader } from '@/layouts/PageHeader'
import { PageShell } from '@/layouts/PageShell'
import { disconnectAccount, updateAccount, useScheduler } from '@/lib/scheduler/data'
import { PLATFORMS } from '@/lib/scheduler/platforms'
import { DAY_LABELS } from '@/lib/scheduler/scheduling'
import type { ScheduleSlot, SocialAccount } from '@/lib/scheduler/types'
import { cn } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

const sectionClass =
  'flex flex-col gap-4 rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft bg-surface-contrast p-4'

const inputClass =
  'h-8 rounded-md bg-surface-3 px-2 text-xs text-foreground inset-edge-ring inset-edge-ring-full outline-none'

function sortSlots(slots: ScheduleSlot[]): ScheduleSlot[] {
  return [...slots].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || a.time.localeCompare(b.time),
  )
}

export function AccountsPage() {
  const { accounts, targets, userId } = useScheduler()
  const [connectOpen, setConnectOpen] = useState(false)

  return (
    <PageShell>
      <PageHeader
        title="Accounts"
        description="Connected accounts and their default queue slots."
        layout="inline"
        actions={
          <Button size="sm" onClick={() => setConnectOpen(true)}>
            <Plus aria-hidden />
            Connect account
          </Button>
        }
      />
      <CenteredPageScroll columnClassName="gap-4">
        {accounts.length === 0 ? (
          <section className={cn(sectionClass, 'items-start')}>
            <p className="text-sm text-muted-foreground">
              No accounts yet. Connect an X or LinkedIn account to start queueing posts.
            </p>
            <Button size="sm" variant="secondary" onClick={() => setConnectOpen(true)}>
              Connect an account
            </Button>
          </section>
        ) : (
          accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              targetIds={targets
                .filter((t) => t.accountId === account.id)
                .map((t) => t.id)}
            />
          ))
        )}
      </CenteredPageScroll>
      <ConnectAccountDialog open={connectOpen} onOpenChange={setConnectOpen} ownerId={userId} />
    </PageShell>
  )
}

function AccountCard({
  account,
  targetIds,
}: {
  account: SocialAccount
  targetIds: string[]
}) {
  const slots = sortSlots(account.scheduleSlots)

  function setSlots(next: ScheduleSlot[]) {
    updateAccount(account.id, { scheduleSlots: sortSlots(next) })
  }

  function updateSlot(index: number, patch: Partial<ScheduleSlot>) {
    setSlots(slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)))
  }

  return (
    <section className={sectionClass}>
      <header className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-surface-3">
          <PlatformIcon platform={account.platform} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {account.displayName}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {PLATFORMS[account.platform].label} · @{account.handle}
          </p>
        </div>
        {account.status === 'needs_reauth' ? (
          <Badge variant="outline" className="text-status-blocked">
            Needs reconnect
          </Badge>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => disconnectAccount(account.id, targetIds)}
        >
          Disconnect
        </Button>
      </header>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">
            Queue slots · {account.timezone}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setSlots([...slots, { dayOfWeek: 1, time: '09:00' }])}
          >
            <Plus className="size-3.5" aria-hidden />
            Add slot
          </Button>
        </div>

        {slots.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {slots.map((slot, index) => (
              <li key={`${slot.dayOfWeek}-${slot.time}-${index}`} className="flex items-center gap-2">
                <select
                  value={slot.dayOfWeek}
                  onChange={(e) => updateSlot(index, { dayOfWeek: Number(e.target.value) })}
                  aria-label="Day of week"
                  className={inputClass}
                >
                  {DAY_LABELS.map((label, day) => (
                    <option key={day} value={day}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={slot.time}
                  onChange={(e) => updateSlot(index, { time: e.target.value })}
                  aria-label="Time"
                  className={inputClass}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setSlots(slots.filter((_, i) => i !== index))}
                  aria-label="Remove slot"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            No slots — “Add to queue” will fall back to the next top of the hour.
          </p>
        )}
      </div>
    </section>
  )
}
