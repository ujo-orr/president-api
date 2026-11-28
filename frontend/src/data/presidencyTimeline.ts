import type { PresidentArchive } from '../types/presidentArchive'

// 선택 분야별 사건 가중치 합산
export function getPresidencyTimeline(archive: PresidentArchive, axisId: string, category?: string) {
  const weights = new Map<string, { positive: number; negative: number }>()
  for (const { eventId, axisId: assessedAxis, classification, weight } of archive.assessments) {
    if (weight === null || (axisId && axisId !== assessedAxis)) continue
    const total = weights.get(eventId) ?? { positive: 0, negative: 0 }
    if (classification === 'POSITIVE') total.positive += weight
    if (classification === 'NEGATIVE') total.negative += weight
    weights.set(eventId, total)
  }
  return archive.events
    .filter((event) => !category || event.categories.includes(category))
    .map((event) => ({ ...event, ...(weights.get(event.id) ?? { positive: 0, negative: 0 }) }))
}
