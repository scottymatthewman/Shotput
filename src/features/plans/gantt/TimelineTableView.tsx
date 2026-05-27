import { AssigneePill } from '@/components/dance/AssigneePill'
import { PriorityIcon } from '@/components/dance/PriorityIcon'
import { PhasePriorityDropdown } from '@/features/plans/PhasePriorityDropdown'
import { PhaseDatePickerField } from '@/features/plans/PhaseDatePickerField'
import { PhaseStatusIcon } from '@/components/dance/StatusBadge'
import { PhaseStatusDropdown } from '@/features/plans/PhaseStatusDropdown'
import {
  shouldSuppressTimelineRowClick,
  phaseStatusMenuLabel,
} from '@/components/dance/phaseStatusMenu'
import {
  comparePhasesDefaultPlanTableOrder,
  PHASE_STATUS_TABLE_SORT_RANK,
} from '@/lib/phaseOrdering'
import { PHASE_PRIORITY_SORT_RANK } from '@/lib/phasePriority'
import { phaseRowNavigateTargetIgnored } from '@/lib/phaseRowNavigate'
import { getEffectivePhaseStatus } from '@/lib/phaseStatus'
import { PAGE_HEADER_LEADING_ALIGN_CLASS } from '@/layouts/pageHeaderStyles'
import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
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

/** Row height — matches body `py-2` + `size-7` (28px) controls (44px total). */
const TABLE_ROW_H = 'h-11'
const tableCellBase = cn('box-border align-middle', TABLE_ROW_H, 'py-0')

const headTh = cn(
  tableCellBase,
  'px-3 text-left text-xs font-medium text-muted-foreground',
)

const bodyTd = tableCellBase

/**
 * Checkbox column uses `PAGE_HEADER_LEADING_ALIGN_CLASS` so control center matches PageHeader back button.
 * Column width locks that padding + checkbox + `pr-2` so `<col>` slack doesn’t grow this cell.
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
const narrowIconControlTh = cn(
  tableCellBase,
  'overflow-hidden px-0.5 text-center text-xs font-medium text-muted-foreground',
)

/** Same control height as body priority/status buttons (`size-7`). */
const TABLE_HEADER_CONTROL_H = 'h-7'

/** Fill `<th>`; label start, sort icon end (priority column uses icon-only, centered). No hover chrome. */
const sortHeaderButtonClass = cn(
  '-mx-1 flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md px-1 text-left outline-none transition-surface duration-150 pressable dance-focus-ring',
  TABLE_HEADER_CONTROL_H,
)

const prioritySortHeaderButtonClass = cn(
  '-mx-0.5 inline-flex w-auto max-w-full shrink-0 cursor-pointer items-center justify-center rounded-md px-0.5 outline-none transition-surface duration-150 pressable dance-focus-ring',
  TABLE_HEADER_CONTROL_H,
)

