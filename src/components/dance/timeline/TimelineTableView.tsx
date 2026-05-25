import { AssigneePill } from '@/components/dance/AssigneePill'
import { PriorityIcon } from '@/components/dance/PriorityIcon'
import { TaskPriorityDropdown } from '@/components/dance/TaskPriorityDropdown'
import { TaskDatePickerField } from '@/components/dance/TaskDatePickerField'
import { TaskStatusIcon } from '@/components/dance/StatusBadge'
import { TaskStatusDropdown } from '@/components/dance/TaskStatusDropdown'
import {
  shouldSuppressTimelineRowClick,
  taskStatusMenuLabel,
} from '@/components/dance/taskStatusMenu'
import {
  compareTasksDefaultTimelineTableOrder,
  TASK_STATUS_TABLE_SORT_RANK,
} from '@/lib/taskOrdering'
import { TASK_PRIORITY_SORT_RANK } from '@/lib/taskPriority'
import { taskRowNavigateTargetIgnored } from '@/lib/taskRowNavigate'
import { getEffectiveTaskStatus } from '@/lib/taskStatus'
import { cn } from '@/lib/utils'
import { useDanceStore } from '@/state/store'
import type { Agent, Phase, User, Workspace } from '@/types/domain'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

type TableSortKey = 'priority' | 'task' | 'status' | 'start' | 'end'
type SortDirection = 'asc' | 'desc'

type TableSortState =
  /** Priority urgent→low, then start date ascending and title (table’s baseline order). */
  | { mode: 'default' }
  | { mode: 'column'; key: TableSortKey; dir: SortDirection }

/** Keep row indices stable while live sort keys change (e.g. date scrubbing). */
function applyFrozenRowOrder(liveSorted: Phase[], frozenIds: string[]): Phase[] {
  const byId = new Map(liveSorted.map((t) => [t.id, t]))
  const seen = new Set<string>()
  const out: Phase[] = []
  for (const id of frozenIds) {
    const t = byId.get(id)
    if (t) {
      out.push(t)
      seen.add(id)
    }
  }
  for (const t of liveSorted) {
    if (!seen.has(t.id)) out.push(t)
  }
  return out
}

function taskPrimaryOwner(workspace: Workspace, phase: Phase): { user?: User; agent?: Agent } {
  const uid = phase.assigneeUserIds[0]
  if (uid) {
    const user = workspace.users[uid]
    if (user) return { user }
  }
  const aid = phase.assigneeAgentIds[0]
  if (aid) {
    const agent = workspace.agents[aid]
    if (agent) return { agent }
  }
  return {}
}

const headTh = 'px-3 py-2 text-left text-xs font-medium text-muted-foreground'

/**
 * Checkbox `pl-6` aligns the 16px control center at 16 + 16px (PageHeader px-4 + half of w-8 `pageChrome` back btn).
 * Column width locks `pl-6` + checkbox + `pr-2` so `<col>` slack doesn’t grow this cell.
 *
 * Priority / status: fixed widths; Owner / dates fixed so they don’t scale with viewport %.
 * Task is the only unspecified `<col>` and absorbs leftover width.
 */
const CHECKBOX_COL_PX = 48
/** Priority / status column — ~125% of the prior 32px track for clearer icon hit targets. */
const ICON_CONTROL_COL_PX = 40
const OWNER_COL_PX = 200
const DATE_COL_PX = 100

const checkboxColStyle: CSSProperties = {
  width: CHECKBOX_COL_PX,
  minWidth: CHECKBOX_COL_PX,
  maxWidth: CHECKBOX_COL_PX,
  boxSizing: 'border-box',
}

const narrowIconColumnStyle: CSSProperties = {
  width: ICON_CONTROL_COL_PX,
  minWidth: ICON_CONTROL_COL_PX,
  maxWidth: ICON_CONTROL_COL_PX,
  boxSizing: 'border-box',
}

const ownerColStyle: CSSProperties = {
  width: OWNER_COL_PX,
  minWidth: OWNER_COL_PX,
  maxWidth: OWNER_COL_PX,
  boxSizing: 'border-box',
}

const dateColStyle: CSSProperties = {
  width: DATE_COL_PX,
  minWidth: DATE_COL_PX,
  maxWidth: DATE_COL_PX,
  boxSizing: 'border-box',
}

/** Icon-only columns: keep `<th>` as table-cell; center control with an inner flex (flex on `<th>` stacks/breaks layout). */
const narrowIconControlTh =
  'box-border overflow-hidden px-0.5 py-2 align-middle text-center text-xs font-medium text-muted-foreground'

