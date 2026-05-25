export {
  useDanceStore,
  InstantBootstrap,
  CURRENT_USER_ID,
  type DanceStoreSlice,
  type TimelineViewMode,
  type PhaseQuickDialogKind,
} from '@/state/useDanceStore'
export { useDomainStore } from '@/state/domainStore'
export {
  useUiStore,
  registerPhaseSheetAnimatedCloseHandler,
  requestPhaseSheetAnimatedClose,
  registerTaskSheetAnimatedCloseHandler,
  requestTaskSheetAnimatedClose,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  captureUndoFrame,
  type UiStore,
} from '@/state/uiStore'
export {
  selectSidebarNav,
  selectPlanBundle,
  selectTimelineBundle,
  selectWorkspaceUsers,
  selectWorkspaceAgents,
} from '@/state/selectors'

/** @deprecated Use DanceStoreSlice from useDanceStore */
export type { DanceStoreSlice as DanceStore } from '@/state/useDanceStore'