const timelineCheckboxClass =
  'timeline-phase-checkbox focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50'

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
  const setHoveredPhaseId = usePlansStore((s) => s.setHoveredPhaseId)
  const updatePhaseDetails = usePlansStore((s) => s.updatePhaseDetails)
  const setPhaseQuickDialog = usePlansStore((s) => s.setPhaseQuickDialog)

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
        comparePhasesDefaultPlanTableOrder(a, b, workspace),
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
          const ra = PHASE_STATUS_TABLE_SORT_RANK[getEffectivePhaseStatus(liveA)]
          const rb = PHASE_STATUS_TABLE_SORT_RANK[getEffectivePhaseStatus(liveB)]
          primary = ra - rb
          break
        }
        case 'priority': {
          const ra = PHASE_PRIORITY_SORT_RANK[liveA.priority]
          const rb = PHASE_PRIORITY_SORT_RANK[liveB.priority]
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
          <thead className="sticky top-0 z-[1] bg-surface-2 border-b border-border">
            <tr className="[&_th]:inset-edge-ring [&_th]:inset-edge-ring-b">
              <th
                scope="col"
                className={cn(
                  headTh,
                  'overflow-hidden text-left',
                  PAGE_HEADER_LEADING_ALIGN_CLASS,
                  'pr-2',
                )}
                style={checkboxColStyle}
              >
                <span className="sr-only">Select rows</span>
                <div
                  data-phase-row-action
                  className="flex h-full items-center justify-start"
                  onClick={(e) => e.stopPropagation()}
                >
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
                <div className="flex h-full items-center justify-center">
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
                <div className="flex h-full items-center justify-center">
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
                <span className="flex h-full min-w-0 items-center truncate">Owner</span>
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
              const eff = getEffectivePhaseStatus(live)
              const isChecked = selection.has(task.id)
              const owner = taskPrimaryOwner(workspace, live)
              return (
                <tr
                  key={task.id}
                  data-timeline-task-id={task.id}
                  className={cn(
                    'cursor-pointer transition-surface duration-150 ease-hover hover:bg-muted/40 [&_td]:inset-edge-ring [&_td]:inset-edge-ring-b [&_td]:inset-edge-softer',
                    selectedPhaseId === task.id && 'bg-accent/20',
                    focusedPhaseId === task.id && 'ring-1 ring-inset ring-ring/50',
                  )}
                  onMouseEnter={() => setHoveredPhaseId(task.id)}
                  onMouseLeave={() => setHoveredPhaseId(null)}
                  onClick={(e) => {
                    if (shouldSuppressTimelineRowClick()) return
                    if (phaseRowNavigateTargetIgnored(e.target)) return
                    onSelectPhase(task.id)
                  }}
                >
                  <td
                    className={cn(
                      bodyTd,
                      'overflow-hidden pr-2',
                      PAGE_HEADER_LEADING_ALIGN_CLASS,
                    )}
                    style={checkboxColStyle}
                    data-phase-row-action
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex h-full items-center justify-start">
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
                    className={cn(bodyTd, 'overflow-hidden px-0.5 text-muted-foreground')}
                    style={narrowIconColumnStyle}
                    data-phase-row-action
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex h-full items-center justify-center">
                      <PhasePriorityDropdown
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
                      </PhasePriorityDropdown>
                    </div>
                  </td>
                  <td
                    className={cn(bodyTd, 'overflow-hidden px-0.5 text-muted-foreground')}
                    style={narrowIconColumnStyle}
                    data-phase-row-action
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex h-full items-center justify-center">
                      <PhaseStatusDropdown phaseId={task.id} currentStatus={eff} hotkeyOpensDropdown>
                        <button
                          type="button"
                          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-foreground shadow-none outline-none transition-surface duration-150 ease-hover hover:bg-muted/40 data-[state=open]:bg-muted/40 dance-focus-ring"
                          aria-label={`Status: ${phaseStatusMenuLabel(eff)}. Change status`}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <PhaseStatusIcon status={eff} />
                        </button>
                      </PhaseStatusDropdown>
                    </div>
                  </td>
                  <td className={cn(bodyTd, 'max-w-0 px-3 font-medium text-foreground')}>
                    <span className="block truncate">{live.title}</span>
                  </td>
                  <td
                    className={cn(bodyTd, 'max-w-0 overflow-hidden px-2')}
                    style={ownerColStyle}
                  >
                    <button
                      type="button"
                      data-phase-row-action
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
                    className={cn(bodyTd, 'px-2')}
                    style={dateColStyle}
                    data-phase-row-action
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PhaseDatePickerField
                      value={live.start}
                      ariaLabel={`Start date for ${live.title}`}
                      scrub
                      maxDate={live.end}
                      onChange={(v) => updatePhaseDetails(task.id, { start: v })}
                      onDatePointerSessionStart={beginDateDragRowStabilization}
                      onDatePointerSessionEnd={endDateDragRowStabilization}
                    />
                  </td>
                  <td
                    className={cn(bodyTd, 'px-2')}
                    style={dateColStyle}
                    data-phase-row-action
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PhaseDatePickerField
                      value={live.end}
                      ariaLabel={`End date for ${live.title}`}
                      scrub
                      minDate={live.start}
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
