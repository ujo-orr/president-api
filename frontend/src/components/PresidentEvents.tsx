import { useEffect, useState, type ReactNode } from 'react'
import { fetchPresidentEvents } from '../data/presidentApi'
import type { EventCategory, EventImpact, LegalDecision, LegalStatus, PresidentEvent } from '../types/presidentEvent'
import { ExternalLink } from './ExternalLink'

const categories: Record<EventCategory, string> = {
  HISTORICAL_EVENT: '역사적 사건',
  POLITICAL_CONTROVERSY: '정치적 논란',
  CRIMINAL_CASE: '형사 사건',
  CONSTITUTIONAL_CASE: '헌법적 사건',
  NATIONAL_INCIDENT: '국가적 사건·사고',
  PUBLIC_STATEMENT: '주요 발언',
}

const phases = { BEFORE: '취임 전', DURING: '재임 중', AFTER: '퇴임 후' }

const legalLabels: Record<LegalStatus, string> = {
  CONVICTED_FINAL: '유죄 확정',
  ACQUITTED_FINAL: '무죄 확정',
  TRIAL_IN_PROGRESS: '재판 진행 중',
  UNDER_INVESTIGATION: '수사 진행 중',
  NO_PROSECUTION_RIGHT: '공소권 없음',
  NOT_INDICTED: '불기소',
  PROSECUTION_DEFERRED: '기소유예',
  NOT_APPLICABLE: '',
  UNKNOWN: '확인된 자료 부족',
}

function decisionLabel(decision: LegalDecision) {
  if (decision.kind === 'CONSTITUTIONAL') return decision.result
  return legalLabels[decision.result as LegalStatus] ?? decision.result
}

function EventDate({ value }: { value: string }) {
  const [year, month, day] = value.split('-')
  return <time dateTime={value}>{year}년{month && ` ${Number(month)}월`}{day && ` ${Number(day)}일`}</time>
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return <div><h4>{label}</h4>{children}</div>
}

const impactHeadings = {
  POLICY: ['긍정적 효과', '부정적 효과 및 한계'],
  DIPLOMATIC: ['성과', '한계 및 비판'],
  NATIONAL_INCIDENT: ['확인된 효과', '대응 과정의 문제점'],
  HISTORICAL_EVENT: ['역사적 의의', '영향 및 한계'],
} as const

function SourcedImpacts({ label, items, sources }: {
  label: string
  items: EventImpact[] | null | undefined
  sources: PresidentEvent['sources']
}) {
  if (!items?.length) return null

  return (
    <DetailField label={label}>
      <ul>{items.map(({ text, sourceUrl }) => (
        <li key={`${sourceUrl}:${text}`}>
          <p>{text}</p>
          <ExternalLink href={sourceUrl}>{sources.find((source) => source.url === sourceUrl)?.title ?? '원문 출처'}</ExternalLink>
        </li>
      ))}</ul>
    </DetailField>
  )
}

