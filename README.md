# Real Court Tennis

1인칭 후방 Telephoto 시점의 3D 미니 테니스 게임. 기준 문서: 07_Cursor_AI_Agent_Master_Execution_Prompt_realcourttennis.md.

## Stack

Vite + TypeScript (strict) + Three.js + DOM UI + Firebase Auth / Firestore (선택) · PWA. Game Logic은 src/game/ 의 Pure Model(120 Hz Fixed Tick, Seeded RNG)로 DOM/Three.js와 분리되어 있습니다.

## Commands (11/10 updated)

| Command | 설명 |
| --- | --- |
| npm install | Dependency 설치 |
| npm run dev | Dev Server — http://localhost:3000 |
| npm run build | Typecheck + Production Build (dist/) |
| npm test | Vitest Unit Test (Physics, Match, i18n) |
| npm run i18n:check | ko / en / ja Key Parity 검사 |
| npm run sim -- 200 | Bot vs NPC Balance Simulation → docs/reports/balance.md |
| npm run images | raw_assets/images_src/ (Inbox)의 Flow 원본을 게임용으로 변환: Image → WebP, Icon → PNG, Video → H.264 mp4, 바뀐 Motion Set 자동 재빌드 (-- --missing, -- --force) |
| npm run motion | raw_assets/images_src/motion/ 의 AI Motion Video를 ffmpeg로 Sprite Atlas 변환 (-- --preview 로 Timing 확인) |
| npm run prompts | 09_Flow Prompt Full Set for each object.md (Google Flow 복붙용 Full Prompt 모음) 재생성 |
| npm run motion:audit | Motion Clip 동작 구간 측정 · 검토 Grid(-- char_0N/view --grid) · overrides 반영(-- --write) → docs/reports/motion_audit.md |
| npm run e2e | Headless Chrome Screenshot (Desktop / Landscape / Portrait) → docs/reports/shots/ (Dev Server 실행 필요) |
| npm run e2e:play | Bot 자동 조작으로 Character·Theme 4조합 Match를 Score 화면까지 완주 → docs/reports/playtest/ (Dev Server 실행 필요) |

## Backend

- .env.local 이 없으면 **MockBackend**(localStorage)로 동작합니다. Guest / Email / Phone 가입, Ranking 모두 로컬에서 테스트 가능.
- Firebase 사용 시:
  1. Firebase Console에서 Project 생성 → Web App 등록 → .env.example 을 .env.local 로 복사해 VITE_FIREBASE\_\* 입력.
  2. Authentication에서 **Anonymous**, **Email/Password** 활성화 (Google / Apple은 선택).
  3. Firestore Database 생성 후 npx firebase-tools deploy --only firestore (Rules, Composite Index, Guest TTL Policy 배포).
  4. Hosting까지 쓰려면 npm run build 후 npx firebase-tools deploy --only hosting.
- Service Account Key는 절대 Client / Repository에 넣지 않습니다. Admin 권한은 Server 측 설정으로만 판단합니다. Data 구조와 보안 설계는 docs/ADR.md ADR-002 참조.

## Controls

| Input | Desktop | Mobile |
| --- | --- | --- |
| Move Intent | WASD | 좌측 Pad (Pointer Capture) |
| Stroke | Arrow Key 조합 (←/→ = Backhand/Forehand, ↑/↓ = High/Low) | 우측 3×2 Stroke Cluster |
| Swing | Key를 **떼는 순간** | Button을 **떼는 순간** (밖으로 밀어 떼면 취소) |
| Serve | Space 누름 = Toss, 뗌 = Serve | High Button 누름 = Toss, 뗌 = Serve |

공이 다가오면 예상 Contact 지점에 흰색 Timing Ring이 줄어들며, 공 크기와 같아지는 순간(노란색)에 떼면 Perfect입니다.

## Assets

AI 생성 Prompt와 파일명 규칙은 08_AI Prompt Master Set.md, 투입 위치는 public/assets/ 입니다. 파일이 없으면 Procedural 연출(Fallback Card, Camera Fly-in / Orbit, SVG Portrait, Toon Mannequin, WebAudio)로 자동 대체됩니다.

## Docs

- docs/ADR.md, docs/DECISIONS.md — 설계 결정
- docs/OPEN_QUESTIONS.md — 사용자 확인 필요 항목
- docs/reports/ — Balance, Implementation Report, Screenshot
