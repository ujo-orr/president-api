import { useState } from 'react'
import type { President } from '../types/archive'

export function PresidentPortrait({ person }: { person: President }) {
  const [unavailable, setUnavailable] = useState(false)
  return (
    <span className="portrait">
      {person.profileImage && !unavailable ? (
        <img src={person.profileImage.path} alt={`${person.name} 초상`} width="360" height="440"
          onError={() => setUnavailable(true)} />
      ) : (
        <span role="img" aria-label={`${person.name} 초상 사진 미제공`}>
          사진 준비 중
        </span>
      )}
    </span>
  )
}
