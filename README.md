# 대한민국 역대 대통령 데이터 아카이브

대한민국 역대 대통령의 재임 기록과 주요 사건, 경제·사회 지표를 탐색하는 개인 포트폴리오 프로젝트입니다. 초기 공개 범위는 이승만부터 윤석열까지 13명입니다. 대통령기록관 등 공식 기관의 원문을 연결하고, 평가 기준 페이지에서 AI 평가의 산식과 한계를 설명합니다.

## 현재 개발 단계

챕터 9 / 13에서 기존 재임 사건, 평가, 점수와 연간 통계를 검증해 MySQL에 저장했습니다. 확인된 결측 관측은 출처가 있는 별도 계열로 보존합니다.

챕터 8 / 13에서 대통령 13명의 프로필을 MySQL로 옮기고 Spring Boot REST API를 연대기, 상세, 평가 근거 화면에 연결했습니다. 상세 페이지에서 육각형 레이더 차트의 6개 분야 점수와 흥망성쇠 기록을 볼 수 있습니다.

챕터 7 / 13에서 추가한 흥망성쇠 기록과 육각형 레이더 차트의 스크롤 애니메이션도 유지합니다. 화면에 들어온 사건의 긍정·부정 막대는 0.8초간 좌우로 펼쳐지고, 레이더 도형은 1초간 중심에서 각 점수 위치까지 커집니다. 움직임 줄이기를 설정하면 두 그래프를 완성된 상태로 표시합니다.

| 현재 기술 | 버전 |
| --- | --- |
| React / React Router DOM | 19.3.1 / 7.9.6 |
| TypeScript / Vite | 5.9.3 / 8.3.8 |
| Vite React 플러그인 / ESLint | 6.3.0 / 9.39.1 |
| 개발용 컨테이너 Node.js | 24.22.3 LTS (Debian Bookworm Slim) |
| 백엔드 Java / Spring Boot | 21 / 3.5.16 |
| 데이터베이스 | MySQL 8.4 |

## Windows 및 Mac 실행 방법

Docker Desktop을 실행하고 프로젝트 루트에서 작업합니다. Windows PowerShell에서는 `Copy-Item .env.example .env`, Mac 터미널에서는 `cp .env.example .env`로 처음 한 번 설정 파일을 만듭니다. `.env`가 이미 있으면 기존 설정을 유지하고 빠진 항목을 추가합니다. MySQL을 처음 실행하기 전에 `MYSQL_PASSWORD`와 `MYSQL_ROOT_PASSWORD`에 서로 다른 개발용 비밀번호를 입력합니다.

```sh
docker compose up -d --build --wait
docker compose ps
docker compose logs backend
```

브라우저에서 [프론트엔드](http://127.0.0.1:5173)에 접속합니다. 다른 호스트 포트가 필요하면 `.env`에서 `FRONTEND_PORT` 또는 `API_PORT`를 설정하고 `docker compose up -d --wait`를 다시 실행합니다. Vite의 파일 변경 자동 반영이 필요할 때는 `VITE_USE_POLLING`을 설정할 수 있습니다. 프론트엔드를 호스트에서 `npm run dev`로 실행하면 `http://127.0.0.1:8080`의 API에 연결합니다. 호스트의 API 포트를 바꾼 경우 프론트엔드 실행 환경에 `PRESIDENT_API_TARGET`을 지정합니다.

```sh
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
docker compose down
```

프론트엔드 소스와 Vite 설정은 컨테이너에 바로 반영됩니다. 백엔드 코드, npm 의존성 또는 Maven 의존성을 변경한 뒤에는 `docker compose up -d --build --wait`로 다시 빌드합니다. Flyway는 백엔드 시작 시 MySQL 스키마와 초기 데이터를 적용합니다. 개발 DB는 `mysql-data` 볼륨에 남습니다. `.env`의 초기 계정 설정은 새 DB를 만들 때 적용됩니다.

다른 컴퓨터에서는 `git pull`로 코드를 가져온 뒤 `.env`를 준비하고 같은 명령을 실행합니다. 이후 추가한 DB 자료를 이전하려면 별도로 백업하고 복원합니다.

## 읽기 전용 API

| 요청 | 응답 |
| --- | --- |
| `GET /api/presidents` | 첫 취임순 대통령 프로필 13건 |
| `GET /api/presidents/{id}` | 대통령 한 명의 프로필. 알 수 없는 ID는 404 |
| `GET /actuator/health` | 백엔드와 DB 연결 상태 |

Vite는 같은 주소의 `/api` 요청을 백엔드에 전달합니다. 기본 포트에서는 [API 목록](http://127.0.0.1:8080/api/presidents)과 [백엔드 상태](http://127.0.0.1:8080/actuator/health)를 직접 확인할 수 있습니다.

## 공공데이터 정합성 검증

Python 3.13에서 아래 검사를 실행할 수 있습니다. 데이터 검증과 MySQL 적재는 Docker 백엔드를 빌드하고 시작할 때도 실행됩니다.

```sh
python data/calculate_presidency_scores.py --check
python data/prepare_presidency_archive.py
docker compose up -d --build --wait backend
```

`data/annual-context-supplement.chapter-09.json`은 확인한 결측만 별도 관측으로 기록합니다. 기존 통계의 결측과 평가 상태는 각 자료에 그대로 남습니다. Flyway는 입력이 바뀌었을 때 아카이브 자료 전용 테이블을 한 트랜잭션에서 갱신합니다. MySQL 전체 행은 적재 스크립트의 `--export-query`와 `--verify`를 사용해 입력과 대조할 수 있습니다. 화면의 사건과 점수는 검증에 사용한 기존 JSON을 읽습니다.

## 프로젝트 구조

| 경로 | 역할 |
| --- | --- |
| `frontend/src/components` | 공통 화면과 초상 사진 표시 |
| `frontend/src/pages` | 홈, 대통령 상세, 평가 기준과 출처, 404 화면 |
| `frontend/src/data` · `frontend/src/types` | REST API 연결, 평가·사건 자료와 데이터 타입 |
| `frontend/src/styles` | 공통 색상, 카드, 반응형 레이아웃 |
| `backend` | Java REST API, MySQL 조회, Flyway 마이그레이션 |
| `data` | 재임 사건, 평가, 원본 통계·보완 관측, 검증 및 적재 코드 |
| `compose.yaml` | 프론트엔드, 백엔드, MySQL 개발환경 |
| `docs` · `capture` | 개인 개발 기록과 실행 화면 캡처 |

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
