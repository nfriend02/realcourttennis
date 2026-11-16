# 📋 Universal Mini-Game Master Specification & Production Blueprint (Form 4.1)
*미니게임 표준 기획서 및 제작 청사진 — Form 4.1*
***검증 참조 ✅: 『토이빌 디펜더스』 (toyville-defenders) — W2D — Vite · TypeScript · Phaser 3 · DOM UI · Firebase (Auth/Firestore/Storage) · Vercel · PWA***
***검증 참조 ✅: 『Real Court Tennis』 (real-court-tennis / realcourttennis) — W3D — Vite · TypeScript · Three.js · DOM UI · Firebase (Auth/Firestore named DB) · Vercel · PWA (Unity/Supabase는 검증 경로가 아님) · Inspection Upgrade X44 반영***
***설계 유지 🧪: N3D (Unity 6 LTS URP · UI Toolkit · Supabase · WebGL) — 선택 Archetype, 구현 검증 없음***
*이전 버전: Form 4.0 (Web 2D + Native 3D 공통, RCT는 Unity 설계 가정) · Form 2.1 (Web 2D 범용) · Form 2.0 (Toyville 기획) · Form 1.7 / 1.6 · **Form 4.1 Inspection Upgrade (2026-11-16, X44)***

**Header Verification (Form 4.1)**

* ✅ Toyville Defenders — Vite + TS + Phaser + DOM + Firebase + Vercel (W2D)
* ✅ Real Court Tennis — Vite + TS + Three.js + DOM + Firebase + Vercel + PWA (W3D) — 구현·Test·Inspection Upgrade(X44) 검증 완료. ADR-001(Engine 전환), ADR-002(Backend 전환) 참조
* 🧪 N3D (Unity) — Designed only. RCT가 Unity/Supabase를 검증했다고 주장하지 않는다

---

## 0. 양식 개요 및 작성 규칙

본 Form은 **05 Design Master Doc 4.1**의 경험 표준을 실제 제품으로 구현하기 위한 **기술 규격·제작 청사진**이다. Form 4.1은 4.0의 구조(Engine-agnostic 계약 + [W]/[U] Binding)를 유지하면서, **RCT가 W3D로 실제 구현·검증된 결과**를 표준에 반영한 개정판이다.

### 0.0 Changelog: Form 4.0 → Form 4.1

| 영역 | Form 4.0 | Form 4.1 |
| --- | --- | --- |
| 검증 참조 | Toyville ✅ (W2D) + RCT 🧪 (Unity N3D 설계) | Toyville ✅ (W2D) + **RCT ✅ (W3D: Vite + TS + Three.js + DOM + Firebase + Vercel)**. N3D는 🧪 선택 Archetype으로만 유지 (§1.2) |
| Stack 재검토 실증 | 의무 규정만 | **Unity → Three.js (X01, ADR-001), Supabase → Firebase (X08, ADR-002)** 실제 전환 사례 수록 (§1.3, §1.6, §20) |
| Default Stack Profile | W3D 열은 "–" (미검증) | **W3D 열 ✅ RCT 구체 기본값**: Vite 8, TS 5.9, Three.js 0.187, DOM UI, Firebase 13, Vercel, Vitest 5, sim/e2e tools (§1.2) |
| Decision Trigger | 2D/3D, Store, Backend 위주 | **W3D vs N3D, Unity 사용 불가 → Web Binding, 가벼운 Data → Firebase, AI Motion Sprite 옵션** 추가 (§1.4) |
| Folder 구조 [W] | 2D(Phaser) 중심 | **W3D Tree**: src/game/{physics, ai, match}, src/view, src/ui, src/backend, src/data, src/core, tools/*, raw_assets/images_src, docs/*, public/assets (§3.1) |
| Layout | HudProfile 단일 출처, System Bar 실측 | **HudProfile CSS 변수, 실측 --sys-h, sysbarRows, One-Viewport, Match 입력 Allowlist (X35), Portrait Compact Sysbar (X43)** (§5) |
| Asset Pipeline [W] | raw_assets + build-assets.mjs | **raw_assets/images_src Inbox → npm run images / motion / prompts**, public/assets는 생성물, Icon mobile + desktop, Asset-Optional 유지 (§9) |
| AI Motion Sprite | 없음 | **AI Video → Frame Atlas → Billboard (X11)**, Mannequin Fallback, Motion Audit (X21) (§9.5, §18.5) |
| Account · DB | Firebase ✅ / Supabase 🧪 병렬 | **Firebase = ✅ Primary (W2D/W3D)**: Phone Alias, Guest TTL 100d, admins/{loginKey}, MockBackend, named DB + Region, LazyFirebaseBackend, smoke. **Supabase = 🟦 Alternate Profile** (§11) |
| Pure Model | Fixed Tick + Seeded RNG | **Date.now / Math.random 금지 명문화, IRandom, Sim Time, Typed JSON Data Table (X02)**, Vitest 필수 (§13) |
| 배포 | Vercel Rewrites + Cache | **Vercel SPA Rewrites + Asset Cache** 구체화, Firebase Hosting은 선택 (§17) |
| QA | 명령 세트 + 감사 | **필수: typecheck, test, i18n:check, build, sim, e2e, firebase-smoke / 권장: e2e:play, motion:audit, images, prompts.** 신규 **§18.5 Headless Balance & Motion Audit Gates** |
| 교훈 표 | 16행 | **+X01, X08, X11, X14, X21, X26, X35, X38, X41, X44** (§20) |
| 문서 서식 | Markdown 전용 | **Plain Markdown Policy (X26)**: Narrative에서 inline backtick·LaTeX 금지, Fenced block만 허용 (§0.1) |
| Cursor Rules | 단일 core 예시 | **00-project-core + 20-ui-localization** 실제 구성 (§22) |
| 07 Skeleton | Unity 중심 Section 이름 | **W3D 기본 예시**, ADR + DECISIONS 필수, QA에 sim + e2e + smoke 포함 (§23) |
| Inspection Upgrade (X44) | 점검 보고서 P0~P2와 구현 Gap | **Hit Feedback mid juice, Haptic, Audio silent Unlock, IJKL/Numpad, Character Passives, AI Corner+Comeback, Deuce HUD, Rally Crowd, Firebase uid Pending Queue(localStorage). Letterbox·Stamina 미채택** (§8, §10~11, §13, §20) |

### 0.0.1 표기

| 표시 | 의미 |
| --- | --- |
| ✅ Verified | Toyville(W2D) 또는 RCT(W3D) 최종본에서 동작·배포·Test로 확인 |
| 🧪 Designed | 설계·계산 검증만 완료, 구현 검증 대기 (Form 4.1에서는 N3D / Native 경로에만 사용) |
| 🟨 표준 필수 | 신규 프로젝트 필수 |
| 🟦 권장 / 대안 | 장르/Stack에 따라 선택 (미채택 시 사유 기록), Alternate Profile 표시 |
| ⚠️ 교훈 | 실제 문제 → 표준화된 해결 |
| { } | 프로젝트별 작성 칸 |
| **[W]** / **[U]** | Web Binding / Unity Binding |

* 표 안의 "✅ Toyville" 열은 W2D 검증 값, "✅ RCT" 열은 W3D 검증 값이다.
* Engine-agnostic 계약(§4~§8, §11~§15, §18)은 [W]/[U] 어느 쪽을 쓰든 동일하게 충족한다. 단, 구현 검증이 있는 쪽은 [W]이다.

### 0.1 Document Policy

* 🟨 모든 기획·개발 문서는 **Markdown(.md)**. 문서 본문은 한국어, **기술 용어는 영어로만 표기**.
* 🟨 Code·Comment·Identifier·Data Key·Log·DB Field·Commit Message는 **100% English**.
* 🟨 사용자 노출 Text(UX/UI/HUD/Error/Video Overlay)는 **ko · en · ja** Localization Key.
* 🟨 **Plain Markdown (X26) ✅**: Narrative 문장(본문·표 셀·목록)에서 inline code backtick과 LaTeX 수식을 쓰지 않는다. 식별자·경로·명령·수식은 일반 텍스트로 쓰고, 긴 Code·Tree·SQL·JSON·Prompt는 Fenced code block에만 둔다. 일부 Markdown Viewer가 inline code를 붉게 표시하거나 수식을 깨뜨리기 때문이다.
* 🟦 Plain Markdown 변환은 tools/docs/plainMarkdown.ts로 자동화하고, 생성 문서(09 Flow Prompt, balance, motion_audit)도 같은 변환을 거쳐 저장한다.
* 🟨 문서 파일명: {번호}_{Title_Words}_{project-id 또는 version}.md

### 0.2 절대 원칙

| # | 원칙 | 요약 |
| --- | --- | --- |
| 1 | English-Only Code | Code·Comment·Key·Log·DB Field 100% English, 화면 문구는 Localization Key ✅ |
| 2 | 3-Language UX | ko(기본)/en/ja, 즉시 전환, Key Parity 자동 검사 ✅ |
| 3 | 3-Device Native Layout | desktop / mobile-landscape / mobile-portrait 독립 설계, 회전 무손실, One-Viewport ✅ |
| 4 | Play-Area First | 2D: 최대 정수 Tile ✅ / 3D: Camera Framing Acceptance ✅ (W3D) |
| 5 | No-Overlap UX | 겹침 0, Touch 44, Text 12 ✅ |
| 6 | Sound-Respectful | 기본 OFF, Session 유지, 단일 Audio Manager ✅ |
| 7 | Asset-Optional | Placeholder로 전체 완주, 투입 시 자동 반영 ✅ |
| 8 | Stack Re-evaluation | Phase 0 재검토 + ADR + Gate G0 ✅ (Toyville, RCT 모두 실제 전환 발생) |
| 9 | Secret-Safe | Secret은 Local Secret 파일만, Admin은 Server/DB Allowlist ✅ |
| 10 | Testable Deterministic Core | Pure Model + Fixed Tick + IRandom + Unit Test ✅ |
| 11 | Data-Driven Balance | JSON/CSV, Magic Number 금지 ✅ |
| 12 | Document Integrity | Precedence, Conflict Log, Open Decisions, DECISIONS.md ✅ |
| 13 | Measurable Acceptance | 모든 품질 요구를 수치 조건으로 ✅ |
| 14 | Code-first Engine Assets | [U] Agent는 Engine YAML을 손으로 편집하지 않고 Builder Script로 생성 🧪 / [W] Three.js Scene을 Code로 생성 ✅ |
| 15 | Plain Markdown | Narrative에 inline backtick·LaTeX 금지 (X26) ✅ |
| 16 | Decision Log | Stack 변경은 ADR, 그 외 결정은 DECISIONS.md X## 번호로 누적 ✅ |

---

## 1. 🟨 Phase 0 — Stack Re-evaluation & Selection

### 1.1 의무 규정

1. Coding Agent는 개발 시작 시 **① Engine ② App Framework/UI ③ Backend/DB (+Hosting, Test/CI)** 를 재검토한다.
2. 결과를 §1.6 ADR 표로 사용자에게 보고하고 docs/ADR.md로 남긴다.
3. **기본값 변경 시 사용자 승인 후 착수 (Gate G0)**. 유지 시 이유를 기록하고 진행.
4. 개발 중 치명적 제약 발견 시 변경 제안 가능. 실행 전 이유·영향·Migration Plan 보고. 승인된 변경은 ADR 신규 번호 또는 Superseded 표기 + docs/DECISIONS.md X## 로 기록한다.
5. Stack이 바뀌어도 §4~§13, §15, §18의 경험·품질 표준은 동일하게 충족.

### 1.2 Default Stack Profiles

| Profile | Engine | App/UI | Backend | Hosting / 배포 | Test | 참조 |
| --- | --- | --- | --- | --- | --- | --- |
| **W2D** Web 2D | Phaser 3/4 | Vite + Vanilla TS + DOM UI | Firebase | Vercel + PWA | Vitest + Headless Chrome(CDP) | ✅ Toyville |
| **W3D** Web 3D | **Three.js** (Babylon.js는 대안) | **Vite + TS + DOM UI** (+ Capacitor 선택) | **Firebase** (Supabase는 🟦 Alternate) | **Vercel + PWA** (+ Store는 Capacitor) | **Vitest + Headless Sim + Playwright(CDP) E2E** | ✅ RCT |
| **N3D** Native 3D | Unity 6 LTS URP | UI Toolkit + Input System | Supabase (+ Firebase Analytics Native) | Store + WebGL(Vercel/Cloudflare) | Unity Test Framework + Device Simulator | 🧪 Designed (선택) |
| **N2D** Native 2D | Unity 2D / Godot 4 | UI Toolkit / Godot UI | Firebase / Supabase | Store (+ Web Export) | Engine Test Framework | 🧪 |

**W3D 구체 기본값 (✅ RCT, package.json 기준)**

| 범주 | 기본값 | 비고 |
| --- | --- | --- |
| Build | Vite 8 (vite ^8.3), build target es2022 | npm run dev = vite --port 3000, npm run build = tsc --noEmit + vite build |
| Language | TypeScript 5.9 (strict), ESM | Pure Core는 DOM·Three.js import 금지 (§13) |
| 3D Engine | Three.js 0.187 (WebGL2) | Toon Material + Outline, Character는 Motion Sprite Billboard + Mannequin Fallback |
| UI | DOM UI (Vanilla TS) + CSS 변수 | html[data-layout], html[data-hand], HudProfile |
| Input | Pointer Events + Keyboard | Pointer ID 고정, event.timeStamp → Sim Clock |
| Backend | Firebase JS SDK 13 (Modular, Lazy Chunk): Auth + Firestore **named DB** | Storage는 선택, MockBackend 내장 (§11) |
| Hosting | Vercel (SPA rewrites) + PWA manifest | Firebase Hosting 설정은 선택 (§17) |
| Unit Test | Vitest 5 (environment node) | src/**/*.test.ts, Pure Model·i18n·Backend Policy |
| Sim / Script Runner | tsx 4 | npm run sim (Headless Balance), npm run i18n:check |
| E2E | playwright-core 1.x (CDP Emulation) | npm run e2e (3-Device Screenshot), npm run e2e:play (Full Playtest) |
| Asset Tools | ffmpeg-static | npm run images, motion, prompts, motion:audit |
| Store (선택) | Capacitor | ADR-001: Store는 Capacitor로 패키징 |

