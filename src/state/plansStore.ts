import { coerceOrderedPhaseDates } from '@/lib/phaseDateOrder'
import { addDays, format } from 'date-fns'
import { useEffect, useLayoutEffect, useMemo } from 'react'
import * as instantMutations from '@/lib/instant/mutations'
import { hasInstantConfig } from '@/lib/instant/db'
import { buildWorkspaceTransact, transactAll } from '@/lib/instant/seed'
import { createInitialWorkspace, initialActivityLog } from '@/mock/fixtures'
import type { ActivityEvent, Phase, PhaseStatus, PlanOverviewPatch, Workspace } from '@/types/domain'
import type { PlanNavGlyph } from '@/lib/planIconRegistry'
import {
  getOverlayPhase,
  mergeWorkspaceWithOverlay,
  useOptimisticOverlay,
} from '@/state/optimisticOverlay'
import { persistLocalWorkspaceIfNeeded, useLocalWorkspaceStore } from '@/state/localWorkspaceStore'
import {
  captureUndoFrame,
  CURRENT_USER_ID,
  type PhaseQuickDialogKind,
  type TimelineViewMode,
  useUiStore,
} from '@/state/uiStore'
import { useWorkspaceQuery } from '@/state/useWorkspaceQuery'

export type { TimelineViewMode, PhaseQuickDialogKind, PlanOverviewPatch }
export { CURRENT_USER_ID }

