import { coerceOrderedTaskDates } from '@/lib/taskDateOrder'
import { addDays, format } from 'date-fns'
import { useLayoutEffect, useMemo } from 'react'
import {
  assembleWorkspaceFromInstant,
  workspaceQuery,
} from '@/lib/instant/assembleWorkspace'
import * as instantMutations from '@/lib/instant/mutations'
import { buildWorkspaceTransact, transactAll } from '@/lib/instant/seed'
import { db } from '@/lib/instant/db'
import { createInitialWorkspace, initialActivityLog } from '@/mock/fixtures'
import type {
  ActivityEvent,
  Phase,
  PhaseStatus,
  Workspace,
} from '@/types/domain'
import type { PlanNavGlyph } from '@/lib/planIconRegistry'
import { getDomainPhase, useDomainStore, type PlanOverviewPatch } from '@/state/domainStore'
import {
  captureUndoFrame,
  CURRENT_USER_ID,
  type PhaseQuickDialogKind,
  type TimelineViewMode,
  useUiStore,
} from '@/state/uiStore'

export type { TimelineViewMode, PhaseQuickDialogKind }
export { CURRENT_USER_ID }

/** @deprecated Use PhaseQuickDialogKind */
export type TaskQuickDialogKind = PhaseQuickDialogKind

export interface DanceStoreSlice {
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
  createPhaseInPlan: (planId: string) => string | null
  undoLastAction: () => boolean
  redoLastAction: () => boolean
  addPlanNote: (planId: string, planName: string, body: string) => void
  deletePlan: (planId: string) => void
  patchPlanOverview: (planId: string, patch: PlanOverviewPatch) => void
  resetDemo: () => void
  setPlanNavGlyph: (planId: string, glyph: Partial<PlanNavGlyph>) => void
}

const loadingPlaceholder = createInitialWorkspace()

let danceStoreRef: DanceStoreSlice | null = null

function useInstantMeta() {
  const { isLoading, error, data } = db.useQuery(workspaceQuery)
  return useMemo(
    () => ({
      isLoading,
      error: error ?? undefined,
      planNavGlyph: assembleWorkspaceFromInstant(data?.workspaces, data?.activityEvents)
        .planNavGlyph,
    }),
    [isLoading, error, data],
  )
}

