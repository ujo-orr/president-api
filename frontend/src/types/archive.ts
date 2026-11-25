export interface DataSource {
  id: string
  organization: string
  title: string
  originalUrl: string
  verifiedAt: string
}

export interface PresidentialTerm {
  id: string
  presidentId: string
  // 공개 출처에 맞춘 월 정밀도
  startDate: string
  endDate: string
}

export interface President {
  id: string
  name: string
  presidentialNumbers: number[]
  profileImage: { path: string; source: DataSource } | null
  representativeQuote: { text: string; kind: 'speech' | 'slogan' | 'retrospective'; source: DataSource } | null
  terms: [PresidentialTerm, ...PresidentialTerm[]]
  sources: DataSource[]
}

export interface EvaluationCategory {
  id: string
  name: string
  description: string
}

export interface EvaluationScore {
  presidentId: string
  categoryId: string
  score: number | null
  reason: string | null
  sources: DataSource[]
}

export interface HistoricalEvent {
  id: string
  presidentId: string
  eventDate: string
  title: string
  description: string
  impactScore: number | null
  sources: DataSource[]
}

export interface Indicator {
  id: string
  name: string
  unit: string
  description: string
  source: DataSource
}

export interface IndicatorValue {
  indicatorId: string
  year: number
  value: number | null
}