### 1.3 선택지 비교 매트릭스

**① Engine**

| 후보 | 강점 | 약점 | 적합 |
| --- | --- | --- | --- |
| Phaser 3/4 ✅ | 2D 기능 완비, Web 친화 | 3D 불가 | Puzzle, Defense, Runner |
| PixiJS | 초고속 2D | Logic·Physics 직접 구현 | Effect 중심 |
| **Three.js** ✅ | Web 3D 표준, 작은 번들, Code로 Scene 생성, GLTF 지원 | Animation·Tooling 직접 구성, Mobile 부하 관리 필요 | 가벼운 3D, Sports-lite (RCT) |
| Babylon.js | Web 3D 기능 풍부 | 번들 큼 | W3D 대안 |
| **Unity 6 URP** 🧪 | Humanoid Animation·Mirror, Shader Graph, Store 출시, C# | WebGL 번들 큼, Mobile Web 성능 약함, **Editor 설치 필요** | 3D Sports/Action, Store 우선 |
| Godot 4 | 가벼움, Open Source | 3D Mobile Tooling 상대적 약세 | 2D/가벼운 3D Native |
| PlayCanvas / Cocos | Editor 기반 Web 3D | Tool 종속 | Editor 협업 |

**② App Framework / UI**

| 후보 | 강점 | 약점 | 선택 기준 |
| --- | --- | --- | --- |
| Vite + Vanilla TS + DOM ✅ | 가볍고 i18n·Form·접근성 쉬움 | 화면이 많으면 구조화 필요 | Web 미니게임 (Toyville, RCT) |
| React / Preact / Svelte | Component·상태 관리 | Render Loop 분리 설계 필요 | 계정·상점 UI가 많을 때 |
| **Unity UI Toolkit** 🧪 | USS Class로 Layout 전환 | Multi-Touch Gameplay Control은 별도 처리 | Unity 화면·HUD |
| Unity uGUI | 자료 풍부 | Layout 전환·i18n 수작업 | 기존 uGUI 자산 |
| Flutter (+ Flame) | 단일 Code Store 출시 | Game Engine 연동 제약 | App 중심 |
| Capacitor | Web 게임 Store 패키징 | Native Plugin 의존 | Web 우선 + Store |

**③ Backend / DB**

| 후보 | 강점 | 약점 | 선택 기준 |
| --- | --- | --- | --- |
| **Firebase** ✅ | Anonymous·Email·Google Auth, Security Rules, TTL, 무료 Spark Plan, Web SDK | 복잡한 Query·집계 약함, Unity WebGL SDK 없음, Ranking 검증은 Rules 범위까지 | 개인 진행 저장 + 적은 Data (Toyville, RCT) |
| **Supabase** 🟦 | Postgres SQL, RLS, RPC, pg_cron | Unity 공식 SDK 부재, Web에서도 별도 Project 운영 | Ranking·통계·관계형, Unity N3D |
| PlayFab / Nakama | Game 특화(Leaderboard, Matchmaking) | 학습·비용 | Online 기능 확장 |
| 자체 Server | 완전한 자유 | 운영 비용 | 특수 요구 |

### 1.4 Decision Trigger (반드시 확인)

- [ ] 2D/3D? 동시 Object 수? Humanoid Animation·Mirror 필요? (Mobile 60 FPS)
- [ ] **W3D vs N3D**: Sports-lite 규모 + AI Video Sprite Character + PWA-first 이면 W3D. Store 출시 필수 또는 Humanoid Rig·복잡한 Shader 필수이면 N3D. W3D가 과반이면 W3D를 기본 선택하고, N3D 선택 이유는 ADR에 남긴다.
- [ ] **Unity unavailable → Web binding**: 개발 PC에 Unity Hub / Editor / .NET SDK가 없어 Compile·Test·Build가 불가능하면 Unity 경로를 시작하지 않고 Web Binding(W3D)으로 전환을 제안한다. (RCT X01: Unity 미설치 + Gate G0 승인) 전환해도 게임 사양·경험 표준은 유지하고 Engine Binding만 바꾼다.
- [ ] **Light data → Firebase**: 주고받는 Data가 적고(개인 설정·진행·결과·단순 Ranking) Server Function 없이 Spark(무료) Plan으로 충분하면 Firebase. 복잡한 집계·관계형 Query가 필요하면 Supabase를 검토한다. (RCT X08)
- [ ] **AI motion sprites option**: Character를 Humanoid Rig 없이 AI Video(Green Screen) → Frame Atlas → Camera-facing Billboard로 만들 수 있는가? Camera 시점이 고정(예: 후방/정면, Yaw ≤ 8°)이면 가능. 불가하면 Rig/Skinned Mesh 경로 또는 Mannequin Procedural. (RCT X11)
- [ ] Store 출시 필요? Web + PWA로 충분? Desktop Web 필요? Store가 나중에 필요하면 Capacitor Wrapping 먼저 시도.
- [ ] Account: Guest(Nickname)·Email·Mobile Number(SMS 없음)·Google·**Apple(iOS 소셜 Login 시 필수)**
- [ ] Ranking·통계 Server Query 필요? Score 위변조 방지 수준? (Rules 범위 검증으로 충분한지, Cloud Functions 필요한지)
- [ ] 자동 삭제(TTL) 요구 (예: Guest 100일)?
- [ ] 다국어 Text·Form·접근성은 어느 계층이 담당? CJK Font 크기 영향?
- [ ] **Platform 제약 Matrix**: SDK가 대상 Platform(특히 WebGL)을 지원하는가? Thread 사용 여부?
- [ ] Agent가 개발 환경에서 Compile·Test·Build를 **Editor GUI 없이** 실행할 수 있는가? ([W] npm scripts / [U] Batchmode, Builder Script)
- [ ] 무료 한도·예상 비용·지역 규제(개인정보, 일본 APPI 등)·Firebase Region (예: asia-northeast3)

### 1.5 Platform 제약 Matrix (🧪 N3D 예시)

| 기능 | Android | iOS | WebGL (Desktop) | 대응 |
| --- | --- | --- | --- | --- |
| Supabase C# SDK(HttpClient) | ○ | ○ | △/✕ | **UnityWebRequest 기반 Thin REST Gateway** |
| Firebase Analytics/Crashlytics | ○ | ○ | ✕ | No-op Adapter |
| Google Sign-In | Native Plugin | Native Plugin | OAuth PKCE Redirect | ID Token → Backend |
| Sign in with Apple | OAuth / Plugin | Native(Nonce) | OAuth | ID Token → Backend |
| VideoClip 직접 참조 | ○ | ○ | ✕ | StreamingAssets URL 재생 |
| Thread / Task.Run | ○ | ○ | ✕ | Main Thread async만 |
| Secure Token 저장 | Keystore | Keychain | localStorage | ADR에 보안 수준 기록 |

* ✅ [W] Web 전용 제약 (RCT): Google/Apple Sign-In은 Firebase Auth Provider 설정 + Authorized Domain 등록 필요. SMS Phone Provider는 사용하지 않는다(Alias Email, §11.2). Firebase JS SDK는 Lazy Chunk로 분리해 초기 Bundle을 줄인다.

### 1.6 ADR 양식 (docs/ADR.md)

| 범주 | 선택안 | 검토한 대안 | 선택 이유 | 변경 시 영향 | 상태 |
| --- | --- | --- | --- | --- | --- |
| Engine | { } | { } | { } | { } | Proposed / Accepted / Superseded |
| App / UI | | | | | |
| Input | | | | | |
| Backend / DB | | | | | |
| Auth Providers | | | | | |
| Analytics | | | | | |
| Hosting / Store | | | | | |
| Test / CI | | | | | |

**✅ 실증 ADR 사례 (RCT, docs/ADR.md)**

| 번호 | 변경 | 근거 | 상태 |
| --- | --- | --- | --- |
| ADR-001 | Unity 6 LTS → Three.js 0.187 + Vite 8 + TS + DOM (W3D) | 개발 PC에 Unity Hub / Editor / .NET SDK 없음, Node·Git만 사용 가능. 사용자 Gate G0 승인 (X01) | Accepted |
| ADR-002 | Supabase → Firebase (Auth + Firestore) + MockBackend | 게임이 주고받는 Data가 적고 무료 Plan으로 충분 (X08). Firebase Hosting 설정은 포함하되 배포는 Vercel | Accepted |

