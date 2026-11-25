import { Link, useParams } from 'react-router-dom'
import { Arrow } from '../components/ArchiveLayout'
import { PresidentPortrait } from '../components/PresidentPortrait'
import { formatPresidentialNumbers, formatTermMonth, presidents } from '../data/presidents'
import { NotFoundPage } from './NotFoundPage'

const categoryNames = ['경제', '대외관계', '노동·사회정책', '안보·국방', '민주주의·법치', '문화 발전']

export function PresidentPage() {
  const { id } = useParams()
  const person = presidents.find((candidate) => candidate.id === id)

  if (!person) return <NotFoundPage presidentMissing />

  return (
    <article className="details inner-page">
      <Link className="back-link" to="/#chronology"><Arrow direction="left" /> 대통령 연대기</Link>
      <div className="details-top">
        <section className="profile" aria-labelledby="profile-title">
          <PresidentPortrait key={person.id} person={person} />
          <div className="profile-copy">
            <h1 id="profile-title">{person.name}</h1>
            <p className="profile-number">({formatPresidentialNumbers(person.presidentialNumbers)})</p>
            <ul className="profile-terms">
              {person.terms.map((term) => (
                <li key={term.id}>{formatTermMonth(term.startDate)}–{formatTermMonth(term.endDate)}</li>
              ))}
            </ul>
            <p className="quote-status">{person.representativeQuote?.text ?? '대표 발언 확인 중'}</p>
          </div>
        </section>
        <section className="detail-panel">
          <h2>재임 기간 타임라인</h2>
          <p>선택한 대통령과 앞뒤 대통령의 재임 기간을 비교하는 영역입니다.</p>
          {person.sources.map((source) => (
            <a key={source.id} href={source.originalUrl}>대통령기록관 약력 <Arrow /></a>
          ))}
        </section>
      </div>
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
      {person.profileImage && (
        <p className="media-credit">
          초상 사진 <a href={person.profileImage.source.originalUrl}>{person.profileImage.source.organization}</a>
          {' · '}<a href={person.profileImage.license.url}>{person.profileImage.license.name}</a>
          {' · 화면 표시 시 흑백 처리 및 크롭'}
        </p>
      )}
    </article>
  )
}
