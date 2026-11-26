import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ArchiveLayout } from './components/ArchiveLayout'
import { EvaluationPage } from './pages/EvaluationPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PresidentPage } from './pages/PresidentPage'

const router = createBrowserRouter([
  {
    Component: ArchiveLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'presidents/:id', Component: PresidentPage },
      {
        path: 'presidents/:id/evaluation-methods',
        HydrateFallback: () => <p role="status">평가 근거를 불러오는 중입니다.</p>,
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
