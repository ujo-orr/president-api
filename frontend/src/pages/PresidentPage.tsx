import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Arrow } from '../components/ArchiveLayout'
import { PresidencyIndicators } from '../components/PresidencyIndicators'
import { PresidentProfile } from '../components/PresidentProfile'
import { presidentCareers } from '../data/presidentCareers'
import { presidents } from '../data/presidents'
import { NotFoundPage } from './NotFoundPage'

const PresidentTimeline = lazy(() => import('../components/PresidentTimeline'))

export function PresidentPage() {
  const { id } = useParams()
  const person = presidents.find((candidate) => candidate.id === id)

  if (!person) return <NotFoundPage presidentMissing />

  const careers = presidentCareers[person.id]

  return (
    <article className="details inner-page">
      <Link className="back-link" to="/#chronology" viewTransition={typeof document.startViewTransition === 'function'}>
        <Arrow direction="left" /> 대통령 연대기
      </Link>
      <PresidentProfile person={person} />
      {careers?.length > 0 && (
        <section className="detail-panel details-career" aria-labelledby="president-career-heading">
          <h2 id="president-career-heading">약력</h2>
          <ul className="career-list">
            {careers.map(({ years, title }) => (
              <li key={title}><span>{years}</span>{title}</li>
            ))}
          </ul>
        </section>
      )}
      <PresidencyIndicators presidentId={person.id} />
      <section className="detail-panel" aria-labelledby="president-timeline-heading">
        <h2 id="president-timeline-heading">흥망성쇠 기록</h2>
        <Suspense fallback={<p role="status">재임 기록을 불러오는 중입니다.</p>}>
          <PresidentTimeline key={person.id} presidentName={person.name} />
        </Suspense>
      </section>
    </article>
  )
}
