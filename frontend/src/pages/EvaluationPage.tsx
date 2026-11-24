import { Link } from 'react-router-dom'
import { Arrow } from '../components/ArchiveLayout'

const sources = [
  { label: '행정안전부 대통령기록관', description: '인물 약력, 연설문 및 대통령 기록물', url: 'https://www.pa.go.kr/portal/search/base/search.do' },
  { label: 'KOSIS 국가통계포털', description: '인구·고용 등 국가승인통계', url: 'https://kosis.kr/' },
  { label: '한국은행 ECOS', description: '성장률·물가 등 경제통계', url: 'https://ecos.bok.or.kr/' },
  { label: '공공데이터포털', description: '공공기관이 공개한 파일과 API', url: 'https://www.data.go.kr/' },
]

export function EvaluationPage() {
  return (
    <article className="inner-page evaluation">
      <Link className="back-link" to="/"><Arrow direction="left" /> 홈으로</Link>
      <h1>평가 기준 및 출처</h1>
      <p className="page-intro">공식 기록과 통계는 원문 출처를 표시하고, 제작자의 평가는 별도로 표시합니다.</p>
      <div className="evaluation-grid">
        <section>
          <h2>평가 원칙</h2>
          <p>정책과 사건의 맥락을 살펴보고, 서로 다른 관점의 근거를 함께 제시합니다. 자료가 부족한 항목은 평가를 보류합니다.</p>
          <p>현재는 공공데이터 API 연동 전으로, 재임 기간은 공식 자료에서 확인한 값입니다. 점수 산정 기준과 평가 자료는 준비 중입니다.</p>
        </section>
        <section>
          <h2>자료 출처</h2>
          <ul className="source-list">
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url}>{source.label} <Arrow /></a>
                <p>{source.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  )
}
