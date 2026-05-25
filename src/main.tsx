import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import './index.css'
import { AppBootGate } from '@/components/AppBootGate'
import { AppBootSkeleton } from '@/components/AppBootSkeleton'

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
