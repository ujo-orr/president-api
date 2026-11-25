import { Link } from 'react-router-dom'
import { Arrow } from '../components/ArchiveLayout'
import { PresidentPortrait } from '../components/PresidentPortrait'
import { formatPresidentialNumbers, formatTermYears, presidents } from '../data/presidents'

export function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-content">
          <h1 id="home-title">대한민국 역대 대통령<span>데이터 아카이브</span></h1>
          <p>재임 기록과 주요 사건으로 대한민국 현대사를 살펴봅니다.</p>
          <Link className="primary-link" to="/#chronology">대통령 연대기 보기 <Arrow direction="down" /></Link>
        </div>
      </section>
      <section className="chronology" id="chronology" aria-labelledby="chronology-title" tabIndex={-1}>
        <div className="chronology-heading">
          <h2 id="chronology-title">대통령 연대기</h2>
          <p>첫 취임 순서</p>
        </div>
        <div className="chronology-scroll" role="region" tabIndex={0} aria-label="취임 순서대로 나열한 대통령 카드">
          <div className="chronology-track">
            <ol className="president-cards">
              {presidents.map((person) => (
                <li key={person.id}>
                  <Link className="president-card" to={`/presidents/${person.id}`} aria-label={`${person.name} 대통령 기록 보기`}>
                    <PresidentPortrait person={person} />
                    <div className="card-text">
                      <h3>{person.name}</h3>
                      <p>({formatPresidentialNumbers(person.presidentialNumbers)})</p>
                      <p className="card-years">{formatTermYears(person)}</p>
                      <Arrow />
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
            <ol className="chronology-years" aria-label="카드 순서에 따른 취임 연도">
              {presidents.map((person) => (
                <li key={person.id}>{person.terms[0].startDate.slice(0, 4)}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  )
}