> ⚠️ **교훈 (Toyville)**: 기획의 "Phaser + Three.js Hybrid"는 불필요했다.
> ⚠️ **교훈 (RCT)**: 07의 Unity + Supabase는 설계 가설이었고 Phase 0 재검토에서 Three.js + Firebase로 바뀌어 구현·검증되었다. 05/06이 계약과 Binding을 분리했기에 경험 표준은 전환 후에도 유지되었다. 07 개념 → Web Binding 매핑표를 ADR에 함께 둔다 (Pure C# Model → src/game Pure TS, UI Toolkit Root Class → html data 속성, HudProfile ScriptableObject → hudProfiles.ts, AudioMixer → Web Audio, CSV → Typed JSON, Batchmode Test → npm scripts).

---

## 2. Master 문서 Meta 정보

| 항목 | 작성 칸 | ✅ Toyville | ✅ RCT |
| --- | --- | --- | --- |
| 게임명 (ko/en/ja) | { } | 토이빌 디펜더스 / Toyville Defenders / トイビル・ディフェンダーズ | 리얼 코트 테니스 / Real Court Tennis / リアルコートテニス |
| Project ID / Namespace | { } | toyville-defenders / – | real-court-tennis (Firebase project: realcourttennis) |
| Stack Profile | {W2D/W3D/N3D/N2D} | W2D | **W3D** |
| Engine (ADR) | { } | Phaser 3.90 | Three.js 0.187 |
| App/UI (ADR) | { } | Vite 8 + TS 5.9 DOM | Vite 8 + TS 5.9 DOM |
| Backend (ADR) | { } | Firebase 13 | Firebase 13 (Auth + Firestore named DB) + MockBackend |
| Hosting | { } | Vercel | Vercel + PWA (Store는 Capacitor 선택) |
| Layout | 3 Profile | 동일 | 동일 (HudProfile × 3) |
| 언어 | ko · en · ja | 동일 (500 Key) | 동일 |
| Test | { } | Vitest 21 + i18n + CDP + Firebase E2E | Vitest + i18n:check + sim + e2e + e2e:play + motion:audit + firebase-smoke |
| 결정 기록 | docs/ADR.md + docs/DECISIONS.md | – | ADR-001~002, X01~X44 |

---

## 3. 표준 Folder 구조

### 3.1 [W] Web Profile (✅ Toyville 일반화, ✅ RCT W3D 반영)

```
📁 {game-id}/
├── index.html · vite.config.ts · vercel.json · tsconfig.json · package.json
├── firebase.json · .firebaserc · firestore.rules · firestore.indexes.json · storage.rules     (Firebase Profile)
├── supabase/migrations/*.sql                                                                  (🟦 Supabase Alternate Profile)
├── .env.example (Key 이름만) · .env.local (gitignore)
├── .cursor/rules/ 00-project-core.mdc · 20-ui-localization.mdc
├── docs/
│   ├── ADR.md · DECISIONS.md · OPEN_QUESTIONS.md
│   └── reports/           # balance.md, motion_audit.md, motion_review.md, implementation_report.md, shots/, playtest/, controls/, audit/
├── src/
│   ├── main.ts            # Boot: settings → layout → hud profile → i18n → audio → (assets, backend) → system overlay → intro
│   ├── styles.css         # html[data-layout] / html[data-hand] 선택자만 사용
│   ├── core/              # layout.ts(detect), hudProfiles.ts(HudProfile), pause.ts, settings.ts, EventBus, Clock, phoneId.ts, bounceCues.ts …
│   ├── game/              # ★ Pure TypeScript (DOM·Three.js import 금지, Date.now·Math.random 금지)
│   │   ├── core/          # IRandom, shared types, constants
│   │   ├── physics/       # ballFlight, court, hitJudge, shotPlanner + *.test.ts
│   │   ├── ai/            # npcBrain, random(Seeded IRandom) + *.test.ts
│   │   └── match/         # matchModel, score, actor, positioning, bot + match.test.ts
│   ├── view/              # Three.js 계층: gameView, cameraRig, court(CourtBuilder), mannequin, spriteCharacter, fxSprites, ballView
│   ├── ui/                # DOM 계층: app(Router), screens, modals, matchScreen, phoneField, assets, dom
│   ├── input/             # gameInput (Pointer Events + Keyboard, Pointer ID 고정, Touch Block)
│   ├── audio/             # audioManager (Web Audio master → bgm / sfx / ui, Synth Fallback)
│   ├── i18n/              # i18n.ts + strings/ko.ts(기준) · en.ts · ja.ts + i18n.test.ts
│   ├── backend/           # types.ts(Backend), index.ts(createBackend, LazyFirebaseBackend), firebaseBackend.ts, mockBackend.ts, adminIds.ts
│   └── data/              # *.json Balance·Stage·Character·Visual (physics, rules{comeback}, aiDifficulty, hitQuality, stages, characters{passives}, visual{hitFeedback}) + gameData.ts(Typed Loader)
├── tools/
│   ├── sim.ts             # Headless Balance Simulation → docs/reports/balance.md
│   ├── check-i18n.ts      # ko 기준 Key Parity 검사
│   ├── e2e-shots.ts       # 3-Device Screenshot + 화면 감사
│   ├── e2e-playtest.ts    # 전체 Match 자동 Playtest (e2e:play)
│   ├── e2e-controls.ts    # Control / Touch Block 점검 (선택 실행)
│   ├── firebase-smoke.ts  # Auth + Firestore CRUD (+ Storage) smoke → npx tsx tools/firebase-smoke.ts
│   ├── motion/            # build-motion.ts, analyze-motion.ts, motionLib.ts, atlas-png.ts, motion.config.json, motion.review.json
│   ├── assets/            # build-assets.ts, assets.config.json
│   ├── prompts/           # build-flow-prompts.ts (Flow Prompt 문서 생성)
│   └── docs/              # plainMarkdown.ts (X26 변환)
├── raw_assets/            # 원본 Inbox (Git 제외 가능)
│   ├── images_src/        # public/assets와 같은 구조: images/ icons/ motion/ video/ references/
│   └── _preview/          # 변환·감사 임시 산출물
└── public/
    ├── manifest.webmanifest · icon.svg
    ├── icons/             # 표준: mobile/ (apple-touch, maskable 192/512) · desktop/ (16~1024, favicon.ico)
    └── assets/            # ★ 생성물 (직접 편집 금지): audio/ icons/ images/ motion/ video/ (+ manifest)
```

* 🟨 public/assets는 npm run images / motion이 생성한다. 원본은 항상 raw_assets/images_src에 두고 변환 Tool을 다시 실행한다 (X14).
* 🟨 Pure Core(src/game/\*)는 View(src/view), UI(src/ui), Backend(src/backend)를 import하지 않는다. 의존 방향: data ← game(core, physics, ai, match) ← view / ui / input. ✅
* 🟨 화면 하나 = 파일 하나(또는 한 Factory), 각 화면은 ScreenContext를 선언한다.
* 🟨 RCT는 layout.ts·hudProfiles.ts·pause.ts·settings.ts를 src/core에 둔다. 프로젝트가 커지면 src/layout, src/app, src/save로 분리할 수 있다 (분리 시 DECISIONS.md에 기록).
* 🟦 [W] 아이콘은 RCT에서 현재 public/assets/icons 아래 평면 구조(app_icon_192/512/1024, apple_touch_icon_180, favicon_\*)로 생성된다. 표준 구조(icons/mobile, icons/desktop)와의 차이는 §9.4에 정리한다.

### 3.2 [U] Unity Profile (🧪 N3D, 구현 검증 없음)

```
📁 {game-id}/
├── Assets/_{GameName}/
│   ├── 01.Scenes/        # Scene_Boot, Scene_Intro, Scene_MainLobby(UI Router), Scene_GamePlay
│   ├── 02.Scripts/
│   │   ├── Core/ Data/ Gameplay/ Physics/ AI/        # Pure C# (No MonoBehaviour)
│   │   ├── Input/ Player/ Presentation/ Layout/ UI/ Localization/ Audio/ Video/
│   │   ├── Save/ Network/ Analytics/ Assets/ Admin/
│   │   └── Editor/       # SceneBuilder, PrefabBuilder, AssetPostprocessors, BuildScripts, AuditRunner, DataValidator
│   ├── 03.Prefabs/ 04.Art/ 05.Audio/
│   ├── 06.Data/          # Tables/*.csv, Config/*.json, Localization/{ko,en,ja}.json
│   ├── 07.UI/            # UXML, USS, Icons
│   ├── 08.Videos/        # (WebGL은 StreamingAssets 사본)
│   └── 09.Tests/         # EditMode, PlayMode
├── Packages/ · ProjectSettings/
├── supabase/migrations/ · docs/ · raw_assets/ · tools/ · web/(WebGL Template, vercel.json)
├── .cursor/rules/*.mdc · .gitignore · .gitattributes(Git LFS)
```

* 🟨 [U] Engine 의존 Code는 Presentation/Scene 계층에만. Model·Data·Rule은 Engine을 모른다.
* 🟨 [U] Assembly Definition으로 의존 방향 강제 (Core ← Data ← Physics/Gameplay/AI ← Presentation/UI).

---

## 4. Runtime Architecture (계약 + Binding)

### 4.1 화면 Layer 계약

| Layer (계약) | 역할 | Pointer | [W] Binding | [U] Binding |
| --- | --- | --- | --- | --- |
| Game View | Engine Canvas / 3D Camera | Gameplay Control만 | #game-root z0 (Three.js Canvas) | Main Camera |
| Screen | 현재 화면 UI | 빈 영역 통과 | #screen-layer z1 | UIDocument Sort 10 |
| Cutscene/Video | 영상·컷씬 | 재생 중 | #cutscene-layer z5 | UIDocument Sort 50 + RenderTexture |
| Modal | Menu·MyPage·확인 창 | Modal 중 | #modal-layer z7 | UIDocument Sort 70 |
| Toast | 알림 | 없음 | #toast-layer z8 | Sort 80, PickingMode.Ignore |
| System Bar | 상단 고정 Button | Button만 | #system-overlay z9 | Sort 90 |

* 🟨 **UI는 UI 계층(DOM / UI Toolkit), Game Field는 Engine.** Text·Form·i18n·반응형은 UI 계층이 압도적으로 쉽다. ✅
* 🟨 [W] 3D HUD 보조 표시(예: Timing Ring)는 가독성을 위해 World-space 오브젝트로 두어 DOM HUD를 최소화한다. ✅ (RCT X09)

### 4.2 Typed EventBus

```ts
// [W]
type Events = {
  'layout:change': LayoutProfile; 'viewport:resize': void; 'language:change': Lang;
  'sound:change': boolean; 'pause:change': { paused: boolean; adminFrozen: boolean };
  'hand:change': 'right' | 'left'; 'save:change': void; 'assets:updated': string;
};
```

```csharp
// [U] Allocation-free struct events
public interface IEventBus
{
    void Publish<T>(in T evt) where T : struct;
    void Subscribe<T>(System.Action<T> handler) where T : struct;
    void Unsubscribe<T>(System.Action<T> handler) where T : struct;
}
```

### 4.3 Pause Controller (사유별) ✅

```
PauseReason = Admin | Menu | Hidden | Rotation(선택)   // 하나라도 있으면 정지, 서로 덮어쓰지 않음
```

* 🟨 Background 복귀 시 Real-time 장르는 **3-2-1 Countdown** 후 재개.

### 4.4 🟨 Clock & Input Timestamp (Timing 장르 필수) ✅

| Clock | 용도 |
| --- | --- |
| SimClock / MatchClock (double) | Fixed Tick Simulation, Pause 시 정지, Slow Motion 배속 반영 |
| RealClock | UI·Video·Countdown |

```
tSim = simNow − (realNow − inputEventTime) × timeScale
```

* [W] PointerEvent.timeStamp / performance.now() → MatchClock (✅ RCT) · [U] Touch.time, InputEventPtr.time vs Time.realtimeSinceStartupAsDouble.
* 🟨 Pure Model은 시간을 인자(dt, tSim)로만 받는다. Date.now / performance.now 직접 호출 금지 (§13).

### 4.5 Router + ScreenContext ✅

```ts
interface ScreenContext {
  showSound: true; showHome?: boolean; showLang?: boolean; showHand?: boolean;
  showHelp?: boolean; showMyPage?: boolean; showLogout?: boolean;
  menu?: 'none' | 'lobby' | 'battle' | 'result';
  music?: MusicId | null;          // undefined = keep
}
```

* router.go(screen) = 이전 unmount → 새 mount → i18n 적용 → Music 교체 → Layout 속성 갱신 → System Bar 재렌더. ✅

### 4.6 App FSM Template

```
Boot → Intro → Title → (Login ↔ Signup) → Setup → StartMedia → Play → EndMedia → (ResultReady) → Result
                                                     ↑______________ Next / Retry ______________|
Play --Home(confirm+pause)--> Title
```

---

## 5. 🟨 3-Device Layout Engine 규격

### 5.1 Detect 계약

```ts
// [W] ✅
function detect(): LayoutProfile {
  const w = visualViewport?.width ?? innerWidth, h = visualViewport?.height ?? innerHeight;
  if (h > w) return 'mobile-portrait';
  if (matchMedia('(pointer: coarse)').matches && Math.min(w, h) < 900) return 'mobile-landscape';
  return 'desktop';
}
```

```csharp
// [U] 🧪
public static LayoutProfile Detect(int widthPx, int heightPx, float dpi, bool touchPrimary)
{
    float density = (dpi > 0f ? dpi : 96f) / 160f;
    float shortSideDp = System.Math.Min(widthPx, heightPx) / density;
    if (heightPx > widthPx) return LayoutProfile.MobilePortrait;
    if (touchPrimary && shortSideDp < 900f) return LayoutProfile.MobileLandscape;
    return LayoutProfile.Desktop;
}
```

| 기능 | 규격 |
| --- | --- |
| Event | [W] resize, orientationchange, visualViewport.resize / [U] Frame당 Screen 크기 비교 → **150 ms Debounce** |
| 적용 | [W] html[data-layout], html[data-hand], CSS 변수 / [U] UI Toolkit Root Class layout-\*, hand-\* |
| 순서 | **HudProfile 적용 → layout:change Publish** (같은 Frame 재배치) |
| Input Lock | 전환 후 200 ms |
| 강제 전환 | Admin layoutOverride + Device Frame Preview |

### 5.2 HudProfile (단일 출처, ✅ RCT)

HudProfile은 Layout별 수치의 **유일한 출처**이며, [W]에서는 :root(html) 인라인 CSS 변수와 data 속성으로 노출된다. 화면 CSS에 기기별 수치를 흩뿌리지 않는다.

```ts
// [W] src/core/hudProfiles.ts (RCT)
interface HudProfile {
  sysBtnPx: number;          // System Bar Button 크기       → --sys-btn
  btnPx: number;             // Action Button 크기            → --btn
  sysGapPx: number;          // System Bar Gap                → --sys-gap
  sysbarRows: 1 | 2;         // System Bar 행 수              → html[data-sysbar-rows]
  scoreboardScale: number;   // 점수판 배율                   → --scoreboard-scale
  controlPadMaxVw: number;   // 이동 Pad 최대 폭(vw), 0 = 없음 /* project fields */
}
export const HUD_PROFILES: Record<LayoutProfile, HudProfile> = {
  desktop:            { sysBtnPx: 44, btnPx: 52, sysGapPx: 8, sysbarRows: 1, scoreboardScale: 1.0,  controlPadMaxVw: 0 },
  'mobile-landscape': { sysBtnPx: 42, btnPx: 64, sysGapPx: 6, sysbarRows: 1, scoreboardScale: 0.95, controlPadMaxVw: 28 },
  'mobile-portrait':  { sysBtnPx: 36, btnPx: 56, sysGapPx: 4, sysbarRows: 1, scoreboardScale: 0.9,  controlPadMaxVw: 45 },
};
// applyHudProfile(profile): root.style.setProperty('--sys-btn' | '--btn' | '--sys-gap' | '--scoreboard-scale', …); root.dataset.sysbarRows = String(rows)
```

```csharp
// [U] ScriptableObject per profile 🧪
[CreateAssetMenu] public sealed class HudProfile : ScriptableObject
{
    public LayoutProfile profile;
    public float systemButtonDp = 42f;
    public bool stackedSystemBar;
    public float actionButtonDp = 64f;        // project field (e.g. stroke button)
    public float padWidthRatio = 0.18f;       // project field
    public bool controlsAsBottomDeck;         // portrait deck vs overlay
    public string cameraProfileId = "landscape";
}
```

* 🟨 새 수치가 필요하면 HudProfile에 필드를 추가하고 applyHudProfile에서 CSS 변수로 노출한다. 화면 CSS는 var(--…)만 읽는다.
* 🟨 HudProfile 적용은 layout:change Publish **이전**에 수행한다 (같은 Frame 재배치).

### 5.3 System Bar 실측 · sysbarRows · One-Viewport ✅

* 🟨 [W] System Bar 높이는 추정하지 않고 **ResizeObserver로 측정**해 CSS 변수 --sys-h에 반영한다. Modal·Scoreboard·Screen 상단 여백은 var(--sys-h) 아래에서 시작한다. ✅
* 🟨 [U] systemBar.RegisterCallback&lt;GeometryChangedEvent> → SystemBarHeight 공개 → Modal·Scoreboard top 적용. 🧪
* 🟨 **sysbarRows**: HudProfile.sysbarRows(1 또는 2)가 System Bar 행 수를 결정한다. 기본은 1행이며, 2행은 버튼 수·언어 Label 길이 때문에 1행이 불가능할 때의 Optional Layout이다. 행 수가 바뀌어도 --sys-h는 실측값을 사용한다.
* 🟨 **Portrait Compact Sysbar (X43) ✅**: mobile-portrait에서도 System Bar는 **1행**으로 유지한다. 버튼 36 px, Gap 4 px, 텍스트 Padding 축소로 Sound / Home / Language / MyPage / Logout을 한 줄에 배치한다. 단, Touch Target 최소 44 px는 Hit Area(Padding·투명 영역 포함)로 충족한다. (2행 → 1행은 사용자 요청, X39에서 2행 허용 → X43에서 1행 확정)
* 🟨 **One-Viewport (X38) ✅**: 모든 화면은 3기기에서 한 Viewport 안에 완결된다 (문서 전체 Scroll 없음). Scroll이 필요한 화면(예: 경기 설정)은 **단일 Scroll Container 하나**(예: .setup-main)만 가지며 System Bar·Header·고정 Action은 Scroll 밖에 둔다. 한 Scroll 영역 안에서 요소가 서로를 덮지 않는다 (예: Stage Thumbnail이 Setting을 가리지 않음, Thumbnail 열 수는 Profile별: portrait 4 / landscape·desktop 6).
* 🟨 Play 화면에서는 One-Viewport 대신 Play-Area 규칙(§6)이 우선한다.

### 5.4 Style 작성 규칙

* 🟨 기기별 규칙은 [W] html[data-layout='…'] 선택자 / [U] .layout-mobile-portrait .controls { … } USS 선택자. Media Query·Screen 분기 Code 분산 금지. ✅
* 🟨 Handedness는 [W] html[data-hand='left'] Grid Area 교환 / [U] .hand-left Class로 flex-direction: row-reverse + 내부 열 교환. ✅
* 🟨 Safe Area: [W] env(safe-area-inset-\*) / [U] Screen.safeArea → Root Padding. ✅
* 🟨 Admin 전용 UI 노출은 html[data-admin='1'] 같은 속성 선택자로 제어한다 (X41). 판정은 Backend Allowlist로만.

### 5.5 Match 입력 Allowlist (X35) ✅

Gameplay 화면에서 **게임 조작 Control과 실행에 필요한 UI Button만** 입력을 받는다.

| 구분 | 허용 (Click/Touch) | 차단 (pointer-events 없음 + Capture 차단) |
| --- | --- | --- |
| Gameplay Control | 이동 Pad(모바일 왼손 Pad), 6개 Stroke Button | 3D 화면, 점수판, Hint, Ring 등 |
| System | Sound, Home, Language | 그 외 System Bar 항목은 프로젝트 결정 |
| Flow | Intro/End Skip, View Score, Home 확인 Modal | – |

* 🟨 구현: (1) 차단 영역은 CSS pointer-events: none, (2) Document **Capture 단계**에서 pointerdown / touchstart / mousedown / click / dblclick을 Allowlist Selector 밖이면 preventDefault + stopPropagation (포커스·텍스트 선택·확대 방지), (3) Desktop·Mobile 모든 Layout에 동일 적용. Language Button은 경기 중에도 유지한다 (사용자 확인).
* 🟨 감사: Allowlist 밖 영역에 Pointer 입력을 Injection했을 때 상태 변화 0 (§18.2).

### 5.6 Play 화면 Grid 예시

```css
/* [W] ✅ Toyville — right-handed: D-Pad right (precision move = primary) */
html[data-layout='mobile-landscape'] .battle-ui {
  grid-template-columns: 122px minmax(0, 1fr) 122px;
  grid-template-areas: 'hud hud hud' 'act play dpad' 'cards cards cards';
}
html[data-layout='mobile-landscape'][data-hand='left'] .battle-ui {
  grid-template-areas: 'hud hud hud' 'dpad play act' 'cards cards cards';
}
```

```css
/* [W] ✅ RCT rule (20-ui-localization): right-handed default = movement pad LEFT, stroke buttons RIGHT
   (backhand column left, forehand column right). Left-handed mirrors and swaps columns. */
html[data-layout='mobile-landscape'] .controls { padding-top: var(--sys-h); }
html[data-hand='left'] .stroke-cluster { flex-direction: row-reverse; }
```

```css
/* [U] 🧪 RCT USS — right-handed: stroke buttons right (timing = primary), move pad left */
.layout-mobile-landscape .controls { position: absolute; left: 0; right: 0; bottom: 0; flex-direction: row; justify-content: space-between; }
.layout-mobile-portrait  .controls { position: relative; height: 38%; flex-direction: row; }
.hand-left .controls { flex-direction: row-reverse; }
.hand-left .stroke-cluster { flex-direction: row-reverse; }   /* swap FH/BH columns */
```

---

## 6. 🟨 Play-Area 구현 규격

### 6.1 [W] 2D Board ✅ (W2D)

```ts
new Phaser.Game({ scale: { mode: Phaser.Scale.RESIZE }, parent: gameRoot, input: { activePointers: 2 } });
const rect = host.playRect();                 // DOM .play-area rect
mapper.fit(rect, /* transposed */ portrait);  // max integer tile, centered
```

* GridMapper: fit, toScreen, fromScreen, screenDelta (전치 반영). Model은 항상 가로 기준 논리 좌표. ✅
* 면적 측정: (play.w × play.h) / (innerWidth × innerHeight) → desktop ≥ .65, landscape ≥ .55, portrait ≥ .50.

### 6.2 [W] / [U] 3D View

| 항목 | 규격 |
| --- | --- |
| View | landscape/desktop 전체 화면, portrait 상단 ≥ 60% ([W] Camera viewport / [U] Camera.rect) |
| Control | landscape/desktop Corner Overlay(Alpha 0.55 → Touch 중 0.85), portrait Bottom Deck |
| Occlusion 측정 | 핵심 피사체 Screen Bounding Box ∩ Control Rect = 0 |
| Overlay 비율 | desktop ≤ 12%, landscape ≤ 22% |
| 작은 Object 시인성 | 거리 기반 Visual Scale(예: 1.0 → 2.5), Trail, Contact Shadow, 예측 Marker / Timing Ring |
| 궤적 가시성 | 최고점 상한(예: 3.6 m) + Follow Camera가 공 위치를 보고 FOV 확장(상 2.4°, 옆 1.0°, 최대 2.2배, 0.2 s 감쇠). 측정 Metric: Ball off-screen % (RCT X31: Mobile 9.7% → 0.8%) |

* ✅ W3D 측정 Metric(RCT e2e:play): ballOff %를 Playtest Report에 기록한다. 목표값은 {프로젝트별}이며 RCT 실측은 ≤ 1%.

### 6.3 🟨 Camera Rig Profile & Framing Validator ✅ (W3D)

```json
// src/data/visual.json camera (예시 구조) / [U] CameraProfiles.json
{
  "landscape": { "distanceBehind": 12.0, "height": 2.10, "pitchDeg": -3.4, "fovMode": "vertical", "fovDeg": 13.0, "followDamping": 0.15, "maxYawDeg": 8 },
  "portrait":  { "distanceBehind": 12.0, "height": 2.10, "pitchDeg": "auto", "fovMode": "horizontal", "fovDeg": 22.8, "followDamping": 0.15, "maxYawDeg": 8 }
}
```

* 🟨 FOV 정책: Landscape는 Vertical 고정(넓은 화면은 좌우가 더 보임), Portrait는 Horizontal 고정(좌우 시야 유지).
* 🟨 CameraFramingValidator: 기준 Point를 Viewport로 투영해 05 §6.3의 조건(점유 범위, 관계, 크기 비율)을 Profile별로 검사 → Test + Debug Overlay.
* 🟨 **원근 비율 공식**: 근거리 Object까지 거리 D, 두 Object 깊이 차 Delta, 목표 크기 비율 k → D = k × Delta / (1 − k). (RCT: k = 1/3, Delta = 23.77 m → D ≈ 11.9 m)
* 🟨 **높이 관계 공식**: Camera 높이 h_c, 점 높이 h, 거리 r의 투영 기울기 (h − h_c) / r로 "A가 B와 C 사이"를 부등식으로 풀어 h_c 범위를 구한다. (RCT: 1.79 m < h_c < 2.59 m)

---

## 7. 🟨 i18n 구현 규격

### 7.1 Dictionary

```ts
// [W] src/i18n/strings/ko.ts — key source ✅
export const ko = { 'title.start': '시작', 'login.toSignup': '처음이면 회원가입', /* … */ } as const;
export type StringKey = keyof typeof ko;   // en/ja: Record<StringKey, string> → missing key = compile error
```

```json
// [U] 06.Data/Localization/ko.json (source) — en.json / ja.json must have identical keys 🧪
{ "title.start": "시작", "login.toSignup": "처음이면 회원가입", "hud.stage": "스테이지 {n}" }
```

### 7.2 Runtime API

| API | [W] | [U] |
| --- | --- | --- |
| 언어 결정 | detectLanguage() | Loc.Resolve(saved, autoDetect) |
| 번역 | t(key, params) | Loc.T(key, params) |
| UI Binding | data-i18n, data-i18n-attr | LocLabel (custom VisualElement, key attribute) |
| 일괄 적용 | applyI18n(root) | Loc.Apply(rootVisualElement) |
| 변경 | setLanguage(lang) → language:change | Loc.SetLanguage(lang) → LanguageChanged |
| Fallback | 현재 → ko → Key | 동일 |

* 🟨 Canvas/3D Text·동적 목록·열린 Modal은 언어 변경 Event를 구독해 다시 그린다. ✅
* 🟨 Font: [W] html[data-lang] 별 Font 변수 / [U] FontRegistry + CJK Fallback Chain (Noto Sans KR/JP). ✅/🧪
* 🟨 Logo 한 줄 맞춤은 언어 변경·Resize·Font 로드 후 재계산. ✅
* 🟨 3D World-space Text(콜아웃 등)도 Localization Key로만 만든다.

### 7.3 Error Mapping

```ts
type AuthErrorCode = 'invalidCredentials' | 'emailInUse' | 'weakPassword' | 'invalidId'
  | 'nicknameTaken' | 'nicknameInvalid' | 'recentLogin' | 'network' | 'unsupported' | 'notFound';
// → 'auth.err.{code}' keys in ko/en/ja. Never show raw backend messages.
```

### 7.4 Parity Check

* [W] npm run i18n:check (tools/check-i18n.ts, ko 기준 missing/extra → exit 1) + src/i18n/i18n.test.ts. ✅
* [U] EditMode LocalizationParityTests: Key 집합 동일, 빈 값 0, {param} 일치, ja 값에 Hangul(\uAC00-\uD7A3) 포함 금지. 🧪
* 🟨 [W]도 ja 값에 Hangul 혼입 금지 검사를 i18n 검사에 포함한다 ({권장}).

---

## 8. 🟨 Audio 구현 규격

| 항목 | [W] ✅ | [U] 🧪 |
| --- | --- | --- |
| Graph | Web Audio master → bgm(0.6)/sfx(0.8)/ui(0.7) | AudioMixer Master → BGM/SFX/UI Group |
| Context Unlock | 첫 Gesture(pointerdown/keydown/touchend)에서 생성/resume + **무음 Buffer 1샘플 재생** (iOS Safari Unlock, X44) | 불필요 (Native), WebGL은 첫 Gesture 후 재생 |
| File 우선 | public/assets/audio/bgm\_{id}.mp3 | 05.Audio/{SFX,BGM}/{id} (AssetRegistry Key) |
| 대체 | Synth Fallback (SoundSynth) | ProceduralSfx (AudioClip.Create) |
| 연타 제한 | 같은 ID 45 ms | 동일 |
| Music | ScreenContext.music, 0.6 s Fade | 동일 (Crossfade 2 AudioSource) |
| Loop | bgm_loops.json + 선행 무음 Skip | AudioClip Loop Point / Import 설정 |
| Video Audio | registerMedia(el) | VideoPlayer → AudioSource(SFX Group) |
| Session Rule | 기본 OFF, soundOn Session Key, Logout 시 Reset | 동일 (SessionPrefs) |
| Crowd Ambience | 긴 Rally / Ace / Point Win 시 court.excite + sfx_crowd_cheer (Data 임계, X44) | 동일 개념 |

---

## 9. 🟨 Asset Pipeline 규격

### 9.1 [W] Inbox → Build → Registry ✅ (RCT 확장)

원본은 **한 곳(raw_assets/images_src)** 에 두고, Agent가 변환 Tool로 일괄 변환한다 (X14). public/assets는 **생성물이며 직접 편집하지 않는다.**

| 단계 | 도구 / 명령 | 결과 |
| --- | --- | --- |
| 투입 | raw_assets/images_src/{images, icons, motion, video, references}/ (public/assets와 같은 구조) | 원본 (jpg/png/mp4) |
| 이미지 변환 | npm run images → tools/assets/build-assets.ts (ffmpeg-static, 설정 tools/assets/assets.config.json) | Image → WebP, Icon → PNG 1024 + 파생 Icon, Video → H.264 faststart (_Ns Trim), 이름 검사 |
| Motion 변환 | npm run motion → tools/motion/build-motion.ts (바뀐 Motion Set은 npm run images가 자동 실행) | Clip → Frame Atlas(PNG/WebP) + Manifest (Chroma Key 자동 Sampling, Loop/Stabilize 메타) |
| Prompt 생성 | npm run prompts → tools/prompts/build-flow-prompts.ts | AI 생성 Prompt 문서(Image / Video / Motion)를 Generator로 재생성 — 문구는 Generator에서만 수정 |
| Motion 감사 | npm run motion:audit → tools/motion/analyze-motion.ts | Clip별 실제 동작 구간 측정, motion.config.json overrides, docs/reports/motion_audit.md (§18.5) |
| 목록 | Build 산출 Manifest (dev + build 모두 생성) | Runtime Registry |
| 점검 | Placeholder 사용 여부 Report (Asset-Optional) | 누락 표 |

> ⚠️ **교훈 (Toyville)**: Manifest를 dev 전용으로 두면 배포본 전체가 Placeholder가 된다 → Build 시 반드시 생성.
> ⚠️ **교훈 (RCT, X14)**: AI 생성 도구(Flow)의 다운로드는 jpg인데 게임은 webp 경로를 읽는다. 원본 Inbox를 한 곳에 두고 변환을 Agent가 일괄 수행해야 이름·형식 불일치가 사라진다. 변환 Tool이 문서(09)의 "넣을 곳 / 게임 파일" 표기를 기준으로 이름을 검사한다.

### 9.2 [U] 🧪

| 단계 | 도구 | 결과 |
| --- | --- | --- |
| 투입 | raw_assets/ → Editor Menu {NS}/Assets/Import Raw Assets | 규칙 경로로 이동 |
| Import 설정 | AssetPostprocessor | Humanoid Rig, ASTC Texture, Vorbis Audio, Video Transcode, Animation Clip 이름 검증 |
| 등록 | AssetRegistry (Key → Addressable/Resources Path) | 없으면 PlaceholderFactory |
| 점검 | EditMode AssetCoverageTests | 필수/선택 Asset 표 보고 |

### 9.3 Placeholder Factory 계약 (Asset-Optional) ✅

```ts
// [W] — 모든 Asset은 선택. 없으면 Code 생성 Fallback으로 전체 완주
interface PlaceholderPolicy {
  character: 'Mannequin';            // primitive Mesh, Sprite Atlas가 로드되면 숨김 (깜빡임 방지: 로드 중 Mannequin 숨김)
  environment: 'CodeBuilt';          // CourtBuilder로 Code 생성
  sfx: 'Synth';                      // Web Audio Synth
  crowd: 'CapsuleCrowd';             // Sheet가 있으면 Instanced Billboard
  video: 'FallbackCard';             // 영상과 같은 길이
}
```

```csharp
// [U] 🧪
public interface IPlaceholderFactory
{
    GameObject CreateCharacter(string characterId, Color tint);   // primitive mannequin
    GameObject CreateEnvironment(string themeId);                 // code-built court/stage
    AudioClip CreateSfx(string sfxId);                            // procedural clip
    IFallbackSequence CreateVideoFallback(string videoId);        // same duration as video
}
```

* 🟨 검증: public/assets가 비어 있어도 전체 Flow가 완주하고, 파일을 넣으면 코드 변경 없이 자동 반영된다.

### 9.4 Icon (mobile + desktop)

* 🟨 [W] 표준 Icon Set은 **mobile + desktop 두 벌**이다.

| Set | 파일 | 규격 |
| --- | --- | --- |
| mobile | apple-touch-icon 180, maskable 192/512 | maskable은 중앙 80% 안전 영역 |
| desktop | PNG 16~1024 (예: 16/32/48/64/128/256/512/1024), favicon.ico | any purpose |

* ✅ RCT 실제: Icon 원본(raw_assets/images_src/icons)을 npm run images가 PNG 1024와 파생 크기(app_icon_192/512/1024, apple_touch_icon_180, favicon_16~256, favicon.ico)로 변환해 public/assets/icons에 둔다. manifest.webmanifest의 icons와 index.html의 link 태그가 이 경로를 참조하고, icon.svg는 maskable 대용으로 쓴다. 표준 구조(public/icons/mobile, desktop)로 정리할 때는 Manifest와 index.html 경로를 함께 갱신하고 DECISIONS.md에 기록한다.
* [U] Player Settings Icon(Android Adaptive Foreground/Background, iOS 1024), WebGL PWA Template Icon. 🧪

### 9.5 AI Motion Sprite Character 경로 (W3D, X11) ✅

| 항목 | 규격 |
| --- | --- |
| 전제 | Camera 시점이 고정(예: Player 후방 / NPC 정면, Yaw ≤ 8°)이어서 2방향 Sprite로 충분 |
| 제작 | AI Video(4 s, Green Screen, Back / Front) → ffmpeg → Chroma Key(Clip 모서리 자동 Sampling) → Frame Atlas → Manifest |
| 재생 | Camera-facing Billboard(SpriteCharacter), Clip별 Loop / Pingpong / Stabilize, Fallback Chain, 필요 시 좌우 반전 대체 |
| Fallback | Primitive Mannequin (Sprite 없을 때만 표시) |
| 감사 | Motion Audit(§18.5): Segment / Marker를 Frame Grid로 사람이 검토해 motion.review.json에 기록 |
| VFX / Crowd | Flipbook Sheet → Pooled Billboard(FxSprites), Crowd Sheet → Instanced Billboard (Draw Call 1, Frame당 할당 0). Perfect Hit Feedback는 visual.json hitFeedback(Hit-stop·Shake·Spark·Haptic)로만 조정 (X44 mid: 0.10 s / Amp 0.06). Rally Crowd Cheer는 hitFeedback.crowdRallyHits 임계 |

---

## 10. Video 규격

| 항목 | [W] | [U] |
| --- | --- | --- |
| 재생 | &lt;video playsinline muted> | VideoPlayer → RenderTexture |
| 비율 대응 | 원본 **contain**(잘림 없음) + 뒤에 Blur cover 복사본 (X20) | RenderTexture 2장(Blur Shader + Fit) |
| Skip | Button | Button |
| Fallback | 그림책 컷씬 / Fallback Card (동일 길이) | Camera 연출 / Fallback Card (동일 길이) |
| WebGL | – | StreamingAssets URL 재생 |
| Sound | Audio Manager 등록 | SFX Group 연결 |

---

## 11. 🟨 Account · DB 규격

**Backend Profile 정리**

| Profile | 상태 | 대상 |
| --- | --- | --- |
| **Firebase Profile** | ✅ **Primary** (W2D Toyville, W3D RCT) | 개인 설정·진행·결과·단순 Ranking, Spark(무료) Plan |
| **Supabase Profile** | 🟦 Alternate (RCT ADR-002에서 기각, 구현 검증 없음) | 관계형 Query·집계 Ranking, Unity N3D |

### 11.1 Auth 계층 (Backend 교체 가능 구조)

```ts
// [W] src/backend/types.ts (개념 계약, 프로젝트 필드는 확장)
interface AuthBackend {
  restore(): Promise<AppUser | null>;
  guest(nickname: string): Promise<AppUser>;
  google(): Promise<AppUser>;
  apple?(): Promise<AppUser>;
  withPassword(loginEmail: string, pw: string): Promise<AppUser>;
  signUp(loginEmail: string, pw: string): Promise<AppUser>;
  changePassword(loginEmail: string, current: string, next: string): Promise<void>;
  discardGuest(user: AppUser): Promise<void>;
  deleteAccount(): Promise<void>;
  signOut(): Promise<void>;
  // Admin allowlist (X41)
  addAdmin?(loginKey: string): Promise<void>;
  removeAdmin?(loginKey: string): Promise<void>;
  listAdmins?(): Promise<string[]>;
}
```

```csharp
// [U] 🧪
public interface IBackendGateway
{
    Task<AppUser> RestoreSessionAsync(CancellationToken ct);
    Task<AppUser> SignInGuestAsync(string nickname, CancellationToken ct);
    Task<AppUser> SignInWithPasswordAsync(string loginEmail, string password, CancellationToken ct);
    Task<AppUser> SignUpWithPasswordAsync(string loginEmail, string password, CancellationToken ct);
    Task<AppUser> SignInWithIdTokenAsync(IdTokenProvider provider, string idToken, string nonce, CancellationToken ct);
    Task ChangePasswordAsync(string loginEmail, string currentPassword, string newPassword, CancellationToken ct);
    Task DiscardGuestAsync(CancellationToken ct);
    Task DeleteAccountAsync(CancellationToken ct);
    Task SignOutAsync(CancellationToken ct);
    Task<SubmitResultDto> SubmitResultAsync(ResultDto result, CancellationToken ct);
    Task<IReadOnlyList<LeaderboardEntry>> GetLeaderboardAsync(int limit, CancellationToken ct);
}
// Implementations: {Firebase|Supabase}Gateway (production) / MockGateway (offline, tests)
```

### 11.1.1 MockBackend · LazyFirebaseBackend (✅ RCT, X05)

| 구성 | 규격 |
| --- | --- |
| MockBackend | localStorage 기반 전체 Auth/Save/Ranking 구현. **VITE_FIREBASE_\* 설정이 없으면 자동 선택** (Backend-Optional 개발, Asset-Optional과 같은 원리). Unit Test·Offline 개발·Mock E2E에 사용 |
| FirebaseBackend | Firebase JS SDK Modular 구현 (Auth + Firestore, 선택적 Storage) |
| LazyFirebaseBackend | createBackend()가 Firebase 설정이 있을 때 반환하는 Wrapper. 첫 호출 시 firebase SDK를 dynamic import해 **Lazy Chunk**로 분리 → 초기 Bundle 축소 |
| 선택 규칙 | createBackend(): Firebase Env 존재 → LazyFirebaseBackend, 없음 → MockBackend. 화면·Model은 Backend 인터페이스만 의존 |
| Env | VITE_FIREBASE_API_KEY / AUTH_DOMAIN / PROJECT_ID / FIRESTORE_DATABASE_ID / REGION / STORAGE_BUCKET / MESSAGING_SENDER_ID / APP_ID / MEASUREMENT_ID, VITE_PHONE_ALIAS_DOMAIN (.env.example에는 Key 이름만) |

### 11.2 Mobile Number Login (SMS 없음, Phone Alias) ✅

```
"+82" + "010-1234 5678" → strip spaces/hyphens/leading 0 → 8–15 digits
→ alias email "821012345678@phone.{aliasDomain}" + password      // Firebase Email/Password Provider로 처리
display: "+82 10 1234 5678"
```

* 🟨 **SMS Phone Provider는 사용하지 않는다.** 휴대폰 번호는 Alias Email + Password로만 인증한다. Console의 Phone(SMS) Provider는 비활성 유지 권장 (비용·남용 방지).
* 🟨 Alias Domain은 환경 설정값(VITE_PHONE_ALIAS_DOMAIN). 입력은 국가번호 선택([+82] 기본, +81 등) + 번호(placeholder "10 1234 5678").
* 🟨 Supabase를 쓰는 경우 Email Confirmation이 켜져 있으면 Alias 계정이 Login할 수 없다 → Confirmation OFF. Firebase는 Email Verification을 요구하지 않는다.
* 🟨 Password는 Firebase가 평문을 제공하지 않으므로 MyPage에서 **마스킹 표시 + 변경만** 지원한다.

### 11.3 Guest Nickname + 100일 TTL

| 요소 | Firebase Profile ✅ | Supabase Profile 🟦 |
| --- | --- | --- |
| 인증 | Anonymous Auth + nickname(displayName) 필수 | Anonymous Sign-in |
| 중복 방지 | guestNames/{nicknameLower} (Profile과 Batch로 동시 생성) | unique index on lower(username) where account_type='guest' |
| Logout (X39) | **guestNames·Ranking 해제**(별명 재사용 가능, 검색 불가). Profile/Mileage는 TTL까지 보관 | Flush → discard_guest() RPC |
| TTL | expireAt = 생성 + **100일** + Firestore TTL Policy | expire_at + pg_cron 일일 삭제 Job |
| 등록 회원 | expireAt 없음 | expire_at null |

* 🟨 TTL은 Firestore Document만 삭제한다. 방치된 Anonymous Auth User는 Identity Platform 업그레이드 시 자동 정리(30일) 옵션을 쓴다 (ADR-002 한계).

### 11.4 Firebase Profile Schema & Rules ✅ (RCT)

```
profiles/{uid}: username, usernameLower, accountType(guest|email|phone|google|apple), handedness, preferredLanguage,
                mileage, role('player' only client-created), expireAt?, createdAt, updatedAt
profiles/{uid}/progress/{stageId}: cleared, bestScore, …
profiles/{uid}/results/{autoId}: Append-only Match Result
guestNames/{nicknameLower}: uid, expireAt
rankings/{uid}: username, stageCleared, highScore, lastResult, updatedAt     // Public Read
admins/{loginKey}: createdAt, createdBy                                      // Admin Allowlist (X41)
```

```js
// firestore.rules (개념)
match /guestNames/{n} { allow get: if true; allow create: if isOwner(uid) && hasOnly([uid, expireAt]); allow delete: if owner; }
match /rankings/{uid}  { allow read: if true; allow create, update: if isOwner(uid) && isNewResult(lastResult) && highScore == max(prev, result.score) …; }
match /admins/{id}     { allow read: if signedIn(); allow create, update, delete: if isAdmin(); }
match /{document=**}   { allow read, write: if false; }
```

* 🟨 **Named Firestore DB (X40)**: 앱은 (default)가 아닌 named DB만 사용한다. Client에서 initializeFirestore(app, settings, databaseId)로 지정하고, firebase.json의 firestore 항목에 database, rules, indexes를 명시한다. (default) DB가 CLI 첫 배포 시 생성될 수 있으나 앱은 사용하지 않는다.
* 🟨 **Region**: Console에서 DB 생성 시 Region을 정한다. 예: asia-northeast3 (Seoul). 변경 불가이므로 Phase 0에서 결정하고 ADR/DECISIONS에 기록한다. {Region}
* 🟨 Result 검증 한계(ADR-002): Server Function 없이 Spark Plan에서 동작하며 Rules는 범위·일관성만 강제한다. Ranking 부정 방지를 강화하려면 Blaze Plan의 Cloud Functions로 submitMatchResult를 옮긴다 (Client 계약 불변).

### 11.4.1 Admin Allowlist (X41) ✅

* 🟨 Admin은 **Firestore admins/{loginKey} Document 존재**로만 판정한다. loginKey = 정규화한 Email 또는 휴대폰 digits 또는 Phone Alias Email. 시드(최초 Admin)는 Console 또는 Admin SDK로 Secret 없이 문서 ID만 등록한다.
* 🟨 UserProfile.isAdmin은 Allowlist 조회 결과이며, profiles.role은 Client가 player로만 생성할 수 있다 (Client가 admin을 자기 부여 불가).
* 🟨 기존 Admin만 addAdmin / removeAdmin / listAdmins를 호출한다 (Rules: isAdmin()이 admins Write 권한).
* 🟨 Admin UI는 html[data-admin='1'] 등으로 노출을 제어하며, 일반 사용자에게는 DOM에서 숨기거나 렌더하지 않는다.
* 🟦 VITE_ADMIN_IDS(Build 시점 ID 목록)는 Toyville ✅ 방식이다. 공개 전제이므로 보안 목적이 아닌 UI 힌트에만 쓰고, 신규 프로젝트는 DB Allowlist를 우선한다.

### 11.4.2 Smoke Test ✅

```
npx tsx tools/firebase-smoke.ts
# Auth(Anonymous) 생성 → Firestore 대상 named DB CRUD → (선택) Storage 업로드/다운로드/삭제 → 테스트 계정·문서 삭제
```

* 🟨 Rules·Index·Storage 배포 후 반드시 실행하고 결과를 docs/reports 또는 DECISIONS.md에 기록한다.

### 11.5 Supabase Profile Schema & Security 🟦 (Alternate, 미검증)

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 2 and 12),
  account_type text not null check (account_type in ('guest','email','phone','google','apple')),
  handedness text not null default 'right' check (handedness in ('right','left')),
  preferred_language text not null default 'ko' check (preferred_language in ('ko','en','ja')),
  mileage bigint not null default 0,
  role text not null default 'player' check (role in ('player','admin')),
  expire_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- + {game}_progress, {game}_results, rankings (see project 07)

