import { AssigneePill } from '@/components/dance/AssigneePill'
import { armTimelineRowClickSuppression } from '@/components/dance/phaseStatusMenu'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { selectWorkspaceUsers } from '@/state/selectors'
import { usePlansStore } from '@/state/store'
import type { Phase } from '@/types/domain'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

const priorities: Phase['priority'][] = ['low', 'medium', 'high', 'urgent']

function priorityLabel(p: Phase['priority']) {
  return p.charAt(0).toUpperCase() + p.slice(1)
}

/** Do not move focus into the dialog on open (avoids focus rings on the panel or first row). */
function preventDialogInitialFocus(e: Event) {
  e.preventDefault()
}

export function PhaseQuickActionDialogs({ planId }: { planId: string }) {
  const dialog = usePlansStore((s) => s.phaseQuickDialog)
  const setDialog = usePlansStore((s) => s.setPhaseQuickDialog)
  const updatePhaseDetails = usePlansStore((s) => s.updatePhaseDetails)
  const deletePhase = usePlansStore((s) => s.deletePhase)
  const phase = usePlansStore((s) =>
    dialog?.phaseId ? s.workspace.phases[dialog.phaseId] : undefined,
  )
  const { userIds, users } = usePlansStore(
    useShallow((s) => ({
      userIds: s.workspace.userIds,
      users: selectWorkspaceUsers(s),
    })),
  )
  const matchesPlan = Boolean(phase && phase.planId === planId)

  useEffect(() => {
    if (!dialog?.phaseId) return
    if (!phase || phase.planId !== planId) {
      setDialog(null)
    }
  }, [dialog, phase, planId, setDialog])

  const close = () => setDialog(null)

  if (!dialog || !phase || !matchesPlan) {
    return null
  }

  return (
    <>
      <Dialog open={dialog.kind === 'priority'} onOpenChange={(v) => !v && close()}>
        <DialogContent
          className="sm:max-w-md"
          aria-describedby={undefined}
          onOpenAutoFocus={preventDialogInitialFocus}
        >
          <DialogHeader className="gap-2 pb-1">
            <DialogTitle>Change priority</DialogTitle>
            <DialogDescription className="truncate">{phase.title}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 px-0.5 pt-3 pb-2">
            {priorities.map((p) => (
              <Button
                key={p}
                type="button"
                variant={phase.priority === p ? 'secondary' : 'ghost'}
                className="h-11 w-full justify-start px-4 font-normal"
                onClick={() => {
                  updatePhaseDetails(phase.id, { priority: p })
                  close()
                }}
              >
                {priorityLabel(p)}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === 'assigneeOwner'} onOpenChange={(v) => !v && close()}>
        <DialogContent
          className="sm:max-w-md"
          aria-describedby={undefined}
          onOpenAutoFocus={preventDialogInitialFocus}
        >
          <DialogHeader className="gap-2 pb-1">
            <DialogTitle>Change owner</DialogTitle>
            <DialogDescription className="truncate">{phase.title}</DialogDescription>
          </DialogHeader>
          <p className="px-0.5 text-xs leading-relaxed text-muted-foreground">
            Pick one workspace member. They become the only user assignee; agents on this task stay as they are.
          </p>
          <div className="max-h-[min(320px,50vh)] overflow-y-auto rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft80 bg-muted/20 px-2 py-2">
            <div className="flex flex-col gap-1">
              {userIds.map((uid) => {
                const user = users[uid]
                if (!user) return null
                const selected = phase.assigneeUserIds[0] === uid
                return (
                  <Button
                    key={uid}
                    type="button"
                    variant={selected ? 'secondary' : 'ghost'}
                    className="h-auto min-h-11 w-full justify-start px-3 py-2.5 font-normal"
                    onClick={() => {
                      updatePhaseDetails(phase.id, { assigneeUserIds: [uid] })
                      armTimelineRowClickSuppression()
                      close()
                    }}
                  >
                    <AssigneePill user={user} className="max-w-full" />
                  </Button>
                )
              })}
            </div>
          </div>
          {phase.assigneeUserIds.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="w-full font-normal"
              onClick={() => {
                updatePhaseDetails(phase.id, { assigneeUserIds: [] })
                armTimelineRowClickSuppression()
                close()
              }}
            >
              Clear user owner
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === 'assignee'} onOpenChange={(v) => !v && close()}>
        <DialogContent
          className="sm:max-w-md"
          aria-describedby={undefined}
          onOpenAutoFocus={preventDialogInitialFocus}
        >
          <DialogHeader className="gap-2 pb-1">
            <DialogTitle>Add assignees</DialogTitle>
            <DialogDescription className="truncate">{phase.title}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(320px,50vh)] overflow-y-auto rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft80 bg-muted/20 px-2 py-2">
            <div className="flex flex-col gap-1">
              {userIds.map((uid) => {
                const user = users[uid]
                if (!user) return null
                const checked = phase.assigneeUserIds.includes(uid)
                return (
                  <div
                    key={uid}
                    className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`assign-${phase.id}-${uid}`}
                      checked={checked}
                      onCheckedChange={(v) => {
                        const next =
                          v === true
                            ? [...phase.assigneeUserIds, uid]
                            : phase.assigneeUserIds.filter((id) => id !== uid)
                        updatePhaseDetails(phase.id, { assigneeUserIds: [...new Set(next)] })
                      }}
                    />
                    <Label
                      htmlFor={`assign-${phase.id}-${uid}`}
                      className="min-w-0 flex-1 cursor-pointer font-normal"
                    >
                      <AssigneePill user={user} className="max-w-full" />
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground pt-1">
            Agents stay separate from user assignees for now.
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === 'delete'} onOpenChange={(v) => !v && close()}>
        <DialogContent
          className="sm:max-w-md"
          aria-describedby="delete-task-desc"
          onOpenAutoFocus={preventDialogInitialFocus}
        >
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              deletePhase(phase.id)
              close()
            }}
          >
            <DialogHeader className="gap-2 pb-1">
              <DialogTitle>Delete this phase?</DialogTitle>
              <DialogDescription id="delete-task-desc">
                This removes the phase from this plan. Press ⌘Z (Ctrl+Z on Windows/Linux) afterward to undo the
                delete.
              </DialogDescription>
            </DialogHeader>
            <p className="truncate px-0.5 text-sm font-medium text-foreground">{phase.title}</p>
            <div className="flex flex-col-reverse gap-2 pt-0 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
              >
                Delete phase
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
