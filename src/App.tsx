import { AppBootSkeleton } from '@/components/AppBootSkeleton'
import { AgentationDevTools } from '@/components/dev/AgentationDevTools'
import { AppShell } from '@/layouts/AppShell'
import { Suspense, lazy, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'

const PlanIndexPage = lazy(() =>
  import('@/features/plans/PlanIndexPage').then((m) => ({ default: m.PlanIndexPage })),
)
const PlanOverviewPage = lazy(() =>
  import('@/features/plans/PlanOverviewPage').then((m) => ({ default: m.PlanOverviewPage })),
)
const PlanWorkspacePage = lazy(() =>
  import('@/features/plans/PlanWorkspacePage').then((m) => ({ default: m.PlanWorkspacePage })),
)
const PhaseDetailPage = lazy(() =>
  import('@/features/plans/PhaseDetailPage').then((m) => ({ default: m.PhaseDetailPage })),
)
const SettingsPage = lazy(() =>
  import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

function LegacyProjectToPlanRedirect() {
  const { projectId } = useParams<{ projectId: string }>()
  return <Navigate to={`/plans/${projectId}`} replace />
}

function LegacyEventsListRedirect() {
  return <Navigate to="/plans" replace />
}

function LegacyPlanOverviewRedirect() {
  const { eventId } = useParams<{ eventId: string }>()
  return <Navigate to={`/plans/${eventId}/overview`} replace />
}

function LegacyPlanWorkspaceRedirect() {
  const { eventId } = useParams<{ eventId: string }>()
  return <Navigate to={`/plans/${eventId}`} replace />
}

function LegacyPlanIndexRedirect() {
  return <Navigate to="/plans" replace />
}

function LegacyPlanWorkspaceFromPlanPathRedirect() {
  const { planId } = useParams<{ planId: string }>()
  return <Navigate to={`/plans/${planId}`} replace />
}

function LegacyPlanOverviewFromPlanPathRedirect() {
  const { planId } = useParams<{ planId: string }>()
  return <Navigate to={`/plans/${planId}/overview`} replace />
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AppBootSkeleton />}>{children}</Suspense>
}

export default function App() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/plans" replace />} />
            <Route
              path="/plans"
              element={
                <LazyPage>
                  <PlanIndexPage />
                </LazyPage>
              }
            />
            <Route
              path="/plans/:planId/overview"
              element={
                <LazyPage>
                  <PlanOverviewPage />
                </LazyPage>
              }
            />
            <Route
              path="/plans/:planId/phases/:phaseId"
              element={
                <LazyPage>
                  <PhaseDetailPage />
                </LazyPage>
              }
            />
            <Route
              path="/plans/:planId"
              element={
                <LazyPage>
                  <PlanWorkspacePage />
                </LazyPage>
              }
            />

            <Route path="/plan" element={<LegacyPlanIndexRedirect />} />
            <Route path="/plan/:planId/overview" element={<LegacyPlanOverviewFromPlanPathRedirect />} />
            <Route path="/plan/:planId" element={<LegacyPlanWorkspaceFromPlanPathRedirect />} />

            <Route path="/events" element={<LegacyEventsListRedirect />} />
            <Route path="/events/:eventId/overview" element={<LegacyPlanOverviewRedirect />} />
            <Route path="/events/:eventId" element={<LegacyPlanWorkspaceRedirect />} />
            <Route path="/projects/:projectId" element={<LegacyProjectToPlanRedirect />} />
            <Route
              path="/projects/:projectId/timelines/:timelineId"
              element={<LegacyProjectToPlanRedirect />}
            />
            <Route
              path="/settings"
              element={
                <LazyPage>
                  <SettingsPage />
                </LazyPage>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/plans" replace />} />
        </Routes>
      </BrowserRouter>
      {import.meta.env.DEV ? <AgentationDevTools /> : null}
    </div>
  )
}