alter table public.profiles enable row level security;
create policy "own profile read"  on public.profiles for select using (auth.uid() = id);
create policy "own profile write" on public.profiles for update using (auth.uid() = id);
revoke update on public.profiles from authenticated;
grant update (username, handedness, preferred_language) on public.profiles to authenticated;   -- role is never client-writable

select cron.schedule('purge-expired-guests', '15 3 * * *', $$
  delete from auth.users u using public.profiles p
  where p.id = u.id and p.account_type = 'guest' and p.expire_at < now();
$$);
```

* 🟨 DB Enum 값은 **소문자**(right/left, ko/en/ja) + CHECK Constraint.
* 🟨 Client → Table 직접 Insert/Update는 **설정 Column만** 허용, 진행·점수는 RPC만.
* 🟦 Supabase를 채택하려면 ADR에 사유를 기록하고, 위 Firebase Profile의 Phone Alias·Guest TTL·Admin 규칙에 대응하는 항목을 구현·검증한 뒤 ✅로 승격한다.

### 11.6 Save / Sync 규칙 ✅

| 규칙 | 내용 |
| --- | --- |
| Local Key | {app}.save.{uid} |
| Load | Local → Cloud Pull → **병합** → User 설정 적용 → save:change |
| 병합 | 단조 증가 값 max, 설정은 최신 updatedAt 우선, 목록은 합집합 |
| Upload | 설정 1.5 s Debounce, 결과는 즉시 Transaction/RPC + 실패 시 Local Queue 재시도 |
| Logout | Flush 후 종료 |

### 11.6.1 Offline Match Result Queue (Firebase, X44) ✅

| 규칙 | 내용 |
| --- | --- |
| 저장소 | localStorage Key 예: rct.fb.pendingResults. **IndexedDB는 필수가 아님** (Light data + 단순 재전송이면 localStorage로 충분, 점검 Q5=A) |
| 항목 | { uid, queuedAt, attempts, result }. Legacy(bare MatchResult)는 현재 uid로 Wrap |
| Queue 조건 | submitMatch 실패가 network 계열일 때만. Auth/검증 오류는 Queue하지 않음 |
| Flush | restoreSession 성공 시, window online, document visibility visible. Exponential Backoff, attempts 상한 초과 시 Drop |
| 계정 분리 | Flush는 현재 Auth uid와 일치하는 항목만 전송. 다른 uid 항목은 보관 |
| 상한 | 최근 N건만 유지 (예: 30). smoke로 CRUD 확인 후 배포 |

### 11.7 설정 저장 범위

| 범위 | [W] | [U] | 예 |
| --- | --- | --- | --- |
| Device | localStorage['{app}.settings'] | PlayerPrefs ({ns}.settings.\*) | language, layoutOverride, 공 속도, Play Level, 시각 Cue 선택 |
| Session | SessionPrefs | SessionPrefs | sound |
| User | Cloud User Record | Cloud profiles | handedness |

---

## 12. 🟨 Ranking & Anti-Cheat (채택 시)

| 규칙 | 내용 |
| --- | --- |
| 제출 | Firebase Spark: Client Transaction 1회(Result 생성 + Progress / Ranking / Mileage 갱신) + Rules의 getAfter 교차검증 ✅ / Blaze: Callable Function / Supabase: Security Definer RPC 🟦 |
| 검증 | 범위 Check(예: 점수 0–40000), 선승 점수·최소 Play 시간(예: 20 s) 상한, Stage 순차 해금 |
| Rate Limit | 사용자당 분당 N회 (Cloud Function/RPC 환경, 예: 6) |
| 저장 | Result Log Insert(Append-only) → Progress Upsert(max) → Ranking Upsert → Mileage 누적 |
| 조회 | Ranking Public Read: Nickname·Score·진행·순위(count Aggregation)만 |
| 이상치 | Flag Column + Admin 검토 (Blaze/Supabase 환경) |

---

## 13. 🟨 Gameplay Core 표준 (Pure Model)

### 13.1 구조

```
{Game}Model (pure)  ← Tick(dt fixed) / Submit*(input, tSim) / Snapshot / events
   ├── Rule (win/lose, turn/serve, scoring)
   ├── Physics or Board logic (analytic where possible)
   ├── Judge (timing/offset tiers → result)
   ├── Planner (target-solved outcomes)
   ├── AI Brain (reachability → probability roll → action)
   └── IRandom (seeded)
