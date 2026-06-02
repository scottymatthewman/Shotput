import { navCopyLinkIcon } from '@/components/nav/navIcons'
import { BudgetAmountField } from '@/components/dance/BudgetAmountField'
import { PlanStatusBadge } from '@/components/dance/StatusBadge'
import { PhaseDatePickerField } from '@/features/plans/PhaseDatePickerField'
import { ActionDialog } from '@/components/ui/action-dialog'
import { Button } from '@/components/ui/button'
import {
  BloomDropdown,
  BloomDropdownItem,
} from '@/components/ui/bloom-menu'
import { Input } from '@/components/ui/input'
import {
  DetailCollapsibleSection,
  inkDatePickers,
  inkOverviewGridValue,
  inkOverviewTitle,
  overviewMetadataGrid,
  overviewGridMenuPlacement,
  OverviewActivityTimeline,
  OverviewDescriptionField,
  OverviewMetadataCell,
  OverviewOwnerPill,
} from '@/features/plans/overviewPageLayout'
import { CenteredPageScroll } from '@/layouts/CenteredPageScroll'
import { PageShell } from '@/layouts/PageShell'
import {
  computePlanBudgetRollup,
  formatBudgetCents,
  planBudgetCurrency,
} from '@/lib/budget'
import { PLAN_TEMPLATE_RECIPES, PLAN_TYPES } from '@/config/planTemplates'
import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
import type { PlanStatus, User } from '@/types/domain'
import {
  CalendarDays,
  ChevronLeft,
  CircleDashed,
  DollarSign,
  LayoutGrid,
  MapPin,
  User as UserIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const PLAN_STATUSES: PlanStatus[] = ['healthy', 'at_risk', 'paused']

export function PlanOverviewPage() {
  const { planId: planIdParam, eventId: legacyEventId } = useParams<{
    planId?: string
    eventId?: string
  }>()
  const planId = planIdParam ?? legacyEventId
  const navigate = useNavigate()
  const workspace = usePlansStore((s) => s.workspace)
  const activityLog = usePlansStore((s) => s.activityLog)
  const deletePlan = usePlansStore((s) => s.deletePlan)
  const patchPlanOverview = usePlansStore((s) => s.patchPlanOverview)

  const plan = planId ? workspace.plans[planId] : undefined

  const budgetRollup = useMemo(
    () => (plan ? computePlanBudgetRollup(plan, workspace) : null),
    [plan, workspace],
  )

  const owner = plan ? workspace.users[plan.ownerUserId] : undefined

  const workspaceUsers = useMemo(() => {
    return workspace.userIds
      .map((id) => workspace.users[id])
      .filter((u): u is User => !!u)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [workspace.userIds, workspace.users])

  const planEvents = useMemo(() => {
    if (!planId) return []
    return activityLog
      .filter(
        (e) =>
          e.planId === planId || (e.objectType === 'plan' && e.objectId === planId),
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
  }, [activityLog, planId])

  const [titleDraft, setTitleDraft] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [locationDraft, setLocationDraft] = useState('')
  const [shareCopied, setShareCopied] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(true)

  useEffect(() => {
    if (!plan) return
    setTitleDraft(plan.name)
    setDescriptionDraft(plan.description)
    setLocationDraft(plan.location ?? '')
  }, [plan?.id, plan?.name, plan?.description, plan?.location])

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

  const shareOverviewLink = useCallback(async () => {
    if (!planId) return
    const url = `${window.location.origin}/plans/${planId}/overview`
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
          to="/plans"
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
    navigate('/plans', { replace: true })
  }

  const currency = planBudgetCurrency(plan)
  const spendLabel =
    budgetRollup != null
      ? formatBudgetCents(budgetRollup.actualCents, currency)
      : '—'

  const programLabel = plan.planType
    ? PLAN_TEMPLATE_RECIPES[plan.planType].label
    : 'Not set'

  return (
    <PageShell>
      <CenteredPageScroll columnClassName="max-w-[700px] gap-10 pt-2 pb-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <Link
              to={`/plans/${planId}`}
              className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground"
            >
              <ChevronLeft className="size-5 shrink-0" aria-hidden />
              Back
            </Link>

            <div className="flex items-start gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      ;(e.target as HTMLInputElement).blur()
                    }
                  }}
                  aria-label="Plan title"
                  className={inkOverviewTitle}
                />
                <div className="h-px w-full bg-border" aria-hidden />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'mt-0.5 size-8 shrink-0 text-muted-foreground transition-surface pressable duration-150 ease-hover',
                  'hover:text-foreground',
                  shareCopied && 'text-foreground',
                )}
                aria-label={shareCopied ? 'Link copied' : 'Copy overview link'}
                title={shareCopied ? 'Copied' : 'Copy link'}
                onClick={() => void shareOverviewLink()}
              >
                {navCopyLinkIcon({ className: 'size-[18px]', 'aria-hidden': true })}
              </Button>
            </div>
          </div>

          <OverviewDescriptionField
            value={descriptionDraft}
            onChange={(e) => setDescriptionDraft(e.target.value)}
            onBlur={commitDescription}
            placeholder="Describe the plan."
            aria-label="Plan description"
          />

          <div className={overviewMetadataGrid}>
            <OverviewMetadataCell icon={UserIcon} label="Owner">
              <BloomDropdown
                placement={overviewGridMenuPlacement}
                menuWidth={240}
                trigger={
                  owner ? (
                    <OverviewOwnerPill
                      as="button"
                      user={owner}
                      aria-label="Change plan owner"
                    />
                  ) : (
                    <button
                      type="button"
                      aria-label="Assign plan owner"
                      className={cn(
                        inkOverviewGridValue,
                        'pressable cursor-pointer text-right',
                      )}
                    >
                      Assign owner
                    </button>
                  )
                }
              >
                {workspaceUsers.map((u) => (
                  <BloomDropdownItem
                    key={u.id}
                    className="text-sm"
                    onSelect={() => patchPlanOverview(planId, { ownerUserId: u.id })}
                  >
                    <OverviewOwnerPill user={u} />
                  </BloomDropdownItem>
                ))}
              </BloomDropdown>
            </OverviewMetadataCell>

            <OverviewMetadataCell icon={CalendarDays} label="Timeline">
              <div className="flex flex-wrap items-center justify-end gap-2.5 text-sm tabular-nums text-foreground">
                <PhaseDatePickerField
                  value={plan.start}
                  ariaLabel="Start date"
                  labelFormat="short"
                  scrub
                  align="end"
                  maxDate={plan.end}
                  onChange={(next) => patchPlanOverview(planId, { start: next })}
                  className={cn(inkDatePickers, '!px-0 !py-0')}
                />
                <span className="shrink-0 text-muted-foreground/30" aria-hidden>
                  –
                </span>
                <PhaseDatePickerField
                  value={plan.end}
                  ariaLabel="End date"
                  labelFormat="short"
                  scrub
                  align="end"
                  minDate={plan.start}
                  onChange={(next) => patchPlanOverview(planId, { end: next })}
                  className={cn(inkDatePickers, '!px-0 !py-0')}
                />
              </div>
            </OverviewMetadataCell>

            <OverviewMetadataCell icon={CircleDashed} label="Status">
              <BloomDropdown
                placement={overviewGridMenuPlacement}
                menuWidth={220}
                trigger={
                  <button
                    type="button"
                    className="pressable cursor-pointer transition-surface duration-150 ease-hover"
                    aria-label="Change plan status"
                  >
                    <PlanStatusBadge status={plan.status ?? 'healthy'} />
                  </button>
                }
              >
                {PLAN_STATUSES.map((status) => (
                  <BloomDropdownItem
                    key={status}
                    className="text-sm"
                    onSelect={() => patchPlanOverview(planId, { status })}
                  >
                    <PlanStatusBadge status={status} />
                  </BloomDropdownItem>
                ))}
              </BloomDropdown>
            </OverviewMetadataCell>

            <OverviewMetadataCell icon={MapPin} label="Location">
              <Input
                value={locationDraft}
                onChange={(e) => setLocationDraft(e.target.value)}
                onBlur={commitLocation}
                placeholder="Add location…"
                aria-label="Location"
                className={inkOverviewGridValue}
              />
            </OverviewMetadataCell>

            <OverviewMetadataCell icon={DollarSign} label="Budget">
              <div className="flex items-center gap-2.5 text-sm tabular-nums text-foreground">
                <span>{spendLabel}</span>
                <span className="text-muted-foreground/30" aria-hidden>
                  /
                </span>
                <BudgetAmountField
                  valueCents={plan.budgetCents}
                  currency={currency}
                  ariaLabel="Plan budget ceiling"
                  onCommit={(cents) => patchPlanOverview(planId, { budgetCents: cents ?? null })}
                  className="min-w-0 justify-end [&_input]:px-0 [&_input]:text-right"
                />
              </div>
            </OverviewMetadataCell>

            <OverviewMetadataCell icon={LayoutGrid} label="Program">
              <BloomDropdown
                placement={overviewGridMenuPlacement}
                menuWidth={280}
                trigger={
                  <button
                    type="button"
                    aria-label="Program type"
                    className={cn(
                      inkOverviewGridValue,
                      'pressable cursor-pointer whitespace-nowrap text-right',
                    )}
                  >
                    {programLabel}
                  </button>
                }
              >
                <BloomDropdownItem
                  className="text-sm"
                  onSelect={() => patchPlanOverview(planId, { planType: undefined })}
                >
                  Not set
                </BloomDropdownItem>
                {PLAN_TYPES.map((t) => (
                  <BloomDropdownItem
                    key={t}
                    className="text-sm"
                    onSelect={() => patchPlanOverview(planId, { planType: t })}
                  >
                    {PLAN_TEMPLATE_RECIPES[t].label}
                  </BloomDropdownItem>
                ))}
              </BloomDropdown>
            </OverviewMetadataCell>
          </div>
        </div>

        <DetailCollapsibleSection
          title="Activity"
          open={activityOpen}
          onOpenChange={setActivityOpen}
        >
          <OverviewActivityTimeline events={planEvents} workspace={workspace} />
        </DetailCollapsibleSection>

        <div className="flex items-center justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="inset-edge-destructive-hover cursor-pointer text-muted-foreground transition-surface duration-150 ease-out hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete plan
          </Button>
        </div>
      </CenteredPageScroll>

      <ActionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this plan?"
        description={
          <>
            This removes <span className="font-medium text-foreground">{plan.name}</span>, its planner
            timeline, and every phase tied to them. Press ⌘Z (Ctrl+Z on Windows/Linux) afterward to undo if
            you&apos;re not typing in a field.
          </>
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
    </PageShell>
  )
}
