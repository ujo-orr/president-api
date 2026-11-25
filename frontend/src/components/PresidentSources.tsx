import { presidentParties } from '../data/partyAffiliations'
import { formatTermMonth } from '../data/presidents'
import type { President } from '../types/archive'
import { ExternalLink } from './ExternalLink'

export function PresidentSources({ person }: { person: President }) {
  const affiliations = presidentParties[person.id]
  const quote = person.representativeQuote
  const photo = person.profileImage

  return (
    <div className="president-sources">
      <span id="president-sources-label">출처</span>
      <ul className="president-source-links" aria-labelledby="president-sources-label">
        {person.sources.map((source) => (
          <li key={source.id}><ExternalLink href={source.originalUrl}>{source.title}</ExternalLink></li>
        ))}
        {affiliations?.map(({ group, sourceUrl, since, context }) => (
          <li key={sourceUrl}>
            <ExternalLink href={sourceUrl}>
              {group.name}
              {since ? ` (${formatTermMonth(since)}부터)` : context && ` (${context})`}
            </ExternalLink>
          </li>
        ))}
        {quote && <li><ExternalLink href={quote.source.originalUrl}>{quote.source.title}</ExternalLink></li>}
        {photo && (
          <>
            <li><ExternalLink href={photo.source.originalUrl}>초상 사진 ({photo.source.organization})</ExternalLink></li>
            <li><ExternalLink href={photo.license.url}>{photo.license.name}</ExternalLink></li>
            <li>화면 표시 시 흑백 처리 및 크롭</li>
          </>
        )}
      </ul>
    </div>
  )
}
