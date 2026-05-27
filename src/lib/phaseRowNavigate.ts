/**
 * Nested controls inside a phase row/card (menus, switches, secondary links).
 * Container-level navigations — e.g. opening the phase detail page — should bail out when the
 * event target sits under `[data-phase-row-action]` (closest), so users can invoke the
 * control without triggering the outer row action.
 *
 * PhaseStatusDropdown automatically sets this attribute on its trigger via `cloneElement`.
 */
export const PHASE_ROW_ACTION_ATTR = 'data-phase-row-action' as const

export function phaseRowNavigateTargetIgnored(eventTarget: EventTarget | null): boolean {
  return eventTarget instanceof Element && Boolean(eventTarget.closest(`[${PHASE_ROW_ACTION_ATTR}]`))
}
