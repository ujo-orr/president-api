import { useLocation, useRevalidator } from 'react-router-dom'
import { useDelayedSkeleton } from '../hooks/useDelayedSkeleton'
import { HomeLoading } from '../pages/HomePage'
import { EvidenceSkeleton, PresidentPageSkeleton } from './ArchiveSkeletons'

export function ArchiveDataError() {
  const { revalidate, state } = useRevalidator()
  const { pathname } = useLocation()
  const showSkeleton = useDelayedSkeleton(state === 'loading' ? pathname : null)
  if (showSkeleton) {
    if (pathname === '/') return <HomeLoading />
    return pathname.endsWith('/evaluation-methods') ? <EvidenceSkeleton /> : <PresidentPageSkeleton />
  }

  return (
    <section className="container inner-page not-found" aria-labelledby="archive-error-heading">
      <h1 id="archive-error-heading">대통령 기록을 불러올 수 없습니다</h1>
      <p>잠시 후 다시 시도해 주세요.</p>
      <button type="button" className="primary-link" disabled={state === 'loading'}
        onClick={() => void revalidate()}>다시 시도</button>
    </section>
  )
}
