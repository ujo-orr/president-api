import type { LoaderFunctionArgs } from 'react-router-dom'
import type { President } from '../types/archive'
import type { PresidentEvent } from '../types/presidentEvent'

const presidentsUrl = '/api/presidents'

export async function loadChronology({ request }: LoaderFunctionArgs): Promise<President[]> {
  const response = await fetch(presidentsUrl, { signal: request.signal })
  if (!response.ok) throw new Error('President list request failed.')
  return response.json()
}

export async function loadPresident({ params, request }: LoaderFunctionArgs): Promise<President | null> {
  if (!params.id) return null
  const response = await fetch(`${presidentsUrl}/${encodeURIComponent(params.id)}`, { signal: request.signal })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('President detail request failed.')
  return response.json()
}

export async function fetchPresidentEvents(id: string, signal: AbortSignal): Promise<PresidentEvent[]> {
  const response = await fetch(`${presidentsUrl}/${encodeURIComponent(id)}/events`, { signal })
  if (!response.ok) throw new Error('President events request failed.')
  const events: PresidentEvent[] = await response.json()
  if (!Array.isArray(events) || !events.every((event) =>
    typeof event?.id === 'string' && typeof event.occurredAt === 'string'
    && Array.isArray(event.verifiedFacts)
    && Array.isArray(event.legalDecisions) && Array.isArray(event.sources)
    && [event.positiveImpacts, event.negativeImpacts, event.governmentResponses, event.perspectives]
      .every((items) => items == null || Array.isArray(items))
  )) throw new Error('Invalid president events response.')

  return events.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id))
}
