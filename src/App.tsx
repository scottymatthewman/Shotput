import { NavigationDebugProbe } from '@/components/dev/NavigationDebugProbe'
import { AppBootSkeleton } from '@/components/AppBootSkeleton'
import { AppShell } from '@/layouts/AppShell'
import { Suspense, lazy, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Agentation } from 'agentation'

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const WorkspaceChatPage = lazy(() =>
  import('@/pages/WorkspaceChatPage').then((m) => ({ default: m.WorkspaceChatPage })),
)
const FindIndustryEventsPage = lazy(() =>
  import('@/pages/FindIndustryEventsPage').then((m) => ({ default: m.FindIndustryEventsPage })),
)
const FindIndustryEventDetailPage = lazy(() =>
  import('@/pages/FindIndustryEventDetailPage').then((m) => ({
    default: m.FindIndustryEventDetailPage,
  })),
)
const EventIndexPage = lazy(() =>
  import('@/pages/EventIndexPage').then((m) => ({ default: m.EventIndexPage })),
)
const EventOverviewPage = lazy(() =>
  import('@/pages/EventOverviewPage').then((m) => ({ default: m.EventOverviewPage })),
)
const TimelineWorkspacePage = lazy(() =>
  import('@/pages/TimelineWorkspacePage').then((m) => ({ default: m.TimelineWorkspacePage })),
)
const ReportPlaceholderPage = lazy(() =>
  import('@/pages/ReportPlaceholderPage').then((m) => ({ default: m.ReportPlaceholderPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

function LegacyProjectToPlanRedirect() {
  const { projectId } = useParams<{ projectId: string }>()
  return <Navigate to={`/plan/${projectId}`} replace />
}

function LegacyEventsListRedirect() {
  return <Navigate to="/plan" replace />
}

function LegacyPlanOverviewRedirect() {
  const { eventId } = useParams<{ eventId: string }>()
  return <Navigate to={`/plan/${eventId}/overview`} replace />
}

function LegacyPlanWorkspaceRedirect() {
  const { eventId } = useParams<{ eventId: string }>()
  return <Navigate to={`/plan/${eventId}`} replace />
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AppBootSkeleton />}>{children}</Suspense>
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        {import.meta.env.DEV ? <NavigationDebugProbe /> : null}
        <Routes>
          <Route element={<AppShell />}>
            <Route
              path="/"
              element={
                <LazyPage>
                  <HomePage />
                </LazyPage>
              }
            />
            <Route
              path="/chat"
              element={
                <LazyPage>
                  <WorkspaceChatPage />
                </LazyPage>
              }
            />
            <Route
              path="/find"
              element={
                <LazyPage>
                  <FindIndustryEventsPage />
                </LazyPage>
              }
            />
            <Route
              path="/find/industry-events/:catalogEventId"
              element={
                <LazyPage>
                  <FindIndustryEventDetailPage />
                </LazyPage>
              }
            />
            <Route
              path="/plan"
              element={
                <LazyPage>
                  <EventIndexPage />
                </LazyPage>
              }
            />
            <Route
              path="/plan/:planId/overview"
              element={
                <LazyPage>
                  <EventOverviewPage />
                </LazyPage>
              }
            />
            <Route
              path="/plan/:planId"
              element={
                <LazyPage>
                  <TimelineWorkspacePage />
                </LazyPage>
              }
            />
            <Route
              path="/report"
              element={
                <LazyPage>
                  <ReportPlaceholderPage />
                </LazyPage>
              }
            />

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      {process.env.NODE_ENV === 'development' && (
        <Agentation
          endpoint="http://localhost:4747"
          onSessionCreated={(sessionId) => {
            console.log('Session started:', sessionId)
          }}
        />
      )}
    </>
  )
}
