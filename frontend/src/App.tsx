import { Route, Routes } from 'react-router-dom'
import { ArchiveLayout } from './components/ArchiveLayout'
import { EvaluationPage } from './pages/EvaluationPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PresidentPage } from './pages/PresidentPage'

export default function App() {
  return (
    <Routes>
      <Route element={<ArchiveLayout />}>
        <Route index element={<HomePage />} />
        <Route path="presidents/:id" element={<PresidentPage />} />
        <Route path="evaluation-methods" element={<EvaluationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
