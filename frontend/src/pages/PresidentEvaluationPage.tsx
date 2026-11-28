import { useLoaderData } from 'react-router-dom'
import { EvaluationBackLink } from '../components/EvaluationBackLink'
import { ExternalLink } from '../components/ExternalLink'
import type { loadPresident } from '../data/presidentApi'
import { NotFoundPage } from './NotFoundPage'

export function PresidentEvaluationPage() {
  const archive = useLoaderData<typeof loadPresident>()

  if (!archive) return <NotFoundPage presidentMissing />

  const { person, scores, events, assessments } = archive
  const eventsById = new Map(events.map((event) => [event.id, event]))
  const evidence = assessments.flatMap((assessment) => {
    const event = eventsById.get(assessment.eventId)
    if (!event || assessment.weight === null) return []
    return [{ assessment, event }]
  })

  return (
    <article className="inner-page evaluation">
      <EvaluationBackLink fallback={`/presidents/${person.id}`} />
      <h1>{person.name} 평가 근거</h1>
      <div className="evaluation-grid president-evidence">
        {scores.map(({ id: axisId, label, score, status }) => {
          const entries = evidence.filter(({ assessment }) => assessment.axisId === axisId)
          const byEvent = new Map<(typeof entries)[number]['event'], (typeof entries)[number]['assessment'][]>()
          for (const { event, assessment } of entries) {
            const impacts = byEvent.get(event)
            if (impacts) impacts.push(assessment)
            else byEvent.set(event, [assessment])
          }
          return (
            <section key={axisId}>
              <h2>{label} <span className="evidence-score">{score ?? 0}점</span></h2>
              {entries.length === 0 ? (
                <p>{status === 'RESEARCH_PENDING' ? '추가 조사를 기다리는 분야입니다.'
                  : status === 'UNASSESSED' ? '평가가 확정되지 않은 분야입니다.'
                    : '점수에 반영된 자료가 없습니다.'}</p>
              ) : (
                <ul className="source-list">
                  {Array.from(byEvent, ([event, impacts]) => (
                    <li key={event.id}>
                      <ExternalLink href={event.sources[0]}>{event.name}</ExternalLink>
                      {impacts.map((assessment) => (
                        <p key={assessment.impactId}>
                          <span className="evidence-weight">{assessment.classification === 'POSITIVE' ? '긍정 +' : '부정 −'}{assessment.weight}</span>
                          {assessment.interpretation}
                        </p>
                      ))}
                      {event.sources.length > 1 && (
                        <div className="evidence-extra-links">
                          {event.sources.slice(1).map((url, index) => (
                            <ExternalLink key={url} href={url}>자료 {index + 2}<span className="visually-hidden"> · {event.name}</span></ExternalLink>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </article>
  )
}
