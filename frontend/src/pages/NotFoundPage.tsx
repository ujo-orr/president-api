import { Link } from 'react-router-dom'
import { Arrow } from '../components/ArchiveLayout'

export function NotFoundPage({ presidentMissing = false }: { presidentMissing?: boolean }) {
  return (
    <section className="inner-page not-found" aria-labelledby="not-found-title">
      <p className="error-code">404</p>
      <h1 id="not-found-title">{presidentMissing ? '대통령 기록을 찾을 수 없습니다' : '페이지를 찾을 수 없습니다'}</h1>
      <p>대통령 연대기에서 현재 공개된 기록을 확인하실 수 있습니다.</p>
      <Link className="primary-link" to="/#chronology">대통령 연대기 보기 <Arrow /></Link>
    </section>
  )
}