/** Fill `<th>`; label start, sort icon end (priority column uses icon-only, centered). No hover chrome. */
const sortHeaderButtonClass =
  '-mx-1 flex h-full min-h-8 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-0.5 text-left outline-none transition-surface duration-150 pressable dance-focus-ring'

const prioritySortHeaderButtonClass =
  '-mx-0.5 inline-flex h-full min-h-7 w-auto max-w-full shrink-0 cursor-pointer items-center justify-center rounded-md px-0.5 outline-none transition-surface duration-150 pressable dance-focus-ring'

/** Native checkboxes tuned for the app dark palette (`--color-muted`, `--color-border`, `--color-primary`). */
const timelineCheckboxClass =
  'size-4 shrink-0 cursor-pointer rounded-lg border border-border bg-muted text-primary accent-primary opacity-60 transition-surface duration-150 hover:opacity-100 checked:opacity-100 focus-visible:opacity-100 [&:indeterminate]:opacity-100 [color-scheme:dark] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50'

/** Shown when column sorts reset to `{ mode: 'default' }` (priority baseline). */
const a11yTableDefaultBaseline =
  'restore default baseline (priority: urgent first through low, then start date and title)'
const a11yClickRestoreTableBaseline = `Click to ${a11yTableDefaultBaseline}.`

