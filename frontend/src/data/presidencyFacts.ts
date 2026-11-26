import type { PresidentialTerm } from '../types/archive'
import { annualObservations } from './annualObservations'

const electionSource = 'https://museum.nec.go.kr/museum2018/bbs/2/3/1/20170912155756377100_list.do?article_category=3'
const electionTurnoutSource = 'https://img.nec.go.kr/common/board/Download.do?bcIdx=15330&cbIdx=1132&streFileNm=BBS_201701110807575650.pdf'

export const factSources = [
  { title: '세계은행 1인당 실질 GDP', url: 'https://data.worldbank.org/indicator/NY.GDP.PCAP.KD?locations=KR' },
  { title: '세계은행 무역 비중', url: 'https://data.worldbank.org/indicator/NE.TRD.GNFS.ZS?locations=KR' },
  { title: '세계은행 실업률', url: 'https://data.worldbank.org/indicator/SL.UEM.TOTL.NE.ZS?locations=KR' },
  { title: '국방부 국방예산 추이', url: 'https://www.mnd.go.kr/mnd/193/subview.do' },
  { title: '중앙선관위 국회의원선거 기록', url: electionSource },
  { title: '중앙선관위 1~20대 총선 투표율', url: electionTurnoutSource },
  { title: '유네스코 한국 세계유산 목록', url: 'https://whc.unesco.org/en/statesparties/kr' },
] as const

export const factMetrics = [
  { id: 'economy', category: '경제', name: '1인당 실질 GDP', unit: '달러', maximum: 40_000, decimals: 0, column: 1 },
  { id: 'trade', category: '대외관계', name: 'GDP 대비 수출입 비중', unit: '%', maximum: 120, decimals: 2, column: 2 },
  { id: 'labor', category: '노동·사회정책', name: '실업률', unit: '%', maximum: 8, decimals: 2, column: 3 },
  { id: 'defense', category: '안보·국방', name: 'GDP 대비 국방비', unit: '%', maximum: 6, decimals: 2, column: 4 },
  { id: 'turnout', category: '민주주의·법치', name: '국회의원선거 전국 투표율', unit: '%', maximum: 100, decimals: 2 },
  { id: 'heritage', category: '문화 발전', name: '유네스코 세계유산 신규 등재', unit: '건/년', maximum: 3, decimals: 2 },
] as const

export interface FactObservation {
  metric: typeof factMetrics[number]
  value: number | null
  period: string
}

// 중앙선관위 선거일과 전국 투표율
const electionTurnout = [
  ['1948-05-10', 95.5], ['1950-05-30', 91.9], ['1954-05-20', 91.1], ['1958-05-02', 87.8],
  ['1960-07-29', 84.3], ['1963-11-26', 72.1], ['1967-06-08', 76.1], ['1971-05-25', 73.2],
  ['1973-02-27', 71.4], ['1978-12-12', 77.1], ['1981-03-25', 77.7], ['1985-02-12', 84.6],
  ['1988-04-26', 75.8], ['1992-03-24', 71.9], ['1996-04-11', 63.9], ['2000-04-13', 57.2],
  ['2004-04-15', 60.6], ['2008-04-09', 46.1], ['2012-04-11', 54.2], ['2016-04-13', 58.0],
  ['2020-04-15', 66.2], ['2024-04-10', 67.0],
] as const

// 유네스코 세계유산 최초 등재 건수
const newHeritageByYear: Readonly<Record<number, number>> = {
  1995: 3, 1997: 2, 2000: 2, 2007: 1, 2009: 1, 2010: 1, 2014: 1, 2015: 1,
  2018: 1, 2019: 1, 2021: 1, 2023: 1,
}

function mean(values: readonly number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function yearCoverage(years: readonly number[]) {
  const ranges: string[] = []
  let first = years[0]
  for (const [index, year] of years.entries()) {
    if (years[index + 1] === year + 1) continue
    ranges.push(first === year ? String(year) : `${first}–${year}`)
    first = years[index + 1]
  }
  return ranges.join(', ') + '년'
}

export function getPresidencyFacts(terms: readonly PresidentialTerm[]): FactObservation[] {
  const completeYears = new Set<number>()
  for (const { startDate, endDate } of terms) {
    for (let year = Number(startDate.slice(0, 4)) + 1; year < Number(endDate.slice(0, 4)); year++) {
      completeYears.add(year)
    }
  }
  const coveredAnnualRows = annualObservations.filter(([year]) => completeYears.has(year))
  const noAnnualValue = completeYears.size ? '해당 기간 공개값 없음' : '온전히 재임한 달력연도 없음'

  return factMetrics.map((metric): FactObservation => {
    if ('column' in metric) {
      const observations = coveredAnnualRows.flatMap((row) => {
        const value = row[metric.column]
        return value === null ? [] : [{ year: row[0], value }]
      })
      if (!observations.length) return { metric, value: null, period: noAnnualValue }
      const years = yearCoverage(observations.map(({ year }) => year))
      return { metric, value: mean(observations.map(({ value }) => value)), period: `${years} · ${observations.length}/${completeYears.size}개 연도` }
    }

    if (metric.id === 'turnout') {
      const elections = electionTurnout.filter(([date]) => {
        const month = date.slice(0, 7)
        return terms.some(({ startDate, endDate }) => startDate <= month && month <= endDate)
      })
      if (!elections.length) return { metric, value: null, period: '재임 중 국회의원선거 없음' }
      return {
        metric,
        value: mean(elections.map(([, turnout]) => turnout)),
        period: `${elections.map(([date]) => date.slice(0, 4)).join('·')}년 · ${elections.length}회`,
      }
    }

    const years = [...completeYears].filter((year) => year >= 1989 && year <= 2024).sort((a, b) => a - b)
    if (!years.length) return {
      metric,
      value: null,
      period: completeYears.size ? '세계유산협약 수락 후 적용 연도 없음' : noAnnualValue,
    }
    const count = years.reduce((total, year) => total + (newHeritageByYear[year] ?? 0), 0)
    return { metric, value: count / years.length, period: `${yearCoverage(years)} · ${count}건 / ${years.length}년` }
  })
}

export function formatFactValue(value: number, metric: FactObservation['metric']) {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: metric.decimals }).format(value) + metric.unit
}
