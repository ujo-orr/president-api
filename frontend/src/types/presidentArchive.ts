import type { President } from './archive'

export interface ArchiveAxis {
  id: string
  label: string
  score: number | null
  status: 'CALCULATED' | 'NO_EVALUABLE_EVIDENCE' | 'UNASSESSED' | 'RESEARCH_PENDING'
}

export interface ArchiveEvent {
  id: string
  date: string
  name: string
  categories: string[]
  role: string
  findings: string[]
  sources: string[]
}

export interface ArchiveAssessment {
  eventId: string
  axisId: string
  classification: 'POSITIVE' | 'NEGATIVE' | 'UNASSESSED'
  weight: number | null
  impactId: string
  interpretation: string
}

export interface PresidentArchive {
  person: President
  scores: ArchiveAxis[]
  events: ArchiveEvent[]
  assessments: ArchiveAssessment[]
  scoreAdjustmentConstant: number
  timelineWeightLimit: number
}
