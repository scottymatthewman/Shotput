import { ActionDialog } from '@/components/ui/action-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { InboxMessage } from '@/features/inbox/inboxTypes'
import type { Phase, Plan } from '@/types/domain'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'

function PlanPhasePicker({
  plans,
  phases,
  planId,
  phaseId,
  onPlanChange,
  onPhaseChange,
}: {
  plans: Plan[]
  phases: Phase[]
  planId: string
  phaseId: string
  onPlanChange: (id: string) => void
  onPhaseChange: (id: string) => void
}) {
  const planPhases = useMemo(
    () => phases.filter((p) => p.planId === planId).sort((a, b) => a.title.localeCompare(b.title)),
    [phases, planId],
  )

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="inbox-link-plan">Plan</Label>
        <select
          id="inbox-link-plan"
          value={planId}
          onChange={(e) => onPlanChange(e.target.value)}
          className={cn(
            'flex h-9 w-full rounded-md bg-surface-3 px-3 py-1 text-sm text-foreground',
            'inset-edge-ring inset-edge-ring-full transition-surface duration-150',
          )}
        >
          <option value="">Select a plan…</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inbox-link-phase">Phase (optional)</Label>
        <select
          id="inbox-link-phase"
          value={phaseId}
          onChange={(e) => onPhaseChange(e.target.value)}
          disabled={!planId}
          className={cn(
            'flex h-9 w-full rounded-md bg-surface-3 px-3 py-1 text-sm text-foreground',
            'inset-edge-ring inset-edge-ring-full transition-surface duration-150',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <option value="">No phase</option>
          {planPhases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function InboxLinkDialog({
  open,
  onOpenChange,
  message,
  plans,
  phases,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: InboxMessage | undefined
  plans: Plan[]
  phases: Phase[]
  onConfirm: (planId: string, phaseId?: string) => void
}) {
  const [planId, setPlanId] = useState('')
  const [phaseId, setPhaseId] = useState('')

  useEffect(() => {
    if (!open || !message) return
    setPlanId(message.linkedPlanId ?? '')
    setPhaseId(message.linkedPhaseId ?? '')
  }, [message, open])

  function handlePlanChange(nextPlanId: string) {
    setPlanId(nextPlanId)
    setPhaseId('')
  }

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Link to plan"
      description="Route this thread to a plan or phase in your workspace."
      confirmLabel="Save link"
      confirmDisabled={!planId}
      onConfirm={() => onConfirm(planId, phaseId || undefined)}
    >
      <PlanPhasePicker
        plans={plans}
        phases={phases}
        planId={planId}
        phaseId={phaseId}
        onPlanChange={handlePlanChange}
        onPhaseChange={setPhaseId}
      />
    </ActionDialog>
  )
}

export function InboxCreateTaskDialog({
  open,
  onOpenChange,
  message,
  plans,
  phases,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: InboxMessage | undefined
  plans: Plan[]
  phases: Phase[]
  onConfirm: (planId: string, phaseId: string, title: string) => void
}) {
  const [planId, setPlanId] = useState('')
  const [phaseId, setPhaseId] = useState('')
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!open || !message) return
    setPlanId(message.linkedPlanId ?? plans[0]?.id ?? '')
    setPhaseId(message.linkedPhaseId ?? '')
    setTitle(message.preview.slice(0, 120))
  }, [message, open, plans])

  const planPhases = useMemo(
    () => phases.filter((p) => p.planId === planId).sort((a, b) => a.title.localeCompare(b.title)),
    [phases, planId],
  )

  useEffect(() => {
    if (!open || !planId) return
    if (phaseId && planPhases.some((p) => p.id === phaseId)) return
    setPhaseId(planPhases[0]?.id ?? '')
  }, [open, planId, phaseId, planPhases])

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create task from message"
      description="Adds a checklist item on the selected phase. Reply in Gmail or Slack when you need to send mail."
      confirmLabel="Create task"
      confirmDisabled={!planId || !phaseId || !title.trim()}
      onConfirm={() => onConfirm(planId, phaseId, title.trim())}
    >
      <div className="space-y-3">
        <PlanPhasePicker
          plans={plans}
          phases={phases}
          planId={planId}
          phaseId={phaseId}
          onPlanChange={(id) => {
            setPlanId(id)
            setPhaseId('')
          }}
          onPhaseChange={setPhaseId}
        />
        <div className="space-y-1.5">
          <Label htmlFor="inbox-task-title">Task title</Label>
          <Input
            id="inbox-task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-surface-3"
          />
        </div>
      </div>
    </ActionDialog>
  )
}

export function InboxDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete this message?"
      description="Removes it from your inbox in Dance. The original thread in Gmail or Slack is not affected."
      confirmLabel="Delete"
      confirmVariant="destructive"
      onConfirm={onConfirm}
    />
  )
}
