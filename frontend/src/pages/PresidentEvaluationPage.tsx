import { useLoaderData } from 'react-router-dom'
import historicalEvents from '../../../data/historical-events.stage-1.json'
import evaluationData from '../../../data/presidency-assessments.stage-2.json'
import { EvaluationBackLink } from '../components/EvaluationBackLink'
import { ExternalLink } from '../components/ExternalLink'
import type { loadPresident } from '../data/presidentApi'
import { getPresidencyScores } from '../data/presidencyScores'
import { NotFoundPage } from './NotFoundPage'

const eventsById = new Map(historicalEvents.events.map((event) => [event.id, event]))

export function PresidentEvaluationPage() {
  const person = useLoaderData<typeof loadPresident>()

  if (!person) return <NotFoundPage presidentMissing />

  const evidence = evaluationData.assessments.flatMap((assessment) => {
    const event = eventsById.get(assessment.eventId)
    if (!event || event.president !== person.name || assessment.weight === null) return []
    return [{ assessment, event }]
  })

  return (
    <article className="inner-page evaluation">
      <EvaluationBackLink fallback={`/presidents/${person.id}`} />
      <h1>{person.name} 평가 근거</h1>
      <div className="evaluation-grid president-evidence">
        {getPresidencyScores(person.id).map(({ id: axisId, label, score }) => {
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
                <p>점수에 반영된 자료가 없습니다.</p>
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
