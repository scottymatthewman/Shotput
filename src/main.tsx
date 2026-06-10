import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppBootGate } from '@/components/AppBootGate'
import { AppBootSkeleton } from '@/components/AppBootSkeleton'

// eslint-disable-next-line react-refresh/only-export-components -- entry file, never hot-reloaded
const App = lazy(() => import('./App.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppBootGate>
      <Suspense fallback={<AppBootSkeleton />}>
        <App />
      </Suspense>
    </AppBootGate>
  </StrictMode>,
)
