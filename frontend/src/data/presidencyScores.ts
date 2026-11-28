import { categories, scoreAdjustmentConstant } from '../../../data/presidency-scores.stage-2.json'

type ScoreAxisId = keyof typeof categories

const axisOrder: readonly ScoreAxisId[] = [
  'economy',
  'foreignRelations',
  'laborSocial',
  'securityDefense',
  'democracyRuleOfLaw',
  'culture',
]

export const maximumScore = 10
export { scoreAdjustmentConstant }
export const scoreCategories = axisOrder.map((id) => ({ id, label: categories[id] }))

export interface RadarScore {
  id: string
  label: string
  score: number | null
}
