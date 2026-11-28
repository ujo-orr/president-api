import type { LegalStatus, VerificationStatus } from './presidentEvent'

export type RelatedLegalStatus = LegalStatus | 'PARTIALLY_CONVICTED_FINAL'

interface Sourced {
  sourceIds: string[]
}

export interface RelatedCaseSource {
  id: string
  organization: string
  title: string
  url: string
  publishedAt: string | null
  accessedAt: string
}

export interface RelatedCaseDecision extends Sourced {
  personName: string
  charges: string[]
  status: RelatedLegalStatus
  courtLevel: string | null
  decisionDate: string | null
  finalizedAt: string | null
  caseNumber: string | null
  sentence: string | null
  reason: string | null
  verdictBreakdown?: { guilty: string; acquitted: string }
}

export interface PresidentRelatedCase {
  id: string
  presidentId: string
  publicEventId: string | null
  title: string
  occurredFrom: string | null
  occurredTo: string | null
  datePrecision: 'YEAR' | 'MONTH' | 'DAY' | 'MIXED' | 'UNKNOWN'
  presidencyPhase: string
  relatedPersons: (Sourced & { name: string; relationship: string })[]
  summary: string
  background: string | null
  verifiedFacts: (Sourced & { description: string })[]
  allegations: (Sourced & { description: string })[]
  legalDecisions: RelatedCaseDecision[]
  presidentInvolvement: (Sourced & { action: string; evidenceType: string; legalCharacter: string | null }) | null
  verificationStatus: VerificationStatus
  verificationNotes: string[]
  sources: RelatedCaseSource[]
  lastVerifiedAt: string
}
