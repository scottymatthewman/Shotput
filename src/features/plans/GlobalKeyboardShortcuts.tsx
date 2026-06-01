import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  stepPhaseFocus,
  phaseTargetId,
} from '@/lib/commandIndex'
import { phaseDetailPath, resolvePhaseDetailRoute, resolvePlanWorkspaceRoute } from '@/lib/planRoute'
import type { TimelineViewMode } from '@/state/store'
import type { Workspace } from '@/types/domain'
import { usePlansStore } from '@/state/store'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.isContentEditable) return true
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (el.closest('[cmdk-input-wrapper]')) return true
  if (el.closest('[role="combobox"]')) return true
  return false
}

function parseTimelinePath(
  pathname: string,
  workspace: Workspace,
): { planId: string } | null {
  return resolvePlanWorkspaceRoute(pathname, workspace)
}

function taskIdUnderGanttPointer(
  clientX: number,
  clientY: number,
  pathname: string,
  workspace: Workspace,
): string | null {
  const route = parseTimelinePath(pathname, workspace)
  if (!route || clientX < 0 || clientY < 0) return null
  const stack = document.elementsFromPoint(clientX, clientY)
  for (const node of stack) {
    if (!(node instanceof HTMLElement)) continue
    const row = node.closest('[data-gantt-task-hover]')
    if (!(row instanceof HTMLElement)) continue
    const id = row.dataset.ganttTaskHover
    if (!id) continue
    const task = workspace.phases[id]
    if (!task || task.planId !== route.planId) continue
    return id
  }
  return null
}

function taskIdUnderTablePointer(
  clientX: number,
  clientY: number,
  pathname: string,
  workspace: Workspace,
): string | null {
  const route = parseTimelinePath(pathname, workspace)
  if (!route || clientX < 0 || clientY < 0) return null
  const stack = document.elementsFromPoint(clientX, clientY)
  for (const node of stack) {
    if (!(node instanceof HTMLElement)) continue
    const row = node.closest('tr[data-timeline-task-id]')
    if (!(row instanceof HTMLElement)) continue
    const id = row.dataset.timelineTaskId
    if (!id) continue
    const task = workspace.phases[id]
    if (!task || task.planId !== route.planId) continue
    return id
  }
  return null
}

const VIEW_CYCLE: TimelineViewMode[] = ['gantt', 'table']

function cycleTimelineView(current: TimelineViewMode): TimelineViewMode {
  const i = VIEW_CYCLE.indexOf(current)
  const idx = i < 0 ? 0 : (i + 1) % VIEW_CYCLE.length
  return VIEW_CYCLE[idx]
}

function preventDialogInitialFocus(e: Event) {
  e.preventDefault()
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    } catch {
      /* ignore */
    }
  }
}

function phaseDeepLink(phaseId: string, planId: string) {
  const base = window.location.origin
  return `${base}${phaseDetailPath(planId, phaseId)}`
}

