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
    republics: [1],
    profileImage: {
      path: '/images/syngman-rhee.jpg',
      source: {
        id: 'portrait-rhee',
        organization: '대한민국 국가기록원',
        title: '이승만 대통령 초상 사진',
        originalUrl: 'https://commons.wikimedia.org/wiki/File:Rhee_Syng-Man_in_1948.jpg',
        verifiedAt: '2026-11-25',
      },
      license: { name: '공공누리 제1유형', url: 'https://www.kogl.or.kr/info/licenseType1.do' },
    },
    representativeQuote: null,
    terms: [{ id: 'rhee-1948', presidentId: 'syngman-rhee', startDate: '1948-07', endDate: '1960-04' }],
    sources: [biography('01', '제1~3대 이승만 약력')],
  },
  {
    id: 'yun-po-sun',
    name: '윤보선',
    presidentialNumbers: [4],
    republics: [2],
    profileImage: {
      path: '/images/yun-po-sun.jpg',
      source: {
        id: 'portrait-yun',
        organization: 'Wikimedia Commons (촬영자 미상)',
        title: '윤보선 대통령 초상 사진',
        originalUrl: 'https://commons.wikimedia.org/wiki/File:Yun_Bo-seon.jpg',
        verifiedAt: '2026-11-25',
      },
      license: { name: '퍼블릭 도메인', url: 'https://commons.wikimedia.org/wiki/File:Yun_Bo-seon.jpg#Licensing' },
    },
    representativeQuote: null,
    terms: [{ id: 'yun-1960', presidentId: 'yun-po-sun', startDate: '1960-08', endDate: '1962-03' }],
    sources: [biography('04', '제4대 윤보선 약력')],
  },
  {
    id: 'park-chung-hee',
    name: '박정희',
    presidentialNumbers: [5, 6, 7, 8, 9],
    republics: [3, 4],
    profileImage: {
      path: '/images/park-chung-hee.jpg',
      source: {
        id: 'portrait-park',
        organization: 'Korea.net / 해외문화홍보원',
        title: '박정희 대통령 초상 사진 (3×4)',
        originalUrl: 'https://commons.wikimedia.org/wiki/File:Park_Chung_Hee_(%EB%B0%95%EC%A0%95%ED%9D%AC)_Presidential_Portrait_(3x4).jpg',
        verifiedAt: '2026-11-25',
      },
      license: { name: 'CC BY-SA 2.0', url: 'https://creativecommons.org/licenses/by-sa/2.0/' },
    },
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

export function formatRepublics([start, end = start]: President['republics']) {
  return start === end ? `제${start}공화국` : `제${start}공화국 ~ 제${end}공화국`
}

export function formatTermMonth(date: string) {
  const [year, month] = date.split('-')
  return `${year}년 ${Number(month)}월`
}