function buildSlice(
  workspace: Workspace,
  activityLog: ActivityEvent[],
  planNavGlyph: Record<string, PlanNavGlyph>,
  instant: { isLoading: boolean; error: { message: string } | undefined },
  ui: ReturnType<typeof useUiStore.getState>,
  domain: Pick<
    ReturnType<typeof useDomainStore.getState>,
    'patchPhase' | 'addPhaseToPlan' | 'removePhase' | 'patchPlan' | 'replaceWorkspace'
  >,
): DanceStoreSlice {
  const snapshot = () => ({
    workspace: useDomainStore.getState().workspace ?? workspace,
    activityLog: useDomainStore.getState().activityLog,
  })

  const withUndo = <Args extends unknown[]>(fn: (...args: Args) => void) => {
    return (...args: Args) => {
      const s = snapshot()
      ui.pushUndoFrame(captureUndoFrame(s))
      fn(...args)
    }
  }

  const requirePhase = (phaseId: string) => getDomainPhase(phaseId) ?? workspace.phases[phaseId]

  const slice: DanceStoreSlice = {
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

    updatePhaseDates: withUndo((phaseId: string, start: string, end: string) => {
      const ordered = coerceOrderedTaskDates(start, end)
      const phase = requirePhase(phaseId)
      if (!phase) return
      if (phase.start === ordered.start && phase.end === ordered.end) return
      domain.patchPhase(phaseId, ordered)
      instantMutations.updatePhaseDates(phase, ordered.start, ordered.end)
    }),
    nudgePhaseByDays: (phaseId: string, deltaDays: number) => {
      const phase = requirePhase(phaseId)
      if (!phase) return
      const start = format(addDays(new Date(`${phase.start}T12:00:00`), deltaDays), 'yyyy-MM-dd')
      const end = format(addDays(new Date(`${phase.end}T12:00:00`), deltaDays), 'yyyy-MM-dd')
      ui.pushUndoFrame(captureUndoFrame(snapshot()))
      domain.patchPhase(phaseId, { start, end })
      instantMutations.updatePhaseDates(phase, start, end)
    },
    setPhaseStatus: withUndo((phaseId: string, status: PhaseStatus) => {
      const phase = requirePhase(phaseId)
      if (!phase) return
      domain.patchPhase(phaseId, { status, statusIsManual: true })
      instantMutations.setPhaseStatus(phase, status)
    }),
    updatePhaseDetails: withUndo((phaseId: string, patch) => {
      const phase = requirePhase(phaseId)
      if (!phase) return
      domain.patchPhase(phaseId, patch)
      instantMutations.updatePhaseDetails(phase, patch)
    }),
    toggleChecklistTask: withUndo((phaseId: string, checklistTaskId: string) => {
      const phase = requirePhase(phaseId)
      if (!phase) return
      const tasks = phase.tasks.map((t) =>
        t.id === checklistTaskId ? { ...t, completed: !t.completed } : t,
      )
      domain.patchPhase(phaseId, { tasks })
      instantMutations.toggleChecklistTask(phase, checklistTaskId)
    }),
    deletePhase: withUndo((phaseId: string) => {
      const phase = requirePhase(phaseId)
      if (!phase) return
      domain.removePhase(phaseId)
      instantMutations.deletePhase(phase)
      if (ui.selectedPhaseId === phaseId) ui.setSelectedPhaseId(null)
      if (ui.hoveredPhaseId === phaseId) ui.setHoveredPhaseId(null)
      if (ui.focusedPhaseId === phaseId) ui.setFocusedPhaseId(null)
      if (ui.phaseQuickDialog?.phaseId === phaseId) ui.setPhaseQuickDialog(null)
    }),
    createPhaseInPlan: (planId: string) => {
      const ws = useDomainStore.getState().workspace ?? workspace
      const plan = ws?.plans[planId]
      if (!plan) return null
      ui.pushUndoFrame(captureUndoFrame(snapshot()))
      const phase = instantMutations.createPhaseInPlan(plan)
      domain.addPhaseToPlan(phase)
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
      domain.patchPlan(planId, patch)
      instantMutations.patchPlanOverview(planId, patch)
    }),
    resetDemo: () => {
      const w = createInitialWorkspace()
      const log = initialActivityLog
      transactAll(buildWorkspaceTransact(w, log))
      domain.replaceWorkspace(w, log)
      ui.clearUndoRedo()
    },
    setPlanNavGlyph: (planId: string, glyph: Partial<PlanNavGlyph>) => {
      instantMutations.setPlanNavGlyph(planId, glyph)
    },
  }

  return slice
}

export function useDanceStore<T>(selector: (s: DanceStoreSlice) => T): T {
  const ui = useUiStore()
  const instant = useInstantMeta()
  const domainWorkspace = useDomainStore((s) => s.workspace)
  const domainActivityLog = useDomainStore((s) => s.activityLog)
  const domainHydrated = useDomainStore((s) => s.hydrated)
  const patchPhase = useDomainStore((s) => s.patchPhase)
  const addPhaseToPlan = useDomainStore((s) => s.addPhaseToPlan)
  const removePhase = useDomainStore((s) => s.removePhase)
  const patchPlan = useDomainStore((s) => s.patchPlan)
  const replaceWorkspace = useDomainStore((s) => s.replaceWorkspace)

  const workspace = domainHydrated && domainWorkspace ? domainWorkspace : loadingPlaceholder
  const activityLog = domainHydrated ? domainActivityLog : initialActivityLog

  const slice = useMemo(
    () =>
      buildSlice(workspace, activityLog, instant.planNavGlyph, instant, ui, {
        patchPhase,
        addPhaseToPlan,
        removePhase,
        patchPlan,
        replaceWorkspace,
      }),
    [workspace, activityLog, instant, ui, patchPhase, addPhaseToPlan, removePhase, patchPlan, replaceWorkspace],
  )

  useLayoutEffect(() => {
    danceStoreRef = slice
  }, [slice])

  return selector(slice)
}

useDanceStore.getState = (): DanceStoreSlice => {
  if (danceStoreRef) return danceStoreRef
  const ui = useUiStore.getState()
  const domain = useDomainStore.getState()
  const workspace = domain.workspace ?? loadingPlaceholder
  return buildSlice(
    workspace,
    domain.activityLog,
    {},
    { isLoading: true, error: undefined },
    ui,
    domain,
  )
}

useDanceStore.persist = useUiStore.persist

export { InstantBootstrap } from '@/state/instantBootstrap'