View/Scene (engine) ← reads Snapshot, plays animation/FX/audio, never mutates rules
```

* ✅ [W] 위치: src/game/{core, physics, ai, match} — Pure TypeScript.

### 13.2 규칙

| 규칙 | 내용 |
| --- | --- |
| **No DOM / Three.js** | src/game은 DOM, window, document, Three.js, Firebase를 import하지 않는다 (Vitest environment node에서 실행 가능해야 함) |
| **No Date.now / Math.random** | 시간은 인자(dt, tSim, MatchClock)로, 난수는 주입된 IRandom으로만 사용. 직접 호출 금지 (Static Scan Test 권장) |
| Fixed Tick | 60~120 Hz, Render와 분리 (Accumulator 방식) |
| 해석적 계산 | 궤적·충돌은 가능하면 수식으로 한 번 계산해 Pre-allocated Buffer에 기록 (Frame 독립) |
| IRandom | Seeded 구현을 주입, Test·Sim에서 Seed 고정 → 같은 Seed = 같은 결과 |
| 판정 Pipeline | ① Window 밖 → Miss ② 축별 Offset 계산 ③ 축별 Tier ④ min 규칙 ⑤ 기하 결과(Zone/Fault) ⑥ 확률 보정(있으면) ⑦ 결과 Event |
| Target-Solved Outcome | 결과(착지점·목표 Cell)를 먼저 정하고 물리량을 역산 → "의도한 결과"와 "보이는 궤적"이 항상 일치 |
| **JSON Data Table (X02)** | Balance 값은 src/data/\*.json (Typed Loader)에만 둔다. Gameplay Code에 Magic Number 금지. CSV 대신 Typed JSON을 쓰되 Column 구성은 유지 ([U]는 CSV) |
| Zero GC | Tick 경로 할당 0 (Struct, Pool, 고정 Buffer, Vector 재사용) |
| Snapshot | View는 Read-only Snapshot만 읽음 |
| Test | Vitest: 결정론(같은 Seed 재현), 경계값, 판정 Tier, Score Rule, Passive Window, Comeback Mul. Pure Model 변경 시 sim도 재실행 |
| Character Passives | characters.json passives: perfectWindowMul / moveSpeedMul / shotSpeedMul. Perfect Tier에만 perfectWindowMul 적용 (X44) |
| AI Comeback | rules.comeback: rallyStart · returnChanceDropPerHit · returnChanceFloorMul. npcComebackMul(rally)로 Return Chance 보정 (X44) |
| High-Level Aim | Lv4~5 corners: 플레이어 반대 코너·역크로스, 슬라이스 가중 (aiDifficulty spinWeights + styleTarget) |

### 13.3 판정 Table Template

| Tier | Timing \|Δt\| | Offset | 결과 확률/배율 | Feedback |
| --- | --- | --- | --- | --- |
| {Perfect} | { } | { } | { } | Spark + Shake + Hit-stop + Haptic (visual.hitFeedback) |

### 13.4 Headless Balance Simulation

* 🟨 Bot Player(실력 Parameter: Timing σ, 선택 정확도)로 Stage별 N판(≥ 1,000) Simulation → 승률·평균 시간·결과 분포를 docs/reports/balance.md로. ✅ [W] npm run sim (tools/sim.ts)
* 🟨 목표 범위 표(05 §2.4)를 벗어나면 **Data(JSON)만 조정**하고 재실행. 조정 근거는 DECISIONS.md에 남긴다. (RCT X06: returnChance 조정, Stage 10 숙련 Bot 승률 98% → 목표 범위)
* 🟨 상세 Gate는 §18.5.

---

## 14. 화면별 공통 Component 규격

| Component | 규격 |
| --- | --- |
| System Bar | 좌: Sound(항상), Home(+Tooltip), Admin Pause / 우: Language, MyPage, Logout (프로젝트 순서 명시). **기본 1행**, Portrait Compact(X43), 2행은 sysbarRows 2일 때만 |
| Home | Gameplay 중 확인 Modal + pause.set(Menu), 그 외 closeAllModals() → Title. 「처음으로 돌아가기」Tip을 Login/가입 Card·System Bar·MyPage에 제공 (X39) |
| Modal | 열린 Handle 추적, Backdrop 닫기, System Bar 실측 높이 아래 시작 |
| Login | Home Corner · Guest(Nickname View) · Google · Apple · [Email \| Mobile Number] Tab · Password · Login · 중앙 CTA 「처음이면 회원가입」 |
| Signup | Email/휴대폰 선택 → 폼(ID·Password·확인) → 가입 → 자동 Login → 즉시 Setup |
| Mobile 입력 | [+82] 국가번호(+81 등 선택) + 번호(placeholder "10 1234 5678") |
| Guest | Nickname 필수, Logout 후 검색 불가·별명 재사용, DB는 100일 TTL 보관 (X39) |
| MyPage | Profile, ID, Password 마스킹+변경, 게임 설정(Handedness 등), Mileage, Guest 경고, Account 삭제, Logout. Setup/Score 화면에는 MyPage + Logout을 우측에 나란히 |
| Setup | 단일 Scroll Container(X38/X42): 캐릭터 → 설정 → Stage 순서의 문서 흐름, Desktop·Portrait 캐릭터 3열, Landscape는 좌측 3행 + 우측 설정 |
| Result | 승패, 점수 내역, Best, 순위, 하단 Action Button (프로젝트별) |
| How to Play | 문단별 Localization Modal + 도해 Icon |
| Gameplay Control | Pointer ID 고정, Touch Block Policy(§5.5 Allowlist), Release-to-Act, Desktop WASD + Arrows/IJKL/Numpad Side·Height, Haptic on Press/Release/Perfect (X44) |
| Tension HUD | Match Point / Deuce 시 Scoreboard Tension Class + Callout (call.matchPoint / call.deuce) |

---

## 15. 🟨 보안 · Secret 규격

| 규칙 | [W] | [U] |
| --- | --- | --- |
| Secret 위치 | .env.local (gitignore). .env.example은 Key 이름만 | Config/backend.local.json (gitignore) → Build 시 Config 생성 |
| Client 공개 값 | VITE\_\* (Firebase Web Config, Supabase anon key) — Web Config는 공개 전제, Console에서 Authorized Domain·API Key 제한 | Supabase URL·anon key |
| 절대 금지 | Service Account, service_role, DB Password, Admin Password, Keystore Password | 동일 |
| Dev 전용 계정 | VITE_DEV\_\* + import.meta.env.DEV Guard, 배포 환경 변수 등록 금지. Dev 전용 기능(예: autoplay Bot)도 DEV Guard | #if UNITY_EDITOR \|\| DEVELOPMENT_BUILD |
| Admin 판정 | **Firestore admins/{loginKey} Allowlist (X41)** ✅ 또는 Backend Role. 일반 사용자에게 Admin UI 미표시 | Backend role = 'admin' 🧪 |
| Build 전 검사 | dist/ grep (service account, private key, password, sk\_) | Build Output grep |
| 첫 Push 전 | README·문서 Secret 전수 검사 (Admin 실제 계정·Password 금지) | 동일 + google-services.json 공개 여부 판단 |
| Test 계정 | E2E·smoke 종료 시 삭제 | 동일 |

---

## 16. PWA · Store 규격

### 16.1 [W] PWA ✅

```json
{ "id": "/", "start_url": "/", "scope": "/", "display": "fullscreen",
  "display_override": ["fullscreen", "standalone"], "orientation": "any",
  "icons": [ { "src": "/icons/desktop/icon-512.png", "sizes": "512x512", "purpose": "any" },
             { "src": "/icons/mobile/maskable-512.png", "sizes": "512x512", "purpose": "maskable" } ] }
