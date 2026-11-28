import type { ReactNode } from 'react'
import { useDelayedSkeleton } from '../hooks/useDelayedSkeleton'

export function DelayedSkeleton({ children }: { children: ReactNode }) {
  return useDelayedSkeleton('fallback') ? children : null
}

function Skeleton({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`skeleton ${className}`}>
      <span className="visually-hidden" role="status">{label}</span>
      <div className="skeleton-content" aria-busy="true">
        <div aria-hidden="true">{children}</div>
      </div>
    </div>
  )
}

function Block({ width, className = '' }: { width?: string; className?: string }) {
  return <span className={`skeleton-block ${className}`} style={{ width }} />
}

const cardSlots = [0, 1, 2, 3]
const scoreSlots = [0, 1, 2, 3, 4, 5]
const rowSlots = [0, 1, 2]

export function ChronologySkeleton() {
  return (
    <Skeleton label="대통령 카드 목록을 불러오는 중입니다." className="chronology container skeleton-chronology">
      <div className="chronology-navigation">
        <div className="chronology-scroll">
          <div className="chronology-track">
            <div className="president-cards">
              {cardSlots.map((slot) => (
                <div className="president-card" key={slot}>
                  <Block className="portrait" />
                  <div className="card-text"><Block width="34%" /><Block width="46%" /><Block width="40%" /></div>
                </div>
              ))}
            </div>
            <ol className="chronology-years">
              {cardSlots.map((slot) => <li key={slot}><Block width="3rem" /></li>)}
            </ol>
          </div>
        </div>
        <Block className="chronology-progress" />
      </div>
    </Skeleton>
  )
}

export function TimelineSkeleton() {
  return (
    <Skeleton label="흥망성쇠 기록을 불러오는 중입니다.">
      <div className="skeleton-lines">
        <Block width="min(100%, 32rem)" />
        <Block className="skeleton-control" width="9rem" />
        <Block width="min(85%, 27rem)" />
      </div>
      <ol className="event-list">
        {rowSlots.map((slot) => (
          <li className="event-row" key={slot}>
            <Block width="5rem" className="skeleton-event-date" />
            <div className="event-details event-summary skeleton-timeline-row">
              <Block width="min(85%, 17rem)" /><Block width="90%" />
            </div>
          </li>
        ))}
      </ol>
    </Skeleton>
  )
}

export function PresidentPageSkeleton() {
  return (
    <Skeleton label="대통령 프로필과 재임 기록을 불러오는 중입니다." className="details inner-page">
      <Block className="skeleton-back" width="7rem" />
      <div className="details-top">
        <div className="profile">
          <Block className="portrait" />
          <div className="profile-copy skeleton-lines"><Block className="skeleton-profile-name" width="55%" /><Block width="26%" /></div>
        </div>
        <div className="detail-panel profile-facts">
          <div className="profile-facts-list">
            <div className="skeleton-lines"><Block width="4rem" /><Block width="85%" /></div>
            <div className="skeleton-lines"><Block width="3rem" /><Block width="55%" /></div>
            <div className="profile-parties skeleton-lines"><Block width="5rem" /><Block width="42%" /></div>
          </div>
          <div className="profile-quote skeleton-lines"><Block width="5rem" /><Block width="86%" /><Block width="66%" /></div>
        </div>
      </div>
      <div className="detail-panel details-career skeleton-lines">
        <Block className="skeleton-heading" width="4rem" />
        {rowSlots.map((slot) => <div className="skeleton-career-row" key={slot}><Block width="5rem" /><Block width="min(70%, 18rem)" /></div>)}
      </div>
      <div className="details-middle">
        <div className="detail-panel skeleton-lines">
          <Block className="skeleton-heading" width="8rem" />
          <div className="presidency-radar skeleton-radar"><Block /></div>
          <Block width="91%" /><Block width="71%" />
        </div>
        <div className="detail-panel skeleton-lines">
          <Block className="skeleton-heading" width="7rem" />
          <ul className="presidency-score-list">
            {scoreSlots.map((slot) => <li key={slot}><Block width="30%" /><Block width="2rem" /></li>)}
          </ul>
          <Block width="7rem" />
        </div>
      </div>
    </Skeleton>
  )
}

export function EvidenceSkeleton() {
  return (
    <Skeleton label="평가 근거를 불러오는 중입니다." className="inner-page evaluation">
      <Block className="skeleton-back" width="5rem" />
      <Block className="skeleton-title" width="min(85%, 17rem)" />
      <div className="evaluation-grid">
        {scoreSlots.map((slot) => (
          <section className="skeleton-lines" key={slot}>
            <Block className="skeleton-heading" width="40%" /><Block width="56%" /><Block width="94%" /><Block width="68%" />
          </section>
        ))}
      </div>
    </Skeleton>
  )
}

export function EventsSkeleton({ filterWidths = [], label = '주요 사건 및 발언을 불러오는 중입니다.' }: {
  filterWidths?: number[]; label?: string
}) {
  return (
    <Skeleton label={label}>
      {filterWidths.length > 0 && <div className="public-event-filters">
        {filterWidths.map((width, index) => <Block className="skeleton-control" width={`${width}em`} key={index} />)}
      </div>}
      <div className="public-event-list">
        {rowSlots.map((slot) => (
          <div className="public-event skeleton-event skeleton-lines" key={slot}>
            <Block width="min(55%, 13rem)" /><Block className="skeleton-heading" width="min(70%, 17rem)" />
            <Block width="85%" /><Block width="5rem" />
          </div>
        ))}
      </div>
    </Skeleton>
  )
}
