import { useRevalidator } from 'react-router-dom'

export function ArchiveLoading() {
  return <p className="container inner-page" role="status">대통령 기록을 불러오는 중입니다.</p>
}

export function ArchiveDataError() {
  const { revalidate, state } = useRevalidator()

  return (
    <section className="container inner-page not-found" aria-labelledby="archive-error-heading">
      <h1 id="archive-error-heading">대통령 기록을 불러올 수 없습니다</h1>
      <p>잠시 후 다시 시도해 주세요.</p>
      <button type="button" className="primary-link" disabled={state === 'loading'}
        onClick={() => void revalidate()}>다시 시도</button>
    </section>
  )
}
