import { NewPhaseForm } from '@/features/plans/NewPhaseForm'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { phaseDetailPath } from '@/lib/planRoute'
import { usePlansStore } from '@/state/store'
import { useNavigate } from 'react-router-dom'

/** Do not steal focus from the title field when creating a phase. */
function preventDialogInitialFocus(e: Event) {
  e.preventDefault()
}

export function NewPhaseModal() {
  const phaseModal = usePlansStore((s) => s.phaseModal)
  const closePhaseModal = usePlansStore((s) => s.closePhaseModal)
  const setSelectedPhaseId = usePlansStore((s) => s.setSelectedPhaseId)
  const navigate = useNavigate()

  const planId = phaseModal?.mode === 'create' ? phaseModal.planId : undefined
  const open = phaseModal?.mode === 'create'

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closePhaseModal()}>
      <DialogContent
        variant="surface"
        hideClose
        className="flex max-h-[min(85vh,720px)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0"
        onOpenAutoFocus={preventDialogInitialFocus}
      >
        <DialogTitle className="sr-only">New phase</DialogTitle>
        {planId ? (
          <NewPhaseForm
            planId={planId}
            onCancel={closePhaseModal}
            onSaved={(id) => {
              setSelectedPhaseId(id)
              closePhaseModal()
              navigate(phaseDetailPath(planId, id))
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
