import { useState } from 'react'
import { useDelayedSkeleton } from '../hooks/useDelayedSkeleton'
import type { President } from '../types/archive'

export function PresidentPortrait({ person, loading }: { person: President; loading?: 'eager' | 'lazy' }) {
  const [unavailable, setUnavailable] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const showSkeleton = useDelayedSkeleton(!loaded && !unavailable ? person.profileImage?.path ?? null : null)
  return (
    <span className="portrait">
      {person.profileImage && !unavailable ? (
        <>
          {showSkeleton && <span className="skeleton-block skeleton-portrait" aria-hidden="true" />}
          <img src={person.profileImage.path} alt={`${person.name} 초상`} width="360" height="440" loading={loading}
            onLoad={() => setLoaded(true)} onError={() => setUnavailable(true)} />
        </>
      ) : (
        <span role="img" aria-label={`${person.name} 초상 사진 미제공`}>
          사진 준비 중
        </span>
      )}
    </span>
  )
}
