import { useId, useState } from 'react'
import { getPresidencyTimeline } from '../data/presidencyTimeline'
import { useChartReveal } from '../hooks/useChartReveal'
import type { PresidentArchive } from '../types/presidentArchive'
import { ExternalLink } from './ExternalLink'

function formatEventDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return `${year}년${month ? ` ${month}월` : ''}${day ? ` ${day}일` : ''}`
}

function finishEventReveal(summary: Element | null) {
  if (summary?.hasAttribute('data-chart-reveal')) {
    summary.setAttribute('data-chart-reveal', 'finished')
  }
}

export default function PresidentTimeline({ archive }: { archive: PresidentArchive }) {
  const { scores: scoreCategories, timelineWeightLimit } = archive
  const [axisId, setAxisId] = useState('')
  const chartRef = useChartReveal<HTMLDivElement>('.event-summary', axisId)
  const filterId = useId()
  const category = scoreCategories.find(({ id }) => id === axisId)
  const events = getPresidencyTimeline(archive, axisId, category?.label)

  return (
    <div className="event-chart" ref={chartRef}>
      <p>재임 중 사건을 기록된 날짜순으로 보여줍니다. 사건 사이의 간격은 경과 시간을 나타내지 않습니다.</p>
      <div className="event-chart-filter">
        <label htmlFor={filterId}>평가 분야</label>
        <select id={filterId} value={axisId} onChange={(event) => setAxisId(event.target.value)}>
          <option value="">전체 분야</option>
          {scoreCategories.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
        </select>
      </div>
      <p>{category
        ? '선택한 분야의 가중치를 합산한 AI 평가입니다.'
        : '여러 분야에 반영된 영향을 포함해 가중치를 합산한 AI 평가입니다.'}
      </p>
      <p className="visually-hidden" role="status">{category?.label ?? '전체 분야'} 사건 {events.length}건</p>
      {events.length > 0 ? (
        <ol className="event-list" aria-label="재임 중 사건">
          {events.map(({ id, date, name, categories, role, findings, sources, positive, negative }) => (
            <li key={id} className="event-row" onAnimationEnd={(event) => {
              if (event.animationName === 'event-reading-progress') {
                finishEventReveal(event.currentTarget.querySelector('.event-summary'))
              }
            }}>
              <span className="event-progress" aria-hidden="true" />
              <time dateTime={date}>{formatEventDate(date)}</time>
              <details className="event-details">
                <summary
                  className="event-summary"
                  onClick={(event) => finishEventReveal(event.currentTarget)}
                  onFocus={(event) => {
                    if (event.currentTarget.matches(':focus-visible')) finishEventReveal(event.currentTarget)
                  }}
                >
                  <span className="event-name">{name}</span>
                  {positive || negative ? (
                    <span className="event-impact">
                      <span className="event-negative"><span className="visually-hidden">부정 가중치 </span>{negative ? `−${negative}` : '0'}</span>
                      <span className="event-bar event-bar-negative" aria-hidden="true">
                        <span style={{ width: `${100 * negative / timelineWeightLimit}%` }} />
                      </span>
                      <span className="event-bar event-bar-positive" aria-hidden="true">
                        <span style={{ width: `${100 * positive / timelineWeightLimit}%` }} />
                      </span>
                      <span className="event-positive"><span className="visually-hidden">긍정 가중치 </span>{positive ? `+${positive}` : '0'}</span>
                    </span>
                  ) : <span className="event-impact event-unassessed">미평가</span>}
                </summary>
                <div className="event-body">
                  <p className="event-meta">{role} · {categories.join(', ')}</p>
                  <ul>{findings.map((finding) => <li key={finding}>{finding}</li>)}</ul>
                  <ul className="event-sources" aria-label={`${name} 출처`}>
                    {sources.map((url, index) => (
                      <li key={url}><ExternalLink href={url}>원문 출처{sources.length > 1 && ` ${index + 1}`}</ExternalLink></li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          ))}
        </ol>
      ) : <p className="event-empty">이 분야에 수집된 사건이 없습니다.</p>}
    </div>
  )
}
