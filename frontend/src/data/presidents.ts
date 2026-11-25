import type { DataSource, President } from '../types/archive'

function biography(page: string, title: string): DataSource {
  return {
    id: `biography-${page}`,
    organization: '행정안전부 대통령기록관',
    title,
    originalUrl: `https://www.pa.go.kr/online_contents/president/history${page}.jsp`,
    verifiedAt: '2026-11-25',
  }
}

const archivesPortrait = {
  organization: '대한민국 국가기록원',
  license: { name: '공공누리 제1유형', url: 'https://www.kogl.or.kr/info/licenseType1.do' },
}

const koreaNetPortrait = {
  organization: 'Korea.net / 해외문화홍보원',
  license: { name: 'CC BY-SA 2.0', url: 'https://creativecommons.org/licenses/by-sa/2.0/' },
}

function commonsPortrait(file: string, name: string, sourceFile: string, attribution = archivesPortrait): NonNullable<President['profileImage']> {
  return {
    path: `/images/${file}`,
    source: {
      id: `portrait-${file.split('.')[0]}`,
      organization: attribution.organization,
      title: `${name} 대통령 초상 사진`,
      originalUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(sourceFile)}`,
      verifiedAt: '2026-11-25',
    },
    license: attribution.license,
  }
}

function speech(presidentId: string, text: string, title: string, originalUrl: string, organization = '행정안전부 대통령기록관'): NonNullable<President['representativeQuote']> {
  return {
    text,
    kind: 'speech',
    source: { id: `speech-${presidentId}`, organization, title, originalUrl, verifiedAt: '2026-11-25' },
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
    representativeQuote: speech(
      'syngman-rhee', '여러분이 나에게 맡기는 직책은 누구나 한사람의 힘으로 성공할 수는 없는 것입니다.',
      '초대 대통령 취임사', 'https://www.pa.go.kr/research/contents/speech/index.jsp?artid=1310440&catid=c_pa02062&spMode=view',
    ),
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
    representativeQuote: speech(
      'yun-po-sun', '우리는 새로운 외교정책과 새로운 외교체제를 갖추어 새로운 외교활동을 재출발하여야 하겠습니다.',
      '제4대 대통령 취임사', 'https://www.pa.go.kr/online_contents/inauguration/president04.jsp',
    ),
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
    representativeQuote: speech(
      'park-chung-hee', '국헌을 준수하고 나의 신명을 조국과 민족앞에 바칠 것을 맹서하면서',
      '제5대 대통령 취임사', 'https://www.pa.go.kr/research/contents/speech/index.jsp?artid=1305368&catid=c_pa02062&spMode=view',
    ),
    terms: [{ id: 'park-1963', presidentId: 'park-chung-hee', startDate: '1963-12', endDate: '1979-10' }],
    sources: [biography('05', '제5~9대 박정희 약력')],
  },
  {
    id: 'choi-kyu-hah',
    name: '최규하',
    presidentialNumbers: [10],
    republics: [4],
    profileImage: commonsPortrait('choi-kyu-hah.jpg', '최규하', 'Presidents_of_the_Republic_Of_Korea_(4261836786)_Choi.jpg', koreaNetPortrait),
    representativeQuote: speech(
      'choi-kyu-hah', '국민 각계각층의 광범위한 의견을 듣기 위하여 그들과의 대화를 폭넓게 갖고자 하며',
      '제10대 대통령 취임사', 'https://www.pa.go.kr/online_contents/inauguration/president10.jsp',
    ),
    terms: [{ id: 'choi-1979', presidentId: 'choi-kyu-hah', startDate: '1979-12', endDate: '1980-08' }],
    sources: [biography('10', '제10대 최규하 약력')],
  },
  {
    id: 'chun-doo-hwan',
    name: '전두환',
    presidentialNumbers: [11, 12],
    republics: [4, 5],
    profileImage: commonsPortrait('chun-doo-hwan.jpg', '전두환', 'Chun_Doo-hwan_(전두환)_Presidential_Portrait_(3x4).jpg', koreaNetPortrait),
    representativeQuote: speech(
      'chun-doo-hwan', '우선 참다운 민주역량의 축적은 우리의 당면과제 중의 하나입니다.',
      '제11대 대통령 취임사', 'https://www.pa.go.kr/online_contents/inauguration/president11.jsp',
    ),
    terms: [{ id: 'chun-1980', presidentId: 'chun-doo-hwan', startDate: '1980-09', endDate: '1988-02' }],
    sources: [biography('11', '제11~12대 전두환 약력')],
  },
  {
    id: 'roh-tae-woo',
    name: '노태우',
    presidentialNumbers: [13],
    republics: [6],
    profileImage: commonsPortrait('roh-tae-woo.jpg', '노태우', 'Roh_Tae-woo_(노태우_)_Presidential_Potraits.jpg', koreaNetPortrait),
    representativeQuote: speech(
      'roh-tae-woo', '어느 누구라도 할 수 있는 ‘보통사람들의 시대’가 왔습니다.',
      '제13대 대통령 취임사', 'https://www.pa.go.kr/online_contents/inauguration/president13.jsp',
    ),
    terms: [{ id: 'roh-tae-1988', presidentId: 'roh-tae-woo', startDate: '1988-02', endDate: '1993-02' }],
    sources: [biography('13', '제13대 노태우 약력')],
  },
  {
    id: 'kim-young-sam',
    name: '김영삼',
    presidentialNumbers: [14],
    republics: [6],
    profileImage: commonsPortrait('kim-young-sam.jpg', '김영삼', 'Kim_Young-sam_presidential_portrait_(3x4_cropped).jpg'),
    representativeQuote: speech(
      'kim-young-sam', '저는 신한국 창조의 꿈을 가슴 깊이 품고 있습니다.',
      '제14대 대통령 취임사', 'https://www.pa.go.kr/research/contents/speech/index.jsp?artid=1307797&catid=c_pa02062&spMode=view',
    ),
    terms: [{ id: 'kim-young-1993', presidentId: 'kim-young-sam', startDate: '1993-02', endDate: '1998-02' }],
    sources: [biography('14', '제14대 김영삼 약력')],
  },
  {
    id: 'kim-dae-jung',
    name: '김대중',
    presidentialNumbers: [15],
    republics: [6],
    profileImage: commonsPortrait('kim-dae-jung.jpg', '김대중', 'Kim_Dae-jung_presidential_portrait_(3x4).jpg'),
    representativeQuote: speech(
      'kim-dae-jung', '국민정부는 어떠한 정치보복도 하지 않겠습니다.',
      '제15대 대통령 취임사', 'https://www.pa.go.kr/online_contents/inauguration/president15.jsp',
    ),
    terms: [{ id: 'kim-dae-1998', presidentId: 'kim-dae-jung', startDate: '1998-02', endDate: '2003-02' }],
    sources: [biography('15', '제15대 김대중 약력')],
  },
  {
    id: 'roh-moo-hyun',
    name: '노무현',
    presidentialNumbers: [16],
    republics: [6],
    profileImage: commonsPortrait('roh-moo-hyun.jpg', '노무현', 'Roh_Moo-hyun_presidential_portrait.jpg'),
    representativeQuote: speech(
      'roh-moo-hyun', '원칙과 신뢰, 공정과 투명, 대화와 타협, 분권과 자율',
      '제16대 대통령 취임사', 'https://www.pa.go.kr/online_contents/inauguration/president16.jsp',
    ),
    terms: [{ id: 'roh-moo-2003', presidentId: 'roh-moo-hyun', startDate: '2003-02', endDate: '2008-02' }],
    sources: [biography('16', '제16대 노무현 약력')],
  },
  {
    id: 'lee-myung-bak',
    name: '이명박',
    presidentialNumbers: [17],
    republics: [6],
    profileImage: commonsPortrait('lee-myung-bak.jpg', '이명박', 'Lee_Myung-bak_presidential_portrait.jpg'),
    representativeQuote: speech(
      'lee-myung-bak', '우리는 ‘이념의 시대’를 넘어 ‘실용의 시대’로 나가야 합니다.',
      '제17대 대통령 취임사', 'https://www.korea.kr/briefing/speechView.do?newsId=132013693', '대한민국 정책브리핑',
    ),
    terms: [{ id: 'lee-2008', presidentId: 'lee-myung-bak', startDate: '2008-02', endDate: '2013-02' }],
    sources: [biography('17', '제17대 이명박 약력')],
  },
  {
    id: 'park-geun-hye',
    name: '박근혜',
    presidentialNumbers: [18],
    republics: [6],
    profileImage: commonsPortrait('park-geun-hye.png', '박근혜', 'Park_Geun-hye_presidential_portrait_(cropped).png'),
    representativeQuote: speech(
      'park-geun-hye', '경제부흥과 국민행복, 문화융성을 이뤄낼 것입니다.',
      '제18대 대통령 취임사', 'https://www.korea.kr/news/policyNewsView.do?newsId=148756155', '대한민국 정책브리핑',
    ),
    terms: [{ id: 'park-geun-2013', presidentId: 'park-geun-hye', startDate: '2013-02', endDate: '2017-03' }],
    sources: [biography('18', '제18대 박근혜 약력')],
  },
  {
    id: 'moon-jae-in',
    name: '문재인',
    presidentialNumbers: [19],
    republics: [6],
    profileImage: commonsPortrait('moon-jae-in.jpg', '문재인', 'President_Moon_Jae_In.jpg', {
      organization: '대한민국 정부',
      license: archivesPortrait.license,
    }),
    representativeQuote: speech(
      'moon-jae-in', '기회는 평등할 것입니다. 과정은 공정할 것입니다. 결과는 정의로울 것입니다.',
      '제19대 대통령 취임사', 'https://www.pa.go.kr/research/contents/speech/index.jsp?artid=1401691&catid=c_pa02062&spMode=view',
    ),
    terms: [{ id: 'moon-2017', presidentId: 'moon-jae-in', startDate: '2017-05', endDate: '2022-05' }],
    sources: [biography('19', '제19대 문재인 약력')],
  },
  {
    id: 'yoon-suk-yeol',
    name: '윤석열',
    presidentialNumbers: [20],
    republics: [6],
    profileImage: commonsPortrait('yoon-suk-yeol.jpg', '윤석열', 'South_Korea_President_Yoon_Suk_Yeol_portrait.jpg', {
      organization: '대한민국 대통령실',
      license: { name: 'CC BY-SA 3.0', url: 'https://creativecommons.org/licenses/by-sa/3.0/' },
    }),
    representativeQuote: speech(
      'yoon-suk-yeol', '국민이 진정한 주인인 나라',
      '제20대 대통령 취임사', 'https://gonggam.korea.kr/newsContentView.es?mid=a12501000000&section_id=NCCD_POLICY_TOTAL&news_id=EBC6D4014D394203E0540021F662AC5F', '정책주간지 K-공감',
    ),
    terms: [{ id: 'yoon-2022', presidentId: 'yoon-suk-yeol', startDate: '2022-05', endDate: '2025-04' }],
    sources: [biography('20', '제20대 윤석열 약력')],
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
