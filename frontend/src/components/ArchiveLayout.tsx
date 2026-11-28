import { useEffect, useRef } from 'react'
import { Link, matchPath, Outlet, useLocation, useRouteLoaderData, useViewTransitionState, type Location } from 'react-router-dom'
import type { loadPresident } from '../data/presidentApi'
import { useDelayedSkeleton } from '../hooks/useDelayedSkeleton'
import { ChronologySkeleton, EvidenceSkeleton, PresidentPageSkeleton } from './ArchiveSkeletons'
import { ArchivePresence } from './ArchivePresence'
import { PresidentSources } from './PresidentSources'

export const archiveNotice = '본 웹 페이지의 평가는 공공데이터와 역사적 기록을 바탕으로 AI를 활용하여 산출하였으며, 평가 기준과 자료의 선정에 따라 해석이 달라질 수 있습니다.'

export function Arrow({ direction = 'right' }: { direction?: 'right' | 'down' | 'left' }) {
  return (
    <svg className={`arrow arrow--${direction}`} width="22" height="22" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth="1.5" fill="none" aria-hidden="true">
      <path d="M3.5 12h16m-6-6 6 6-6 6" />
    </svg>
  )
}

function ArchiveMark() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="currentColor"
      strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="24" cy="24" r="22.5" />
      <path d="M7 33h34M10 30.5h28M11 30.5v-7h26v7M16 30.5v-7m5 7v-7m6 7v-7m5 7v-7M8 23.5c4-.65 7-2.5 9-5.5h14c2 3 5 4.85 9 5.5H8Zm6-5.5c3-.6 5-2.1 6-4h8c1 1.9 3 3.4 6 4H14Z" />
    </svg>
  )
}

export function ArchiveHeader({ activePage, isPresidentDetail }: {
  activePage?: 'chronology' | 'evaluation'
  isPresidentDetail?: boolean
}) {
  const supportsTransitions = typeof document.startViewTransition === 'function'
  const animateToChronology = supportsTransitions && (isPresidentDetail || activePage === 'evaluation')

  return (
    <header className="site-header container">
      <Link className="brand" to="/#chronology" viewTransition={animateToChronology} aria-label="대통령 아카이브 홈">
        <ArchiveMark />
        <span>대통령 아카이브</span>
      </Link>
      <nav className="site-nav" aria-label="주 메뉴">
        <Link to="/#chronology" viewTransition={animateToChronology} aria-current={activePage === 'chronology' ? 'page' : undefined}>대통령 연대기</Link>
        <Link to="/evaluation-methods" state={{ fromArchive: true }}
          viewTransition={supportsTransitions && activePage === 'chronology'}
          aria-current={activePage === 'evaluation' ? 'page' : undefined}>
          평가 기준·출처
        </Link>
      </nav>
    </header>
  )
}

export function ArchiveLayout({ pendingLocation }: { pendingLocation: Location | undefined }) {
  const { pathname, hash } = useLocation()
  const destination = pendingLocation?.pathname
  const pendingRequest = destination !== pathname ? pendingLocation?.key ?? null : null
  const showPendingSkeleton = useDelayedSkeleton(pendingRequest)
  const PendingSkeleton = showPendingSkeleton && destination
    ? destination === '/' ? ChronologySkeleton
      : matchPath('/presidents/:id/evaluation-methods', destination) ? EvidenceSkeleton
        : matchPath('/presidents/:id', destination) ? PresidentPageSkeleton : null
    : null
  const president = useRouteLoaderData<typeof loadPresident>('president')?.person
  const isHome = pathname === '/'
  const isChronology = isHome && hash === '#chronology'
  const isEvaluation = pathname === '/evaluation-methods'
  const transitioningChronology = useViewTransitionState('/#chronology')
  const transitioningEvaluation = useViewTransitionState('/evaluation-methods')
  const pageSlide = transitioningChronology && transitioningEvaluation
    ? isChronology ? 'left' : 'right'
    : undefined
  const previousPath = useRef(pathname)
  const wasChronology = useRef(isChronology)
  const main = useRef<HTMLElement>(null)
  const chronologyPosition = useRef(0)

  // 경로 전환 시 본문 초점과 연대기 앵커 처리
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      target?.focus({ preventScroll: true })
      if (isChronology) window.scrollTo(0, 0)
      else target?.scrollIntoView({ block: 'start' })
    } else if (previousPath.current !== pathname || wasChronology.current) {
      window.scrollTo(0, 0)
      main.current?.focus({ preventScroll: true })
    }
    previousPath.current = pathname
    wasChronology.current = isChronology
  }, [hash, pathname, isChronology])

  return (
    <div className={isHome ? 'site-shell site-shell--home' : 'site-shell'} data-page-slide={pageSlide}>
      <a className="skip-link" href="#main" onClick={(event) => {
        if (!isHome) return
        event.preventDefault()
        main.current?.focus({ preventScroll: true })
      }}>본문 바로가기</a>
      {!isHome && <ArchiveHeader activePage={isEvaluation ? 'evaluation' : undefined} isPresidentDetail={Boolean(president)} />}
      <main className={isHome ? 'site-main site-main--home' : 'container site-main'} id="main" ref={main} tabIndex={-1}>
        <div className="archive-route-content" inert={Boolean(PendingSkeleton)}>
          <Outlet context={chronologyPosition} />
        </div>
        {PendingSkeleton && <div className="archive-route-pending"><PendingSkeleton /></div>}
      </main>
      <footer className="site-footer container">
        <div className="site-footer-copy">
          <div className="site-footer-row">
            <p>{archiveNotice}</p>
            <ArchivePresence hidden={isHome && !isChronology} />
          </div>
          {president && <PresidentSources person={president} />}
        </div>
      </footer>
    </div>
  )
}