export function GlobalKeyboardShortcuts() {
  const location = useLocation()
  const navigate = useNavigate()
  const [helpOpen, setHelpOpen] = useState(false)
  const lastPointerRef = useRef({ x: -1, y: -1 })

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointermove', syncPointer, { passive: true })
    window.addEventListener('pointerdown', syncPointer, { passive: true })
    return () => {
      window.removeEventListener('pointermove', syncPointer)
      window.removeEventListener('pointerdown', syncPointer)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target
      const typing = isTypingTarget(target)
      const state = usePlansStore.getState()

      if (e.key === 'Escape') {
        if (state.commandOpen) {
          state.setCommandOpen(false)
          e.preventDefault()
          return
        }
        if (state.phaseQuickDialog) {
          state.setPhaseQuickDialog(null)
          e.preventDefault()
          return
        }
        if (state.phaseModal) {
          state.closePhaseModal()
          e.preventDefault()
          return
        }
        const phaseRoute = resolvePhaseDetailRoute(location.pathname, state.workspace)
        if (phaseRoute) {
          navigate(`/plans/${phaseRoute.planId}`)
          e.preventDefault()
          return
        }
        if (state.selectedPhaseId) {
          state.setSelectedPhaseId(null)
          e.preventDefault()
          return
        }
        const overviewPlanId = location.pathname.match(/^\/plans\/([^/]+)\/overview\/?$/)?.[1]
        if (
          overviewPlanId &&
          !typing &&
          !helpOpen &&
          !document.querySelector('[role="dialog"][data-state="open"]')
        ) {
          navigate(`/plans/${overviewPlanId}`)
          e.preventDefault()
          return
        }
        return
      }

      if (
        e.key === '/' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !typing
      ) {
        e.preventDefault()
        state.setCommandOpen(!state.commandOpen)
        return
      }

      if (!typing && !state.commandOpen) {
        const k = e.key
        if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (k === 'z' || k === 'Z')) {
          if (state.undoLastAction()) e.preventDefault()
          return
        }
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && (k === 'z' || k === 'Z')) {
          if (state.redoLastAction()) e.preventDefault()
          return
        }
      }

      const {
        commandOpen,
        timelineViewMode,
        setTimelineViewMode,
        phaseQuickDialog,
        setFocusedPhaseId,
      } = state

      if (helpOpen) {
        if (
          (e.metaKey || e.ctrlKey) &&
          e.shiftKey &&
          (e.key === 'c' || e.key === 'C') &&
          !typing
        ) {
          e.preventDefault()
          void copyText(window.location.href)
        }
        return
      }

      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (typing) return
        e.preventDefault()
        setHelpOpen(true)
        return
      }

      const timelineRoute = parseTimelinePath(location.pathname, state.workspace)

      if (
        (e.key === 'v' || e.key === 'V') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        timelineRoute &&
        !typing
      ) {
        e.preventDefault()
        setTimelineViewMode(cycleTimelineView(timelineViewMode))
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        if (typing) return
        e.preventDefault()
        const targetId = phaseTargetId(state)
        if (targetId) {
          const task = state.workspace.phases[targetId]
          if (task) void copyText(phaseDeepLink(task.id, task.planId))
          else void copyText(window.location.href)
        } else {
          void copyText(window.location.href)
        }
        return
      }

      if (timelineRoute && !typing && !commandOpen) {
        if ((e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') && !e.metaKey) {
          e.preventDefault()
          const next = stepPhaseFocus(
            state.workspace,
            timelineRoute.planId,
            state.focusedPhaseId,
            1,
          )
          if (next) setFocusedPhaseId(next)
          return
        }
        if ((e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') && !e.metaKey) {
          e.preventDefault()
          const next = stepPhaseFocus(
            state.workspace,
            timelineRoute.planId,
            state.focusedPhaseId,
            -1,
          )
          if (next) setFocusedPhaseId(next)
          return
        }
        if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
          const focusId = state.focusedPhaseId ?? state.hoveredPhaseId
          if (focusId) {
            e.preventDefault()
            state.setSelectedPhaseId(focusId)
            navigate(phaseDetailPath(timelineRoute.planId, focusId))
          }
          return
        }
        if ((e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault()
          state.openNewPhaseModal(timelineRoute.planId)
          return
        }
      }

      if (!timelineRoute || typing || commandOpen) {
        return
      }

      const ptr = lastPointerRef.current
      let phaseId: string | null = phaseTargetId(state)
      if (!phaseId && ptr.x >= 0 && ptr.y >= 0) {
        phaseId =
          state.timelineViewMode === 'table'
            ? taskIdUnderTablePointer(ptr.x, ptr.y, location.pathname, state.workspace)
            : taskIdUnderGanttPointer(ptr.x, ptr.y, location.pathname, state.workspace)
      }

      if (!phaseId) return

      const task = state.workspace.phases[phaseId]
      if (!task || task.planId !== timelineRoute.planId) return

      if ((e.metaKey || e.ctrlKey) && e.key === 'Backspace') {
        if (e.repeat) return
        if (phaseQuickDialog) return
        e.preventDefault()
        state.setPhaseQuickDialog({ kind: 'delete', phaseId })
        return
      }

      if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        state.requestGanttStatusMenuForPhase(phaseId)
        return
      }

      if ((e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        if (state.timelineViewMode === 'table') {
          state.requestPhasePriorityDropdownForPhase(phaseId)
        } else {
          state.setPhaseQuickDialog({ kind: 'priority', phaseId })
        }
        return
      }

      if ((e.key === 'a' || e.key === 'A') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        state.setPhaseQuickDialog({ kind: 'assignee', phaseId })
        return
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [helpOpen, location.pathname, navigate])

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent
        data-shortcuts-help-dialog=""
        className="max-h-[min(520px,85vh)] overflow-y-auto sm:max-w-lg"
        aria-describedby="shortcuts-help-desc"
        onOpenAutoFocus={preventDialogInitialFocus}
      >
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription id="shortcuts-help-desc">
            Use Ctrl on Windows/Linux wherever ⌘ appears. Hover or focus a task row for S, P, A,
            and ⌘⌫. Esc closes the command menu, quick dialogs, then returns from phase detail.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <ShortcutSection title="General">
            <ShortcutRow keys={['/']} description="Open command menu" />
            <ShortcutRow keys={['?']} description="Show this help" />
            <ShortcutRow keys={['⌘', 'Z']} description="Undo" />
            <ShortcutRow keys={['⌘', '⇧', 'Z']} description="Redo" />
            <ShortcutRow keys={['Esc']} description="Close menu, dialog, or leave phase detail / overview" />
            <ShortcutRow keys={['⌘', '.']} description="Toggle sidebar / leave phase detail" />
            <ShortcutRow keys={['⌘', '/']} description="Toggle agent chat" />
            <ShortcutRow keys={['⌘', '⇧', 'C']} description="Copy task link or page URL" />
          </ShortcutSection>
          <ShortcutSection title="Timeline workspace">
            <ShortcutRow keys={['J', 'K']} description="Move focus between tasks" />
            <ShortcutRow keys={['Enter']} description="Open focused task" />
            <ShortcutRow keys={['C']} description="Create task on timeline" />
            <ShortcutRow keys={['V']} description="Cycle view: Timeline ↔ Table" />
            <ShortcutRow keys={['S']} description="Change status (1–5 in menu)" />
            <ShortcutRow keys={['P']} description="Change priority (1–4 in menu)" />
            <ShortcutRow keys={['A']} description="Add assignees" />
            <ShortcutRow keys={['⌘', '⌫']} description="Delete task" />
          </ShortcutSection>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShortcutSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <li className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{description}</span>
      <span className="flex shrink-0 flex-wrap justify-end gap-1">
        {keys.map((k, i) => (
          <kbd
            key={`${description}-${i}`}
            className="rounded inset-edge-ring inset-edge-ring-full bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground"
          >
            {k}
          </kbd>
        ))}
      </span>
    </li>
  )
}
