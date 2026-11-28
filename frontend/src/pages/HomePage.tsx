import type { ReactNode } from 'react'
import { Link, useLoaderData, useLocation } from 'react-router-dom'
import { ArchiveHeader, Arrow } from '../components/ArchiveLayout'
import { ChronologySkeleton, DelayedSkeleton } from '../components/ArchiveSkeletons'
import { PresidentChronology } from '../components/PresidentChronology'
import { TaegeukgiBackdrop } from '../components/TaegeukgiBackdrop'
import type { loadChronology } from '../data/presidentApi'

function HomeScreens({ children }: { children: ReactNode }) {
  const { hash } = useLocation()
  const isChronology = hash === '#chronology'

  return (
    <div className="home-screens" data-screen={isChronology ? 'chronology' : 'intro'}>
      <section className="home-screen hero" aria-labelledby="home-title" inert={isChronology}>
        <TaegeukgiBackdrop />
        <div className="hero-content">
          <h1 id="home-title">대한민국 역대 대통령<span>데이터 아카이브</span></h1>
          <p>재임 기록과 주요 사건으로 대한민국 현대사를 살펴봅니다.</p>
          <Link className="primary-link" to="/#chronology">시작하기 <Arrow /></Link>
        </div>
      </section>
      <div className="home-screen home-screen--chronology" inert={!isChronology}>
        <ArchiveHeader activePage="chronology" />
        {children}
      </div>
    </div>
  )
}

export function HomePage() {
  const presidents = useLoaderData<typeof loadChronology>()
  return <HomeScreens><PresidentChronology presidents={presidents} /></HomeScreens>
}

export function HomeLoading({ delayed = false }: { delayed?: boolean }) {
  const skeleton = <ChronologySkeleton />
  return <HomeScreens>{delayed ? <DelayedSkeleton>{skeleton}</DelayedSkeleton> : skeleton}</HomeScreens>
}
