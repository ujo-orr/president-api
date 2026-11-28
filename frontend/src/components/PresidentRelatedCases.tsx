import { useEffect, useState } from 'react'
import { fetchPresidentRelatedCases } from '../data/presidentApi'
import { useDelayedSkeleton } from '../hooks/useDelayedSkeleton'
import type { PresidentRelatedCase, RelatedCaseSource, RelatedLegalStatus } from '../types/presidentRelatedCase'
import { EventsSkeleton } from './ArchiveSkeletons'
import { ExternalLink } from './ExternalLink'

const legalLabels: Record<RelatedLegalStatus, string> = {
  CONVICTED_FINAL: '유죄 확정',
  ACQUITTED_FINAL: '무죄 확정',
  PARTIALLY_CONVICTED_FINAL: '일부 유죄·일부 무죄 확정',
  TRIAL_IN_PROGRESS: '재판 진행 중',
  UNDER_INVESTIGATION: '수사 진행 중',
  NOT_INDICTED: '불기소',
  PROSECUTION_DEFERRED: '기소유예',
  NO_PROSECUTION_RIGHT: '공소권 없음',
  NOT_APPLICABLE: '',
  UNKNOWN: '사법적 상태 확인 불가',
}

const verificationLabels = {
  VERIFIED: '사실관계 확인',
  PARTIALLY_VERIFIED: '일부 사실 확인',
  DISPUTED: '사실관계에 관한 자료 간 불일치',
  INSUFFICIENT_EVIDENCE: '확인된 자료 부족',
}

function VerdictLabel({ status }: { status: RelatedLegalStatus }) {
  if (status === 'PARTIALLY_CONVICTED_FINAL') {
    return <><span data-verdict="유죄">일부 유죄</span>·<span data-verdict="무죄">일부 무죄</span> 확정</>
  }
  return (
    <span data-verdict={status === 'CONVICTED_FINAL' ? '유죄' : status === 'ACQUITTED_FINAL' ? '무죄' : undefined}>
      {legalLabels[status]}
    </span>
  )
}

function DateText({ date }: { date: string }) {
  const [year, month, day] = date.split('-')
  return <time dateTime={date}>{year}년{month && ` ${Number(month)}월`}{day && ` ${Number(day)}일`}</time>
}

function SourceLinks({ sources, ids }: { sources: RelatedCaseSource[]; ids?: string[] }) {
  return (
    <ul className="related-case-sources">
      {sources.filter(({ id }) => !ids || ids.includes(id)).map(({ id, organization, title, url }) => (
        <li key={id}><ExternalLink href={url}>{organization} · {title}</ExternalLink></li>
      ))}
    </ul>
  )
}

