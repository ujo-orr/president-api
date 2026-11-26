import historicalEvents from '../../../data/historical-events.stage-1.json'
import evaluationData from '../../../data/presidency-assessments.stage-2.json'

const impactsByEvent = new Map<string, { axisId: string; positive: number; negative: number }[]>()
for (const { eventId, axisId, classification, weight } of evaluationData.assessments) {
  if (weight === null) continue

  const impact = {
    axisId,
    positive: classification === 'POSITIVE' ? weight : 0,
    negative: classification === 'NEGATIVE' ? weight : 0,
  }
  const impacts = impactsByEvent.get(eventId)
  if (impacts) impacts.push(impact)
  else impactsByEvent.set(eventId, [impact])
}

const eventsByDate = [...historicalEvents.events].sort((a, b) => a.date.localeCompare(b.date))

function sumWeights(eventId: string, axisId: string) {
  let positive = 0
  let negative = 0
  for (const impact of impactsByEvent.get(eventId) ?? []) {
    if (axisId && impact.axisId !== axisId) continue
    positive += impact.positive
    negative += impact.negative
  }
  return { positive, negative }
}

// 대통령과 선택 분야에 공통인 막대 눈금
export const timelineWeightLimit = Math.max(1, ...eventsByDate.map(({ id }) => {
  const { positive, negative } = sumWeights(id, '')
  return Math.max(positive, negative)
}))

export function getPresidencyTimeline(presidentName: string, axisId = '', category?: string) {
  return eventsByDate
    .filter((event) => event.president === presidentName && (!category || event.categories.includes(category)))
    .map((event) => ({ ...event, ...sumWeights(event.id, axisId) }))
}
