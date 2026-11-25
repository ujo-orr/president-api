interface CareerEntry {
  years: string
  title: string
}

export const presidentCareers: Record<string, readonly CareerEntry[]> = {
  'syngman-rhee': [
    { years: '1919–1925', title: '대한민국 임시정부 초대 대통령' },
    { years: '1945', title: '독립촉성중앙협의회 회장' },
    { years: '1948', title: '제헌국회 의장' },
  ],
  'yun-po-sun': [
    { years: '1919', title: '대한임시의정원 의원' },
    { years: '1948–1949', title: '서울특별자유시장' },
    { years: '1958–1960', title: '제4·5대 민의원' },
  ],
  'park-chung-hee': [
    { years: '1937–1940', title: '문경공립보통학교 교사' },
    { years: '1955', title: '육군 제5보병사단장' },
    { years: '1961–1963', title: '국가재건최고회의 의장' },
  ],
  'choi-kyu-hah': [
    { years: '1964–1967', title: '주말레이시아 특명전권대사' },
    { years: '1967–1971', title: '제14대 외무부 장관' },
    { years: '1976–1979', title: '제12대 국무총리' },
  ],
  'chun-doo-hwan': [
    { years: '1955', title: '육군 소위 임관' },
    { years: '1979–1980', title: '국군 보안사령관' },
    { years: '1980', title: '국가보위비상대책위원회 상임위원장' },
  ],
  'roh-tae-woo': [
    { years: '1980–1981', title: '국군 보안사령관' },
    { years: '1983–1986', title: '서울올림픽 조직위원장' },
    { years: '1985–1987', title: '제12대 국회의원' },
  ],
  'kim-young-sam': [
    { years: '1954–1958', title: '제3대 민의원' },
    { years: '1984', title: '민주화추진협의회 공동의장' },
    { years: '1987', title: '통일민주당 총재' },
  ],
  'kim-dae-jung': [
    { years: '1985', title: '민주화추진협의회 공동의장' },
    { years: '1994–1998', title: '아시아태평양평화재단 이사장' },
    { years: '2000', title: '노벨 평화상 수상' },
  ],
  'roh-moo-hyun': [
    { years: '1977', title: '대전지방법원 판사' },
    { years: '1988', title: '제13대 국회의원' },
    { years: '2000–2001', title: '제6대 해양수산부 장관' },
  ],
  'lee-myung-bak': [
    { years: '1977–1992', title: '현대건설·인천제철 등 대표이사 사장 및 회장' },
    { years: '1992', title: '제14대 국회의원' },
    { years: '2002–2006', title: '민선 제3기 서울특별시장' },
  ],
  'park-geun-hye': [
    { years: '1998–2000', title: '제15대 국회의원' },
    { years: '2004–2006', title: '한나라당 대표최고위원' },
    { years: '2011–2012', title: '새누리당 비상대책위원회 위원장' },
  ],
  'moon-jae-in': [
    { years: '1995–2001', title: '법무법인 부산 대표변호사' },
    { years: '2007–2008', title: '대통령비서실장' },
    { years: '2012–2016', title: '제19대 국회의원' },
  ],
  'yoon-suk-yeol': [
    { years: '1994', title: '대구지방검찰청 검사' },
    { years: '2017', title: '서울중앙지방검찰청 검사장' },
    { years: '2019', title: '검찰총장 임명' },
  ],
}
