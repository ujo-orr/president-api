import type { ReactNode } from 'react'

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <span>{children}</span>
      <span className="external-link-icon" aria-hidden="true">↗</span>
      <span className="visually-hidden"> (새 탭에서 열기)</span>
    </a>
  )
}
