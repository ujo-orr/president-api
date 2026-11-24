import type { DataSource, President } from '../types/archive'

function biography(page: string, title: string): DataSource {
  return {
    id: `biography-${page}`,
    organization: '행정안전부 대통령기록관',
    title,
    originalUrl: `https://www.pa.go.kr/online_contents/president/history${page}.jsp`,
    verifiedAt: '2026-11-24',
  }
}

const profiles: President[] = [
  {
    id: 'syngman-rhee',
    name: '이승만',
    presidentialNumbers: [1, 2, 3],
    profileImage: null,
    representativeQuote: null,
    terms: [{ id: 'rhee-1948', presidentId: 'syngman-rhee', startDate: '1948-07', endDate: '1960-04' }],
    sources: [biography('01', '제1~3대 이승만 약력')],
  },
  {
    id: 'yun-po-sun',
    name: '윤보선',
    presidentialNumbers: [4],
    profileImage: null,
    representativeQuote: null,
    terms: [{ id: 'yun-1960', presidentId: 'yun-po-sun', startDate: '1960-08', endDate: '1962-03' }],
    sources: [biography('04', '제4대 윤보선 약력')],
  },
  {
    id: 'park-chung-hee',
    name: '박정희',
    presidentialNumbers: [5, 6, 7, 8, 9],
    profileImage: null,
    representativeQuote: null,
    terms: [{ id: 'park-1963', presidentId: 'park-chung-hee', startDate: '1963-12', endDate: '1979-10' }],
    sources: [biography('05', '제5~9대 박정희 약력')],
  },
]

export const presidents = [...profiles].sort(
  (first, second) => first.terms[0].startDate.localeCompare(second.terms[0].startDate),
)

export function formatPresidentialNumbers(numbers: number[]) {
  const first = numbers[0]
  const last = numbers.at(-1)
  return first === last ? `제${first}대` : `제${first}–${last}대`
}

export function formatTermYears(president: President) {
  return `${president.terms[0].startDate.slice(0, 4)}–${president.terms.at(-1)?.endDate.slice(0, 4)}`
}

export function formatTermMonth(date: string) {
  const [year, month] = date.split('-')
  return `${year}년 ${Number(month)}월`
}
