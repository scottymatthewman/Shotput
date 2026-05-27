import { createInitialWorkspace, initialActivityLog } from '@/mock/fixtures'
import type { ActivityEvent, Workspace } from '@/types/domain'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { restoreWorkspaceSnapshot } from '@/lib/instant/seed'
import { useOptimisticOverlay } from '@/state/optimisticOverlay'

export const STORAGE_KEY = 'dance-ui-v2'
export const LEGACY_STORAGE_KEY = 'dance-ui-v1'

/** Demo “current user” for assignee filters & activity actor (Alex Rivera in fixtures). */
export const CURRENT_USER_ID = 'u1'

const MAX_UNDO_FRAMES = 50

export interface UndoFrame {
  workspace: Workspace
  activityLog: ActivityEvent[]
}

function cloneWorkspace(w: Workspace): Workspace {
  return structuredClone(w)
}

function trimUndoStack(stack: UndoFrame[], frame: UndoFrame): UndoFrame[] {
  const next = [...stack, frame]
  return next.length > MAX_UNDO_FRAMES ? next.slice(next.length - MAX_UNDO_FRAMES) : next
}

export function captureUndoFrame(s: {
  workspace: Workspace
  activityLog: ActivityEvent[]
}): UndoFrame {
  return {
    workspace: cloneWorkspace(s.workspace),
    activityLog: structuredClone(s.activityLog),
  }
}

export type TimelineViewMode = 'gantt' | 'table'

export type PhaseQuickDialogKind = 'priority' | 'assignee' | 'assigneeOwner' | 'delete'

export type ThemeMode = 'light' | 'dark'

export interface UiStore {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
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
  undoStack: UndoFrame[]
  redoStack: UndoFrame[]
  pushUndoFrame: (frame: UndoFrame) => void
  undoLastAction: (current: UndoFrame) => boolean
  redoLastAction: (current: UndoFrame) => boolean
  clearUndoRedo: () => void
  instantSeeded: boolean
  setInstantSeeded: (v: boolean) => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      timelineViewMode: 'gantt',
      setTimelineViewMode: (m) =>
        set({
          timelineViewMode: m,
          pendingGanttStatusMenuPhaseId: null,
          pendingPhasePriorityDropdownPhaseId: null,
        }),
      hoveredPhaseId: null,
      setHoveredPhaseId: (id) => set({ hoveredPhaseId: id }),
      focusedPhaseId: null,
      setFocusedPhaseId: (id) => set({ focusedPhaseId: id }),
      phaseQuickDialog: null,
      setPhaseQuickDialog: (v) => set({ phaseQuickDialog: v }),
      pendingGanttStatusMenuPhaseId: null,
      requestGanttStatusMenuForPhase: (phaseId) =>
        set({ pendingGanttStatusMenuPhaseId: phaseId }),
      clearPendingGanttStatusMenu: () => set({ pendingGanttStatusMenuPhaseId: null }),
      pendingPhasePriorityDropdownPhaseId: null,
      requestPhasePriorityDropdownForPhase: (phaseId) =>
        set({ pendingPhasePriorityDropdownPhaseId: phaseId }),
      clearPendingPhasePriorityDropdown: () =>
        set({ pendingPhasePriorityDropdownPhaseId: null }),
      commandOpen: false,
      setCommandOpen: (v) => set({ commandOpen: v }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebarCollapsed: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      selectedPhaseId: null,
      setSelectedPhaseId: (id) => set({ selectedPhaseId: id }),
      undoStack: [],
      redoStack: [],
      pushUndoFrame: (frame) =>
        set((s) => ({
          undoStack: trimUndoStack(s.undoStack, frame),
          redoStack: [],
        })),
      undoLastAction: (current) => {
        const { undoStack, redoStack } = get()
        if (undoStack.length === 0) return false
        const frame = undoStack[undoStack.length - 1]!
        restoreWorkspaceSnapshot(frame.workspace, frame.activityLog)
        useOptimisticOverlay.getState().clear()
        set({
          undoStack: undoStack.slice(0, -1),
          redoStack: [...redoStack, captureUndoFrame(current)],
        })
        return true
      },
      redoLastAction: (current) => {
        const { redoStack, undoStack } = get()
        if (redoStack.length === 0) return false
        const frame = redoStack[redoStack.length - 1]!
        restoreWorkspaceSnapshot(frame.workspace, frame.activityLog)
        useOptimisticOverlay.getState().clear()
        set({
          redoStack: redoStack.slice(0, -1),
          undoStack: trimUndoStack(undoStack, captureUndoFrame(current)),
        })
        return true
      },
      clearUndoRedo: () => set({ undoStack: [], redoStack: [] }),
      instantSeeded: false,
      setInstantSeeded: (v) => set({ instantSeeded: v }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        timelineViewMode: s.timelineViewMode,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
      version: 3,
    },
  ),
)

export function getDefaultUndoSnapshot(): UndoFrame {
  return {
    workspace: createInitialWorkspace(),
    activityLog: initialActivityLog,
  }
}
