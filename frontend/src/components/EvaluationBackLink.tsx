import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Arrow } from './ArchiveLayout'

export function EvaluationBackLink({ fallback = '/#chronology' }: { fallback?: string }) {
  const { state } = useLocation()
  const navigate = useNavigate()

  return (
    <Link className="back-link" to={fallback} onClick={(event) => {
      if (!state?.fromArchive || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      void navigate(-1)
    }}>
      <Arrow direction="left" /> 뒤로가기
    </Link>
  )
}
