import { Link, useParams } from 'react-router-dom'
import { Arrow } from '../components/ArchiveLayout'
import { PresidentProfile } from '../components/PresidentProfile'
import { presidentCareers } from '../data/presidentCareers'
import { presidents } from '../data/presidents'
import { NotFoundPage } from './NotFoundPage'

const categoryNames = ['경제', '대외관계', '노동·사회정책', '안보·국방', '민주주의·법치', '문화 발전']

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
      <div className="details-middle">
        <section className="detail-panel">
          <h2>영역별 평가</h2>
          <ul className="category-list">{categoryNames.map((name) => <li key={name}>{name}</li>)}</ul>
        </section>
        <section className="detail-panel">
          <h2>평가 근거</h2>
          <p>평가 항목별 정책·사건과 원문 출처를 준비하고 있습니다.</p>
          <Link to="/evaluation-methods">평가 기준 및 출처 <Arrow /></Link>
        </section>
      </div>
      <section className="detail-panel">
        <h2>흥망성쇠 기록</h2>
        <p>재임 중 주요 사건을 시간순으로 살펴볼 수 있는 영역입니다.</p>
      </section>
    </article>
  )
}