function EventCard({ event }: { event: PresidentEvent }) {
  const { background, verifiedFacts, perspectives, responsibility, legalDecisions, quote, socialImpact, followUp, sources } = event
  const outcomes = legalDecisions.filter((decision) => decision.kind === 'CONSTITUTIONAL' || decision.result === event.legalStatus)
  const outcomeLabels = new Map(outcomes.map((decision) => [
    `${decision.subject} · ${decisionLabel(decision)}`, decision,
  ]))
  const status = legalLabels[event.legalStatus]
  const needsSubject = event.legalStatus === 'CONVICTED_FINAL' || event.legalStatus === 'ACQUITTED_FINAL'
  const showStatus = status && !needsSubject && !outcomes.some((decision) => decision.kind !== 'CONSTITUTIONAL')
  const impactType = event.eventType ?? (event.category === 'NATIONAL_INCIDENT' ? 'NATIONAL_INCIDENT' : 'HISTORICAL_EVENT')
  const [positiveHeading, negativeHeading] = impactHeadings[impactType]
  const perspectiveHeading = event.category === 'PUBLIC_STATEMENT' ? '사회적 반응' : '주요 주장 및 반론'

  return (
    <details className="public-event">
      <summary>
        <div className="public-event-meta">
          <EventDate value={event.occurredAt} />
          <span>{categories[event.category]}</span>
          <span data-phase={event.presidencyPhase}>{phases[event.presidencyPhase]}</span>
        </div>
        <h3>{event.title}</h3>
        <p>{event.summary}</p>
        {(outcomeLabels.size > 0 || showStatus) && (
          <div className="public-event-outcomes">
            {[...outcomeLabels].map(([key, decision]) => (
              <span key={key}>{decision.subject} · <DecisionResult decision={decision} /></span>
            ))}
            {showStatus && <span data-legal-status={event.legalStatus}>{status}</span>}
          </div>
        )}
      </summary>
      <div className="public-event-body">
        {quote && (
          <DetailField label={quote.text ? '발언 원문' : '발언 요약'}>
            {quote.text && <blockquote>{quote.text}</blockquote>}
            <p>{quote.speaker} · {quote.role} · <EventDate value={quote.date} />{quote.time && ` ${quote.time}`}{quote.place && ` · ${quote.place}`}</p>
            <ExternalLink href={quote.sourceUrl}>{quote.text ? '발언 원문 또는 영상 출처' : '발언 요약 출처'}</ExternalLink>
          </DetailField>
        )}
        {quote?.context && <DetailField label="발언 배경"><p>{quote.context}</p></DetailField>}
        {background && <DetailField label="발생 배경"><p>{background}</p></DetailField>}
        {verifiedFacts.length > 0 && (
          <DetailField label="확인된 사실"><ul>{verifiedFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul></DetailField>
        )}
        <SourcedImpacts label="정부 대응" items={event.governmentResponses} sources={sources} />
        <SourcedImpacts label={positiveHeading} items={event.positiveImpacts} sources={sources} />
        <SourcedImpacts label={negativeHeading} items={event.negativeImpacts} sources={sources} />
        {!!perspectives?.length && (
          <DetailField label={perspectiveHeading}>
            <ul>{perspectives.map(({ speaker, claim, sourceUrl }) => (
              <li key={`${speaker}:${claim}:${sourceUrl}`}>
                <p><strong>{speaker}</strong> · {claim}</p>
                <ExternalLink href={sourceUrl}>{sources.find((source) => source.url === sourceUrl)?.title ?? '주장 출처'}</ExternalLink>
              </li>
            ))}</ul>
          </DetailField>
        )}
        {responsibility && <DetailField label="대통령 및 정부의 관여 범위"><p>{responsibility}</p></DetailField>}
        {legalDecisions.length > 0 && (
          <DetailField label="사법적 판단">
            <ul className="public-event-decisions">{legalDecisions.map((decision) => (
              <li key={`${decision.subject}:${decision.issue}:${decision.decidedAt}:${decision.result}`}>
                <strong>{decision.subject} · <DecisionResult decision={decision} />{!decision.final && ' (미확정)'}</strong>
                <p>{decision.issue}</p>
                <p>{decision.authority} · <EventDate value={decision.decidedAt} />{decision.caseNumber && ` · ${decision.caseNumber}`}</p>
                {decision.sentence && <p>{decision.sentence}</p>}
                <p>{decision.reason}</p>
                <ExternalLink href={decision.sourceUrl}>판단 출처</ExternalLink>
              </li>
            ))}</ul>
          </DetailField>
        )}
        {socialImpact && <DetailField label="국가 및 사회에 미친 영향"><p>{socialImpact}</p></DetailField>}
        {followUp && <DetailField label="후속 조치"><p>{followUp}</p></DetailField>}
        {sources.length > 0 && (
          <DetailField label="원문 출처">
            <ul>{sources.map(({ title, url }) => <li key={url}><ExternalLink href={url}>{title}</ExternalLink></li>)}</ul>
            <p>자료 확인일 <EventDate value={event.lastVerifiedAt.slice(0, 10)} /></p>
          </DetailField>
        )}
      </div>
    </details>
  )
}

function DecisionResult({ decision }: { decision: LegalDecision }) {
  return (
    <span data-legal-status={decision.kind !== 'CONSTITUTIONAL' ? decision.result : undefined}>
      {decisionLabel(decision)}
    </span>
  )
}

type EventsState = { status: 'loading' | 'error' } | { status: 'ready'; events: PresidentEvent[] }
const filters = [['all', '전체'], ...Object.entries(categories)] as const

export function PresidentEvents({ presidentId }: { presidentId: string }) {
  const [state, setState] = useState<EventsState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // 페이지 이동 및 재시도 시 이전 요청 취소
    const controller = new AbortController()
    fetchPresidentEvents(presidentId, controller.signal).then(
      (events) => { if (!controller.signal.aborted) setState({ status: 'ready', events }) },
      () => { if (!controller.signal.aborted) setState({ status: 'error' }) },
    )
    return () => controller.abort()
  }, [presidentId, attempt])

  const events = state.status === 'ready' ? state.events : []
  const shown = filter === 'all' ? events : events.filter((event) => event.category === filter)

  return (
    <section className="detail-panel public-events" aria-labelledby="public-events-heading">
      <h2 id="public-events-heading">주요 사건 및 발언</h2>
      <p>해당 대통령과 관련된 주요 역사적 사건, 사법적 판단 및 발언을 확인할 수 있습니다.</p>
      {state.status === 'loading' && <p role="status">주요 사건 및 발언을 불러오는 중입니다.</p>}
      {state.status === 'error' && (
        <div className="public-events-error">
          <p role="alert">주요 사건 및 발언을 불러오지 못했습니다.</p>
          <button type="button" onClick={() => {
            setState({ status: 'loading' })
            setAttempt((previous) => previous + 1)
          }}>다시 시도</button>
        </div>
      )}
      {state.status === 'ready' && events.length === 0 && <p role="status">등록된 사건 및 발언이 없습니다.</p>}
      {events.length > 0 && (
        <>
          <div className="public-event-filters" role="group" aria-label="사건 분류 필터">
            {filters.map(([value, label]) => (
              <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
            ))}
          </div>
          {shown.length === 0 && <p role="status">이 분류에 해당하는 기록이 없습니다.</p>}
          <div className="public-event-list">
            {shown.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        </>
      )}
      <p className="public-events-notice">본 기록은 대한민국 현대사에 대한 이해를 돕기 위해 작성되었습니다. 확인된 사실, 의혹, 정치적 해석 및 사법적 판단을 구분하여 제공하며, 특정 정치적 입장이나 판단을 강요하지 않습니다.</p>
    </section>
  )
}
