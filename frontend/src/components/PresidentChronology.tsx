import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatPresidentialNumbers, formatRepublics, presidents } from '../data/presidents'
import { PresidentPortrait } from './PresidentPortrait'

export function PresidentChronology() {
  const section = useRef<HTMLElement>(null)
  const scrollRegion = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const chronology = section.current
    const rail = scrollRegion.current
    if (!chronology || !rail) return

    // 이동 가능한 구간에서만 세로 휠을 가로 이동으로 전환
    function moveTrack(event: WheelEvent) {
      if (!rail || !event.cancelable || event.ctrlKey || event.shiftKey) return
      const mode = event.deltaMode
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      const distance = mode === 1 ? 16 : mode === 2 ? rail.clientWidth : 1
      const maxOffset = rail.scrollWidth - rail.clientWidth
      const next = Math.min(maxOffset, Math.max(0, rail.scrollLeft + event.deltaY * distance))
      if (Math.abs(next - rail.scrollLeft) < 1) return

      event.preventDefault()
      rail.scrollLeft = next
    }

    chronology.addEventListener('wheel', moveTrack, { passive: false })
    return () => chronology.removeEventListener('wheel', moveTrack)
  }, [])

  return (
    <section className="chronology container" id="chronology" aria-label="대통령 연대기" tabIndex={-1} ref={section}>
      <div className="chronology-scroll" role="region" tabIndex={0} aria-label="취임 순서대로 나열한 대통령 카드" ref={scrollRegion}>
        <div className="chronology-track">
          <ol className="president-cards">
            {presidents.map((person) => (
              <li key={person.id}>
                <Link className="president-card" to={`/presidents/${person.id}`} aria-label={`${person.name} 대통령 기록 보기`}>
                  <PresidentPortrait person={person} />
                  <div className="card-text">
                    <h2>{person.name}</h2>
                    <p>{formatPresidentialNumbers(person.presidentialNumbers)}</p>
                    <p>{formatRepublics(person.republics)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
          <ol className="chronology-years" aria-label="카드 순서에 따른 취임 연도">
            {presidents.map((person) => (
              <li key={person.id}>{person.terms[0].startDate.slice(0, 4)}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
