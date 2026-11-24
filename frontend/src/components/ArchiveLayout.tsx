import { useEffect, useRef } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

export const archiveNotice = '해당 웹 페이지는 공공데이터를 최대한 활용하였으나, 점수를 매기는 과정에서 제작자의 주관이 들어갑니다.'

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

export function ArchiveLayout() {
  const { pathname, hash } = useLocation()
  const previousPath = useRef(pathname)
  const main = useRef<HTMLElement>(null)

  // 경로 전환 시 본문 초점과 연대기 앵커 처리
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      target?.focus({ preventScroll: true })
      target?.scrollIntoView({ block: 'start' })
    } else if (previousPath.current !== pathname) {
      window.scrollTo(0, 0)
      main.current?.focus({ preventScroll: true })
    }
    previousPath.current = pathname
  }, [hash, pathname])

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">본문 바로가기</a>
      <header className="site-header container">
        <Link className="brand" to="/" aria-label="대통령 아카이브 홈">
          <ArchiveMark />
          <span>대통령 아카이브</span>
        </Link>
        <nav className="site-nav" aria-label="주 메뉴">
          <Link to="/#chronology">대통령 연대기</Link>
          <Link to="/evaluation-methods" aria-current={pathname === '/evaluation-methods' ? 'page' : undefined}>
            평가 기준·출처
          </Link>
        </nav>
      </header>
      <main className="container site-main" id="main" ref={main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer container">
        <p>{archiveNotice}</p>
        <Link to="/evaluation-methods">평가 기준 및 출처</Link>
      </footer>
    </div>
  )
}
