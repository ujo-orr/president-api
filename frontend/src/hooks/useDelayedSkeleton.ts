import { useEffect, useState } from 'react'

export const SKELETON_DELAY_MS = 300

export function useDelayedSkeleton(requestKey: string | number | null) {
  const [delay, setDelay] = useState({ requestKey, elapsed: false })

  // 요청 전환 시 이전 표시 상태 초기화
  if (delay.requestKey !== requestKey) setDelay({ requestKey, elapsed: false })

  useEffect(() => {
    if (requestKey === null) return

    const timer = window.setTimeout(() => {
      setDelay((current) => current.requestKey === requestKey ? { requestKey, elapsed: true } : current)
    }, SKELETON_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [requestKey])

  return delay.requestKey === requestKey && delay.elapsed
}
