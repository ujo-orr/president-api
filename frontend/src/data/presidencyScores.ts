import scoreData from '../../../data/presidency-scores.stage-2.json'

type ScoreAxisId = keyof typeof scoreData.categories

const axisOrder: readonly ScoreAxisId[] = [
  'economy',
  'foreignRelations',
  'laborSocial',
  'securityDefense',
  'democracyRuleOfLaw',
  'culture',
]

export const maximumScore = 10
export const scoreAdjustmentConstant = scoreData.scoreAdjustmentConstant
export const scoreCategories = axisOrder.map((id) => ({ id, label: scoreData.categories[id] }))

export interface RadarScore {
  id: ScoreAxisId
  label: string
  score: number | null
}

type PresidentScoreRecord = { axes: Record<ScoreAxisId, { score: number | null }> }

const scoresByPresident: Partial<Record<string, PresidentScoreRecord>> = scoreData.presidents

export function getPresidencyScores(presidentId: string): RadarScore[] {
  const entry = scoresByPresident[presidentId]
  return scoreCategories.map((category) => ({
    ...category,
    score: entry?.axes[category.id].score ?? null,
  }))
}
