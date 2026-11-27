import { Link } from 'react-router-dom'
import { getPresidencyScores, maximumScore, scoreAdjustmentConstant } from '../data/presidencyScores'
import type { RadarScore } from '../data/presidencyScores'
import { useChartReveal } from '../hooks/useChartReveal'
import { Arrow } from './ArchiveLayout'

const center = { x: 210, y: 163 }
const radius = 102
const rings = [0.25, 0.5, 0.75, 1]
type DisplayScore = RadarScore & { score: number }

function position(index: number, distance: number) {
  const angle = index * Math.PI / 3
  return { x: center.x + Math.sin(angle) * distance, y: center.y - Math.cos(angle) * distance }
}

function RadarChart({ scores }: { scores: DisplayScore[] }) {
  const points = scores.map(({ score }, index) => position(index, radius * score / maximumScore))

  return (
    <svg className="presidency-radar" viewBox="0 0 420 330" role="img" aria-labelledby="presidency-radar-title presidency-radar-description">
      <title id="presidency-radar-title">재임 기간 6개 지표 레이더 차트</title>
      <desc id="presidency-radar-description">중심은 0점, 외곽은 10점입니다. 표시된 점수는 분야별 점수 목록에서도 확인할 수 있습니다.</desc>
      <g className="radar-grid">
        {rings.map((ring) => (
          <polygon key={ring} points={scores.map((_, index) => {
            const { x, y } = position(index, radius * ring)
            return `${x},${y}`
          }).join(' ')} />
        ))}
        {scores.map(({ id }, index) => {
          const edge = position(index, radius)
          return <line key={id} x1={center.x} y1={center.y} x2={edge.x} y2={edge.y} />
        })}
      </g>
      <g className="radar-values" style={{ transformOrigin: `${center.x}px ${center.y}px` }}>
        <polygon className="radar-area" points={points.map(({ x, y }) => `${x},${y}`).join(' ')} />
        {points.map(({ x, y }, index) => <circle className="radar-point" key={scores[index].id} cx={x} cy={y} r={4} />)}
      </g>
      {scores.map(({ id, label, score }, index) => {
        const anchor = position(index, 131)
        return (
          <text key={id} className="radar-label" x={anchor.x} y={anchor.y} textAnchor="middle">
            {label}
            <tspan className="radar-label-value" x={anchor.x} dy={17}>{score}점</tspan>
          </text>
        )
      })}
    </svg>
  )
}

export function PresidencyIndicators({ presidentId }: { presidentId: string }) {
  const chartRef = useChartReveal<HTMLElement>('.presidency-radar', presidentId)
  const scores = getPresidencyScores(presidentId).map((axis) => ({ ...axis, score: axis.score ?? 0 }))

  return (
    <div className="details-middle presidency-indicators">
      <section ref={chartRef} className="detail-panel" aria-labelledby="presidency-facts-heading">
        <h2 id="presidency-facts-heading">재임 기간 지표</h2>
        <RadarChart scores={scores} />
        <p>AI가 평가한 역사적 사건의 긍정·부정 가중치와 보정 상수 {scoreAdjustmentConstant}를 적용해 0~10점으로 환산했습니다. 자료가 없어 표시된 0점은 해당 분야의 실패를 의미하지 않습니다.</p>
      </section>
      <section className="detail-panel" aria-labelledby="presidency-counts-heading">
        <h2 id="presidency-counts-heading">분야별 점수</h2>
        <ul className="presidency-score-list">
          {scores.map(({ id, label, score }) => (
            <li key={id}>
              <span>{label}</span>
              <strong>{score}점</strong>
            </li>
          ))}
        </ul>
        <Link to={`/presidents/${presidentId}/evaluation-methods`} state={{ fromArchive: true }}>평가 기준 보기 <Arrow /></Link>
      </section>
    </div>
  )
}
