import { PhaseDetailPanel } from '@/features/plans/PhaseDetailPanel'
import { NewPhaseForm } from '@/features/plans/NewPhaseForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePlansStore } from '@/state/store'
import { useEffect } from 'react'

/** Do not steal focus from the title field when creating a phase. */
function preventDialogInitialFocus(e: Event) {
  e.preventDefault()
}

export function PhaseDetailModal() {
  const phaseModal = usePlansStore((s) => s.phaseModal)
  const closePhaseModal = usePlansStore((s) => s.closePhaseModal)
  const setSelectedPhaseId = usePlansStore((s) => s.setSelectedPhaseId)
  const workspace = usePlansStore((s) => s.workspace)

  const planId = phaseModal?.planId
  const plan = planId ? workspace.plans[planId] : undefined
  const phaseId = phaseModal?.mode === 'edit' ? phaseModal.phaseId : undefined
  const phase = phaseId ? workspace.phases[phaseId] : undefined

  useEffect(() => {
    if (!phaseModal || phaseModal.mode !== 'edit') return
    if (!phase || phase.planId !== phaseModal.planId) {
      closePhaseModal()
    }
  }, [phaseModal, phase, closePhaseModal])

  const isCreate = phaseModal?.mode === 'create'

  return (
    <Dialog open={phaseModal != null} onOpenChange={(open) => !open && closePhaseModal()}>
      <DialogContent
        variant="surface"
        hideClose={isCreate}
        className="flex max-h-[min(85vh,720px)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0"
        aria-describedby={isCreate ? undefined : plan ? undefined : 'phase-modal-desc'}
        onOpenAutoFocus={isCreate ? preventDialogInitialFocus : undefined}
      >
        {isCreate ? (
          <DialogTitle className="sr-only">New phase</DialogTitle>
        ) : (
          <DialogHeader className="shrink-0 gap-1 px-6 pt-6 pr-12 text-left">
            <DialogTitle>Phase</DialogTitle>
            {plan ? (
              <DialogDescription>{plan.name}</DialogDescription>
            ) : (
              <DialogDescription id="phase-modal-desc">Phase details</DialogDescription>
            )}
          </DialogHeader>
        )}

        {isCreate && planId ? (
          <NewPhaseForm
            planId={planId}
            onCancel={closePhaseModal}
            onSaved={(id) => {
              setSelectedPhaseId(id)
              closePhaseModal()
            }}
          />
        ) : null}

        {!isCreate && planId && phaseId ? (
          <ScrollArea className="min-h-0 flex-1 overscroll-contain">
            <PhaseDetailPanel
              planId={planId}
              phaseId={phaseId}
              autoFocusTitle={
                phaseModal?.mode === 'edit' ? phaseModal.autoFocusTitle : false
              }
              className="pt-0"
            />
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
