import type { ActivityEvent, ExternalCrmRecord, Phase, Plan, Workspace } from '@/types/domain'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface PlanOverviewPatch {
  name?: string
  description?: string
  location?: string
  start?: string
  end?: string
  status?: Plan['status']
  externalRecord?: ExternalCrmRecord | null
  teamMemberUserIds?: string[]
  budgetCents?: number | null
  budgetCurrency?: string | null
}

export interface DomainStore {
  hydrated: boolean
  workspace: Workspace | null
  activityLog: ActivityEvent[]
  hydrateFromInstant: (workspace: Workspace, activityLog: ActivityEvent[]) => void
  replaceWorkspace: (workspace: Workspace, activityLog: ActivityEvent[]) => void
  patchPhase: (phaseId: string, patch: Partial<Phase>) => void
  addPhaseToPlan: (phase: Phase) => void
  removePhase: (phaseId: string) => void
  patchPlan: (planId: string, patch: PlanOverviewPatch) => void
  reset: () => void
}

export const useDomainStore = create<DomainStore>()(
  immer((set) => ({
    hydrated: false,
    workspace: null,
    activityLog: [],

    hydrateFromInstant: (workspace, activityLog) => {
      set({
        hydrated: true,
        workspace: structuredClone(workspace),
        activityLog: structuredClone(activityLog),
      })
    },

    replaceWorkspace: (workspace, activityLog) => {
      set({
        hydrated: true,
        workspace: structuredClone(workspace),
        activityLog: structuredClone(activityLog),
      })
    },

    addPhaseToPlan: (phase) => {
      set((state) => {
        if (!state.workspace) return
        state.workspace.phases[phase.id] = phase
        const plan = state.workspace.plans[phase.planId]
        if (plan && !plan.phaseIds.includes(phase.id)) {
          plan.phaseIds.push(phase.id)
        }
      })
    },

    patchPhase: (phaseId, patch) => {
      set((state) => {
        const phase = state.workspace?.phases[phaseId]
        if (!phase) return
        Object.assign(phase, patch)
        if ('budgetAllocatedCents' in patch && patch.budgetAllocatedCents == null) {
          delete phase.budgetAllocatedCents
        }
        if ('budgetActualCents' in patch && patch.budgetActualCents == null) {
          delete phase.budgetActualCents
        }
        if ('budgetAllocatedCents' in patch && patch.budgetAllocatedCents === undefined) {
          delete phase.budgetAllocatedCents
        }
        if ('budgetActualCents' in patch && patch.budgetActualCents === undefined) {
          delete phase.budgetActualCents
        }
      })
    },

    removePhase: (phaseId) => {
      set((state) => {
        if (!state.workspace) return
        const phase = state.workspace.phases[phaseId]
        if (!phase) return
        delete state.workspace.phases[phaseId]
        const plan = state.workspace.plans[phase.planId]
        if (plan) {
          plan.phaseIds = plan.phaseIds.filter((id) => id !== phaseId)
        }
      })
    },

    patchPlan: (planId, patch) => {
      set((state) => {
        const plan = state.workspace?.plans[planId]
        if (!plan) return
        Object.assign(plan, patch)
        if ('budgetCents' in patch && patch.budgetCents == null) delete plan.budgetCents
        if ('budgetCurrency' in patch && patch.budgetCurrency == null) delete plan.budgetCurrency
        if ('externalRecord' in patch && patch.externalRecord == null) delete plan.externalRecord
      })
    },

    reset: () => {
      set({ hydrated: false, workspace: null, activityLog: [] })
    },
  })),
)

export function getDomainWorkspace(): Workspace | null {
  return useDomainStore.getState().workspace
}

export function getDomainPhase(phaseId: string): Phase | undefined {
  return useDomainStore.getState().workspace?.phases[phaseId]
}

/** @deprecated Use getDomainPhase */
export const getDomainTask = getDomainPhase
