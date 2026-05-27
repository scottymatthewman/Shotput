import { useEffect, useMemo, useState } from 'react'
import {
  assembleWorkspaceFromInstant,
  workspaceQuery,
} from '@/lib/instant/assembleWorkspace'
import { db, hasInstantConfig } from '@/lib/instant/db'
import { createInitialWorkspace, initialActivityLog } from '@/mock/fixtures'
import type { PlanNavGlyph } from '@/lib/planIconRegistry'
import { useLocalWorkspaceStore } from '@/state/localWorkspaceStore'
import { useUiStore } from '@/state/uiStore'

const HYDRATE_TIMEOUT_MS = 4_000

const fixtureFallback = assembleWorkspaceFromInstant(undefined, undefined)

export function useWorkspaceQuery() {
  const instantSeeded = useUiStore((s) => s.instantSeeded)
  const localWorkspace = useLocalWorkspaceStore((s) => s.workspace)
  const localActivityLog = useLocalWorkspaceStore((s) => s.activityLog)
  const localPlanNavGlyph = useLocalWorkspaceStore((s) => s.planNavGlyph)
  const { isLoading, error, data } = db.useQuery(workspaceQuery)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!instantSeeded) return
    const timer = window.setTimeout(() => setTimedOut(true), HYDRATE_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [instantSeeded])

  return useMemo(() => {
    const assembled = assembleWorkspaceFromInstant(data?.workspaces, data?.activityEvents)

    if (assembled.workspace) {
      return {
        workspace: assembled.workspace,
        activityLog: assembled.activityLog,
        planNavGlyph: assembled.planNavGlyph as Record<string, PlanNavGlyph>,
        isLoading: isLoading && !instantSeeded,
        error: error ?? undefined,
        ready: true,
      }
    }

    if (!hasInstantConfig && instantSeeded) {
      if (!localWorkspace) {
        return {
          workspace: null,
          activityLog: initialActivityLog,
          planNavGlyph: {} as Record<string, PlanNavGlyph>,
          isLoading: true,
          error: undefined,
          ready: false,
        }
      }
      return {
        workspace: localWorkspace,
        activityLog: localActivityLog,
        planNavGlyph: localPlanNavGlyph,
        isLoading: false,
        error: undefined,
        ready: true,
      }
    }

    if (timedOut || error) {
      console.warn('[Dance] Using local fixtures while InstantDB sync catches up')
      return {
        workspace: createInitialWorkspace(),
        activityLog: initialActivityLog,
        planNavGlyph: fixtureFallback.planNavGlyph,
        isLoading: false,
        error: error ?? undefined,
        ready: true,
      }
    }

    return {
      workspace: null,
      activityLog: initialActivityLog,
      planNavGlyph: {} as Record<string, PlanNavGlyph>,
      isLoading: !instantSeeded ? true : isLoading,
      error: error ?? undefined,
      ready: false,
    }
  }, [data, error, instantSeeded, isLoading, timedOut, localWorkspace, localActivityLog, localPlanNavGlyph])
}
