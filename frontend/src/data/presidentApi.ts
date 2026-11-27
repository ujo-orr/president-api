import type { LoaderFunctionArgs } from 'react-router-dom'
import type { President } from '../types/archive'

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
