const electionResults = 'https://theme.archives.go.kr/next/vote/info/electInfo.do'
const conservativePartyHistory = 'https://m.peoplepowerparty.kr/about/history'
const democraticJusticePartyHistory = 'https://theme.archives.go.kr/next/organ/viewDetailInfo.do?code=OG0036763&isProvince=&mapInfo=mapno1'

const politicalGroups = {
  nationalAssociation: { name: '대한독립촉성국민회' },
  liberal: { name: '자유당', icon: 'liberal.png' },
  democratic1955: { name: '민주당', icon: 'democratic-1955.png' },
  democraticRepublican: { name: '민주공화당', icon: 'democratic-republican.png' },
  independent: { name: '무소속' },
  democraticJustice: { name: '민주정의당', icon: 'justice.svg' },
  democraticLiberal: { name: '민주자유당', icon: 'democratic-liberal.svg' },
  newKorea: { name: '신한국당', icon: 'new-korea.svg' },
  newPolitics: { name: '새정치국민회의', icon: 'new-politics.svg' },
  millenniumDemocratic: { name: '새천년민주당', icon: 'millennium-democratic.png' },
  uri: { name: '열린우리당', icon: 'uri.svg' },
  grandNational: { name: '한나라당', icon: 'grand-national.svg' },
  saenuri: { name: '새누리당', icon: 'saenuri.svg' },
  libertyKorea: { name: '자유한국당', icon: 'liberty-korea.svg' },
  minjoo: { name: '더불어민주당', icon: 'minjoo.svg' },
  peoplePower: { name: '국민의힘', icon: 'people-power.svg' },
} satisfies Record<string, { name: string; icon?: string }>

interface PartyAffiliation {
  group: { name: string; icon?: string }
  sourceUrl: string
  since?: string
  context?: string
}

function affiliation(group: keyof typeof politicalGroups, sourceUrl: string, since?: string, context?: string): PartyAffiliation {
  return { group: politicalGroups[group], sourceUrl, since, context }
}

export const presidentParties: Record<string, PartyAffiliation[]> = {
  'syngman-rhee': [
    affiliation('nationalAssociation', 'https://contents.history.go.kr/front/hm/view.do?levelId=hm_145_0075', undefined, '초대 당선 당시 지지 단체'),
    affiliation('liberal', 'https://theme.archives.go.kr/next/organ/viewDetailInfo.do?code=OG0036784&isProvince=&mapInfo=mapno1', '1951-12'),
  ],
  'yun-po-sun': [
    affiliation('democratic1955', electionResults, undefined, '당선 당시'),
    affiliation('independent', 'https://www.law.go.kr/lsInfoP.do?lsiSeq=53084', undefined, '취임 후'),
  ],
  'park-chung-hee': [affiliation('democraticRepublican', electionResults)],
  'choi-kyu-hah': [affiliation('independent', electionResults)],
  'chun-doo-hwan': [affiliation('democraticJustice', democraticJusticePartyHistory, '1981-01')],
  'roh-tae-woo': [
    affiliation('democraticJustice', electionResults),
    affiliation('democraticLiberal', 'https://www.nec.go.kr/files/B0000235/201607/BBS_201607060156400600.pdf', '1990-02'),
    affiliation('independent', 'https://imnews.imbc.com/replay/1992/nwdesk/article/1749068_30556.html', '1992-10'),
  ],
  'kim-young-sam': [
    affiliation('democraticLiberal', electionResults),
    affiliation('newKorea', 'https://imnews.imbc.com/replay/1995/nwdesk/article/1964366_30705.html', '1995-12'),
    affiliation('independent', 'https://imnews.imbc.com/replay/1997/nwdesk/article/1770766_30718.html', '1997-11'),
  ],
  'kim-dae-jung': [
    affiliation('newPolitics', electionResults),
    affiliation('millenniumDemocratic', 'https://www.pa.go.kr/research/contents/speech/index.jsp?artid=1308859&catid=c_pa02062&spMode=view', '2000-01'),
    affiliation('independent', 'https://dams.pa.go.kr/dams/DOCUMENT/2025/11/24/DOC/SRC/0A04202511241354570651708012678.pdf', '2002-05'),
  ],
  'roh-moo-hyun': [
    affiliation('millenniumDemocratic', electionResults),
    affiliation('independent', 'https://archives.knowhow.or.kr/rmh/chronologyList/20030925', '2003-09'),
    affiliation('uri', 'https://archives.knowhow.or.kr/record/document/view/1046467', '2004-05'),
    affiliation('independent', 'https://archives.knowhow.or.kr/rmh/chronologyList/20070215', '2007-02'),
  ],
  'lee-myung-bak': [
    affiliation('grandNational', electionResults),
    affiliation('saenuri', conservativePartyHistory, '2012-02'),
  ],
  'park-geun-hye': [
    affiliation('saenuri', electionResults),
    affiliation('libertyKorea', 'https://m.nec.go.kr/files/B0000338/201901/BBS_201901040437176100.pdf', '2017-02'),
  ],
  'moon-jae-in': [
    affiliation('minjoo', 'https://www.korea.kr/goNewsRes/attaches/2019.05/23/91_20170515_01Is2y1D4DGJM000.pdf'),
  ],
  'yoon-suk-yeol': [
    affiliation('peoplePower', 'https://museum.nec.go.kr/museum2018/bbs/2/2/1/20170912155756377100_view.do?article_category=2&article_id=20220415092608887100&bbs_id=20170912155756377100&imgNum=대통령선거사'),
  ],
}
