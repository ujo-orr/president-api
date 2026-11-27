import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ArchiveLayout } from './components/ArchiveLayout'
import { ArchiveDataError, ArchiveLoading } from './components/ArchiveDataState'
import { loadChronology, loadPresident } from './data/presidentApi'
import { EvaluationPage } from './pages/EvaluationPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PresidentPage } from './pages/PresidentPage'

const router = createBrowserRouter([
  {
    Component: ArchiveLayout,
    children: [
      {
        index: true,
        loader: loadChronology,
        Component: HomePage,
        HydrateFallback: ArchiveLoading,
        ErrorBoundary: ArchiveDataError,
      },
      {
        id: 'president',
        path: 'presidents/:id',
        loader: loadPresident,
        Component: PresidentPage,
        HydrateFallback: ArchiveLoading,
        ErrorBoundary: ArchiveDataError,
      },
      {
        path: 'presidents/:id/evaluation-methods',
        loader: loadPresident,
        HydrateFallback: ArchiveLoading,
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

export default function App() {
  return <RouterProvider router={router} />
}
