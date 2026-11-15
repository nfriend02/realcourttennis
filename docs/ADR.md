# ADR — Real Court Tennis

## ADR-001 Stack Selection (Phase 0, Gate G0 승인 완료)

* 결정일: 2026-11-06
* 상태: **Accepted** (사용자 승인: "Web 3D로 전환")
* 배경: 개발 PC에 Unity Hub / Unity Editor / .NET SDK가 없어 07의 기본 추천 Stack(Unity 6 LTS)으로는 Compile·Test·Build가 불가능했다. Node.js v24와 Git은 사용 가능하다.

| 범주 | 선택안 | 검토한 대안 | 선택 이유 | 변경 시 영향 | 상태 |
| --- | --- | --- | --- | --- | --- |
| Engine | **Three.js 0.187** (WebGL2) | Unity 6 LTS URP, Babylon.js, Godot 4 | 즉시 개발·검증 가능, 작은 Bundle, Toon Material + Outline로 Cell Shading 구현 가능, GLTF Skinned Mesh 지원 | Rendering 계층(src/game/view)만 교체하면 Model은 재사용 | Accepted |
| App / UI | **Vite 8 + TypeScript + DOM UI** | React, UI Toolkit | 05/06 Web Profile에서 검증된 구조(✅ Toyville), i18n·Form·접근성·반응형이 DOM에서 가장 쉬움 | – | Accepted |
| Input | **Pointer Events + Keyboard** | – | Multi-Touch Pointer ID 고정, event.timeStamp로 정밀 Timing | – | Accepted |
| Backend / DB | ~~Supabase~~ → **Firebase (Auth + Firestore)** + **MockBackend**(Local) | Supabase | ADR-002 참조 | .env.local 설정만 추가 | Superseded by ADR-002 |
| Auth Providers | Guest · Email · Mobile Number(SMS 없음) · Google · Apple | – | 07 §17.1 | Google/Apple은 Firebase Auth Provider 설정 필요 | Accepted |
| Analytics | 없음 (v1) → 추후 PostHog 또는 Firebase Web | Firebase Analytics | Web에서는 Firebase Web SDK 사용 가능하나 v1 범위 밖 | – | Deferred |
| Hosting / Store | **Vercel + PWA**, Store는 **Capacitor**로 패키징 | Cloudflare Pages | 05/06 검증 경로 | – | Accepted |
| Test / CI | **Vitest** (Pure Model, i18n, Layout) + tools/sim.ts Headless Simulation | Playwright | Node만으로 실행 가능 | – | Accepted |

## ADR-002 Backend: Supabase → Firebase

* 결정일: 2026-11-06
* 상태: **Accepted** (사용자 지시: "게임상 주고 받을 데이터가 많지 않으므로 Firebase로 교체")
* 구성: Firebase JS SDK v13 (Modular, Lazy Chunk) — Auth + Cloud Firestore. Firebase Hosting 설정 포함(firebase.json).

| 07 §17 개념 (Supabase) | Firebase 구현 |
| --- | --- |
| auth.users + Anonymous Sign-in | Firebase Auth (Anonymous / Email-Password / Google / Apple). Mobile Number는 Alias Email({digits}@phone.{domain}) |
| profiles | profiles/{uid} |
| Guest Nickname Unique Index | guestNames/{usernameLower} (Batch로 Profile과 동시 생성) |
| stage_progress | profiles/{uid}/progress/{stageId} |
| match_results | profiles/{uid}/results/{autoId} (Append-only) |
| rankings + get_leaderboard | rankings/{uid} (Public Read) + Composite Index stageCleared desc, highScore desc, Rank = count() Aggregation |
| RLS + Column Grant | firestore.rules |
| RPC submit_match_result | Client Transaction 1회: Result 생성 + Progress / Ranking / Mileage 갱신. Rules가 lastResult(같은 Transaction에서 새로 생긴 Result)를 getAfter()로 교차검증 |
| pg_cron Guest Purge | Firestore **TTL Policy** (expireAt, 100일). Guest Logout 시 guestNames·랭킹만 해제하고 Profile/마일리지는 TTL까지 보관 (X39) |
| delete_my_account | Client가 자기 Document 전체 삭제 후 deleteUser() (최근 로그인 필요 시 recentLogin 안내) |

* 트레이드오프: Server Function 없이 Spark(무료) Plan에서 동작한다. 대신 Match Result 자체는 Client가 보고한 값이며 Rules는 범위(점수 0–40000, 3점 선승, 20 s 이상, Stage 순차 해금)와 일관성만 강제한다. Ranking 부정 방지를 강화하려면 Blaze Plan의 Cloud Functions로 submitMatchResult를 옮기면 된다(Client 계약 Backend.submitMatch 불변).
* 정리 한계: TTL은 Firestore Document만 삭제한다. 방치된 Anonymous Auth User는 Identity Platform 업그레이드 시 자동 정리(30일) 옵션을 사용한다.

### 07 문서와의 매핑 (Unity → Web Binding)

| 07 개념 (Unity) | Web 구현 |
| --- | --- |
| Pure C# Model (RCT.Physics/Gameplay/AI) | src/game/{physics,ai,match} Pure TypeScript (DOM·Three.js 의존 금지) |
| UI Toolkit Root Class layout-\* | html[data-layout], html[data-hand] |
| HudProfile ScriptableObject | src/layout/hudProfile.ts 단일 출처 |
| SystemBarHeight 실측 | ResizeObserver → CSS 변수 --sys-h |
| EnhancedTouch Hit-test | Pointer Events + setPointerCapture + Rect Hit-test |
| Touch.time → MatchClock | PointerEvent.timeStamp → MatchClock |
| AudioMixer | Web Audio master → bgm / sfx / ui |
| CSV Data Table | src/data/\*.json (Typed) |
| Scene Builder (Code-first) | Three.js Scene을 Code로 생성 (CourtBuilder, Mannequin) |
| Batchmode Test | npm test, npm run sim, npm run build |
