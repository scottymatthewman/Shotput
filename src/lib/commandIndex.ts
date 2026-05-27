import { features } from '@/config/features'
import { phaseDetailPath } from '@/lib/planRoute'
import type { PlansStoreSlice } from '@/state/plansStore'
import type { Workspace } from '@/types/domain'

const RECENT_KEY = 'dance-command-recent'
const MAX_RECENT = 5

export type CommandItemKind = 'nav' | 'event' | 'task' | 'action'

export interface CommandItem {
  id: string
  kind: CommandItemKind
  label: string
  keywords: string
  to?: string
  shortcut?: string
  action?: () => void
}

export function readRecentCommands(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

export function pushRecentCommand(id: string) {
  const prev = readRecentCommands().filter((x) => x !== id)
  sessionStorage.setItem(RECENT_KEY, JSON.stringify([id, ...prev].slice(0, MAX_RECENT)))
}

export function buildCommandIndex(input: {
  workspace: Workspace
  pathname: string
  selectedPhaseId: string | null
  createPhaseInPlan: (timelineId: string) => string | null
  setTimelineViewMode: (m: 'gantt' | 'table') => void
  timelineViewMode: 'gantt' | 'table'
  toggleSidebarCollapsed: () => void
  resetDemo: () => void
  resolveTimelineId: () => string | null
}): { recent: CommandItem[]; navigation: CommandItem[]; actions: CommandItem[]; index: CommandItem[] } {
  const { workspace } = input
  const navigation: CommandItem[] = [
    ...(features.home
      ? [{ id: 'nav-home', kind: 'nav' as const, label: 'Home', keywords: 'home dashboard', to: '/' }]
      : []),
    ...(features.inbox
      ? [{ id: 'nav-inbox', kind: 'nav' as const, label: 'Inbox', keywords: 'inbox messages', to: '/inbox' }]
      : []),
    { id: 'nav-plans', kind: 'nav', label: 'Plans', keywords: 'plan events projects', to: '/plans' },
    ...(features.reports
      ? [{ id: 'nav-reports', kind: 'nav' as const, label: 'Reports', keywords: 'reports analytics', to: '/reports' }]
      : []),
  ]

  if (features.settings) {
    navigation.push({
      id: 'nav-settings',
      kind: 'nav',
      label: 'Settings',
      keywords: 'settings preferences',
      to: '/settings',
    })
  }

  for (const p of Object.values(workspace.plans)) {
    navigation.push({
      id: `event-${p.id}`,
      kind: 'event',
      label: p.name,
      keywords: `event project ${p.name}`,
      to: `/plans/${p.id}`,
    })
    navigation.push({
      id: `event-overview-${p.id}`,
      kind: 'event',
      label: `${p.name} overview`,
      keywords: `overview ${p.name}`,
      to: `/plans/${p.id}/overview`,
    })
  }

  const index: CommandItem[] = []
  for (const t of Object.values(workspace.phases)) {
    const project = workspace.plans[t.planId]
    index.push({
      id: `task-${t.id}`,
      kind: 'task',
      label: t.title,
      keywords: `task ${t.title} ${project?.name ?? ''} ${t.section}`,
      to: phaseDetailPath(t.planId, t.id),
    })
  }

  const timelineId = input.resolveTimelineId()
  const actions: CommandItem[] = [
    {
      id: 'action-toggle-view',
      kind: 'action',
      label: `Switch to ${input.timelineViewMode === 'gantt' ? 'table' : 'Gantt'} view`,
      keywords: 'view toggle gantt table',
      shortcut: 'V',
      action: () =>
        input.setTimelineViewMode(input.timelineViewMode === 'gantt' ? 'table' : 'gantt'),
    },
    {
      id: 'action-toggle-sidebar',
      kind: 'action',
      label: 'Toggle sidebar',
      keywords: 'sidebar collapse',
      shortcut: '⌘.',
      action: () => input.toggleSidebarCollapsed(),
    },
    {
      id: 'action-reset',
      kind: 'action',
      label: 'Reset demo data',
      keywords: 'reset demo fixtures',
      action: () => input.resetDemo(),
    },
  ]

  if (timelineId) {
    actions.unshift({
      id: 'action-create-task',
      kind: 'action',
      label: 'Add phase on timeline',
      keywords: 'create new phase add phase',
      shortcut: 'C',
      action: () => {
        input.createPhaseInPlan(timelineId)
      },
    })
  }

  if (input.selectedPhaseId) {
    const task = workspace.phases[input.selectedPhaseId]
    if (task) {
      actions.unshift(
        {
          id: 'action-task-status',
          kind: 'action',
          label: `Change status: ${task.title}`,
          keywords: 'status phase detail',
          shortcut: 'S',
          action: undefined,
        },
        {
          id: 'action-task-delete',
          kind: 'action',
          label: `Delete phase: ${task.title}`,
          keywords: 'delete phase',
          shortcut: '⌘⌫',
          action: undefined,
        },
      )
    }
  }

  const recentIds = readRecentCommands()
  const all = [...navigation, ...index, ...actions]
  const recent = recentIds
    .map((id) => all.find((item) => item.id === id))
    .filter((x): x is CommandItem => Boolean(x))

  return { recent, navigation, actions, index }
}

export function phaseTargetId(state: Pick<PlansStoreSlice, 'focusedPhaseId' | 'hoveredPhaseId' | 'selectedPhaseId'>) {
  return state.focusedPhaseId ?? state.hoveredPhaseId ?? state.selectedPhaseId
}

export function orderedPhaseIdsForPlan(workspace: Workspace, planId: string): string[] {
  const plan = workspace.plans[planId]
  return plan?.phaseIds ?? []
}

export function stepPhaseFocus(
  workspace: Workspace,
  planId: string,
  currentId: string | null,
  direction: 1 | -1,
): string | null {
  const ids = orderedPhaseIdsForPlan(workspace, planId)
  if (ids.length === 0) return null
  if (!currentId) return direction === 1 ? ids[0]! : ids[ids.length - 1]!
  const idx = ids.indexOf(currentId)
  if (idx < 0) return ids[0]!
  const next = idx + direction
  if (next < 0 || next >= ids.length) return currentId
  return ids[next]!
}
