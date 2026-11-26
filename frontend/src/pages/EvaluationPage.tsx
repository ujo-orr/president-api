import { EvaluationBackLink } from '../components/EvaluationBackLink'
import { ExternalLink } from '../components/ExternalLink'
import { factSources } from '../data/presidencyFacts'
import { maximumScore, scoreAdjustmentConstant, scoreCategories } from '../data/presidencyScores'

const sources = [
  { label: '행정안전부 대통령기록관', description: '인물 약력, 연설문 및 대통령 기록물', url: 'https://www.pa.go.kr/portal/search/base/search.do' },
  { label: 'KOSIS 국가통계포털', description: '인구·고용 등 국가승인통계', url: 'https://kosis.kr/' },
  { label: '한국은행 ECOS', description: '성장률·물가 등 경제통계', url: 'https://ecos.bok.or.kr/' },
  { label: '공공데이터포털', description: '공공기관이 공개한 파일과 API', url: 'https://www.data.go.kr/' },
]

export function EvaluationPage() {
  return (
    <article className="inner-page evaluation">
      <EvaluationBackLink />
      <h1>평가 기준 및 출처</h1>
      <p className="page-intro">AI가 공공데이터와 역사적 기록을 검토해 같은 기준으로 사건의 영향과 가중치를 평가했습니다.</p>
      <div className="evaluation-grid">
        <section>
          <h2>지표 집계 기준</h2>
          <p>점수는 10 × P ÷ (P + N + K)로 계산합니다. P는 긍정 가중치 합계, N은 부정 가중치 합계, K는 여섯 분야에 공통으로 적용하는 보정 상수({scoreAdjustmentConstant})입니다. 최종 점수는 정수로 반올림합니다.</p>
          <p>평가 자료가 없는 분야는 화면에서 0점으로 표시합니다. 자료 부족에 따른 0점은 해당 분야의 실패를 의미하지 않습니다. 내부 데이터에서는 계산된 0점, 조사로 확인된 자료 부재, 미평가 상태를 구분합니다.</p>
          <p>가중치는 영향이 작은 변화에 1, 제한적이거나 단기적인 영향에 2, 특정 분야에서 유의미한 영향에 3, 광범위하거나 지속적인 영향에 4, 국가 전체 또는 헌정질서에 중대한 영향에 5를 적용합니다.</p>
          <p>안보·국방은 위협 자체와 실제 대응을 구분합니다. 국방백서의 북한 정권과 북한군 명시는 프로젝트 기준에 따라 문서 차원의 긍정 영향으로 재임 기간에 한 번만 집계합니다. 문구 삭제 자체의 감점은 없으며, 방위력과 대비태세는 별도 근거로 평가합니다.</p>
          <p>보정 상수는 긍정적 영향이 적게 기록된 분야에서 소수의 사건만으로 높은 점수가 나오는 현상을 줄입니다. 점수는 수집한 자료의 범위와 사건 해석에 따라 달라질 수 있습니다.</p>
          <ul className="fact-scale-list" aria-label="레이더 차트 평가 범위">
            {scoreCategories.map(({ id, label }) => (
              <li key={id}>{label} · 0~{maximumScore}점</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>자료 출처</h2>
          <ul className="source-list">
            {factSources.map(({ url, title }) => (
              <li key={url}><ExternalLink href={url}>{title}</ExternalLink></li>
            ))}
            {sources.map((source) => (
              <li key={source.url}>
                <ExternalLink href={source.url}>{source.label}</ExternalLink>
                <p>{source.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  )
}
