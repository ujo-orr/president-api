import { useSyncExternalStore } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ArchiveLayout } from './components/ArchiveLayout'
import { ArchiveDataError } from './components/ArchiveDataState'
import { DelayedSkeleton, EvidenceSkeleton, PresidentPageSkeleton } from './components/ArchiveSkeletons'
import { loadChronology, loadPresident } from './data/presidentApi'
import { EvaluationPage } from './pages/EvaluationPage'
import { HomeLoading, HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PresidentPage } from './pages/PresidentPage'

const router = createBrowserRouter([
  {
    Component: ArchiveRoute,
    children: [
      {
        index: true,
        loader: loadChronology,
        Component: HomePage,
        HydrateFallback: () => <HomeLoading delayed />,
        ErrorBoundary: ArchiveDataError,
      },
      {
        id: 'president',
        path: 'presidents/:id',
        loader: loadPresident,
        Component: PresidentPage,
        HydrateFallback: () => <DelayedSkeleton><PresidentPageSkeleton /></DelayedSkeleton>,
        ErrorBoundary: ArchiveDataError,
      },
      {
        path: 'presidents/:id/evaluation-methods',
        loader: loadPresident,
        HydrateFallback: () => <DelayedSkeleton><EvidenceSkeleton /></DelayedSkeleton>,
        ErrorBoundary: ArchiveDataError,
        lazy: async () => {
          const { PresidentEvaluationPage } = await import('./pages/PresidentEvaluationPage')
          return { Component: PresidentEvaluationPage }
        },
      },
      { path: 'evaluation-methods', Component: EvaluationPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])

// 화면 전환과 독립적인 라우터 요청 상태 구독
function getPendingLocation() {
  return router.state.navigation.location
}

function ArchiveRoute() {
  const pendingLocation = useSyncExternalStore(router.subscribe, getPendingLocation)
  return <ArchiveLayout pendingLocation={pendingLocation} />
}

export default function App() {
  return <RouterProvider router={router} />
}
