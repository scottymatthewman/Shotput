import type { Phase, Plan, PlanOverviewPatch, Workspace } from '@/types/domain'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type { PlanOverviewPatch }

export interface AddedPlanBundle {
  plan: Plan
  phases: Phase[]
  addedAt: number
}

export interface OptimisticOverlayState {
  phasePatches: Record<string, Partial<Phase>>
  planPatches: Record<string, PlanOverviewPatch>
  removedPhaseIds: string[]
  removedPlanIds: string[]
  addedPhases: Record<string, Phase>
  addedPlans: Record<string, AddedPlanBundle>
  patchPhase: (phaseId: string, patch: Partial<Phase>) => void
  addPhaseToPlan: (phase: Phase) => void
  addPlanWithPhases: (plan: Plan, phases: Phase[]) => void
  removePhase: (phaseId: string) => void
  removePlan: (planId: string, phaseIds: string[]) => void
  patchPlan: (planId: string, patch: PlanOverviewPatch) => void
  clear: () => void
  pruneAgainst: (workspace: Workspace) => void
}

type OverlaySlice = Pick<
  OptimisticOverlayState,
  | 'phasePatches'
  | 'planPatches'
  | 'removedPhaseIds'
  | 'removedPlanIds'
  | 'addedPhases'
  | 'addedPlans'
>

function phasePatchSatisfied(phase: Phase, patch: Partial<Phase>): boolean {
  for (const [key, value] of Object.entries(patch)) {
    const current = phase[key as keyof Phase]
    if (JSON.stringify(current) !== JSON.stringify(value)) return false
  }
  return true
}

function planPatchSatisfied(plan: Plan, patch: PlanOverviewPatch): boolean {
  for (const [key, value] of Object.entries(patch)) {
    const current = plan[key as keyof Plan]
    if (JSON.stringify(current) !== JSON.stringify(value)) return false
  }
  return true
}

function applyPhasePatch(phase: Phase, patch: Partial<Phase>): Phase {
  const next = { ...phase, ...patch }
  if ('budgetAllocatedCents' in patch && patch.budgetAllocatedCents == null) {
    delete next.budgetAllocatedCents
  }
  if ('budgetActualCents' in patch && patch.budgetActualCents == null) {
    delete next.budgetActualCents
  }
  return next
}

export const useOptimisticOverlay = create<OptimisticOverlayState>()(
  immer((set) => ({
    phasePatches: {},
    planPatches: {},
    removedPhaseIds: [],
    removedPlanIds: [],
    addedPhases: {},
    addedPlans: {},

    patchPhase: (phaseId, patch) => {
      set((state) => {
        state.phasePatches[phaseId] = { ...state.phasePatches[phaseId], ...patch }
        if ('budgetAllocatedCents' in patch && patch.budgetAllocatedCents == null) {
          delete state.phasePatches[phaseId]!.budgetAllocatedCents
        }
        if ('budgetActualCents' in patch && patch.budgetActualCents == null) {
          delete state.phasePatches[phaseId]!.budgetActualCents
        }
      })
    },

    addPhaseToPlan: (phase) => {
      set((state) => {
        state.addedPhases[phase.id] = phase
        state.removedPhaseIds = state.removedPhaseIds.filter((id) => id !== phase.id)
        delete state.phasePatches[phase.id]
      })
    },

    addPlanWithPhases: (plan, phases) => {
      set((state) => {
        state.addedPlans[plan.id] = { plan, phases, addedAt: Date.now() }
        for (const phase of phases) {
          state.addedPhases[phase.id] = phase
          delete state.phasePatches[phase.id]
        }
      })
    },

    removePhase: (phaseId) => {
      set((state) => {
        if (!state.removedPhaseIds.includes(phaseId)) {
          state.removedPhaseIds.push(phaseId)
        }
        delete state.addedPhases[phaseId]
        delete state.phasePatches[phaseId]
      })
    },

    removePlan: (planId, phaseIds) => {
      set((state) => {
        if (!state.removedPlanIds.includes(planId)) {
          state.removedPlanIds.push(planId)
        }
        delete state.addedPlans[planId]
        delete state.planPatches[planId]
        for (const phaseId of phaseIds) {
          if (!state.removedPhaseIds.includes(phaseId)) {
            state.removedPhaseIds.push(phaseId)
          }
          delete state.addedPhases[phaseId]
          delete state.phasePatches[phaseId]
        }
      })
    },

    patchPlan: (planId, patch) => {
      set((state) => {
        state.planPatches[planId] = { ...state.planPatches[planId], ...patch }
      })
    },

    clear: () => {
      set({
        phasePatches: {},
        planPatches: {},
        removedPhaseIds: [],
        removedPlanIds: [],
        addedPhases: {},
        addedPlans: {},
      })
    },

    pruneAgainst: (workspace) => {
      set((state) => {
        for (const id of [...state.removedPhaseIds]) {
          if (!workspace.phases[id]) {
            state.removedPhaseIds = state.removedPhaseIds.filter((x) => x !== id)
          }
        }

        for (const planId of [...state.removedPlanIds]) {
          if (!workspace.plans[planId]) {
            state.removedPlanIds = state.removedPlanIds.filter((x) => x !== planId)
          }
        }

        for (const id of Object.keys(state.addedPhases)) {
          if (workspace.phases[id]) {
            delete state.addedPhases[id]
          }
        }

        const now = Date.now()
        for (const planId of Object.keys(state.addedPlans)) {
          const bundle = state.addedPlans[planId]
          if (!bundle) continue
          // Keep optimistic plan visible until Instant has echoed it for a beat.
          if (workspace.plans[planId] && now - bundle.addedAt > 2_000) {
            delete state.addedPlans[planId]
          }
        }

        for (const [id, patch] of Object.entries({ ...state.phasePatches })) {
          const phase = workspace.phases[id]
          if (phase && phasePatchSatisfied(phase, patch)) {
            delete state.phasePatches[id]
          }
        }

        for (const [planId, patch] of Object.entries({ ...state.planPatches })) {
          const plan = workspace.plans[planId]
          if (plan && planPatchSatisfied(plan, patch)) {
            delete state.planPatches[planId]
          }
        }
      })
    },
  })),
)