export function TimelineTableView({
  workspace,
  phases,
  selectedPhaseId,
  focusedPhaseId,
  onSelectPhase,
  onSelectionCountChange,
}: {
  workspace: Workspace
  phases: Phase[]
  selectedPhaseId: string | null
  focusedPhaseId?: string | null
  onSelectPhase: (id: string | null) => void
  /** Report selection size for the workspace footer (e.g. “N selected”). */
  onSelectionCountChange?: (count: number) => void
}) {
  const setHoveredPhaseId = useDanceStore((s) => s.setHoveredPhaseId)
  const updatePhaseDetails = useDanceStore((s) => s.updatePhaseDetails)
  const setPhaseQuickDialog = useDanceStore((s) => s.setPhaseQuickDialog)

  const [selection, setSelection] = useState<Set<string>>(new Set())
  useEffect(() => {
    onSelectionCountChange?.(selection.size)
  }, [selection, onSelectionCountChange])
  const [sort, setSort] = useState<TableSortState>({ mode: 'default' })
  const [dateDragFrozenOrder, setDateDragFrozenOrder] = useState<string[] | null>(null)
  const dateDragDepthRef = useRef(0)

  const sortedTasksLive = useMemo(() => {
    if (sort.mode === 'default') {
      return [...phases].sort((a, b) =>
        compareTasksDefaultTimelineTableOrder(a, b, workspace),
      )
    }

    const resolve = (t: Phase) => workspace.phases[t.id] ?? t

    const tieBreak = (a: Phase, b: Phase) => {
      const byTitle = resolve(a).title.localeCompare(resolve(b).title, undefined, {
        sensitivity: 'base',
      })
      if (byTitle !== 0) return byTitle
      return a.id.localeCompare(b.id)
    }

    const { key: sortKey, dir: sortDir } = sort

    return [...phases].sort((a, b) => {
      const liveA = resolve(a)
      const liveB = resolve(b)
      let primary = 0

      switch (sortKey) {
        case 'task':
          primary = liveA.title.localeCompare(liveB.title, undefined, { sensitivity: 'base' })
          break
        case 'status': {
          const ra = TASK_STATUS_TABLE_SORT_RANK[getEffectiveTaskStatus(liveA)]
          const rb = TASK_STATUS_TABLE_SORT_RANK[getEffectiveTaskStatus(liveB)]
          primary = ra - rb
          break
        }
        case 'priority': {
          const ra = TASK_PRIORITY_SORT_RANK[liveA.priority]
          const rb = TASK_PRIORITY_SORT_RANK[liveB.priority]
          primary = ra - rb
          break
        }
        case 'start':
          primary = liveA.start.localeCompare(liveB.start)
          break
        case 'end':
          primary = liveA.end.localeCompare(liveB.end)
          break
      }

      if (sortDir === 'desc') primary = -primary
      if (primary !== 0) return primary
      return tieBreak(a, b)
    })
  }, [phases, workspace, sort])

  const sortedTasksLiveRef = useRef(sortedTasksLive)
  sortedTasksLiveRef.current = sortedTasksLive

  const sortedTasks = useMemo(() => {
    if (!dateDragFrozenOrder) return sortedTasksLive
    return applyFrozenRowOrder(sortedTasksLive, dateDragFrozenOrder)
  }, [sortedTasksLive, dateDragFrozenOrder])

  const beginDateDragRowStabilization = useCallback(() => {
    if (dateDragDepthRef.current === 0) {
      setDateDragFrozenOrder(sortedTasksLiveRef.current.map((t) => t.id))
    }
    dateDragDepthRef.current += 1
  }, [])

  const endDateDragRowStabilization = useCallback(() => {
    dateDragDepthRef.current = Math.max(0, dateDragDepthRef.current - 1)
    if (dateDragDepthRef.current === 0) {
      setDateDragFrozenOrder(null)
    }
  }, [])

  const toggleSort = useCallback((key: TableSortKey) => {
    setSort((prev) => {
      if (prev.mode === 'default') return { mode: 'column', key, dir: 'asc' }
      if (prev.key !== key) return { mode: 'column', key, dir: 'asc' }
      if (prev.dir === 'asc') return { mode: 'column', key, dir: 'desc' }
      return { mode: 'default' }
    })
  }, [])

  const toggleSelected = useCallback((phaseId: string, value: boolean) => {
    setSelection((prev) => {
      const next = new Set(prev)
      if (value) next.add(phaseId)
      else next.delete(phaseId)
      return next
    })
  }, [])

  const allSelected = sortedTasks.length > 0 && selection.size === sortedTasks.length
  const someSelected = selection.size > 0 && !allSelected

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) setSelection(new Set(sortedTasks.map((t) => t.id)))
      else setSelection(new Set())
    },
    [sortedTasks],
  )

  const selectAllRef = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    const el = selectAllRef.current
    if (el) el.indeterminate = someSelected
  }, [someSelected])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 min-w-0 flex-1 basis-0 overflow-y-auto overflow-x-auto overscroll-y-contain">
        <table className="w-full min-w-[800px] table-fixed border-collapse text-sm">
          <caption className="sr-only">Tasks on this timeline</caption>
          <colgroup>
            <col style={checkboxColStyle} />
            <col style={narrowIconColumnStyle} />
            <col style={narrowIconColumnStyle} />
            <col />
            <col style={ownerColStyle} />
            <col style={dateColStyle} />
            <col style={dateColStyle} />
          </colgroup>
          <thead className="sticky top-0 z-[1] bg-gantt-canvas">
            <tr className="border-b border-border">
              <th
                scope="col"
                className={cn(
                  'box-border overflow-hidden py-2 text-left text-xs font-medium text-muted-foreground',
                  /* Align checkbox center with PageHeader back control: px-4 (16px) + w-8/2 → pl-6 + flush-left control. */
                  'pl-6 pr-2',
                )}
                style={checkboxColStyle}
              >
                <span className="sr-only">Select rows</span>
                <div data-task-row-action className="flex justify-start" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    ref={selectAllRef}
                    checked={allSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    disabled={sortedTasks.length === 0}
                    className={timelineCheckboxClass}
                    aria-label="Select all tasks"
                  />
                </div>
              </th>
              <th scope="col" className={narrowIconControlTh} style={narrowIconColumnStyle}>
                <div className="flex justify-center">
                  <button
                    type="button"
                    title="Priority"
                    className={prioritySortHeaderButtonClass}
                  aria-sort={
                    sort.mode === 'column' && sort.key === 'priority'
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  aria-label={
                    sort.mode === 'column' && sort.key === 'priority'
                      ? sort.dir === 'asc'
                        ? 'Priority sorted urgent first through low. Click for low first through urgent.'
                        : `Priority sorted low first through urgent. ${a11yClickRestoreTableBaseline}`
                      : 'Sort by priority. Click for urgent through low, then reversed, then default order.'
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSort('priority')
                  }}
                >
                  <span className="sr-only">Priority</span>
                  <span className="inline-flex size-4 items-center justify-center text-muted-foreground">
                    {sort.mode === 'column' && sort.key === 'priority' ? (
                      sort.dir === 'asc' ? (
                        <ChevronUp className="size-3.5" aria-hidden />
                      ) : (
                        <ChevronDown className="size-3.5" aria-hidden />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3 opacity-40" aria-hidden />
                    )}
                  </span>
                </button>
                </div>
              </th>
              <th scope="col" className={narrowIconControlTh} style={narrowIconColumnStyle}>
                <div className="flex justify-center">
                  <button
                    type="button"
                    title="Status"
                    className={prioritySortHeaderButtonClass}
                  aria-sort={
                    sort.mode === 'column' && sort.key === 'status'
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  aria-label={
                    sort.mode === 'column' && sort.key === 'status'
                      ? sort.dir === 'asc'
                        ? 'Status sorted Todo through Done. Click for Done through Todo.'
                        : `Status sorted Done through Todo. ${a11yClickRestoreTableBaseline}`
                      : 'Sort by status. Click for Todo through Done, then reversed, then default order.'
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSort('status')
                  }}
                >
                  <span className="sr-only">Status</span>
                  <span className="inline-flex size-4 items-center justify-center text-muted-foreground">
                    {sort.mode === 'column' && sort.key === 'status' ? (
                      sort.dir === 'asc' ? (
                        <ChevronUp className="size-3.5" aria-hidden />
                      ) : (
                        <ChevronDown className="size-3.5" aria-hidden />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3 opacity-40" aria-hidden />
                    )}
                  </span>
                </button>
                </div>
              </th>
              <th scope="col" className={cn(headTh, 'min-w-0')}>
                <button
                  type="button"
                  className={sortHeaderButtonClass}
                  aria-sort={
                    sort.mode === 'column' && sort.key === 'task'
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  aria-label={
                    sort.mode === 'column' && sort.key === 'task'
                      ? sort.dir === 'asc'
                        ? 'Tasks sorted A to Z. Click for Z to A.'
                        : `Tasks sorted Z to A. ${a11yClickRestoreTableBaseline}`
                      : 'Sort by task name. Click for A to Z, then Z to A, then default order.'
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSort('task')
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">Task</span>
                  <span className="inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                    {sort.mode === 'column' && sort.key === 'task' ? (
                      sort.dir === 'asc' ? (
                        <ChevronUp className="size-3.5" aria-hidden />
                      ) : (
                        <ChevronDown className="size-3.5" aria-hidden />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3 opacity-40" aria-hidden />
                    )}
                  </span>
                </button>
              </th>
              <th
                scope="col"
                className={cn(headTh, 'min-w-0 overflow-hidden')}
                style={ownerColStyle}
              >
                <span className="block w-full min-w-0 truncate">Owner</span>
              </th>
              <th
                scope="col"
                className={cn(headTh, 'min-w-0 overflow-hidden whitespace-nowrap px-2')}
                style={dateColStyle}
              >
                <button
                  type="button"
                  className={sortHeaderButtonClass}
                  aria-sort={
                    sort.mode === 'column' && sort.key === 'start'
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  aria-label={
                    sort.mode === 'column' && sort.key === 'start'
                      ? sort.dir === 'asc'
                        ? 'Start date sorted earliest first. Click for latest first.'
                        : `Start date sorted latest first. ${a11yClickRestoreTableBaseline}`
                      : 'Sort by start date. Click for earliest first, then latest first, then default order.'
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSort('start')
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">Start</span>
                  <span className="inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                    {sort.mode === 'column' && sort.key === 'start' ? (
                      sort.dir === 'asc' ? (
                        <ChevronUp className="size-3.5" aria-hidden />
                      ) : (
                        <ChevronDown className="size-3.5" aria-hidden />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3 opacity-40" aria-hidden />
                    )}
                  </span>
                </button>
              </th>
              <th
                scope="col"
                className={cn(headTh, 'min-w-0 overflow-hidden whitespace-nowrap px-2')}
                style={dateColStyle}
              >
                <button
                  type="button"
                  className={sortHeaderButtonClass}
                  aria-sort={
                    sort.mode === 'column' && sort.key === 'end'
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  aria-label={
                    sort.mode === 'column' && sort.key === 'end'
                      ? sort.dir === 'asc'
                        ? 'End date sorted earliest first. Click for latest first.'
                        : `End date sorted latest first. ${a11yClickRestoreTableBaseline}`
                      : 'Sort by end date. Click for earliest first, then latest first, then default order.'
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSort('end')
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">End</span>
                  <span className="inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                    {sort.mode === 'column' && sort.key === 'end' ? (
                      sort.dir === 'asc' ? (
                        <ChevronUp className="size-3.5" aria-hidden />
                      ) : (
                        <ChevronDown className="size-3.5" aria-hidden />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3 opacity-40" aria-hidden />
                    )}
                  </span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => {
              const live = workspace.phases[task.id] ?? task
              const eff = getEffectiveTaskStatus(live)
              const isChecked = selection.has(task.id)
              const owner = taskPrimaryOwner(workspace, live)
              return (
                <tr
                  key={task.id}
                  data-timeline-task-id={task.id}
                  className={cn(
                    'cursor-pointer border-b border-border/60 transition-surface duration-150 ease-hover hover:bg-muted/40',
                    selectedPhaseId === task.id && 'bg-accent/20',
                    focusedPhaseId === task.id && 'ring-1 ring-inset ring-ring/50',
                  )}
                  onMouseEnter={() => setHoveredPhaseId(task.id)}
                  onMouseLeave={() => setHoveredPhaseId(null)}
                  onClick={(e) => {
                    if (shouldSuppressTimelineRowClick()) return
                    if (taskRowNavigateTargetIgnored(e.target)) return
                    onSelectPhase(task.id)
                  }}
                >
                  <td
                    className="box-border overflow-hidden py-2 pl-6 pr-2 align-middle"
                    style={checkboxColStyle}
                    data-task-row-action
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-start">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => toggleSelected(task.id, e.target.checked)}
                        className={timelineCheckboxClass}
                        aria-label={`Select ${task.title}`}
                      />
                    </div>
                  </td>
                  <td
                    className="box-border overflow-hidden px-0.5 py-2 align-middle text-muted-foreground"
                    style={narrowIconColumnStyle}
                    data-task-row-action
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center">
                      <TaskPriorityDropdown
                        phaseId={task.id}
                        currentPriority={live.priority}
                        hotkeyOpensDropdown
                      >
                        <button
                          type="button"
                          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-foreground shadow-none outline-none transition-surface duration-150 ease-hover hover:bg-muted/40 data-[state=open]:bg-muted/40 dance-focus-ring"
                          aria-label={`Priority: ${live.priority}. Change priority`}
                        >
                          <PriorityIcon priority={live.priority} />
                        </button>
                      </TaskPriorityDropdown>
                    </div>
                  </td>
                  <td
                    className="box-border overflow-hidden px-0.5 py-2 align-middle text-muted-foreground"
                    style={narrowIconColumnStyle}
                    data-task-row-action
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center">
                      <TaskStatusDropdown phaseId={task.id} currentStatus={eff} hotkeyOpensDropdown>
                        <button
                          type="button"
                          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-foreground shadow-none outline-none transition-surface duration-150 ease-hover hover:bg-muted/40 data-[state=open]:bg-muted/40 dance-focus-ring"
                          aria-label={`Status: ${taskStatusMenuLabel(eff)}. Change status`}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <TaskStatusIcon status={eff} />
                        </button>
                      </TaskStatusDropdown>
                    </div>
                  </td>
                  <td className="max-w-0 px-3 py-2 font-medium text-foreground">
                    <span className="block truncate">{live.title}</span>
                  </td>
                  <td
                    className="max-w-0 overflow-hidden px-2 py-2 align-middle"
                    style={ownerColStyle}
                  >
                    <button
                      type="button"
                      data-task-row-action
                      className={cn(
                        'min-w-0 w-full max-w-full rounded-md text-left outline-none transition-surface duration-150 pressable dance-focus-ring',
                        'hover:bg-muted/40 focus-visible:bg-muted/30',
                      )}
                      onClick={() =>
                        setPhaseQuickDialog({ kind: 'assigneeOwner', phaseId: task.id })
                      }
                      aria-label={
                        owner.user
                          ? `Owner: ${owner.user.name}. Change owner`
                          : owner.agent
                            ? `Owner: ${owner.agent.name} (AI). Change workspace owner`
                            : `No workspace owner for ${live.title}. Assign owner`
                      }
                    >
                      {owner.user || owner.agent ? (
                        <AssigneePill
                          user={owner.user}
                          agent={owner.agent}
                          className="min-w-0 max-w-full"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">Choose owner…</span>
                      )}
                    </button>
                  </td>
                  <td
                    className="px-2 py-2 align-middle"
                    style={dateColStyle}
                    data-task-row-action
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskDatePickerField
                      value={live.start}
                      ariaLabel={`Start date for ${live.title}`}
                      scrub
                      onChange={(v) => updatePhaseDetails(task.id, { start: v })}
                      onDatePointerSessionStart={beginDateDragRowStabilization}
                      onDatePointerSessionEnd={endDateDragRowStabilization}
                    />
                  </td>
                  <td
                    className="px-2 py-2 align-middle"
                    style={dateColStyle}
                    data-task-row-action
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskDatePickerField
                      value={live.end}
                      ariaLabel={`End date for ${live.title}`}
                      scrub
                      onChange={(v) => updatePhaseDetails(task.id, { end: v })}
                      onDatePointerSessionStart={beginDateDragRowStabilization}
                      onDatePointerSessionEnd={endDateDragRowStabilization}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
