# HOFF-P2-03 Evidence

Issue: https://github.com/chattchatt/handoff/issues/22
Date: 2026-05-28

## Acceptance vs result
- CLI가 웹 핵심 기능보다 먼저 보이지 않음 — 페이지 순서 `Hero → Demo → Preview → How → CLI → Team`은 HOFF-P0-02에서 정렬됨. CLI section은 페이지 하단(`HandoffLanding.tsx` L519, eyebrow `고급 사용자용 CLI`).
- 설치 명령어 + 사용 예시 정확 표시 — 본 작업에서 commands 갱신:
  - INSTALL: `git clone https://github.com/chattchatt/handoff.git`
  - CONFIGURE: `cd handoff && npm install`
  - RUN: `npm run dev  # 실행 후 http://127.0.0.1:8080`
  실제 repo의 `package.json` 스크립트(`npm run dev`)에 맞춰 정확.
- GitHub 링크 정리 — CLI 블록 하단에 새 footer 행 추가 (`CliQuickstart` L378-388): repo hint 메시지 `전체 README와 환경 변수, 배포 가이드는 GitHub 저장소에서 확인하세요.` + `GitHub 열기` 버튼 (Info 50 focus ring).
- 라벨/배지 — `Handoff CLI` 타이틀 + `quickstart.sh` 파일명 + `Advanced path` 배지 + Copy 버튼 × 3 + 명령어 복사 버튼.

## Changed files this issue
- `src/components/HandoffLanding.tsx`:
  - L111-115 `commands` 갱신 (실제 npm 스크립트 + 실행 URL 안내).
  - L33-34 ko / L82-83 en `cliRepoHint` 키 추가.
  - L378-388 `CliQuickstart` 내부에 GitHub 링크 footer 행 추가.
- `evidence/hoff-p2-03.md`
- `evidence/screenshots/hoff-p2-03-desktop.png` (CLI 섹션 전체)
- `evidence/screenshots/hoff-p2-03-mobile.png`

## Before / after
- INSTALL: 동일 (git clone)
- CONFIGURE: `cd handoff && handoff setup` → `cd handoff && npm install` (`handoff` 바이너리 부재로 실제 npm 설치로 정렬)
- RUN: `handoff run ./meeting.md` → `npm run dev  # 실행 후 http://127.0.0.1:8080` (현재 동작하는 dev server 실행으로 정렬)
- 신규 footer 행: `GitHub 저장소 안내 + GitHub 열기 버튼`

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning.
- 시각 확인:
  - Desktop full screenshot (816x2112)에서 HOW IT WORKS → 고급 사용자용 CLI → HandOff CLI 블록(3 명령 + GitHub 안내 footer) → HandOff by E-Hong 순서 노출.
  - Mobile screenshot에서 CLI 블록 install/configure 명령 노출.
- 명령어 정확성: `cd ~/handoff && npm run dev`는 실제 동작하는 dev server (vite v7.3.3, port 8080).

## Screenshots
- Desktop (816x2112): `evidence/screenshots/hoff-p2-03-desktop.png` — How section 종료 + CLI 블록 full view + GitHub 링크.
- Mobile (391x845): `evidence/screenshots/hoff-p2-03-mobile.png` — CLI 블록 install/configure 명령 노출.

## Notes / risk
- `handoff` 바이너리는 미존재. P3+에서 npm package `@handoff/cli` 같은 형태로 별도 패키지화 검토 가능. 현재 명령은 repo clone + npm run dev 흐름이라 모든 사용자가 즉시 실행 가능.
- 명령어 `# 실행 후 http://127.0.0.1:8080` 코멘트가 한 줄 안에 같이 들어가 모바일에서 줄바꿈 발생 가능 — `break-all`로 가독성 유지됨.
