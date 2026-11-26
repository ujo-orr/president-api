# 대한민국 역대 대통령 데이터 아카이브

대한민국 역대 대통령의 재임 기록과 주요 사건, 경제·사회 지표를 탐색하는 개인 포트폴리오 프로젝트입니다. 초기 공개 범위는 이승만부터 윤석열까지 13명입니다. 대통령기록관 등 공식 기관의 원문을 연결하고, 평가 기준 페이지에서 AI 평가의 산식과 한계를 설명합니다.

## 현재 개발 단계

챕터 6 / 13에서 대통령별 세로형 흥망성쇠 그래프를 추가했습니다. 평가 분야를 선택해 재임 중 사건의 긍정·부정 가중치를 보고, 사건을 펼쳐 기록과 원문 출처를 확인할 수 있습니다. 취임 배경이 기록된 대통령에게만 해당 항목을 표시합니다. 육각형 레이더 차트는 기존 6개 분야의 0~10점 정수 점수를 표시합니다. 연대기 카드를 열면 좌우로 180도 뒤집히며 상세 프로필로 전환됩니다. 연대기로 돌아오면 이전 가로 위치가 복원됩니다.

| 현재 기술 | 버전 |
| --- | --- |
| React / React Router DOM | 19.3.1 / 7.9.6 |
| TypeScript / Vite | 5.9.3 / 8.3.8 |
| Vite React 플러그인 / ESLint | 6.3.0 / 9.39.1 |
| 개발용 컨테이너 Node.js | 24.22.3 LTS (Debian Bookworm Slim) |

## Windows 및 Mac 실행 방법

Docker Desktop을 실행하고 프로젝트 루트에서 작업합니다. Windows PowerShell에서는 `Copy-Item .env.example .env`, Mac 터미널에서는 `cp .env.example .env`로 처음 한 번 설정 파일을 만듭니다. `.env`가 이미 있으면 기존 설정을 사용합니다.

```sh
docker compose up -d --build
docker compose ps
docker compose logs frontend
```

