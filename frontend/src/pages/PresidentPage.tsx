import { lazy, Suspense } from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import { Arrow } from '../components/ArchiveLayout'
import { DelayedSkeleton, TimelineSkeleton } from '../components/ArchiveSkeletons'
import { PresidentEvents } from '../components/PresidentEvents'
import { PresidencyIndicators } from '../components/PresidencyIndicators'
import { PresidentProfile } from '../components/PresidentProfile'
import { presidentCareers } from '../data/presidentCareers'
import type { loadPresident } from '../data/presidentApi'
import { NotFoundPage } from './NotFoundPage'

const PresidentTimeline = lazy(() => import('../components/PresidentTimeline'))

export function PresidentPage() {
  const archive = useLoaderData<typeof loadPresident>()

  if (!archive) return <NotFoundPage presidentMissing />

  const { person } = archive
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
      <PresidencyIndicators archive={archive} />
      <section className="detail-panel" aria-labelledby="president-timeline-heading">
        <h2 id="president-timeline-heading">흥망성쇠 기록</h2>
        <Suspense fallback={<DelayedSkeleton><TimelineSkeleton /></DelayedSkeleton>}>
          <PresidentTimeline key={person.id} archive={archive} />
        </Suspense>
      </section>
      <PresidentEvents key={person.id} presidentId={person.id} />
    </article>
  )
}
