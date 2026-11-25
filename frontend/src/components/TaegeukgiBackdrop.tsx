import { useEffect, useRef } from 'react'

const flagWidth = 900
const flagHeight = 600
const radius = flagHeight / 4
const diagonal = Math.atan2(flagHeight, flagWidth)
const trigrams = [
  { angle: diagonal + Math.PI, splitBars: [false, false, false] },
  { angle: -diagonal, splitBars: [true, false, true] },
  { angle: Math.PI - diagonal, splitBars: [false, true, false] },
  { angle: diagonal, splitBars: [true, true, true] },
]

function drawFlag(context: CanvasRenderingContext2D, width: number, height: number) {
  const scale = Math.min(width / flagWidth, height / flagHeight)
  context.save()
  context.translate(width / 2, height / 2)
  context.scale(scale, scale)

  // 태극과 괘의 대각선 작도
  context.save()
  context.rotate(diagonal)
  context.fillStyle = '#cd2e3a'
  context.beginPath()
  context.arc(0, 0, radius, 0, 2 * Math.PI)
  context.fill()
  context.fillStyle = '#0047a0'
  context.beginPath()
  context.arc(0, 0, radius, Math.PI, 0, true)
  context.arc(radius / 2, 0, radius / 2, 0, Math.PI, true)
  context.arc(-radius / 2, 0, radius / 2, 0, Math.PI)
  context.closePath()
  context.fill()
  context.restore()

  context.fillStyle = '#000'
  const barHeight = radius / 6
  const gap = barHeight / 2
  const depth = 3 * barHeight + 2 * gap
  const distance = 1.5 * radius + depth / 2
  const halfBar = (radius - gap) / 2

  for (const { angle, splitBars } of trigrams) {
    context.save()
    context.rotate(angle)
    context.translate(distance, 0)
    context.rotate(Math.PI / 2)
    splitBars.forEach((isSplit, row) => {
      const y = row * (barHeight + gap) - depth / 2
      context.fillRect(-radius / 2, y, isSplit ? halfBar : radius, barHeight)
      if (isSplit) context.fillRect(gap / 2, y, halfBar, barHeight)
    })
    context.restore()
  }
  context.restore()
}

function drawFade(context: CanvasRenderingContext2D, width: number, height: number) {
  // 지정 좌표를 기준으로 한 흰 레이어의 ease-in
  const gradient = context.createLinearGradient(.067 * width, .173 * height, .892 * width, .828 * height)
  const steps = 64
  for (let step = 0; step <= steps; step++) {
    const progress = step / steps
    const opacity = 0.92 + 0.08 * (1 - progress) ** 0.5
    gradient.addColorStop(progress, `rgba(255, 255, 255, ${opacity})`)
  }
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
}

export function TaegeukgiBackdrop() {
  const backdrop = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = backdrop.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const observer = new ResizeObserver(([entry]) => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.round(entry.contentRect.width * pixelRatio)
      const height = Math.round(entry.contentRect.height * pixelRatio)
      if (!width || !height) return

      canvas.width = width
      canvas.height = height
      drawFlag(context, width, height)
      drawFade(context, width, height)
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  return <canvas className="hero-backdrop" ref={backdrop} aria-hidden="true" />
}
