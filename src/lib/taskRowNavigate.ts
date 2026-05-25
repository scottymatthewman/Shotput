/**
 * Nested controls inside a task row/card (menus, switches, secondary links).
 * Container-level navigations — e.g. opening the task sheet — should bail out when the
 * event target sits under `[data-task-row-action]` (closest), so users can invoke the
 * control without triggering the outer row action.
 *
 * TaskStatusDropdown automatically sets this attribute on its trigger via `cloneElement`.
 */
export const TASK_ROW_ACTION_ATTR = 'data-task-row-action' as const

export function taskRowNavigateTargetIgnored(eventTarget: EventTarget | null): boolean {
  return eventTarget instanceof Element && Boolean(eventTarget.closest(`[${TASK_ROW_ACTION_ATTR}]`))
}
