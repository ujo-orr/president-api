import { useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent, RefObject } from 'react'
import { NavLink, useOutletContext } from 'react-router-dom'
import { formatPresidentialNumbers, formatRepublics, presidents } from '../data/presidents'
import { PresidentPortrait } from './PresidentPortrait'

export function PresidentChronology() {
  const section = useRef<HTMLElement>(null)
  const scrollRegion = useRef<HTMLDivElement>(null)
  const progressBar = useRef<HTMLProgressElement>(null)
  const scrollPosition = useOutletContext<RefObject<number>>()

  useLayoutEffect(() => {
    const chronology = section.current
    const rail = scrollRegion.current
    const progress = progressBar.current
    if (!chronology || !rail || !progress) return

    // 화면 폭 변화에 대응하는 가로 위치 비율 복원
    rail.scrollLeft = scrollPosition.current * (rail.scrollWidth - rail.clientWidth)

    // 이동 가능한 구간에서만 세로 휠을 가로 이동으로 전환
    const moveTrack = (event: WheelEvent) => {
      if (!event.cancelable || event.ctrlKey || event.shiftKey) return
      const mode = event.deltaMode
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      const distance = mode === 1 ? 16 : mode === 2 ? rail.clientWidth : 1
      const maxOffset = rail.scrollWidth - rail.clientWidth
      const next = Math.min(maxOffset, Math.max(0, rail.scrollLeft + event.deltaY * distance))
      if (Math.abs(next - rail.scrollLeft) < 1) return

      event.preventDefault()
      rail.scrollLeft = next
    }

    const updateProgress = () => {
      const maxOffset = rail.scrollWidth - rail.clientWidth
      progress.value = maxOffset > 0 ? Math.round(100 * rail.scrollLeft / maxOffset) : 100
    }

    chronology.addEventListener('wheel', moveTrack, { passive: false })
    rail.addEventListener('scroll', updateProgress, { passive: true })
    const observer = new ResizeObserver(updateProgress)
    observer.observe(rail)
    if (rail.firstElementChild) observer.observe(rail.firstElementChild)
    updateProgress()

    return () => {
      const maxOffset = rail.scrollWidth - rail.clientWidth
      if (maxOffset > 0) scrollPosition.current = rail.scrollLeft / maxOffset
      chronology.removeEventListener('wheel', moveTrack)
      rail.removeEventListener('scroll', updateProgress)
      observer.disconnect()
    }
  }, [scrollPosition])

  function navigateTrack(event: KeyboardEvent<HTMLElement>) {
    const rail = scrollRegion.current
    if (!rail || (event.target !== event.currentTarget && event.target !== rail)) return
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

    switch (event.key) {
      case 'Home':
      case 'End':
        rail.scrollLeft = event.key === 'Home' ? 0 : rail.scrollWidth - rail.clientWidth
        break
      case 'ArrowLeft':
      case 'ArrowRight': {
        const [first, second] = rail.querySelectorAll<HTMLElement>('.president-cards > li')
        const step = first && second ? second.offsetLeft - first.offsetLeft : rail.clientWidth
        rail.scrollLeft += event.key === 'ArrowRight' ? step : -step
        break
      }
      default:
        return
    }
    event.preventDefault()
  }

  return (
    <section className="chronology container" id="chronology" aria-label="대통령 연대기" tabIndex={-1} ref={section}
      onKeyDown={navigateTrack}>
      <div className="chronology-navigation">
        <div className="chronology-scroll" role="region" tabIndex={0} aria-label="취임 순서대로 나열한 대통령 카드"
          aria-keyshortcuts="ArrowLeft ArrowRight Home End" ref={scrollRegion}>
          <div className="chronology-track">
            <ol className="president-cards">
              {presidents.map((person, index) => (
                <li key={person.id}>
                  <NavLink className="president-card" to={`/presidents/${person.id}`} viewTransition={typeof document.startViewTransition === 'function'}
                    aria-label={`${person.name} 대통령 기록 보기`}>
                    <PresidentPortrait person={person} loading={index < 3 ? 'eager' : 'lazy'} />
                    <div className="card-text">
                      <h2>{person.name}</h2>
                      <p>{formatPresidentialNumbers(person.presidentialNumbers)}</p>
                      <p>{formatRepublics(person.republics)}</p>
                    </div>
                  </NavLink>
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
        <progress className="chronology-progress" max={100} value={0} aria-label="연대기 탐색 진행도" ref={progressBar} />
      </div>
    </section>
  )
}
