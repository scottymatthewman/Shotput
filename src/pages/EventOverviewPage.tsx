import { BudgetAmountField } from '@/components/dance/BudgetAmountField'
import { TaskDatePickerField } from '@/components/dance/TaskDatePickerField'
import { CrmLogoMark } from '@/components/dance/CrmLogoMark'
import { CenteredPageScroll } from '@/components/dance/CenteredPageScroll'
import { PageHeader } from '@/components/dance/PageHeader'
import { PageShell } from '@/components/dance/PageShell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { navigationDebug } from '@/lib/navigationDebug'
import {
  computePlanBudgetRollup,
  formatBudgetCents,
  formatBudgetCentsCompact,
  planBudgetCurrency,
} from '@/lib/budget'
import { cn } from '@/lib/utils'
import { useDanceStore } from '@/state/store'
import type { Plan, User, Workspace } from '@/types/domain'
import { ArrowLeftRight, ChevronLeft, Plus, Share2, X } from 'lucide-react'
import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  const a = parts[0]!.charAt(0)
  const b = parts[parts.length - 1]!.charAt(0)
  return `${a}${b}`.toUpperCase()
}

/** Canonical roster shown in Overview; persists when adjusted. */
function effectiveTeamMemberIds(plan: Plan, workspace: Workspace): string[] {
  if (plan.teamMemberUserIds !== undefined) return plan.teamMemberUserIds

  const set = new Set<string>()
  set.add(plan.ownerUserId)
  for (const t of Object.values(workspace.phases)) {
    if (t.planId !== plan.id) continue
    for (const uid of t.assigneeUserIds) set.add(uid)
  }
  return [...set].sort((a, b) =>
    (workspace.users[a]?.name ?? '').localeCompare(workspace.users[b]?.name ?? ''),
  )
}

/** Hero card: uniform `p-3` + `gap-3`; light edge to separate from canvas. */
const overviewSectionShell = cn('flex flex-col gap-3 rounded-lg border border-border/50 bg-muted p-3')

const overviewMetricCardBase = cn('rounded-lg border border-border/50 bg-muted px-5')

/** Progress / Location: symmetric vertical padding. */
const overviewMetricSectionShell = cn(overviewMetricCardBase, 'py-3')

/** Team: extra bottom padding (~`px-5`) so the badge row clears the card like the sides. */
const overviewTeamSectionShell = cn(overviewMetricCardBase, 'space-y-2 pt-3 pb-5')

const inkBase = cn(
  'border-0 bg-transparent px-2 py-1.5 text-foreground shadow-none outline-none ring-0 transition-surface duration-150',
  'rounded-md placeholder:text-muted-foreground',
  'motion-reduce:transition-none',
  'focus-visible:!bg-gantt-canvas focus-visible:outline-none focus-visible:ring-0',
)

const inkTitle = cn(inkBase, 'w-full py-2 text-xl font-semibold tracking-tight')
const inkBody = cn(
  inkBase,
  'min-h-[72px] w-full resize-none py-2 text-sm leading-relaxed text-muted-foreground',
)

const inkLocation = cn(
  inkBase,
  'w-full px-0 py-2 text-right text-sm tabular-nums',
  'ease-hover hover:bg-accent/40',
)

const inkDatePickers = cn(
  'text-foreground/80 hover:text-foreground',
  '!rounded-md !px-2 !py-1 focus-visible:!bg-secondary focus-visible:!outline-none !ring-0',
)

const overviewIconButtonClass = cn(
  'cursor-pointer pressable size-8 shrink-0 rounded-md border-0 bg-transparent p-0 text-muted-foreground shadow-none outline-none ring-0 transition-surface duration-150',
  'hover:text-foreground focus-visible:bg-secondary focus-visible:outline-none focus-visible:ring-0 motion-reduce:transition-none',
)

/** Outline actions on Overview (CRM row + Share): white border + darker canvas fill on hover. */
const overviewCrmOutlineButtonClass = cn(
  'transition-surface duration-150 ease-hover motion-reduce:transition-none',
  'hover:border-white hover:bg-gantt-canvas hover:text-foreground',
)

