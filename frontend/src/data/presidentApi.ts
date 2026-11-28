import type { LoaderFunctionArgs } from 'react-router-dom'
import type { President } from '../types/archive'
import type { PresidentArchive } from '../types/presidentArchive'
import type { PresidentEvent } from '../types/presidentEvent'
import type { PresidentRelatedCase } from '../types/presidentRelatedCase'
import { scoreCategories } from './presidencyScores'

const presidentsUrl = '/api/presidents'

export async function fetchPresidentRelatedCases(id: string, signal: AbortSignal): Promise<PresidentRelatedCase[]> {
  const response = await fetch(`${presidentsUrl}/${encodeURIComponent(id)}/related-cases`, { signal })
  if (!response.ok) throw new Error('President related cases request failed.')
  const cases: PresidentRelatedCase[] = await response.json()
  if (!Array.isArray(cases) || !cases.every((entry) => entry?.presidentId === id
      && typeof entry.id === 'string' && Array.isArray(entry.relatedPersons)
      && Array.isArray(entry.legalDecisions) && Array.isArray(entry.sources)
      && Array.isArray(entry.verifiedFacts) && Array.isArray(entry.allegations))) {
    throw new Error('Invalid president related cases response.')
  }
  return cases
}

export async function loadChronology({ request }: LoaderFunctionArgs): Promise<President[]> {
  const response = await fetch(presidentsUrl, { signal: request.signal })
  if (!response.ok) throw new Error('President list request failed.')
  return response.json()
}

export async function loadPresident({ params, request }: LoaderFunctionArgs): Promise<PresidentArchive | null> {
  if (!params.id) return null
  const response = await fetch(`${presidentsUrl}/${encodeURIComponent(params.id)}/archive`, { signal: request.signal })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('President archive request failed.')
  const archive: PresidentArchive = await response.json()
  const axes = new Map(archive.scores?.map((axis) => [axis.id, axis]))
  if (archive.person?.id !== params.id || axes.size !== scoreCategories.length
      || !Array.isArray(archive.events) || !Array.isArray(archive.assessments)
      || !Number.isInteger(archive.scoreAdjustmentConstant) || archive.scoreAdjustmentConstant < 0
      || !Number.isInteger(archive.timelineWeightLimit) || archive.timelineWeightLimit < 1) {
    throw new Error('Invalid president archive response.')
  }
  const scores = scoreCategories.map(({ id }) => {
    const axis = axes.get(id)
    if (!axis) throw new Error('Missing archive score axis.')
    return axis
  })
  return { ...archive, scores }
}

export async function fetchPresidentEvents(id: string, signal: AbortSignal): Promise<PresidentEvent[]> {
  const response = await fetch(`${presidentsUrl}/${encodeURIComponent(id)}/events`, { signal })
  if (!response.ok) throw new Error('President events request failed.')
  const events: PresidentEvent[] = await response.json()
  if (!Array.isArray(events) || !events.every((event) =>
    typeof event?.id === 'string' && typeof event.occurredAt === 'string'
    && Array.isArray(event.verifiedFacts)
    && Array.isArray(event.legalDecisions) && Array.isArray(event.sources)
    && [event.positiveImpacts, event.negativeImpacts, event.governmentResponses, event.perspectives,
      event.factSources, event.relatedStatements]
      .every((items) => items == null || Array.isArray(items))
  )) throw new Error('Invalid president events response.')

  return events.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id))
}
