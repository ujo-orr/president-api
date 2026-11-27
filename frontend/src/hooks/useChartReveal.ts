import { useLayoutEffect, useRef } from 'react'

export function useChartReveal<T extends Element>(selector: string, dataKey?: string) {
  const containerRef = useRef<T>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || typeof IntersectionObserver === 'undefined') return

    const targets = container.querySelectorAll(selector)
    const threshold = 0.25
    const observer = new IntersectionObserver((entries) => {
      for (const { target, intersectionRatio } of entries) {
        if (intersectionRatio < threshold) continue
        observer.unobserve(target)
        if (target.getAttribute('data-chart-reveal') === 'pending') {
          target.setAttribute('data-chart-reveal', 'playing')
        }
      }
    }, { threshold })

    for (const target of targets) {
      target.setAttribute('data-chart-reveal', 'pending')
      observer.observe(target)
    }
    return () => {
      observer.disconnect()
      for (const target of targets) target.removeAttribute('data-chart-reveal')
    }
  }, [selector, dataKey])

  return containerRef
}
