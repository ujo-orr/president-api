export type EventCategory = 'HISTORICAL_EVENT' | 'POLITICAL_CONTROVERSY' | 'CRIMINAL_CASE'
  | 'CONSTITUTIONAL_CASE' | 'NATIONAL_INCIDENT' | 'PUBLIC_STATEMENT'

export type LegalStatus = 'CONVICTED_FINAL' | 'ACQUITTED_FINAL' | 'TRIAL_IN_PROGRESS'
  | 'UNDER_INVESTIGATION' | 'NO_PROSECUTION_RIGHT' | 'NOT_INDICTED'
  | 'PROSECUTION_DEFERRED' | 'NOT_APPLICABLE' | 'UNKNOWN'

export interface LegalDecision {
  kind: 'CRIMINAL' | 'CONSTITUTIONAL' | 'PROSECUTORIAL'
  subject: string
  issue: string
  authority: string
  caseNumber: string | null
  decidedAt: string
  final: boolean
  result: string
  sentence: string | null
  reason: string
  sourceUrl: string
}

export interface EventImpact {
  text: string
  sourceUrl: string
}

export interface PresidentEvent {
  id: string
  presidentId: string
  title: string
  category: EventCategory
  eventType?: 'POLICY' | 'DIPLOMATIC' | null
  occurredAt: string
  datePrecision: 'YEAR' | 'MONTH' | 'DAY'
  presidencyPhase: 'BEFORE' | 'DURING' | 'AFTER'
  summary: string
  background: string | null
  verifiedFacts: string[]
  positiveImpacts?: EventImpact[] | null
  negativeImpacts?: EventImpact[] | null
  governmentResponses?: EventImpact[] | null
  perspectives?: { speaker: string; claim: string; sourceUrl: string }[] | null
  responsibility: string
  legalStatus: LegalStatus
  legalDecisions: LegalDecision[]
  quote: {
    speaker: string
    role: string
    date: string
    time: string | null
    place: string | null
    context: string
    text: string | null
    sourceUrl: string
  } | null
  socialImpact: string | null
  followUp: string | null
  sources: { title: string; url: string }[]
  lastVerifiedAt: string
}