```

* 최소 Service Worker(Cache 없음) + Cache-Control: no-cache, Production에서만 등록, Page.getInstallabilityErrors = [] (Toyville ✅ 기준).
* ✅ RCT 현재 상태: public/manifest.webmanifest(fullscreen, orientation any, icons는 public/assets/icons 경로) + index.html link 태그. Service Worker는 미도입이며 설치 가능 판정이 필요하면 최소 SW를 추가하고 DECISIONS.md에 기록한다.

### 16.2 [U] Store + WebGL 🧪

| Target | 규격 |
| --- | --- |
| Android | AAB, IL2CPP, ARM64, Target API = Store 최신 요구 |
| iOS | IL2CPP, Sign in with Apple Capability, Privacy Manifest |
| WebGL | Brotli, Unity 6 PWA Template, 파일명 Hash, .wasm/.data 장기 Cache |
| Store Checklist | Privacy Policy, Account Deletion, Apple Login, Data Safety / Privacy Label, 연령 등급, 현지어 Listing |

* 🟦 [W] Store 출시: Capacitor로 Wrapping (ADR-001). 한계가 확인되면 N3D 이관을 ADR로 결정.

---

## 17. 🟨 배포 규격

### 17.1 [W] Vercel (SPA Rewrites + Asset Cache) ✅

```json
{ "framework": "vite", "buildCommand": "npm run build", "outputDirectory": "dist",
  "rewrites": [{ "source": "/((?!assets/|.*\\.[a-zA-Z0-9]+$).*)", "destination": "/index.html" }],
  "headers": [ { "source": "/sw.js", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
               { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] } ] }