export interface PlansStoreSlice {
  workspace: Workspace
  activityLog: ActivityEvent[]
  planNavGlyph: Record<string, PlanNavGlyph>
  isLoading: boolean
  error: { message: string } | undefined
  timelineViewMode: TimelineViewMode
  setTimelineViewMode: (m: TimelineViewMode) => void
  hoveredPhaseId: string | null
  setHoveredPhaseId: (id: string | null) => void
  focusedPhaseId: string | null
  setFocusedPhaseId: (id: string | null) => void
  phaseQuickDialog: { kind: PhaseQuickDialogKind; phaseId: string } | null
  setPhaseQuickDialog: (v: { kind: PhaseQuickDialogKind; phaseId: string } | null) => void
  pendingGanttStatusMenuPhaseId: string | null
  requestGanttStatusMenuForPhase: (phaseId: string) => void
  clearPendingGanttStatusMenu: () => void
  pendingPhasePriorityDropdownPhaseId: string | null
  requestPhasePriorityDropdownForPhase: (phaseId: string) => void
  clearPendingPhasePriorityDropdown: () => void
  commandOpen: boolean
  setCommandOpen: (v: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebarCollapsed: () => void
  selectedPhaseId: string | null
  setSelectedPhaseId: (id: string | null) => void
  phaseModal: import('@/state/uiStore').PhaseModalState | null
  openNewPhaseModal: (planId: string) => void
  openPhaseModal: (
    planId: string,
    phaseId: string,
    options?: { autoFocusTitle?: boolean },
  ) => void
  closePhaseModal: () => void
  updatePhaseDates: (phaseId: string, start: string, end: string) => void
  nudgePhaseByDays: (phaseId: string, deltaDays: number) => void
  setPhaseStatus: (phaseId: string, status: PhaseStatus) => void
  updatePhaseDetails: (
    phaseId: string,
    patch: Partial<
      Pick<
        Phase,
        | 'title'
        | 'description'
        | 'start'
        | 'end'
        | 'priority'
        | 'assigneeUserIds'
        | 'statusIsManual'
        | 'budgetAllocatedCents'
        | 'budgetActualCents'
      >
    >,
  ) => void
  toggleChecklistTask: (phaseId: string, checklistTaskId: string) => void
  deletePhase: (phaseId: string) => void
  createPhaseInPlan: (
    planId: string,
    overrides?: Partial<import('@/types/domain').Phase>,
  ) => string | null
  undoLastAction: () => boolean
  redoLastAction: () => boolean
  addPlanNote: (planId: string, planName: string, body: string) => void
  deletePlan: (planId: string) => void
  patchPlanOverview: (planId: string, patch: PlanOverviewPatch) => void
  resetDemo: () => void
  setPlanNavGlyph: (planId: string, glyph: Partial<PlanNavGlyph>) => void
}

const loadingPlaceholder = createInitialWorkspace()

let plansStoreRef: PlansStoreSlice | null = null

function buildSlice(
  baseWorkspace: Workspace,
  activityLog: ActivityEvent[],
  planNavGlyph: Record<string, PlanNavGlyph>,
  instant: { isLoading: boolean; error: { message: string } | undefined },
  ui: ReturnType<typeof useUiStore.getState>,
  overlay: ReturnType<typeof useOptimisticOverlay.getState>,
): PlansStoreSlice {
  const workspace = mergeWorkspaceWithOverlay(baseWorkspace, overlay)

  const snapshot = () => ({
    workspace: mergeWorkspaceWithOverlay(baseWorkspace, useOptimisticOverlay.getState()),
    activityLog,
  })

  const persistLocal = () => {
    persistLocalWorkspaceIfNeeded({
      workspace: snapshot().workspace,
      activityLog,
      planNavGlyph,
    })
  }

  const withUndo = <Args extends unknown[]>(fn: (...args: Args) => void) => {
    return (...args: Args) => {
      ui.pushUndoFrame(captureUndoFrame(snapshot()))
      fn(...args)
      persistLocal()
    }
  }

  const requirePhase = (phaseId: string) =>
    getOverlayPhase(baseWorkspace, useOptimisticOverlay.getState(), phaseId)

  const slice: PlansStoreSlice = {
    workspace,
    activityLog,
    planNavGlyph,
    isLoading: instant.isLoading,
    error: instant.error,
    timelineViewMode: ui.timelineViewMode,
    setTimelineViewMode: ui.setTimelineViewMode,
    hoveredPhaseId: ui.hoveredPhaseId,
    setHoveredPhaseId: ui.setHoveredPhaseId,
    focusedPhaseId: ui.focusedPhaseId,
    setFocusedPhaseId: ui.setFocusedPhaseId,
    phaseQuickDialog: ui.phaseQuickDialog,
    setPhaseQuickDialog: ui.setPhaseQuickDialog,
    pendingGanttStatusMenuPhaseId: ui.pendingGanttStatusMenuPhaseId,
    requestGanttStatusMenuForPhase: ui.requestGanttStatusMenuForPhase,
    clearPendingGanttStatusMenu: ui.clearPendingGanttStatusMenu,
    pendingPhasePriorityDropdownPhaseId: ui.pendingPhasePriorityDropdownPhaseId,
    requestPhasePriorityDropdownForPhase: ui.requestPhasePriorityDropdownForPhase,
    clearPendingPhasePriorityDropdown: ui.clearPendingPhasePriorityDropdown,
    commandOpen: ui.commandOpen,
    setCommandOpen: ui.setCommandOpen,
    sidebarCollapsed: ui.sidebarCollapsed,
    setSidebarCollapsed: ui.setSidebarCollapsed,
    toggleSidebarCollapsed: ui.toggleSidebarCollapsed,
    selectedPhaseId: ui.selectedPhaseId,
    setSelectedPhaseId: ui.setSelectedPhaseId,
    phaseModal: ui.phaseModal,
    openNewPhaseModal: ui.openNewPhaseModal,
    openPhaseModal: ui.openPhaseModal,
    closePhaseModal: ui.closePhaseModal,

    updatePhaseDates: withUndo((phaseId: string, start: string, end: string) => {
      const ordered = coerceOrderedPhaseDates(start, end)
      const phase = requirePhase(phaseId)
      if (!phase) return
      if (phase.start === ordered.start && phase.end === ordered.end) return
      overlay.patchPhase(phaseId, ordered)
      instantMutations.updatePhaseDates(phase, ordered.start, ordered.end)
    }),
    nudgePhaseByDays: (phaseId: string, deltaDays: number) => {
      const phase = requirePhase(phaseId)
      if (!phase) return
      const start = format(addDays(new Date(`${phase.start}T12:00:00`), deltaDays), 'yyyy-MM-dd')
      const end = format(addDays(new Date(`${phase.end}T12:00:00`), deltaDays), 'yyyy-MM-dd')
      ui.pushUndoFrame(captureUndoFrame(snapshot()))
      overlay.patchPhase(phaseId, { start, end })
      instantMutations.updatePhaseDates(phase, start, end)
      persistLocal()
    },
    setPhaseStatus: withUndo((phaseId: string, status: PhaseStatus) => {
      const phase = requirePhase(phaseId)
      if (!phase) return
      overlay.patchPhase(phaseId, { status, statusIsManual: true })
      instantMutations.setPhaseStatus(phase, status)
    }),
    updatePhaseDetails: withUndo((phaseId: string, patch) => {
      const phase = requirePhase(phaseId)
      if (!phase) return
      overlay.patchPhase(phaseId, patch)
      instantMutations.updatePhaseDetails(phase, patch)
    }),
    toggleChecklistTask: withUndo((phaseId: string, checklistTaskId: string) => {
      const phase = requirePhase(phaseId)
      if (!phase) return
      const tasks = phase.tasks.map((t) =>
        t.id === checklistTaskId ? { ...t, completed: !t.completed } : t,
      )
      overlay.patchPhase(phaseId, { tasks })
      instantMutations.toggleChecklistTask(phase, checklistTaskId)
    }),
    deletePhase: withUndo((phaseId: string) => {
      const phase = requirePhase(phaseId)
      if (!phase) return
      overlay.removePhase(phaseId)
      instantMutations.deletePhase(phase)
      if (ui.phaseModal?.mode === 'edit' && ui.phaseModal.phaseId === phaseId) {
        ui.closePhaseModal()
      }
      if (ui.selectedPhaseId === phaseId) ui.setSelectedPhaseId(null)
      if (ui.hoveredPhaseId === phaseId) ui.setHoveredPhaseId(null)
      if (ui.focusedPhaseId === phaseId) ui.setFocusedPhaseId(null)
      if (ui.phaseQuickDialog?.phaseId === phaseId) ui.setPhaseQuickDialog(null)
    }),
    createPhaseInPlan: (planId: string, overrides) => {
      const plan = workspace.plans[planId]
      if (!plan) return null
      ui.pushUndoFrame(captureUndoFrame(snapshot()))
      const phase = instantMutations.createPhaseInPlan(plan, overrides)
      overlay.addPhaseToPlan(phase)
      persistLocal()
      return phase.id
    },
    undoLastAction: () => ui.undoLastAction(captureUndoFrame(snapshot())),
    redoLastAction: () => ui.redoLastAction(captureUndoFrame(snapshot())),
    addPlanNote: withUndo((planId: string, planName: string, body: string) => {
      instantMutations.addPlanNote(planId, planName, body)
    }),
    deletePlan: withUndo((planId: string) => {
      const plan = workspace.plans[planId]
      if (!plan) return
      const phaseIdsToRemove = new Set<string>()
      for (const phase of Object.values(workspace.phases)) {
        if (phase.planId === planId) {
          phaseIdsToRemove.add(phase.id)
        }
      }
      instantMutations.deletePlan(planId, plan.name, [...phaseIdsToRemove])
      if (ui.selectedPhaseId && phaseIdsToRemove.has(ui.selectedPhaseId)) {
        ui.setSelectedPhaseId(null)
      }
    }),
    patchPlanOverview: withUndo((planId: string, patch) => {
      if (!workspace.plans[planId]) return
      overlay.patchPlan(planId, patch)
      instantMutations.patchPlanOverview(planId, patch)
    }),
    resetDemo: () => {
      const w = createInitialWorkspace()
      const log = initialActivityLog
      if (hasInstantConfig) {
        transactAll(buildWorkspaceTransact(w, log))
      } else {
        useLocalWorkspaceStore.getState().resetToFixtures()
      }
      overlay.clear()
      ui.clearUndoRedo()
    },
    setPlanNavGlyph: (planId: string, glyph: Partial<PlanNavGlyph>) => {
      instantMutations.setPlanNavGlyph(planId, glyph)
      if (!hasInstantConfig) {
        const current = useLocalWorkspaceStore.getState().planNavGlyph
        persistLocalWorkspaceIfNeeded({
          workspace: snapshot().workspace,
          activityLog,
          planNavGlyph: {
            ...current,
            [planId]: { ...current[planId], ...glyph },
          },
        })
      }
    },
  }

  return slice
}

export function usePlansStore<T>(selector: (s: PlansStoreSlice) => T): T {
  const ui = useUiStore()
  const query = useWorkspaceQuery()
  const overlayState = useOptimisticOverlay()

  const baseWorkspace = query.workspace ?? loadingPlaceholder
  const activityLog = query.ready ? query.activityLog : initialActivityLog

  useEffect(() => {
    if (query.workspace) {
      useOptimisticOverlay.getState().pruneAgainst(query.workspace)
    }
  }, [query.workspace])

  const slice = useMemo(
    () =>
      buildSlice(
        baseWorkspace,
        activityLog,
        query.planNavGlyph,
        { isLoading: query.isLoading, error: query.error },
        ui,
        overlayState,
      ),
    [baseWorkspace, activityLog, query.planNavGlyph, query.isLoading, query.error, ui, overlayState],
  )

  useLayoutEffect(() => {
    plansStoreRef = slice
  }, [slice])

  return selector(slice)
}

usePlansStore.getState = (): PlansStoreSlice => {
  if (plansStoreRef) return plansStoreRef
  const ui = useUiStore.getState()
  const overlay = useOptimisticOverlay.getState()
  return buildSlice(
    loadingPlaceholder,
    initialActivityLog,
    {},
    { isLoading: true, error: undefined },
    ui,
    overlay,
  )
}

usePlansStore.persist = useUiStore.persist

export { InstantBootstrap } from '@/state/instantBootstrap'
