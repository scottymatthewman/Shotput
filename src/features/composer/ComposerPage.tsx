import { PlatformIcon } from '@/components/PlatformIcon'
import { Button } from '@/components/ui/button'
import { ConnectAccountDialog } from '@/features/accounts/ConnectAccountDialog'
import { PageScrollArea, PageShell } from '@/layouts/PageShell'
import {
  createPostWithTargets,
  useScheduler,
  type TargetEntry,
} from '@/lib/scheduler/data'
import { PLATFORMS, PLATFORM_IDS } from '@/lib/scheduler/platforms'
import { nextAvailableSlot, nextTopOfHour, slotKey } from '@/lib/scheduler/scheduling'
import type { Platform, SocialAccount } from '@/lib/scheduler/types'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type PendingFile = { id: string; file: File; previewUrl: string }

function accountLabel(account: SocialAccount): string {
  return account.platform === 'x' ? `@${account.handle}` : account.displayName
}

const sectionHeaderClass = 'flex items-center justify-between'
const sectionTitleClass = 'text-sm text-foreground'

export function ComposerPage() {
  const { accounts, targets, userId } = useScheduler()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [overrides, setOverrides] = useState<Partial<Record<Platform, string>>>({})
  const [activeTabState, setActiveTabState] = useState<'shared' | Platform>('shared')
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [connectOpen, setConnectOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const selectedAccounts = accounts.filter((a) => selectedIds.has(a.id))
  const selectedPlatforms = PLATFORM_IDS.filter((pid) =>
    selectedAccounts.some((a) => a.platform === pid),
  )
  const showPlatformTabs = selectedPlatforms.length >= 2
  const activeTab =
    activeTabState !== 'shared' && showPlatformTabs && selectedPlatforms.includes(activeTabState)
      ? activeTabState
      : 'shared'

  /** Platform text — its override when set and non-empty, else the shared body. */
  function effectiveBody(platform: Platform): string {
    const override = overrides[platform]
    return override !== undefined && override.trim().length > 0 ? override : body
  }

  const overLimitPlatforms = selectedPlatforms.filter(
    (pid) => PLATFORMS[pid].countText(effectiveBody(pid)) > PLATFORMS[pid].charLimit,
  )
  const canSubmit =
    !submitting &&
    body.trim().length > 0 &&
    selectedAccounts.length > 0 &&
    overLimitPlatforms.length === 0

  function toggleAccount(accountId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(accountId)) next.delete(accountId)
      else next.add(accountId)
      return next
    })
  }

  function addFiles(list: FileList | File[]) {
    const images = Array.from(list).filter((f) => f.type.startsWith('image/'))
    setPendingFiles((prev) => [
      ...prev,
      ...images.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
  }

  function removeFile(id: string) {
    setPendingFiles((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((f) => f.id !== id)
    })
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  async function submit(mode: 'now' | 'queue') {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const nowIso = new Date().toISOString()
      const entries: TargetEntry[] = selectedAccounts.map((account) => {
        const override = overrides[account.platform]?.trim()
        const overrideBody =
          override && override !== body.trim() ? override : undefined

        if (mode === 'now') {
          // Phase 1 simulation — Phase 2 hands this to the publishing worker.
          return {
            accountId: account.id,
            status: 'published',
            scheduledAt: nowIso,
            publishedAt: nowIso,
            overrideBody,
          }
        }
        const occupied = new Set(
          targets
            .filter(
              (t) => t.accountId === account.id && t.status === 'queued' && t.scheduledAt,
            )
            .map((t) => slotKey(new Date(t.scheduledAt!))),
        )
        const slot =
          nextAvailableSlot(account.scheduleSlots, occupied) ?? nextTopOfHour()
        return {
          accountId: account.id,
          status: 'queued',
          scheduledAt: slot.toISOString(),
          overrideBody,
        }
      })

      await createPostWithTargets(
        { title: title.trim(), body: body.trim(), files: pendingFiles.map((f) => f.file) },
        entries,
        userId,
      )
      pendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl))
      navigate('/queue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <header className="flex shrink-0 items-center justify-between gap-2 p-3">
        <Button asChild variant="secondary" size="sm">
          <Link to="/queue">Browse</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={!canSubmit}
            onClick={() => void submit('now')}
          >
            Post now
          </Button>
          <Button size="sm" disabled={!canSubmit} onClick={() => void submit('queue')}>
            Add to queue
          </Button>
        </div>
      </header>

      <PageScrollArea>
        <div className="mx-auto flex w-full max-w-[700px] flex-col gap-8 pt-4 pb-16">
          <div className="flex flex-col gap-4">
            <div className="inset-edge-ring-b pb-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title..."
                aria-label="Post title"
                className="w-full bg-transparent text-[28px] font-medium tracking-[-0.02em] text-foreground outline-none placeholder:text-foreground/30"
              />
            </div>
            {showPlatformTabs ? (
              <div className="flex items-center gap-1">
                <ComposerTab
                  label="Shared"
                  active={activeTab === 'shared'}
                  onClick={() => setActiveTabState('shared')}
                />
                {selectedPlatforms.map((pid) => (
                  <ComposerTab
                    key={pid}
                    label={PLATFORMS[pid].label}
                    platform={pid}
                    active={activeTab === pid}
                    overridden={Boolean(overrides[pid]?.trim())}
                    onClick={() => setActiveTabState(pid)}
                  />
                ))}
                {activeTab !== 'shared' && overrides[activeTab]?.trim() ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      setOverrides((prev) => {
                        const next = { ...prev }
                        delete next[activeTab]
                        return next
                      })
                    }
                  >
                    Reset to shared
                  </Button>
                ) : null}
              </div>
            ) : null}
            <textarea
              value={activeTab === 'shared' ? body : (overrides[activeTab] ?? body)}
              onChange={(e) => {
                if (activeTab === 'shared') setBody(e.target.value)
                else setOverrides((prev) => ({ ...prev, [activeTab]: e.target.value }))
              }}
              placeholder={
                activeTab === 'shared'
                  ? 'Write content here...'
                  : `Customize for ${PLATFORMS[activeTab].label}...`
              }
              aria-label={
                activeTab === 'shared'
                  ? 'Post content'
                  : `${PLATFORMS[activeTab].label} post content`
              }
              rows={5}
              className="min-h-[100px] w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-foreground/30"
            />
            {selectedPlatforms.length > 0 ? (
              <div className="flex gap-4">
                {selectedPlatforms.map((pid) => (
                  <CharCounter key={pid} platform={pid} body={effectiveBody(pid)} />
                ))}
              </div>
            ) : null}
          </div>

          <section className="flex flex-col gap-3">
            <header className={sectionHeaderClass}>
              <h2 className={sectionTitleClass}>Assets</h2>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add assets"
              >
                <Plus aria-hidden />
              </Button>
            </header>
            {pendingFiles.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {pendingFiles.map((f) => (
                  <div key={f.id} className="group relative">
                    <img
                      src={f.previewUrl}
                      alt={f.file.name}
                      className="h-24 w-24 rounded-lg object-cover inset-edge-ring inset-edge-ring-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(f.id)}
                      aria-label={`Remove ${f.file.name}`}
                      className="transition-surface pressable absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100"
                    >
                      <X className="size-3" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex h-[140px] w-full items-center justify-center gap-2.5 rounded-xl border border-dashed border-border bg-surface-3 px-3 py-2"
            >
              <span className="text-sm text-muted-foreground">Drop content here or</span>
              <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                Browse
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </section>

          <section className="flex flex-col gap-3">
            <header className={sectionHeaderClass}>
              <h2 className={sectionTitleClass}>Accounts</h2>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={() => setConnectOpen(true)}
                aria-label="Connect account"
              >
                <Plus aria-hidden />
              </Button>
            </header>
            {accounts.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {accounts.map((account) => {
                  const selected = selectedIds.has(account.id)
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => toggleAccount(account.id)}
                      aria-pressed={selected}
                      className={cn(
                        'transition-surface pressable flex items-center gap-2 rounded-full bg-surface-1 py-1.5 pr-3 pl-2 text-sm text-foreground',
                        'inset-edge-ring inset-edge-ring-full',
                        selected ? 'opacity-100' : 'opacity-40 hover:opacity-70',
                      )}
                    >
                      <span className="flex size-6 items-center justify-center rounded-full bg-surface-3">
                        <PlatformIcon platform={account.platform} />
                      </span>
                      {accountLabel(account)}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-[60px] items-center gap-2.5 rounded-xl px-1">
                <span className="text-sm text-muted-foreground">
                  No accounts connected yet —
                </span>
                <Button size="sm" variant="secondary" onClick={() => setConnectOpen(true)}>
                  Connect an account
                </Button>
              </div>
            )}
          </section>
        </div>
      </PageScrollArea>

      <ConnectAccountDialog open={connectOpen} onOpenChange={setConnectOpen} ownerId={userId} />
    </PageShell>
  )
}

function ComposerTab({
  label,
  platform,
  active,
  overridden,
  onClick,
}: {
  label: string
  platform?: Platform
  active: boolean
  overridden?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'transition-surface pressable flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium duration-150',
        active
          ? 'bg-surface-3 text-foreground'
          : 'text-muted-foreground hover:bg-fill-hover hover:text-foreground',
      )}
    >
      {platform ? <PlatformIcon platform={platform} className="size-3" /> : null}
      {label}
      {overridden ? (
        <span
          className="size-1.5 rounded-full bg-foreground/50"
          aria-label="Customized"
        />
      ) : null}
    </button>
  )
}

function CharCounter({ platform, body }: { platform: Platform; body: string }) {
  const config = PLATFORMS[platform]
  const count = config.countText(body)
  const over = count > config.charLimit
  return (
    <span
      className={cn(
        'flex items-center gap-1.5 text-xs tabular-nums',
        over ? 'text-status-blocked' : 'text-muted-foreground',
      )}
    >
      <PlatformIcon platform={platform} className="size-3" />
      {count.toLocaleString()}/{config.charLimit.toLocaleString()}
    </span>
  )
}