function applyRemovedPlans(merged: Workspace, removedPlanIds: string[]) {
  for (const planId of removedPlanIds) {
    const plan = merged.plans[planId]
    if (!plan) continue
    for (const phaseId of plan.phaseIds) {
      delete merged.phases[phaseId]
    }
    delete merged.plans[planId]
  }
  for (const [phaseId, phase] of Object.entries(merged.phases)) {
    if (removedPlanIds.includes(phase.planId)) {
      delete merged.phases[phaseId]
    }
  }
}

export function mergeWorkspaceWithOverlay(
  workspace: Workspace,
  overlay: OverlaySlice,
): Workspace {
  const merged = structuredClone(workspace)

  for (const { plan, phases } of Object.values(overlay.addedPlans)) {
    if (overlay.removedPlanIds.includes(plan.id)) continue
    const planPatch = overlay.planPatches[plan.id]
    const mergedPlan: Plan = { ...plan }
    if (planPatch) {
      const patch = { ...planPatch }
      if ('externalRecord' in patch && patch.externalRecord === null) delete patch.externalRecord
      if ('budgetCents' in patch && patch.budgetCents == null) delete patch.budgetCents
      if ('budgetCurrency' in patch && patch.budgetCurrency == null) delete patch.budgetCurrency
      Object.assign(mergedPlan, patch)
    }
    merged.plans[plan.id] = mergedPlan
    for (const phase of phases) {
      const patch = overlay.phasePatches[phase.id]
      merged.phases[phase.id] = patch ? applyPhasePatch(phase, patch) : phase
    }
    const phaseIds = phases.map((p) => p.id)
    merged.plans[plan.id]!.phaseIds = [
      ...new Set([...merged.plans[plan.id]!.phaseIds, ...phaseIds]),
    ]
  }

  for (const [id, patch] of Object.entries(overlay.phasePatches)) {
    const phase = merged.phases[id]
    if (phase) {
      merged.phases[id] = applyPhasePatch(phase, patch)
    }
  }

  for (const id of overlay.removedPhaseIds) {
    const phase = merged.phases[id]
    if (!phase) continue
    delete merged.phases[id]
    const plan = merged.plans[phase.planId]
    if (plan) {
      plan.phaseIds = plan.phaseIds.filter((pid) => pid !== id)
    }
  }

  for (const phase of Object.values(overlay.addedPhases)) {
    if (overlay.removedPlanIds.includes(phase.planId)) continue
    const patch = overlay.phasePatches[phase.id]
    merged.phases[phase.id] = patch ? applyPhasePatch(phase, patch) : phase
    const plan = merged.plans[phase.planId]
    if (plan && !plan.phaseIds.includes(phase.id)) {
      plan.phaseIds.push(phase.id)
    }
  }

  for (const [planId, patch] of Object.entries(overlay.planPatches)) {
    if (overlay.removedPlanIds.includes(planId)) continue
    const plan = merged.plans[planId]
    if (!plan) continue
    Object.assign(plan, patch)
    if ('budgetCents' in patch && patch.budgetCents == null) delete plan.budgetCents
    if ('budgetCurrency' in patch && patch.budgetCurrency == null) delete plan.budgetCurrency
    if ('externalRecord' in patch && patch.externalRecord == null) delete plan.externalRecord
  }

  applyRemovedPlans(merged, overlay.removedPlanIds)

  return merged
}

export function getOverlayPhase(
  workspace: Workspace,
  overlay: OverlaySlice,
  phaseId: string,
): Phase | undefined {
  if (overlay.removedPhaseIds.includes(phaseId)) return undefined
  const added = overlay.addedPhases[phaseId]
  if (added) {
    const patch = overlay.phasePatches[phaseId]
    return patch ? applyPhasePatch(added, patch) : added
  }
  const base = workspace.phases[phaseId]
  if (!base) return undefined
  if (overlay.removedPlanIds.includes(base.planId)) return undefined
  const patch = overlay.phasePatches[phaseId]
  return patch ? applyPhasePatch(base, patch) : base
}
