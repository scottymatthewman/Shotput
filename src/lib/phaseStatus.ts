import { isAfter, isValid, parseISO, startOfDay } from 'date-fns'
import type { Phase, PhaseStatus, Workspace } from '@/types/domain'

/** Coerce persisted / partial phases so UI maps never see `undefined` or garbage strings. */
export function normalizePhaseStatus(raw: unknown): PhaseStatus {
  if (
    raw === 'todo' ||
    raw === 'in_progress' ||
    raw === 'in_review' ||
    raw === 'blocked' ||
    raw === 'done'
  ) {
    return raw
  }
  return 'todo'
}

export function sanitizeWorkspace(workspace: Workspace): Workspace {
  const next = structuredClone(workspace)
  for (const id of Object.keys(next.phases)) {
    const p = next.phases[id]
    if (!p) {
      delete next.phases[id]
      continue
    }
    p.status = normalizePhaseStatus(p.status)
    if (p.statusIsManual !== undefined && typeof p.statusIsManual !== 'boolean') {
      delete p.statusIsManual
    }
  }
  return next
}

/** `undefined` / `true` = user-controlled status (incl. all persisted phases before this flag existed). */
export function isPhaseStatusManual(phase: Phase): boolean {
  return phase.statusIsManual !== false
}

/**
 * Schedule-aware status for incomplete work when `statusIsManual` is false: missed (`blocked`) after
 * the phase end date, otherwise todo. In progress, in review, and done are never inferred — only set by the user.
 */
export function getEffectivePhaseStatus(phase: Phase, now: Date = new Date()): PhaseStatus {
  const stored = normalizePhaseStatus(phase.status)
  if (stored === 'done' || stored === 'in_progress' || stored === 'in_review') {
    return stored
  }
  if (isPhaseStatusManual(phase)) {
    return stored
  }
  const endDay = startOfDay(parseISO(`${phase.end}T12:00:00`))
  const today = startOfDay(now)
  if (!isValid(endDay) || !isValid(today)) {
    return stored
  }
  if (isAfter(today, endDay)) {
    return 'blocked'
  }
  return 'todo'
}

/** @deprecated Use normalizePhaseStatus */
export const normalizeTaskStatus = normalizePhaseStatus

/** @deprecated Use getEffectivePhaseStatus */
export const getEffectiveTaskStatus = getEffectivePhaseStatus

/** @deprecated Use isPhaseStatusManual */
export const isTaskStatusManual = isPhaseStatusManual