function RelatedCaseCard({ record }: { record: PresidentRelatedCase }) {
  const { occurredFrom, occurredTo, relatedPersons, verifiedFacts, allegations, legalDecisions, sources } = record
  const involvement = record.presidentInvolvement
  const involvementSources = involvement && sources.filter(({ id }) => involvement.sourceIds.includes(id))

  return (
    <details className="public-event">
      <summary>
        <div className="public-event-meta">
          <span>{occurredFrom ? <DateText date={occurredFrom} /> : '발생 시기 미확인'}
            {occurredTo && occurredTo !== occurredFrom && <> ~ <DateText date={occurredTo} /></>}</span>
          <span>{record.presidencyPhase}</span>
        </div>
        <h3>{record.title}</h3>
        <p>{relatedPersons.map(({ name, relationship }) => `${name}(${relationship})`).join(' · ')}</p>
        <p>{record.summary}</p>
        <div className="public-event-outcomes">
          <span data-verification-status={record.verificationStatus}>{verificationLabels[record.verificationStatus]}</span>
        </div>
      </summary>
      <div className="public-event-body">
        <div><h4>관련 인물</h4><ul>{relatedPersons.map(({ name, relationship, sourceIds }) => (
          <li key={name}><p><strong>{name}</strong> · {relationship}</p><SourceLinks sources={sources} ids={sourceIds} /></li>
        ))}</ul></div>
        {record.background && <div><h4>발생 배경</h4><p>{record.background}</p></div>}
        {([{ label: '확인된 사실', items: verifiedFacts }, { label: '혐의 및 주장', items: allegations }]).map(({ label, items }) =>
          items.length > 0 && <div key={label}><h4>{label}</h4><ul>{items.map(({ description, sourceIds }) => (
            <li key={description}><p>{description}</p><SourceLinks sources={sources} ids={sourceIds} /></li>
          ))}</ul></div>)}
        {legalDecisions.length > 0 && <div>
          <h4>사법적 판단</h4>
          <ul className="public-event-judgments related-case-judgments">{legalDecisions.map((decision, index) => (
            <li key={index}>
              <h5>{decision.personName}{legalLabels[decision.status] && <> · <VerdictLabel status={decision.status} /></>}</h5>
              <ul className="related-case-charges">{decision.verdictBreakdown ? (
                <>
                  <li><strong data-verdict="유죄">유죄</strong> · {decision.verdictBreakdown.guilty}</li>
                  <li><strong data-verdict="무죄">무죄</strong> · {decision.verdictBreakdown.acquitted}</li>
                </>
              ) : decision.charges.map((charge) => <li key={charge}>{charge}</li>)}</ul>
              <p>{[decision.courtLevel, decision.caseNumber].filter(Boolean).join(' · ')}
                {decision.decisionDate && <> · 판단일 <DateText date={decision.decisionDate} /></>}</p>
              {decision.finalizedAt && <p>확정일 <DateText date={decision.finalizedAt} /></p>}
              {decision.sentence && <p>선고 내용{decision.charges.length > 1 && ' (전체)'} · {decision.sentence}</p>}
              {decision.reason && <p>{decision.reason}</p>}
              <SourceLinks sources={sources} ids={decision.sourceIds} />
            </li>
          ))}</ul>
        </div>}
        {involvement?.action && involvement.evidenceType && !!involvementSources?.length && (
          <div><h4>대통령 관여</h4><p>{involvement.action}</p>
            <p>{involvement.evidenceType}{involvement.legalCharacter && ` · ${involvement.legalCharacter}`}</p>
            <SourceLinks sources={involvementSources} />
          </div>
        )}
        {record.verificationNotes.length > 0 && <div><h4>자료 검증 범위</h4>
          <ul>{record.verificationNotes.map((note) => <li key={note}>{note}</li>)}</ul>
        </div>}
        <div><h4>원문 출처</h4><SourceLinks sources={sources} />
          <p className="public-event-source-date">마지막 검증일 <DateText date={record.lastVerifiedAt} /></p>
        </div>
      </div>
    </details>
  )
}

type CasesState = { status: 'loading' | 'error' } | { status: 'ready'; cases: PresidentRelatedCase[] }

export function PresidentRelatedCases({ presidentId }: { presidentId: string }) {
  const [state, setState] = useState<CasesState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const showSkeleton = useDelayedSkeleton(state.status === 'loading' ? attempt : null)

  useEffect(() => {
    // 대통령 전환 및 재시도 시 이전 요청 취소
    const controller = new AbortController()
    fetchPresidentRelatedCases(presidentId, controller.signal).then(
      (cases) => { if (!controller.signal.aborted) setState({ status: 'ready', cases }) },
      () => { if (!controller.signal.aborted) setState({ status: 'error' }) },
    )
    return () => controller.abort()
  }, [presidentId, attempt])

  return (
    <section className="detail-panel public-events" aria-labelledby="related-cases-heading">
      <h2 id="related-cases-heading">가족 및 측근 관련 사건</h2>
      {showSkeleton && <EventsSkeleton label="가족 및 측근 관련 사건을 불러오는 중입니다." />}
      {state.status === 'error' && <div className="public-events-error">
        <p role="alert">가족 및 측근 관련 사건을 불러오지 못했습니다.</p>
        <button type="button" onClick={() => {
          setState({ status: 'loading' })
          setAttempt((previous) => previous + 1)
        }}>다시 시도</button>
      </div>}
      {state.status === 'ready' && (state.cases.length > 0 ? (
        <div className="public-event-list">{state.cases.map((record) => <RelatedCaseCard key={record.id} record={record} />)}</div>
      ) : <p role="status">현재 등록된 가족 및 측근 관련 사건이 없습니다.</p>)}
      <p className="public-events-notice">본 기록은 대통령의 가족 및 측근과 관련된 주요 역사적 사건을 사실과 공식 자료에 근거하여 제공합니다. 관련 인물의 사법적 책임은 대통령 개인의 책임과 구분되며, 대통령의 관여 사실은 명확한 근거가 확보된 경우에만 표시합니다. 관여 항목의 미표기가 대통령의 무관함을 의미하는 것은 아닙니다.</p>
    </section>
  )
}
