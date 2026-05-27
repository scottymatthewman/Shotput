import { assembleWorkspaceFromInstant } from '@/lib/instant/assembleWorkspace'
import { hasInstantConfig } from '@/lib/instant/db'
import type { PlanNavGlyph } from '@/lib/planIconRegistry'
import { createInitialWorkspace, initialActivityLog } from '@/mock/fixtures'
import type { ActivityEvent, Workspace } from '@/types/domain'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const LOCAL_WORKSPACE_STORAGE_KEY = 'dance-workspace-v1'

const fixtureFallback = assembleWorkspaceFromInstant(undefined, undefined)

export interface LocalWorkspaceState {
  workspace: Workspace | null
  activityLog: ActivityEvent[]
  planNavGlyph: Record<string, PlanNavGlyph>
  setSnapshot: (snapshot: {
    workspace: Workspace
    activityLog: ActivityEvent[]
    planNavGlyph?: Record<string, PlanNavGlyph>
  }) => void
  resetToFixtures: () => void
  ensureInitialized: () => void
}

export const useLocalWorkspaceStore = create<LocalWorkspaceState>()(
  persist(
    (set, get) => ({
      workspace: null,
      activityLog: initialActivityLog,
      planNavGlyph: fixtureFallback.planNavGlyph,
      setSnapshot: ({ workspace, activityLog, planNavGlyph }) =>
        set({
          workspace,
          activityLog,
          ...(planNavGlyph ? { planNavGlyph } : {}),
        }),
      resetToFixtures: () =>
        set({
          workspace: createInitialWorkspace(),
          activityLog: initialActivityLog,
          planNavGlyph: fixtureFallback.planNavGlyph,
        }),
      ensureInitialized: () => {
        if (!get().workspace) get().resetToFixtures()
      },
    }),
    {
      name: LOCAL_WORKSPACE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)

export function persistLocalWorkspaceIfNeeded(snapshot: {
  workspace: Workspace
  activityLog: ActivityEvent[]
  planNavGlyph: Record<string, PlanNavGlyph>
}) {
  if (!hasInstantConfig) {
    useLocalWorkspaceStore.getState().setSnapshot(snapshot)
  }
}