```

* 🟨 SPA Rewrite: 확장자 없는 경로는 /index.html로 보내 Deep Link 새로고침을 지원한다. Vercel은 파일 시스템을 먼저 확인하므로 RCT는 단순 형태 rewrites [{ source: "/(.*)", destination: "/index.html" }]도 동작한다 ✅ (실제 vercel.json). 두 형태 중 하나를 선택하고 Asset 404가 index.html로 가려지는지 확인한다.
* 🟨 Asset Cache: /assets/(.*) 에 immutable 장기 Cache. Vite 해시 번들(JS/CSS)에는 안전하다.

> ⚠️ Hash 없는 Asset에 immutable을 쓰려면 ?v= 버전 Query 필수. RCT는 public/assets의 생성물(webp, atlas, audio 등)이 파일명 Hash 없이 같은 /assets 경로에 배포되므로, 교체 시 stale Cache 위험이 있다 → ({Asset Version Query} 또는 미디어는 max-age 짧게 + must-revalidate)를 Phase 0에서 정해 기록한다.

### 17.1.1 Firebase Hosting (선택 🟦)

* firebase.json에 hosting(public dist, rewrites ** → /index.html)을 둘 수 있으나 기본 배포는 Vercel이다. Firebase Hosting은 Rules/Index/Storage 배포용 firebase.json과 같은 파일에 공존하며, 사용하지 않아도 무방하다.
* 🟨 Firebase Console의 Authorized Domains에 Vercel Production/Preview 도메인을 추가해야 Google 등 소셜 Login이 동작한다.

### 17.2 [U] WebGL Hosting 🧪

```json
{ "headers": [
  { "source": "/Build/(.*)\\.br", "headers": [{ "key": "Content-Encoding", "value": "br" }] },
  { "source": "/Build/(.*)\\.wasm\\.br", "headers": [{ "key": "Content-Type", "value": "application/wasm" }] },
  { "source": "/Build/(.*)\\.js\\.br", "headers": [{ "key": "Content-Type", "value": "application/javascript" }] },
  { "source": "/Build/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] } ] }
```

### 17.3 환경 설정 등록표

| Key | 출처 | Client 포함 | 배포 등록 |
| --- | --- | --- | --- |
| Firebase Web Config (VITE_FIREBASE_\*), Named DB ID, Region | Firebase Console | ✅ | ✅ Vercel Env |
| Backend URL / Public Key (Supabase 사용 시) | Backend Console | ✅ | ✅ |
| Phone Alias Domain (VITE_PHONE_ALIAS_DOMAIN) | 프로젝트 결정 | ✅ | ✅ |
| Admin Allowlist | Firestore admins 컬렉션 (X41) | ❌ (DB 조회) | – |
| Admin ID 목록 VITE_ADMIN_IDS (레거시, 선택) | 운영자 | ✅ (공개 전제) | ✅ |
| Dev Admin 계정 / Password | 개발자 | ❌ | ❌ **절대 금지** |
| Service Account / Service Role / Server Secret | Backend Console | ❌ | Server Function 환경에만 |

* 🟨 소셜 Login: 배포 Domain·Redirect URL을 Auth Provider 승인 목록(Authorized Domains)에 등록.

---

## 18. 🟨 QA · 검증 규격

### 18.1 명령 세트

**필수 (Mandatory) — 배포·Phase 종료 전 전부 통과 ✅**

| [W] 명령 | 대응 [U] 🧪 | 통과 기준 |
| --- | --- | --- |
| npm run typecheck (tsc --noEmit) | Unity Compile (batchmode) | Error 0 |
| npm test (vitest run) | -runTests -testPlatform EditMode | 전부 통과 (Model 결정론 포함) |
| npm run i18n:check | LocalizationParityTests | OK (ko 기준 missing/extra 0) |
| npm run build (tsc --noEmit + vite build) | -executeMethod {NS}.Editor.BuildScripts.BuildAll | 성공 + Secret 0건 |
| npm run sim | Headless Simulation | 목표 범위 (§18.5), docs/reports/balance.md 갱신 |
| npm run e2e (tools/e2e-shots.ts) | Audit Runner | 3-Device × 3-언어 감사 통과 (§18.2), Screenshot 저장 |
| npx tsx tools/firebase-smoke.ts | Supabase E2E 🟦 | Auth + Firestore(named DB) CRUD 통과, 테스트 데이터 정리 |

**권장 (Recommended) 🟦**

| [W] 명령 | 목적 | 통과 기준 |
| --- | --- | --- |
| npm run e2e:play (tools/e2e-playtest.ts) | 캐릭터·Theme별 전체 Match 자동 Playtest, End → Score 화면까지 | Runtime Exception 0, ballOff % 목표 이하, Flow 완주 |
| npm run motion:audit | Motion Clip 구간·Marker 감사 (§18.5) | docs/reports/motion_audit.md Warning 검토 완료 |
| npm run images | raw_assets/images_src → public/assets 변환 | 이름 검사 오류 0 |
| npm run prompts | AI 생성 Prompt 문서 재생성 | Generator와 문서 일치 |
| npx tsx tools/e2e-controls.ts | Control / Touch Block 점검 | 허용 영역 밖 입력 상태 변화 0 |
| – | PlayMode Flow Smoke, Framing, Rotation 🧪 | [U] 전부 통과 |

### 18.2 3-Device 화면 감사

| Profile | 해상도 | [W] CDP Emulation | [U] Audit Runner |
| --- | --- | --- | --- |
| mobile-portrait | 390×844 (DPR 2) | mobile + touch | Game View 해상도 + Touch 가정 |
| mobile-landscape | 844×390, 2400×1080(21:9) | mobile + touch | 동일 |
| desktop | 1280×720 / 1440×900 | mouse | 동일 |

검사 항목 (모든 화면 × 3언어):

- [ ] 보이는 Interactive 요소 사각형 상호 겹침 0건 ([W] getBoundingClientRect / [U] worldBound)
- [ ] Touch ≥ 44 (Hit Area 포함), Text ≥ 12, Safe Area 밖 잘림 0
- [ ] **One-Viewport**: 문서 전체 Scroll 없음 (허용된 단일 Scroll Container 제외), System Bar 아래 --sys-h 겹침 0
- [ ] **System Bar 행 수**: HudProfile.sysbarRows와 일치 (Portrait 기본 1행, X43)
- [ ] Runtime Exception 0
- [ ] Home → Title, Logout → Title
- [ ] **Gameplay 중 회전** → 상태 동일 + ≤ 0.2 s
- [ ] Play-Area 지표 (2D 면적 / 3D Framing·Occlusion·Ball off-screen %)
- [ ] Handedness 전환 시 배치·내부 열·Animation Mirror
- [ ] **Touch Block (X35)**: Allowlist 밖 영역 입력 Injection → 상태 변화 0
- [ ] Screenshot 저장 (docs/reports/audit/{profile}-{lang}-{screen}.png 또는 docs/reports/shots)

> 팁 [W]: Vite HMR 때문에 Test의 import('/src/…')가 다른 Module Instance를 받을 수 있다 → 실제 로드 URL로 import. ✅
> 팁 [U]: Batchmode는 -nographics 시 Screenshot 불가 → Audit은 Graphics Device가 있는 Runner에서 실행. 🧪

### 18.3 Backend E2E (실제 Backend, 종료 후 정리)

- [ ] Email 가입 → 자동 Login → Password 변경 → 이전 Password 거부 → 새 Password Login
- [ ] Mobile Number 가입(국가번호, 하이픈·공백·선행 0) → Alias Login
- [ ] Guest Nickname 중복 거부 → Logout 후 별명 재사용 가능 → expireAt(100일) Field 존재
- [ ] User 설정(Handedness) → Local 삭제 후 재Login 복원
- [ ] Ranking 제출 검증 실패 Case 거부 / 정상 Case 순위 반환 (채택 시)
- [ ] 타인·비Login 접근 차단, role / admins 직접 수정 차단 (Admin만 admins Write)
- [ ] Account 삭제 Cascade (Firestore 문서 삭제 후 Auth 삭제, recentLogin 안내)
- [ ] firebase-smoke 통과 (named DB)

### 18.4 운영 Smoke Test

- [ ] 운영 URL/Store Build 실행, Asset 렌더, Manifest/Asset 200
- [ ] Mobile Portrait로 Guest 시작·가입·Logout
- [ ] 일반 사용자에게 Admin UI 미표시
- [ ] PWA 설치 가능 (Web) / Store 심사 Checklist 충족 (Native)
- [ ] Firebase Authorized Domain에 운영 도메인 등록 확인

### 18.5 Headless Balance & Motion Audit Gates ✅ (신규)

사람이 화면을 보지 않고도 Balance와 AI Motion 품질을 점검하는 자동·반자동 Gate이다. 값은 {프로젝트별}이며 아래는 RCT 기준 예시다.

**A. Headless Balance Gate (npm run sim)**

| Gate | 기준 | 실패 시 |
| --- | --- | --- |
| 결정론 | 같은 Seed 2회 실행 결과 동일 | Pure Model 위반(Date.now/Math.random/Frame 의존) 수정 |
| 표본 | Stage·Bot Level별 N ≥ 1,000판 | 표본 부족이면 재실행 |
| 목표 범위 | 승률·평균 Rally·평균 시간·결과 분포가 05 §2.4 / 07 목표 범위 이내 | **Data(JSON)만 조정** 후 재실행, DECISIONS.md에 기록 (예: X06) |
| 단조성 | Stage/Level이 오를수록 숙련 Bot 승률 단조 감소 | AI 난이도 표 조정 |
| 보고 | docs/reports/balance.md 자동 생성 (Plain Markdown 변환 적용) | – |

**B. Motion Audit Gate (npm run motion:audit, AI Motion Sprite 채택 시)**

| Gate | 기준 | 실패 시 |
| --- | --- | --- |
| 구간 측정 | Clip마다 실제 동작 구간을 측정해 motion.config.json overrides에 Segment / Marker 저장 | 재측정 |
| Marker 사람 검토 | Swing/Serve Contact Marker는 Frame Grid(0.1 s 간격)를 보고 판정해 motion.review.json 기록 (Energy Peak 자동 추정만 믿지 않음, X21) | 재검토 |
| 방향 정확성 | Clip이 Spec 방향(Forehand/Backhand, run 방향)과 일치. 불일치 Clip은 exclude + 좌우 반전/대체 Clip (X22) | exclude 또는 재생성 |
| Loop 품질 | 끝 Frame과 첫 Frame Seam ≤ 15%, 작은 Seam은 Crossfade, 주기 없는 Clip은 Pingpong (X22) | range 조정 |
| Stabilize | 제자리 동작에서 발 흘러감(dx) 상쇄 | Manifest dx 확인 |
| Timing 정합 | Backswing 표시 시간이 Model Windup과 일치 (예: 0.32 s 안에 Take-back 완료, X23) | visual.json 조정 |
| 보고 | docs/reports/motion_audit.md, motion_review.md | – |

**C. Playtest Gate (npm run e2e:play, 권장)**

* 전체 Match 자동 진행(Dev 전용 autoplay Bot) → Intro → Play → End → Score 화면 도달, Runtime Exception 0, ballOff % 기록 (X23, X24, X31).

---

## 19. Admin · Debug 도구

| 도구 | 접근 | 기능 |
| --- | --- | --- |
| Pause / Go | System Bar (Admin) | Game·Video·Audio 전체 정지 |
| Admin Allowlist 관리 | MyPage/Admin (Admin) | addAdmin / removeAdmin / listAdmins (X41) |
| Admin Tuning | Menu (Admin) | 난이도·속도·Window 배율, Manual Mode 등 |
| Layout 강제 전환 | Menu (Admin) | 자동/desktop/landscape/portrait + Device Frame |
| FPS / Profiler Overlay | Menu (Admin) | FPS, GC Alloc, Draw Call |
| Cheat Console | ~ (Admin) | 점수·해금·즉시 승리 |
| Judgment Debug Overlay | Menu (Admin) | Δt, Offset, Zone, Tier 시각화 |
| Camera Framing Overlay | Admin | 투영 기준선 표시 |
| Dev autoplay | import.meta.env.DEV + query (?autoplay) | Balance Bot이 Player 조작, e2e:play에서 사용 (배포 Build 제외) |

---

## 20. ⚠️ 교훈 → Form 4.1 표준화 요약

| 실제 문제 | 원인 | 표준화된 해결 | 출처 |
| --- | --- | --- | --- |
| 기획 Stack(Three.js) 불필요 | 기획 단계 Stack 고정 | Phase 0 재검토 + ADR | ✅ Toyville |
| 세로 메뉴 겹침 | Bar 높이 추정 | 실측 높이(--sys-h) 공개 | ✅ |
| 기기별 수치 분산 | 곳곳 Hard-coding | HudProfile 단일 출처 | ✅ |
| 오른손잡이인데 방향키가 왼쪽 | 용어 정의 부재 | "주력 손 = Primary Action" 명시 | ✅ |
| 배포본 그림이 Placeholder | Manifest dev 전용 | Build 시 생성 | ✅ |
| 재Login 시 설정 소실 | 범위 미정의 | Device/Session/User 분류 | ✅ |
| README에 Admin Password | 문서에 Credential | Secret 파일만 + Push 전 검사 | ✅ |
| 확인 창 중 게임 진행 | Pause 미연동 | 사유별 Pause | ✅ |
| Web 전용 Form을 Unity에 적용 불가 | 계약과 구현 혼재 | 계약 + [W]/[U] Binding 분리 | ✅ RCT (Form 4.0 설계가 W3D 전환에서도 유효) |
| 문서 간 규칙 충돌 20건 | 문서 분산 작성 | Precedence + Conflict Log + Open Decisions | ✅ RCT |
| 구도 요구와 직관적 Camera 불일치 | 수치 검증 부재 | Camera Framing 공식 + Validator | ✅ RCT |
| 25% 규칙 vs 9분할 판정 충돌 | 판정 모델 미통합 | Fault Ring + Inner Zone, Tier min 규칙 | ✅ RCT |
| Timing 판정이 Frame Rate에 흔들릴 위험 | Polling 기반 | Input Timestamp → SimClock | ✅ RCT |
| ja 번역에 한국어 혼입 | 검수 부재 | Parity Test에 Hangul 검사 | ✅/🧪 |
| Unity WebGL에서 Backend SDK 불가 위험 | Platform 제약 미확인 | Platform 제약 Matrix + REST Gateway | 🧪 N3D |
| Agent가 Scene YAML 편집 시 손상 위험 | Editor 의존 | Code-first Builder + Batchmode | 🧪 N3D |
| **Unity 미설치로 Compile·Test·Build 불가 (X01)** | Phase 0에서 개발 환경 검증 누락 | **Stack 전환(Unity → Three.js W3D), Decision Trigger에 환경 가용성 추가, ADR-001** | ✅ RCT |
| **Backend 과잉 (Supabase) (X08)** | 주고받는 Data가 적음 | **Light data → Firebase, MockBackend, ADR-002, Rules로 범위 검증** | ✅ RCT |
| **Rig 없이 Character 품질 확보 (X11)** | 3D Animation 제작 비용 | **AI Video → ffmpeg Atlas → Billboard, Mannequin Fallback** | ✅ RCT |
| **AI 도구 출력(jpg)과 게임 경로(webp) 불일치 (X14)** | Asset 수동 변환 | **raw_assets/images_src Inbox + npm run images 일괄 변환, public/assets 직접 편집 금지** | ✅ RCT |
| **AI Video가 Prompt Timing을 안 지킴 (X21)** | Contact가 0.05~0.3 s 늦음, Backswing 정점 편차 | **Motion Audit + 사람 Marker 검토(motion.review.json), Clip별 overrides** | ✅ RCT |
| **Markdown Viewer에서 기호·수식 깨짐 (X26)** | inline backtick/LaTeX 혼용 | **Plain Markdown Policy: Narrative 금지, Fenced만 허용, plainMarkdown.ts 자동 변환** | ✅ RCT |
| **게임 외 영역 Touch로 Focus·확대·오작동 (X35)** | Gameplay 중 전체 DOM 입력 허용 | **Match 입력 Allowlist + Capture 차단** | ✅ RCT |
| **설정 화면에서 Stage가 설정을 가림 (X38)** | 다중 Scroll·절대 배치 | **One-Viewport + 단일 Scroll Container** | ✅ RCT |
| **세로 System Bar 2행이 화면을 잡아먹음 (X43)** | 버튼 수 대비 Padding 과다 | **Portrait Compact Sysbar 1행 (36 px, Gap 4 px)** | ✅ RCT |
| **Admin ID가 Client Build에 고정 (X41)** | 환경 변수 Allowlist는 변경에 재배포 필요 | **Firestore admins/{loginKey} Allowlist, Admin만 추가·삭제** | ✅ RCT |
| Firebase named DB와 (default) DB 혼선 (X40) | CLI 첫 배포 시 (default) 생성 | **Client는 named DB 지정, firebase.json database 명시, smoke로 확인** | ✅ RCT |
| **점검 보고서 P0 Letterbox / IndexedDB / 스태미나 과잉 (X44)** | 기존 표준·ADR과 충돌 또는 ROI 낮음 | **Letterbox 금지 유지(Blur+Contain), Offline은 localStorage Pending Queue, 스태미나 UI 스킵**. Perfect juice는 mid 값, Passives·Comeback·Haptic·Deuce HUD·Audio Unlock은 채택 | ✅ RCT |
| **고난이도 AI가 중앙 반환에 치우침 (X44)** | Targeting Style 가중 부족 | **corners 빈 코너·역크로스 + 슬라이스 편향, Rally Comeback으로 Return Chance 하락** | ✅ RCT |
| Rule의 시작(Serve) 누락 | Spec Gap | Gap 기록 + 기본안 | ✅ RCT |

---

## 21. Phase Plan Template

| Phase | 내용 | 산출물 | DoD |
| --- | --- | --- | --- |
| 0 | 문서 정독, 충돌·Gap 보고, Stack 재검토(ADR), Repository·Rules·Backend 준비 | ADR, DECISIONS, Skeleton | **Gate G0** |
| 1 | App Shell: Layer, EventBus, Pause, Clock, Settings, LayoutManager + HudProfile, i18n, Audio, Router, System Bar, Video Fallback | 전 화면 이동 | 3 Layout × 3 언어 전환 |
| 2 | Pure Model + Data Table + Unit Test + Headless Simulation | Test, balance.md | Test 100%, sim Gate |
| 3 | Engine Presentation (Scene/Camera/Board), Input, HUD, Placeholder | 1 Stage 완주 | Play-Area 지표 통과 |
| 4 | 전체 Flow, Stage 진행, 연출, Handedness, Pause/Home | Offline 전체 Loop | Flow Smoke (e2e:play) |
| 5 | Account·DB·Ranking·Rules·TTL (MockBackend → Firebase) | E2E, smoke 보고 | E2E + firebase-smoke 통과 |
| 6 | Asset Pipeline + 실제 Asset + Audio/Video + Icon (+ Motion Audit) | Asset 반영 | Asset 유무 모두 완주 |
| 7 | Analytics, 성능, 3기기 × 3언어 감사, Design 재정비, Balance | audit/, performance.md | 겹침 0, FPS 목표 |
| 8 | 보안 검사, Build, 배포/Store, Smoke Test | 운영 URL / Build | 최종 DoD |

---

## 22. Cursor Rules Template (.cursor/rules/\*.mdc)

RCT는 **00-project-core.mdc**(alwaysApply)와 **20-ui-localization.mdc**(globs: UI·layout·i18n 경로) 두 파일 구성이다 ✅.

```markdown
---
description: {Game} core rules (00-project-core)
alwaysApply: true
---
- Source of truth: 07 Master Execution Prompt + docs/ADR.md + docs/DECISIONS.md. Stack is {W3D: Vite + TypeScript + Three.js + DOM UI}, see ADR-001.
- 100% English code, comments, identifiers, logs, commit messages. User-facing text only via i18n keys (ko/en/ja) in src/i18n/strings.
- src/game/physics, src/game/ai, src/game/match are pure TypeScript: no DOM, no Three.js, no Date.now/Math.random (use IRandom and sim time). Cover them with Vitest.
- All balance values live in src/data/*.json. No magic numbers in gameplay code.
- No allocations in per-frame hot paths where avoidable (reuse vectors, preallocated buffers).
- Never commit secrets (.env.local). Admin UI only for server-side admin role / allowlist.
- Record decisions in docs/DECISIONS.md; report before changing stack or scope.
- (Unity, N3D only) Never hand-edit .unity/.prefab/.asset YAML; use Editor builder scripts. Never delete .meta files.
```

```markdown
---
description: Layout, UI and localization rules (20-ui-localization)
globs: src/ui/**,src/styles.css,src/i18n/**,src/core/**
---
- Layout-specific styles use html[data-layout='desktop'|'mobile-landscape'|'mobile-portrait'] and html[data-hand='right'|'left'] selectors only.
- Touch targets >= 44px, text >= 12px, zero overlap, respect env(safe-area-inset-*), use var(--sys-h) below the system bar.
- Right-handed default: {movement pad LEFT, primary action buttons RIGHT}. Left-handed mirrors and swaps columns.
- Every visible string has a key in ko.ts (source), en.ts, ja.ts. ja must be natural Japanese (no Hangul).
- Gameplay touch/click is accepted only on: {movement pad, stroke buttons, sound, home, language, match flow buttons} ({X35}).
- Every screen fits one viewport; at most one scroll container per screen ({X38}).
```

* 🟨 Rules 파일에는 inline backtick 제한이 없지만(코드 파일), 프로젝트 문서(.md)는 Plain Markdown(X26)을 따른다.
* 🟦 Layout/i18n Rule은 globs로 해당 경로 작업 때만 적용해 Context 비용을 줄인다.

---

## 23. 07 Master Execution Prompt Skeleton (복사하여 프로젝트별 작성)

W3D(Vite + TS + Three.js + DOM + Firebase + Vercel)를 **기본 예시**로 한다. N3D를 선택하면 §4·§5·§17 등 해당 Section의 Binding 열을 [U]로 바꾼다.

```markdown
# 07. Cursor AI Agent Master Execution Prompt — {Game Name}
## 0. 문서 개요 (역할 · Pipeline · Precedence · Language Policy · Plain Markdown(X26) · Conflict Resolution Log)
## 1. Agent Role & Mission (English block)
## 2. 절대 원칙 (R01~Rnn)
## 3. 프로젝트 Meta (Stack Profile 예: W3D)
## 4. Phase 0 — Stack Re-evaluation & ADR (Default · 대안 · Decision Trigger(W3D vs N3D, Unity 불가→Web, Light data→Firebase, Motion Sprite) · Platform 제약 · Gate G0)
   → 필수 산출물: docs/ADR.md + docs/DECISIONS.md (X## 로그)
## 5. Repository & Project 구조 (Folder: src/game/{physics,ai,match}, src/view, src/ui, src/backend, src/data, src/core, tools/*, raw_assets/images_src, public/assets · Version Control)
## 6. Runtime Architecture (Boot · App FSM · EventBus · Pause · Clock · ScreenContext)
## 7. 화면 사양 (System Bar 매트릭스 · 화면별 표 · How to Play)
## 8. Gameplay Core (좌표계 · Rule · 공식 · 판정 · Planner · AI · Stat 공식 · Score · Code 계약 · Headless Sim 목표)
## 9. Camera / Presentation (Framing Acceptance · FX · Replay)
## 10. Character & Animation (Data · Clip 목록 · Mirror · Placeholder · AI Motion Sprite 경로)
## 11. Input & Controls (Device별 Wireframe · Control 정의 · Desktop Mapping WASD/IJKL/Numpad · Haptic · Touch Block Allowlist)
## 12. 3-Device Layout & HUD (Detect · HudProfile CSS 변수 · sysbarRows · --sys-h · One-Viewport · Tension HUD · Wireframe × 3 · Play-Area 목표)
## 13. UI/UX & Localization (규칙 · 저장 범위 · Localization Master Table ko/en/ja 실제 문구 · Passiveives Keys)
## 14. Audio (정책 · silent-buffer Unlock · Crowd Ambience · 구조 · 목록)
## 15. Art & Asset Pipeline (원칙 · Theme · Naming · raw_assets Inbox · npm run images/motion/prompts · Placeholder · hitFeedback)
## 16. Video (구간 · Fallback · Letterbox 금지 Blur+Contain)
## 17. Backend (Auth · Phone Alias · Guest TTL · Schema · Rules · Admin Allowlist · MockBackend · Named DB/Region · Offline Pending Queue)
## 18. Data Tables (JSON 규칙 · Table 실제 값 · passives · comeback · hitFeedback)
## 19. Save & Sync (uid-scoped localStorage Queue · online/visibility Flush)
## 20. Admin & Debug
## 21. Security
## 22. Performance
## 23. Testing & QA (필수: typecheck · test · i18n:check · build · sim · e2e · firebase-smoke / 권장: e2e:play · motion:audit · images · prompts · 감사 · E2E)
## 24. Build & Deploy (Vercel SPA rewrites · Asset Cache · Authorized Domains · Store Checklist)
## 25. Phase Plan (내용 · 산출물 · DoD · Gate)
## 26. Agent 보고 형식
## 27. Cursor Rules (00-project-core + 20-ui-localization)
## 28. Open Decisions (기본값 · 대안)
## 29. 최종 Definition of Done (QA 필수 7종 + Smoke + 보안 grep 포함)
## 30. Kickoff Prompt + Phase 진행 Prompt
```

* 🟨 07 착수 이후의 결정은 07을 고치지 않고 docs/DECISIONS.md에 X## 번호로 누적한다. Stack 변경은 ADR로 남긴다.
* 🟨 07의 QA Section(§23)과 최종 DoD(§29)에는 반드시 sim + e2e + firebase-smoke(Firebase 사용 시)를 포함한다.

---

## 24. [복사해서 쓰는] AI Agent Production Blueprint Directive

```text
[AI Agent Production Blueprint — Form 4.1]
You are the lead development agent for '{Game Name EN}' ({game-id}), stack profile {W2D|W3D|N3D|N2D}.
Follow the project's 07 Master Execution Prompt, then Design Master Doc 4.1 and this Form 4.1.
Verified paths: Toyville (W2D) and Real Court Tennis (W3D: Vite + TS + Three.js + DOM + Firebase + Vercel + PWA).
Unity (N3D) and Supabase are designed/alternate only, never claimed as verified.

[Phase 0 — mandatory]
- Read all specs, report uncovered contradictions and gaps.
- Re-evaluate Engine, App/UI framework, Backend/DB, Hosting, Test/CI. Check Decision Triggers (W3D vs N3D, tool availability
  such as Unity, light data -> Firebase, AI motion sprite option) and the Platform Constraint Matrix (section 1.5).
  Write docs/ADR.md and record decisions in docs/DECISIONS.md (X## ids). If a default changes, wait for approval (Gate G0).

[Implementation — mandatory]
1. Layer contract (game view + screen/cutscene/modal/toast/system bar), typed event bus, reason-based pause,
   SimClock with input-timestamp conversion for timing judgments.
2. LayoutManager (3 profiles, 150 ms debounce, 200 ms input lock, rotation without state loss) + single HudProfile
   (CSS variables, sysbarRows) + measured --sys-h + root attribute/class styling + safe area + one-viewport screens
   + portrait compact single-row system bar.
3. Gameplay input allowlist: only control and flow buttons accept pointer input; everything else is blocked in capture phase.
4. Play-area: 2D max integer tile with portrait transpose, or 3D camera profiles + Framing Validator + occlusion and
   ball off-screen measurement.
5. Handedness = dominant hand on precision primary action (as defined in 07), mirrored layout and inner mapping,
   cloud-synced per user.
6. i18n: ko source dictionary, identical en/ja keys, attribute/error/video overlay coverage, instant switch,
   canvas/3D text redraw, parity check incl. no Hangul in ja.
7. Audio: master->bgm/sfx/ui, OFF by default, session-persistent, file-first + synth fallback, 45 ms throttle,
   screen-declared music, video audio routed. Unlock with silent buffer on first gesture. Crowd cheer on long rally/ace.
8. Assets: raw_assets/images_src inbox -> npm run images/motion/prompts -> generated public/assets (never hand-edit),
   placeholder fallbacks for full playthrough, build-time manifest, mobile + desktop icons. No letterbox (blur+contain).
9. Accounts (Firebase primary): guest nickname (unique, released on logout, 100-day TTL), email, mobile number via alias
   email (no SMS), Google, Apple (iOS), MyPage (masked password change, settings, account deletion), admins/{loginKey}
   allowlist, MockBackend when Firebase env is missing, LazyFirebaseBackend, named Firestore DB + region.
   Offline results: uid-scoped localStorage pending queue flushed on online/visibility (not IndexedDB by default).
10. Ranking (if any): rules- or server-validated submit, public-column leaderboard, rate limit where functions exist.
11. Pure deterministic model (src/game/*): no DOM, no Three.js, no Date.now, no Math.random; fixed tick, injected seeded IRandom,
    analytic physics, target-solved outcomes, judge pipeline, JSON data tables (passives, comeback, hitFeedback), unit tests,
    headless balance simulation report. High-level AI aims open corners; long rallies lower return chance.
12. Security: secrets only in local secret files, no dev credentials in builds, admin via DB allowlist/server role,
    build output secret grep.
13. QA mandatory: typecheck, test, i18n:check, build, sim, e2e, firebase-smoke. Recommended: e2e:play, motion:audit, images, prompts.
    Run balance and motion audit gates (section 18.5), 3-device x 3-language audit, backend E2E with cleanup,
    production smoke test. Report results as tables.
14. (Unity, N3D only) Code-first scenes/prefabs via builder scripts, never hand-edit YAML, batchmode tests and builds.
15. 100% English code. Markdown documents in Plain Markdown (no inline backticks or LaTeX in narrative; fenced blocks only).
    Report to the user in their language with English technical terms.
16. Input polish: desktop WASD + arrows/IJKL/numpad stroke map, haptic on press/release/perfect, match-point/deuce tension HUD.
```