function OverviewRow({
  label,
  children,
  className,
}: {
  label: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-2',
        className,
      )}
    >
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="min-w-0 flex flex-1 flex-wrap items-center justify-end gap-2">{children}</div>
    </div>
  )
}

type OverviewReceiptRow = {
  id: string
  label: string
  value: ReactNode
  valueClassName?: string
}

/** 6px dash, 8px gap — receipt-style row divider. */
function OverviewReceiptDashDivider() {
  return (
    <div
      aria-hidden
      className="h-px w-full bg-[repeating-linear-gradient(90deg,var(--color-border)_0_6px,transparent_6px_14px)]"
    />
  )
}

function OverviewReceiptSubrows({ rows }: { rows: OverviewReceiptRow[] }) {
  if (rows.length === 0) return null
  return (
    <div>
      {rows.map((row, index) => (
        <Fragment key={row.id}>
          {index > 0 ? <OverviewReceiptDashDivider /> : null}
          <div className="flex min-h-8 items-center justify-between gap-4 py-2 text-xs">
            <span className="text-muted-foreground">{row.label}</span>
            <span
              className={cn('shrink-0 tabular-nums font-medium text-foreground', row.valueClassName)}
            >
              {row.value}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

export function EventOverviewPage() {
  const { planId: planIdParam, eventId: legacyEventId } = useParams<{
    planId?: string
    eventId?: string
  }>()
  const planId = planIdParam ?? legacyEventId
  const navigate = useNavigate()
  const workspace = useDanceStore((s) => s.workspace)
  const deletePlan = useDanceStore((s) => s.deletePlan)
  const patchPlanOverview = useDanceStore((s) => s.patchPlanOverview)

  const plan = planId ? workspace.plans[planId] : undefined

  const phasesDone = useMemo(() => {
    if (!plan) return { done: 0, total: 0 }
    let done = 0
    let total = 0
    for (const t of Object.values(workspace.phases)) {
      if (t.planId !== plan.id) continue
      total++
      if (t.status === 'done') done++
    }
    return { done, total }
  }, [plan, workspace.phases])

  const budgetRollup = useMemo(
    () => (plan ? computePlanBudgetRollup(plan, workspace) : null),
    [plan, workspace],
  )

  const teamIds = useMemo(
    () => (plan ? effectiveTeamMemberIds(plan, workspace) : []),
    [plan, workspace],
  )

  const teamMembers = useMemo(() => {
    return teamIds
      .map((id) => workspace.users[id])
      .filter((u): u is User => !!u)
  }, [teamIds, workspace.users])

  const addableMembers = useMemo(() => {
    const taken = new Set(teamIds)
    return workspace.userIds
      .map((id) => workspace.users[id])
      .filter((u): u is User => !!u && !taken.has(u.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [teamIds, workspace.userIds, workspace.users])

  const [titleDraft, setTitleDraft] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [locationDraft, setLocationDraft] = useState('')
  const [shareCopied, setShareCopied] = useState(false)

  const [reportBusy, setReportBusy] = useState(false)
  const [reportReady, setReportReady] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [crmDialogOpen, setCrmDialogOpen] = useState(false)
  const [crmDraftTitle, setCrmDraftTitle] = useState('')
  const [crmDraftUrl, setCrmDraftUrl] = useState('')

  useEffect(() => {
    if (!plan) return
    setTitleDraft(plan.name)
    setDescriptionDraft(plan.description)
    setLocationDraft(plan.location ?? '')
  }, [
    plan?.id,
    plan?.name,
    plan?.description,
    plan?.location,
  ])

  useEffect(() => {
    if (!crmDialogOpen || !plan) return
    setCrmDraftTitle(plan.externalRecord?.title ?? '')
    setCrmDraftUrl(plan.externalRecord?.url ?? '')
  }, [crmDialogOpen, plan])

  const runGenerateReport = useCallback(() => {
    if (reportBusy) return
    setReportBusy(true)
    setReportReady(false)
    window.setTimeout(() => {
      setReportBusy(false)
      setReportReady(true)
    }, 850)
  }, [reportBusy])

  useEffect(() => {
    if (!reportReady) return
    const id = window.setTimeout(() => setReportReady(false), 2600)
    return () => clearTimeout(id)
  }, [reportReady])

  useEffect(() => {
    navigationDebug('page/event-overview', {
      planId: planId ?? null,
      hasPlan: !!plan,
    })
  }, [planId, plan])

  const commitTitle = useCallback(() => {
    if (!planId || !plan || titleDraft.trim() === plan.name) return
    if (!titleDraft.trim()) {
      setTitleDraft(plan.name)
      return
    }
    patchPlanOverview(planId, { name: titleDraft })
  }, [planId, patchPlanOverview, plan, titleDraft])

  const commitDescription = useCallback(() => {
    if (!planId || !plan || descriptionDraft === plan.description) return
    patchPlanOverview(planId, { description: descriptionDraft })
  }, [descriptionDraft, planId, patchPlanOverview, plan])

  const commitLocation = useCallback(() => {
    if (!planId || !plan) return
    if ((plan.location ?? '') === locationDraft.trim()) return
    patchPlanOverview(planId, { location: locationDraft })
  }, [planId, locationDraft, patchPlanOverview, plan])

  const commitCrmFromDialog = useCallback(() => {
    if (!planId || !plan) return
    const title = crmDraftTitle.trim()
    const url = crmDraftUrl.trim()
    if (!title && !url) {
      if (plan.externalRecord) patchPlanOverview(planId, { externalRecord: null })
      return
    }
    patchPlanOverview(planId, {
      externalRecord: {
        provider: 'attio',
        title: title || 'Untitled record',
        ...(url ? { url } : {}),
      },
    })
  }, [crmDraftTitle, crmDraftUrl, planId, patchPlanOverview, plan])

  const bumpTeam = useCallback(
    (ids: string[]) => {
      if (!planId) return
      const unique = [...new Set(ids)].filter(Boolean)
      patchPlanOverview(planId, { teamMemberUserIds: unique })
    },
    [planId, patchPlanOverview],
  )

  const onRemoveMember = useCallback(
    (userId: string) => {
      bumpTeam(teamIds.filter((id) => id !== userId))
    },
    [bumpTeam, teamIds],
  )

  const onAddMember = useCallback(
    (userId: string) => {
      bumpTeam([...teamIds, userId])
    },
    [bumpTeam, teamIds],
  )

  const shareOverviewLink = useCallback(async () => {
    if (!planId) return
    const url = `${window.location.origin}/plan/${planId}/overview`
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // Clipboard may be denied in non-secure contexts or without permission.
    }
  }, [planId])

  if (!planId || !plan) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Event not found.</p>
        <Link
          to="/plan"
          className="text-primary text-sm transition-surface duration-150 ease-hover hover:underline"
        >
          Plans
        </Link>
      </div>
    )
  }

  function confirmDelete() {
    if (!planId) return
    deletePlan(planId)
    setDeleteOpen(false)
    navigate('/plan', { replace: true })
  }

  function saveCrmDialog() {
    commitCrmFromDialog()
    setCrmDialogOpen(false)
  }

  const hasRecord = !!(plan.externalRecord?.title ?? '').trim()
  const recordUrl = plan.externalRecord?.url?.trim()
  const recordTitle = (plan.externalRecord?.title ?? '').trim()

  return (
    <PageShell>
      <PageHeader
        title="Overview"
        description={`${plan.name}`}
        descriptionInline
        leading={
          <Link to={`/plan/${planId}`}>
            <Button variant="pageChrome" size="icon" aria-label="Back to planner">
              <ChevronLeft aria-hidden />
            </Button>
          </Link>
        }
      />
      <CenteredPageScroll>
            <div className={overviewSectionShell}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <Input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      ;(e.target as HTMLInputElement).blur()
                    }
                  }}
                  aria-label="Event title"
                  className={cn(inkTitle, 'sm:min-w-0 sm:flex-1')}
                />
                <div className="flex shrink-0 flex-wrap items-center justify-start gap-1 text-sm sm:justify-end">
                  <TaskDatePickerField
                    value={plan.start}
                    ariaLabel="Start date"
                    labelFormat="short"
                    scrub
                    align="end"
                    onChange={(next) =>
                      patchPlanOverview(planId, { start: next })
                    }
                    className={cn(inkDatePickers)}
                  />
                  <span className="shrink-0 text-muted-foreground" aria-hidden>
                    –
                  </span>
                  <TaskDatePickerField
                    value={plan.end}
                    ariaLabel="End date"
                    labelFormat="long"
                    scrub
                    align="end"
                    onChange={(next) => patchPlanOverview(planId, { end: next })}
                    className={cn(inkDatePickers)}
                  />
                </div>
              </div>
              {reportReady ? (
                <p className="text-left text-xs text-muted-foreground" role="status">
                  Demo report queued — download would start here.
                </p>
              ) : null}

              <Textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onBlur={commitDescription}
                placeholder="Describe the event."
                aria-label="Event description"
                className={inkBody}
              />

              <Separator />

              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-1">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                  {hasRecord ? (
                    <span className="inline-flex min-w-0 max-w-full flex-nowrap items-center gap-0.5">
                      {recordUrl ? (
                        <a
                          href={recordUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            'inline-flex min-w-0 max-w-[min(100%,18rem)] cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-sm text-foreground',
                            'transition-surface duration-150 ease-hover hover:bg-accent/40 hover:text-foreground',
                          )}
                        >
                          <CrmLogoMark provider="attio" />
                          <span className="min-w-0 truncate">{recordTitle || 'Linked record'}</span>
                        </a>
                      ) : (
                        <span className="inline-flex min-w-0 max-w-[min(100%,18rem)] items-center gap-2 rounded-sm px-2 py-1 text-sm text-foreground">
                          <CrmLogoMark provider="attio" />
                          <span className="min-w-0 truncate">{recordTitle || 'Linked record'}</span>
                        </span>
                      )}
                      <button
                        type="button"
                        className={cn(overviewIconButtonClass, 'shrink-0')}
                        aria-label="Switch CRM connection"
                        title="Switch CRM connection"
                        onClick={() => setCrmDialogOpen(true)}
                      >
                        <ArrowLeftRight className="mx-auto size-4 shrink-0 rotate-90" aria-hidden />
                      </button>
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(overviewCrmOutlineButtonClass, 'cursor-pointer whitespace-nowrap')}
                      aria-label="Connect CRM"
                      onClick={() => setCrmDialogOpen(true)}
                    >
                      Connect CRM
                    </Button>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      overviewCrmOutlineButtonClass,
                      'w-full cursor-pointer whitespace-nowrap sm:w-auto',
                    )}
                    disabled={reportBusy}
                    onClick={runGenerateReport}
                  >
                    {reportBusy ? 'Generating…' : 'Generate Report'}
                  </Button>
                </div>
              </div>
            </div>

            <div className={overviewMetricSectionShell}>
              <OverviewRow label="Progress">
                <span className="whitespace-nowrap text-sm tabular-nums text-foreground">
                  {phasesDone.done} / {phasesDone.total} done
                </span>
              </OverviewRow>
            </div>

            <div className={cn(overviewMetricSectionShell, 'space-y-2')}>
              <OverviewRow label="Budget">
                <BudgetAmountField
                  valueCents={plan.budgetCents}
                  currency={planBudgetCurrency(plan)}
                  ariaLabel="Plan budget ceiling"
                  onCommit={(cents) => {
                    if (!planId) return
                    patchPlanOverview(planId, { budgetCents: cents ?? null })
                  }}
                />
              </OverviewRow>
              {budgetRollup ? (
                <OverviewReceiptSubrows
                  rows={[
                    {
                      id: 'allocated',
                      label: 'Allocated',
                      value: formatBudgetCents(
                        budgetRollup.allocatedCents,
                        budgetRollup.currency,
                      ),
                      valueClassName: budgetRollup.overAllocated ? 'text-destructive' : undefined,
                    },
                    {
                      id: 'spend',
                      label: 'Spend',
                      value: formatBudgetCentsCompact(
                        budgetRollup.actualCents,
                        budgetRollup.currency,
                      ),
                      valueClassName: budgetRollup.overSpent ? 'text-destructive' : undefined,
                    },
                    {
                      id: 'standing',
                      label: 'Standing',
                      value:
                        budgetRollup.ceilingCents != null &&
                        budgetRollup.remainingCents != null
                          ? formatBudgetCentsCompact(
                              budgetRollup.remainingCents,
                              budgetRollup.currency,
                            )
                          : '—',
                      valueClassName: budgetRollup.overSpent ? 'text-destructive' : undefined,
                    },
                  ]}
                />
              ) : null}
            </div>

            <div className={overviewMetricSectionShell}>
              <OverviewRow label="Location">
                <Input
                  value={locationDraft}
                  onChange={(e) => setLocationDraft(e.target.value)}
                  onBlur={commitLocation}
                  placeholder="Add location…"
                  aria-label="Location"
                  className={inkLocation}
                />
              </OverviewRow>
            </div>

            <div className={overviewTeamSectionShell}>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Team Members</span>
                <div className="flex shrink-0 items-center">
                  {addableMembers.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={overviewIconButtonClass}
                          aria-label="Add team member"
                        >
                          <Plus className="mx-auto size-4" aria-hidden />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="max-h-[min(16rem,var(--radix-dropdown-menu-content-available-height))]"
                      >
                        {addableMembers.map((u) => (
                          <DropdownMenuItem key={u.id} className="text-sm" onSelect={() => onAddMember(u.id)}>
                            {u.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {teamMembers.map((u) => (
                  <Badge
                    key={u.id}
                    variant="outline"
                    className="transition-surface max-w-full px-2 py-1 pl-2 pr-1 text-xs font-medium duration-150"
                  >
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Avatar className="size-5">
                        {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt="" /> : null}
                        <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
                          {initialsFor(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 truncate">{u.name}</span>
                    </span>
                    <button
                      type="button"
                      className={cn(
                        'group pressable ml-1 inline-flex shrink-0 cursor-pointer rounded-sm p-0.5 opacity-70 transition-surface duration-150 ease-hover hover:opacity-100',
                        'hover:text-white motion-reduce:transition-none dance-focus-ring',
                      )}
                      aria-label={`Remove ${u.name}`}
                      onClick={() => onRemoveMember(u.id)}
                    >
                      <X className="size-3 shrink-0 text-current group-hover:!text-white" aria-hidden />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(overviewCrmOutlineButtonClass, 'cursor-pointer whitespace-nowrap')}
                aria-label="Copy overview link"
                onClick={() => void shareOverviewLink()}
              >
                <Share2 className="mr-2 size-4 shrink-0" aria-hidden />
                {shareCopied ? 'Copied' : 'Share'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer text-muted-foreground transition-surface duration-150 ease-out hover:border-destructive/40 hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete plan
              </Button>
            </div>
      </CenteredPageScroll>

      <Dialog open={crmDialogOpen} onOpenChange={setCrmDialogOpen}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Connect CRM record</DialogTitle>
            <DialogDescription>
              Link an Attio record (prototype). Clearing both fields disconnects this event.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Display title</span>
              <Input
                value={crmDraftTitle}
                onChange={(e) => setCrmDraftTitle(e.target.value)}
                placeholder="Roo Launch 2026"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Record URL</span>
              <Input
                type="url"
                value={crmDraftUrl}
                onChange={(e) => setCrmDraftUrl(e.target.value)}
                placeholder="https://app.attio.com/…"
              />
            </label>
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              className="sm:mr-auto"
              onClick={() => {
                if (!planId || !plan) return
                if (plan.externalRecord) {
                  setCrmDraftTitle('')
                  setCrmDraftUrl('')
                  patchPlanOverview(planId, { externalRecord: null })
                  setCrmDialogOpen(false)
                }
              }}
              disabled={!plan.externalRecord}
            >
              Disconnect
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setCrmDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={saveCrmDialog}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete this plan?</DialogTitle>
            <DialogDescription>
              This removes <span className="font-medium text-foreground">{plan.name}</span>, its planner
              timeline, and every phase tied to them. Press ⌘Z (Ctrl+Z on Windows/Linux) afterward to undo if you're
              not typing in a field.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="transition-surface duration-200 ease-out"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
