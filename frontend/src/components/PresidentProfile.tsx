import { useViewTransitionState } from 'react-router-dom'
import { formatPresidentialNumbers, formatRepublics, formatTermMonth } from '../data/presidents'
import type { President } from '../types/archive'
import { Arrow } from './ArchiveLayout'
import { PresidentPortrait } from './PresidentPortrait'

export function PresidentProfile({ person }: { person: President }) {
  const quote = person.representativeQuote
  const isTransitioning = useViewTransitionState(`/presidents/${person.id}`)

  return (
    <div className="details-top">
      <section className={isTransitioning ? 'profile transitioning' : 'profile'} aria-labelledby="profile-title">
        <PresidentPortrait key={person.id} person={person} />
        <div className="profile-copy">
          <h1 id="profile-title">{person.name}</h1>
          <p className="profile-number">{formatPresidentialNumbers(person.presidentialNumbers)}</p>
        </div>
      </section>
      <section className="detail-panel profile-facts" aria-label="대통령 재임 정보">
        <dl className="profile-facts-list">
          <div>
            <dt>재임 기간</dt>
            <dd>
              <ul className="profile-terms">
                {person.terms.map((term) => (
                  <li key={term.id}>
                    <time dateTime={term.startDate}>{formatTermMonth(term.startDate)}</time>
                    {' ~ '}
                    <time dateTime={term.endDate}>{formatTermMonth(term.endDate)}</time>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>공화국</dt>
            <dd>{formatRepublics(person.republics)}</dd>
          </div>
        </dl>
        <div className="profile-quote">
          <h2>대표 발언</h2>
          {quote ? (
            <figure>
              <blockquote cite={quote.source.originalUrl}>“{quote.text}”</blockquote>
              <figcaption><a href={quote.source.originalUrl}>{quote.source.title} 발췌 <Arrow /></a></figcaption>
            </figure>
          ) : (
            <p>대표 발언 확인 중</p>
          )}
        </div>
      </section>
    </div>
  )
}
