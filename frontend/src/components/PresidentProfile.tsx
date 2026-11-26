import { useViewTransitionState } from 'react-router-dom'
import { presidentParties } from '../data/partyAffiliations'
import { formatPresidentialNumbers, formatRepublics, formatTermMonth } from '../data/presidents'
import type { President, PresidentialTerm } from '../types/archive'
import { PresidentPortrait } from './PresidentPortrait'

function formatTermEndReason(reason: NonNullable<PresidentialTerm['endReason']>) {
  switch (reason.kind) {
    case 'impeachment': return '탄핵'
    case 'death': return `사망(${reason.cause})`
    case 'resignation': return `${reason.label}(${reason.context})`
  }
}

export function PresidentProfile({ person }: { person: President }) {
  const quote = person.representativeQuote
  const affiliations = presidentParties[person.id]
  const startEvents = person.terms.flatMap((term) => term.startContext?.events ?? [])
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
                    {term.endReason && (
                      <>
                        {' '}
                        <strong className="term-end-reason">{formatTermEndReason(term.endReason)}</strong>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>공화국</dt>
            <dd>{formatRepublics(person.republics)}</dd>
          </div>
          {startEvents.length > 0 && (
            <div className="profile-start-context">
              <dt>취임 배경</dt>
              <dd className="term-start-context">{startEvents.join(', ')}</dd>
            </div>
          )}
          <div className="profile-parties">
            <dt>소속 정당</dt>
            <dd>
              {affiliations?.length ? (
                <ol className="profile-party-list">
                  {affiliations.map(({ group, sourceUrl, since, context }) => (
                    <li key={sourceUrl}>
                      <strong>
                        {group.icon && <img src={'/images/parties/' + group.icon} alt="" width="22" height="22" />}
                        {group.name}
                      </strong>
                      {since && <span><time dateTime={since}>{formatTermMonth(since)}</time>부터</span>}
                      {context && <span>{context}</span>}
                    </li>
                  ))}
                </ol>
              ) : '확인 중'}
            </dd>
          </div>
        </dl>
        <div className="profile-quote">
          <h2>대표 발언</h2>
          {quote ? (
            <blockquote cite={quote.source.originalUrl}>“{quote.text}”</blockquote>
          ) : (
            <p>대표 발언 확인 중</p>
          )}
        </div>
      </section>
    </div>
  )
}
