import { useEffect, useState } from 'react'

const reconnectDelay = 3_000
const messageTimeout = 35_000
const visitorIdKey = 'archive-presence-visitor-id'
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
let fallbackVisitorId: string | undefined

function createVisitorId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
}

// 동일한 브라우저 프로필과 사이트의 방문자 식별
function getVisitorId() {
  try {
    const storedId = localStorage.getItem(visitorIdKey)
    if (storedId && uuidPattern.test(storedId)) return storedId
    const visitorId = createVisitorId()
    localStorage.setItem(visitorIdKey, visitorId)
    return visitorId
  } catch {
    return fallbackVisitorId ??= createVisitorId()
  }
}

export function ArchivePresence({ hidden }: { hidden: boolean }) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const url = new URL('/ws/presence', window.location.href)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    let socket: WebSocket | undefined
    let connectedVisitorId: string | undefined
    let connectTimer: number | undefined
    let messageTimer: number | undefined

    function scheduleConnect(delay: number) {
      if (socket || connectTimer !== undefined) return
      connectTimer = window.setTimeout(() => {
        connectTimer = undefined
        connect()
      }, delay)
    }

    function connect() {
      connectedVisitorId = getVisitorId()
      url.searchParams.set('visitorId', connectedVisitorId)
      const connection = new WebSocket(url)
      socket = connection
      function reconnect() {
        if (socket !== connection) return
        disconnect()
        setCount(null)
        scheduleConnect(reconnectDelay)
      }

      function watchForMessage() {
        window.clearTimeout(messageTimer)
        messageTimer = window.setTimeout(reconnect, messageTimeout)
      }

      connection.onmessage = ({ data }) => {
        if (socket !== connection || typeof data !== 'string') return
        try {
          const message: { activeConnections?: unknown } | null = JSON.parse(data)
          const next = message?.activeConnections
          if (typeof next === 'number' && Number.isSafeInteger(next) && next >= 0) {
            setCount(next)
            watchForMessage()
          }
        } catch {
          return
        }
      }
      connection.onclose = reconnect
      watchForMessage()
    }

    // 페이지 이동 및 효과 재실행 시 연결과 타이머 정리
    function disconnect() {
      window.clearTimeout(connectTimer)
      window.clearTimeout(messageTimer)
      connectTimer = undefined
      messageTimer = undefined
      const connection = socket
      socket = undefined
      if (!connection) return
      connection.onmessage = null
      connection.onclose = null
      connection.close()
    }

    function restore(event: PageTransitionEvent) {
      if (event.persisted) {
        setCount(null)
        scheduleConnect(0)
      }
    }

    // 최초 동시 접속 시 탭 간 저장 UUID 일치
    function syncVisitorId(event: StorageEvent) {
      if (event.key !== visitorIdKey || !socket || event.newValue === connectedVisitorId) return
      disconnect()
      scheduleConnect(0)
    }

    // StrictMode의 첫 효과 정리 후 연결 시작
    scheduleConnect(0)
    window.addEventListener('pagehide', disconnect)
    window.addEventListener('pageshow', restore)
    window.addEventListener('storage', syncVisitorId)
    return () => {
      window.removeEventListener('pagehide', disconnect)
      window.removeEventListener('pageshow', restore)
      window.removeEventListener('storage', syncVisitorId)
      disconnect()
    }
  }, [])

  if (hidden) return null
  return <p className="archive-presence" title="같은 브라우저 프로필에서 열려 있는 탭은 한 명으로 집계됩니다.">
    실시간 접속자 {count === null ? '–' : <><strong>{count.toLocaleString('ko-KR')}</strong>명</>}
  </p>
}
