import { PLAN_TEMPLATE_RECIPES, PLAN_TYPES } from '@/config/planTemplates'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
import { useUiStore } from '@/state/uiStore'
import type { PlanType } from '@/types/domain'
import { useEffect, useState, type FormEvent } from 'react'

export function NewPlanDialog() {
  const open = useUiStore((s) => s.newPlanDialogOpen)
  const setNewPlanDialogOpen = useUiStore((s) => s.setNewPlanDialogOpen)
  const setLastCreatedPlanId = useUiStore((s) => s.setLastCreatedPlanId)
  const [planType, setPlanType] = useState<PlanType>('trade_show_booth')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const recipe = PLAN_TEMPLATE_RECIPES[planType]

  useEffect(() => {
    if (open) return
    setName('')
    setDescription('')
    setPlanType('trade_show_booth')
  }, [open])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    setNewPlanDialogOpen(false)

    const planId = usePlansStore.getState().createPlanFromTemplate(planType, {
      name: trimmed,
      description: description.trim() || undefined,
    })
    setLastCreatedPlanId(planId)
  }

  return (
    <Dialog open={open} onOpenChange={setNewPlanDialogOpen}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New plan</DialogTitle>
            <DialogDescription>
              Choose a program type to seed phases and detail fields for your timeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="plan-type">Program type</Label>
              <select
                id="plan-type"
                className={cn(
                  'h-9 w-full cursor-pointer rounded-md bg-surface-3 px-3 text-sm text-foreground',
                  'inset-edge-ring inset-edge-ring-full outline-none transition-surface duration-150',
                )}
                value={planType}
                onChange={(ev) => setPlanType(ev.target.value as PlanType)}
              >
                {PLAN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PLAN_TEMPLATE_RECIPES[t].label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">{recipe.description}</p>
              <p className="text-xs text-muted-foreground">
                Seeds {recipe.defaultPhases.length} phases · emphasizes{' '}
                {recipe.defaultPropertyGroups.join(', ')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                placeholder={recipe.label}
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-description">Description (optional)</Label>
              <Textarea
                id="plan-description"
                rows={2}
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewPlanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