브라우저에서 [http://127.0.0.1:5173](http://127.0.0.1:5173)에 접속합니다. 다른 호스트 포트가 필요하면 `.env`에서 `FRONTEND_PORT`를 설정하고 `docker compose up -d`를 다시 실행합니다. 파일 변경이 자동 반영되지 않을 때는 `.env`의 `VITE_USE_POLLING`을 `true`로 바꾸고 컨테이너를 다시 생성합니다.

```sh
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
docker compose down
```

소스와 Vite 설정의 변경은 컨테이너에 바로 반영됩니다. npm 패키지를 추가하거나 버전을 바꾼 뒤에는 `docker compose up -d --build`로 다시 빌드합니다. 잠금 파일은 `frontend`에서 `npm install --package-lock-only`로 만들고 Git에 포함합니다. Docker는 잠금 파일이 있으면 `npm ci`를 사용합니다.

다른 컴퓨터에서는 `git pull`로 코드를 가져온 뒤 `.env`를 준비하고 같은 명령을 실행합니다. `.env`, `docs`, `capture`는 필요에 따라 별도로 이동합니다. npm 의존성과 Docker 컨테이너는 각 환경에서 생성합니다. 향후 MySQL을 추가하면 데이터 이전은 별도 백업과 복원으로 진행합니다.

## 프로젝트 구조

| 경로 | 역할 |
| --- | --- |
| `frontend/src/components` | 공통 화면과 초상 사진 표시 |
| `frontend/src/pages` | 홈, 대통령 상세, 평가 기준과 출처, 404 화면 |
| `frontend/src/data` · `frontend/src/types` | 초기 재임 자료와 API 연동을 고려한 타입 |
| `frontend/src/styles` | 공통 색상, 카드, 반응형 레이아웃 |
| `frontend/Dockerfile` · `compose.yaml` | 프론트엔드 개발용 컨테이너 |
| `docs` · `capture` | 개인 개발 기록과 실행 화면 캡처 |

Spring Boot와 MySQL은 챕터 8에서 도입합니다. 운영 환경에서 상세 경로를 직접 열거나 새로고침할 수 있도록 배포 단계에 SPA 경로 처리를 추가합니다.

## 개발 로드맵

| 챕터 | 주제 |
| --- | --- |
| 1 | 초기 프로젝트, Docker 개발환경, 화면 설계 |
| 2 | 대통령 카드 목록과 가로 스크롤 |
| 3 | 카드 회전·확대와 상세 화면 전환 |
| 4 | 인물 프로필, 주요 약력 및 출처 |
| 5 | 육각형 레이더 차트와 평가 근거 |
| 6 | 세로형 흥망성쇠 그래프 |
| 7 | 스크롤 연동 그래프 애니메이션 |
| 8 | Spring Boot, MySQL, REST API 연동 |
| 9 | 공공데이터 수집 및 가공 |
| 10 | 역사 자료, 평가 점수 및 출처 관리 |
| 11 | WebSocket 실시간 활성 연결 수 |
| 12 | 통합 테스트, 접근성 및 성능 개선 |
| 13 | Mac mini 배포 및 최종 검증 |

## 자료 및 AI 활용

재임 기간의 월 단위 자료는 대통령기록관 약력을 사용합니다. 경제·사회 지표는 제공 기관의 정의와 단위를 확인해 사용하며, 초상 사진은 개별 이용 조건을 확인한 뒤 추가합니다. 평가에는 확인 가능한 근거와 원문을 함께 연결하고, 근거가 부족한 항목은 평가를 보류합니다.

### 정당 심볼 출처

정당명을 식별하는 데 사용한 이미지의 원본과 이용 조건은 각 파일 페이지에서 확인할 수 있습니다. 자료 페이지에서 공개 도메인으로 표시한 심볼을 사용하며, 원본에 별도 상표 표시가 있는 경우 해당 안내도 함께 확인할 수 있습니다.

- [자유당](https://commons.wikimedia.org/wiki/File:%EC%9E%90%EC%9C%A0%EB%8B%B9_%EB%A1%9C%EA%B3%A0.svg#Licensing) · [민주당(1955)](https://commons.wikimedia.org/wiki/File:%EB%AF%BC%EC%A3%BC%EB%8B%B9%281955%EB%85%84%29_%EB%A1%9C%EA%B3%A0.svg#Licensing) · [민주공화당](https://commons.wikimedia.org/wiki/File:%EB%AF%BC%EC%A3%BC%EA%B3%B5%ED%99%94%EB%8B%B9_%EC%9B%8C%EB%93%9C%EB%A7%88%ED%81%AC.svg#Licensing) · [민주정의당](https://commons.wikimedia.org/wiki/File:Democratic_Justice_Party_emblem.svg#Licensing) · [민주자유당](https://commons.wikimedia.org/wiki/File:%EB%AF%BC%EC%A3%BC%EC%9E%90%EC%9C%A0%EB%8B%B9_%EC%8B%AC%EB%B3%BC.svg#Licensing) · [신한국당](https://commons.wikimedia.org/wiki/File:%EC%8B%A0%ED%95%9C%EA%B5%AD%EB%8B%B9_%EB%A1%9C%EA%B3%A0.svg#Licensing) · [새정치국민회의](https://commons.wikimedia.org/wiki/File:Logo_of_the_National_Congress_for_New_Politics_%28Sign_only%29.svg#Licensing)
- [새천년민주당](https://commons.wikimedia.org/wiki/File:Logo_of_Millennium_Democratic_Party.svg#Licensing) · [열린우리당](https://commons.wikimedia.org/wiki/File:Logo_of_the_Uri_Party_%28Sign_only%29.svg#Licensing) · [한나라당](https://commons.wikimedia.org/wiki/File:Logo_of_the_Grand_National_Party.svg#Licensing) · [새누리당](https://commons.wikimedia.org/wiki/File:Logo_of_the_Saenuri_Party.svg#Licensing) · [자유한국당](https://commons.wikimedia.org/wiki/File:Logo_of_the_Liberty_Korea_Party_%28Sign_only%29.svg#Licensing) · [더불어민주당](https://commons.wikimedia.org/wiki/File:Logo_of_the_Minjoo_Party_of_Korea_%28Sign_only%29.svg#Licensing) · [국민의힘](https://commons.wikimedia.org/wiki/File:Logo_of_People_Power_Party_of_Korea_%28Logo_only%29.svg#Licensing)

GPT 및 Codex를 기획, 화면 구성, 코드 작성, 검증 기록 정리에 활용했습니다. 개발자 직접 검증 결과는 실제로 확인한 환경과 항목을 기준으로 기록합니다.
