# 📋 Universal Mini-Game Master Specification & Production Blueprint (Form 4.0)
*미니게임 표준 기획서 및 제작 청사진 — Form 4.0*
***검증 참조 ✅: 『토이빌 디펜더스』 (toyville-defenders) — Vite · TypeScript · Phaser 3 · DOM UI · Firebase (Auth/Firestore/Storage) · Vercel · PWA***
***설계 참조 🧪: 『Real Court Tennis』 (real-court-tennis) — Unity 6 LTS URP · UI Toolkit · Input System · Supabase · Firebase Analytics(Native) · WebGL PWA***
*이전 버전: Form 2.1 (Web 2D 범용) · Form 2.0 (Toyville 기획) · Form 1.7 / 1.6*

---

## 0. 양식 개요 및 작성 규칙

본 Form은 **05 Design Master Doc 4.0**의 경험 표준을 실제 제품으로 구현하기 위한 **기술 규격·제작 청사진**이다. Form 4.0의 핵심 변경은 다음과 같다.

* **Engine-agnostic 계약 + Stack Profile별 Binding**: 같은 경험 표준을 Web(DOM/Canvas)과 Native(Unity) 양쪽에서 구현하는 규격을 나란히 제공한다.
* **Backend Profile 2종**: Firebase(✅ 검증) / Supabase(🧪 설계) Schema·보안·TTL·Ranking 규격.
* **Gameplay Core 표준**: Fixed Tick, Seeded RNG, Input Timestamp, 판정 Pipeline, Headless Simulation.
* **Agent-on-Engine 규칙**: Coding Agent가 Editor GUI 없이 개발하기 위한 Code-first Scene 생성, Batchmode Test·Build.
* **07 Master Execution Prompt Skeleton** (§23).

| 표시 | 의미 |
| --- | --- |
| ✅ Verified | Toyville 최종본에서 동작·배포·Test로 확인 |
| 🧪 Designed | RCT 07에서 설계·계산 검증, 구현 검증 대기 |
| 🟨 표준 필수 | 신규 프로젝트 필수 |
| 🟦 권장 | 장르/Stack에 따라 선택 (미채택 시 사유 기록) |
| ⚠️ 교훈 | 실제 문제 → 표준화된 해결 |
| { } | 프로젝트별 작성 칸 |
| **[W]** / **[U]** | Web Binding / Unity Binding |

### 0.1 Document Policy

* 🟨 모든 기획·개발 문서는 **Markdown(.md)**. 문서 본문은 한국어, **기술 용어는 영어로만 표기**.
* 🟨 Code·Comment·Identifier·Data Key·Log·DB Field·Commit Message는 **100% English**.
* 🟨 사용자 노출 Text(UX/UI/HUD/Error/Video Overlay)는 **ko · en · ja** Localization Key.

### 0.2 절대 원칙

| # | 원칙 | 요약 |
| --- | --- | --- |
| 1 | English-Only Code | Code·Comment·Key·Log·DB Field 100% English, 화면 문구는 Localization Key ✅ |
| 2 | 3-Language UX | ko(기본)/en/ja, 즉시 전환, Key Parity 자동 검사 ✅ |
| 3 | 3-Device Native Layout | desktop / mobile-landscape / mobile-portrait 독립 설계, 회전 무손실 ✅ |
| 4 | Play-Area First | 2D: 최대 정수 Tile ✅ / 3D: Camera Framing Acceptance 🧪 |
| 5 | No-Overlap UX | 겹침 0, Touch 44, Text 12 ✅ |
| 6 | Sound-Respectful | 기본 OFF, Session 유지, 단일 Audio Manager ✅ |
| 7 | Asset-Optional | Placeholder로 전체 완주, 투입 시 자동 반영 ✅ |
| 8 | Stack Re-evaluation | Phase 0 재검토 + ADR + Gate G0 ✅ |
| 9 | Secret-Safe | Secret은 Local Secret 파일만, Admin은 Server 권한 ✅ |
| 10 | Testable Deterministic Core | Pure Model + Fixed Tick + Seeded RNG + Unit Test ✅/🧪 |
| 11 | Data-Driven Balance | CSV/JSON, Magic Number 금지 ✅ |
| 12 | Document Integrity | Precedence, Conflict Log, Open Decisions 🧪 |
| 13 | Measurable Acceptance | 모든 품질 요구를 수치 조건으로 🧪 |
| 14 | Code-first Engine Assets | Agent는 Engine YAML(Scene/Prefab)을 손으로 편집하지 않고 Builder Script로 생성 🧪 |

---

## 1. 🟨 Phase 0 — Stack Re-evaluation & Selection

### 1.1 의무 규정

1. Coding Agent는 개발 시작 시 **① Engine ② App Framework/UI ③ Backend/DB (+Hosting, Test/CI)** 를 재검토한다.
2. 결과를 §1.6 ADR 표로 사용자에게 보고하고 docs/ADR.md로 남긴다.
3. **기본값 변경 시 사용자 승인 후 착수 (Gate G0)**. 유지 시 이유를 기록하고 진행.
4. 개발 중 치명적 제약 발견 시 변경 제안 가능. 실행 전 이유·영향·Migration Plan 보고.
5. Stack이 바뀌어도 §4~§13, §15, §18의 경험·품질 표준은 동일하게 충족.

### 1.2 Default Stack Profiles

| Profile | Engine | App/UI | Backend | Hosting / 배포 | Test | 참조 |
| --- | --- | --- | --- | --- | --- | --- |
| **W2D** Web 2D | Phaser 3/4 | Vite + Vanilla TS + DOM UI | Firebase | Vercel + PWA | Vitest + Headless Chrome(CDP) | ✅ Toyville |
| **W3D** Web 3D | Three.js / Babylon.js | Vite + TS + DOM UI (+ Capacitor) | Firebase / Supabase | Vercel + PWA (+ Store) | Vitest + CDP | – |
| **N3D** Native 3D | Unity 6 LTS URP | UI Toolkit + Input System | Supabase (+ Firebase Analytics Native) | Store + WebGL(Vercel/Cloudflare) | Unity Test Framework + Device Simulator | 🧪 RCT |
| **N2D** Native 2D | Unity 2D / Godot 4 | UI Toolkit / Godot UI | Firebase / Supabase | Store (+ Web Export) | Engine Test Framework | – |

### 1.3 선택지 비교 매트릭스

**① Engine**

| 후보 | 강점 | 약점 | 적합 |
| --- | --- | --- | --- |
| Phaser 3/4 ✅ | 2D 기능 완비, Web 친화 | 3D 불가 | Puzzle, Defense, Runner |
| PixiJS | 초고속 2D | Logic·Physics 직접 구현 | Effect 중심 |
| Three.js / Babylon.js | Web 3D 표준, 작은 번들 | Animation·Tooling 직접 구성, Mobile 부하 | 가벼운 3D |
| **Unity 6 URP** 🧪 | Humanoid Animation·Mirror, Shader Graph, Store 출시, C# | WebGL 번들 큼, Mobile Web 성능 약함, Editor 의존 | 3D Sports/Action, Store 우선 |
| Godot 4 | 가벼움, Open Source | 3D Mobile Tooling 상대적 약세 | 2D/가벼운 3D Native |
| PlayCanvas / Cocos | Editor 기반 Web 3D | Tool 종속 | Editor 협업 |

**② App Framework / UI**

| 후보 | 강점 | 약점 | 선택 기준 |
| --- | --- | --- | --- |
| Vite + Vanilla TS + DOM ✅ | 가볍고 i18n·Form·접근성 쉬움 | 화면이 많으면 구조화 필요 | Web 미니게임 |
| React / Preact / Svelte | Component·상태 관리 | Render Loop 분리 설계 필요 | 계정·상점 UI가 많을 때 |
| **Unity UI Toolkit** 🧪 | USS Class로 Layout 전환, Runtime Binding | Multi-Touch Gameplay Control은 별도 처리 권장 | Unity 화면·HUD |
| Unity uGUI | 자료 풍부, Canvas Scaler | Layout 전환·i18n 구조화 수작업 | 기존 uGUI 자산 |
| Flutter (+ Flame / Unity as a Library) | 단일 Code Store 출시 | Game Engine 연동 제약 | App 중심 |
| Capacitor | Web 게임 Store 패키징 | Native Plugin 의존 | Web 우선 + Store |

**③ Backend / DB**

| 후보 | 강점 | 약점 | 선택 기준 |
| --- | --- | --- | --- |
| Firebase ✅ | Anonymous·Email·Google Auth, Security Rules, TTL | 복잡한 Query·집계 약함, **Unity WebGL SDK 없음** | 개인 진행 저장 중심 |
| **Supabase** 🧪 | Postgres SQL, RLS, RPC, pg_cron, Anonymous Sign-in, ID Token Login | Unity 공식 SDK 부재(Community C#은 HttpClient → WebGL 문제) | Ranking·통계·관계형 |
| PlayFab / Nakama | Game 특화(Leaderboard, Matchmaking) | 학습·비용 | Online 기능 확장 |
| 자체 Server | 완전한 자유 | 운영 비용 | 특수 요구 |

### 1.4 Decision Trigger (반드시 확인)

- [ ] 2D/3D? 동시 Object 수? Humanoid Animation·Mirror 필요? (Mobile 60 FPS)
- [ ] Store 출시 필요? Web + PWA로 충분? Desktop Web 필요?
- [ ] Account: Guest(Nickname)·Email·Mobile Number(SMS 없음)·Google·**Apple(iOS 소셜 Login 시 필수)**
- [ ] Ranking·통계 Server Query 필요? Score 위변조 방지 수준?
- [ ] 자동 삭제(TTL) 요구 (예: Guest 100일)?
- [ ] 다국어 Text·Form·접근성은 어느 계층이 담당? CJK Font 크기 영향?
- [ ] **Platform 제약 Matrix**: SDK가 대상 Platform(특히 WebGL)을 지원하는가? Thread 사용 여부?
- [ ] Agent가 Editor GUI 없이 Scene·Prefab을 생성·Test·Build할 수 있는가? (Batchmode, Builder Script)
- [ ] 무료 한도·예상 비용·지역 규제(개인정보, 일본 APPI 등)

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

> ⚠️ **교훈 (Toyville)**: 기획의 "Phaser + Three.js Hybrid"는 불필요했다.
> ⚠️ **교훈 (RCT 설계)**: Web 전제로 쓰인 Form 2.1을 Unity에 적용하려면 모든 DOM 규격을 재해석해야 했다 → Form 4.0은 계약과 Binding을 분리.

---

## 2. Master 문서 Meta 정보

| 항목 | 작성 칸 | ✅ Toyville | 🧪 RCT |
| --- | --- | --- | --- |
| 게임명 (ko/en/ja) | { } | 토이빌 디펜더스 / Toyville Defenders / トイビル・ディフェンダーズ | 리얼 코트 테니스 / Real Court Tennis / リアルコートテニス |
| Project ID / Namespace | { } | toyville-defenders / – | real-court-tennis / RCT |
| Stack Profile | {W2D/W3D/N3D/N2D} | W2D | N3D |
| Engine (ADR) | { } | Phaser 3.90 | Unity 6 LTS URP |
| App/UI (ADR) | { } | Vite 8 + TS 5.9 DOM | UI Toolkit + Input System |
| Backend (ADR) | { } | Firebase 13 | Supabase (+ Firebase Analytics Native) |
| Hosting | { } | Vercel | Store + WebGL (Vercel/Cloudflare) |
| Layout | 3 Profile | 동일 | 동일 |
| 언어 | ko · en · ja | 동일 (500 Key) | 동일 |
| Test | { } | Vitest 21 + i18n + CDP + Firebase E2E | EditMode + PlayMode + Audit Runner + Supabase E2E + Headless Sim |

---

## 3. 표준 Folder 구조

### 3.1 [W] Web Profile (✅ Toyville 일반화)

```
📁 {game-id}/
├── index.html · vite.config.ts · vercel.json
├── firebase.json · firestore.rules · firestore.indexes.json · storage.rules     (Firebase Profile)
├── supabase/migrations/*.sql                                                   (Supabase Profile)
├── .env.example (Key 이름만) · .env.local (gitignore)
├── docs/ADR.md · DECISIONS.md · reports/ · specs/
├── src/
│   ├── main.ts            # Boot: settings → layout → i18n → audio → (assets, auth) → overlay → intro
│   ├── core/              # EventBus, Settings, SessionPrefs, Pause, Clock, Assets, AdminTuning, Random
│   ├── layout/            # LayoutManager, HudProfile
│   ├── i18n/              # i18n.ts + strings/ko.ts(기준) · en.ts · ja.ts
│   ├── audio/             # AudioManager, SoundSynth
│   ├── auth/              # AuthService, {Firebase|Supabase}Backend, MockBackend, adminPolicy
│   ├── save/              # SaveSystem, CloudSave
│   ├── data/              # *.json Balance, Stage, Entity
│   ├── game/              # {Game}Model(Pure), {Game}Scene(Engine), Mapper, *.test.ts
│   ├── app/               # Router, SystemOverlay, Menu, MyPage, AdminPage
│   │   └── screens/       # Intro, Title, Login, Signup, Setup, Play, Result …
│   ├── ui/ · styles/
├── public/ (manifest, sw.js, icons, assets)
├── raw_assets/ · tools/
```

### 3.2 [U] Unity Profile (🧪 RCT 일반화)

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

* 🟨 화면 하나 = 파일 하나, 각 화면은 ScreenContext 선언.
* 🟨 Engine 의존 Code는 Presentation/Scene 계층에만. Model·Data·Rule은 Engine을 모른다.
* 🟨 [U] Assembly Definition으로 의존 방향 강제 (Core ← Data ← Physics/Gameplay/AI ← Presentation/UI).

---

## 4. Runtime Architecture (계약 + Binding)

### 4.1 화면 Layer 계약

| Layer (계약) | 역할 | Pointer | [W] Binding | [U] Binding |
| --- | --- | --- | --- | --- |
| Game View | Engine Canvas / 3D Camera | Gameplay Control만 | #game-root z0 | Main Camera |
| Screen | 현재 화면 UI | 빈 영역 통과 | #screen-layer z1 | UIDocument Sort 10 |
| Cutscene/Video | 영상·컷씬 | 재생 중 | #cutscene-layer z5 | UIDocument Sort 50 + RenderTexture |
| Modal | Menu·MyPage·확인 창 | Modal 중 | #modal-layer z7 | UIDocument Sort 70 |
| Toast | 알림 | 없음 | #toast-layer z8 | Sort 80, PickingMode.Ignore |
| System Bar | 상단 고정 Button | Button만 | #system-overlay z9 | Sort 90 |

* 🟨 **UI는 UI 계층(DOM / UI Toolkit), Game Field는 Engine.** Text·Form·i18n·반응형은 UI 계층이 압도적으로 쉽다. ✅

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

* 🟨 Background 복귀 시 Real-time 장르는 **3-2-1 Countdown** 후 재개. 🧪

### 4.4 🟨 Clock & Input Timestamp (Timing 장르 필수) 🧪

| Clock | 용도 |
| --- | --- |
| SimClock (double) | Fixed Tick Simulation, Pause 시 정지, Slow Motion 배속 반영 |
| RealClock | UI·Video·Countdown |

```
tSim = simNow − (realNow − inputEventTime) × timeScale
```

* [W] PointerEvent.timeStamp / performance.now() · [U] Touch.time, InputEventPtr.time vs Time.realtimeSinceStartupAsDouble.

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
// [W]
function detect(): LayoutProfile {
  const w = visualViewport?.width ?? innerWidth, h = visualViewport?.height ?? innerHeight;
  if (h > w) return 'mobile-portrait';
  if (matchMedia('(pointer: coarse)').matches && Math.min(w, h) < 900) return 'mobile-landscape';
  return 'desktop';
}
```

```csharp
// [U]
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

### 5.2 HudProfile (단일 출처)

```ts
// [W]
interface HudProfile { sysBar: 'single' | 'stacked'; sysBtn: number; pillH: number; pillFont: number; /* project fields */ }
```

```csharp
// [U] ScriptableObject per profile
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

### 5.3 System Bar 실측 ✅

* [W] ResizeObserver → --sys-h.
* [U] systemBar.RegisterCallback&lt;GeometryChangedEvent> → SystemBarHeight 공개 → Modal·Scoreboard top 적용.

### 5.4 Style 작성 규칙

* 🟨 기기별 규칙은 [W] html[data-layout='…'] 선택자 / [U] .layout-mobile-portrait .controls { … } USS 선택자. Media Query·Screen 분기 Code 분산 금지. ✅
* 🟨 Handedness는 [W] html[data-hand='left'] Grid Area 교환 / [U] .hand-left Class로 flex-direction: row-reverse + 내부 열 교환. ✅/🧪
* 🟨 Safe Area: [W] env(safe-area-inset-\*) / [U] Screen.safeArea → Root Padding. ✅

### 5.5 Play 화면 Grid 예시

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
/* [U] 🧪 RCT USS — right-handed: stroke buttons right (timing = primary), move pad left */
.layout-mobile-landscape .controls { position: absolute; left: 0; right: 0; bottom: 0; flex-direction: row; justify-content: space-between; }
.layout-mobile-portrait  .controls { position: relative; height: 38%; flex-direction: row; }
.hand-left .controls { flex-direction: row-reverse; }
.hand-left .stroke-cluster { flex-direction: row-reverse; }   /* swap FH/BH columns */
```

---

## 6. 🟨 Play-Area 구현 규격

### 6.1 [W] 2D Board ✅

```ts
new Phaser.Game({ scale: { mode: Phaser.Scale.RESIZE }, parent: gameRoot, input: { activePointers: 2 } });
const rect = host.playRect();                 // DOM .play-area rect
mapper.fit(rect, /* transposed */ portrait);  // max integer tile, centered
```

* GridMapper: fit, toScreen, fromScreen, screenDelta (전치 반영). Model은 항상 가로 기준 논리 좌표. ✅
* 면적 측정: (play.w × play.h) / (innerWidth × innerHeight) → desktop ≥ .65, landscape ≥ .55, portrait ≥ .50.

### 6.2 [U] 3D View 🧪

| 항목 | 규격 |
| --- | --- |
| View | landscape/desktop 전체 화면, portrait 상단 ≥ 60% (Camera.rect) |
| Control | landscape/desktop Corner Overlay(Alpha 0.55 → Touch 중 0.85), portrait Bottom Deck |
| Occlusion 측정 | 핵심 피사체 Screen Bounding Box ∩ Control Rect = 0 |
| Overlay 비율 | desktop ≤ 12%, landscape ≤ 22% |
| 작은 Object 시인성 | 거리 기반 Visual Scale(예: 1.0 → 2.5), Trail, Contact Shadow, 예측 Marker |

### 6.3 🟨 Camera Rig Profile & Framing Validator 🧪

```json
// CameraProfiles.json
{
  "landscape": { "distanceBehind": 12.0, "height": 2.10, "pitchDeg": -3.4, "fovMode": "vertical", "fovDeg": 13.0, "followDamping": 0.15, "maxYawDeg": 8 },
  "portrait":  { "distanceBehind": 12.0, "height": 2.10, "pitchDeg": "auto", "fovMode": "horizontal", "fovDeg": 22.8, "followDamping": 0.15, "maxYawDeg": 8 }
}
```

* 🟨 FOV 정책: Landscape는 Vertical 고정(넓은 화면은 좌우가 더 보임), Portrait는 Horizontal 고정(좌우 시야 유지).
* 🟨 CameraFramingValidator: 기준 Bone/Point를 WorldToViewportPoint로 투영해 05 §6.3의 조건(점유 범위, 관계, 크기 비율)을 Profile별로 검사 → PlayMode Test + Editor Overlay.
* 🟨 **원근 비율 공식**: 근거리 Object까지 거리 D, 두 Object 깊이 차 Δ, 목표 크기 비율 k → D = k·Δ / (1 − k). (RCT: k = 1/3, Δ = 23.77 m → D ≈ 11.9 m)
* 🟨 **높이 관계 공식**: Camera 높이 h_c, 점 높이 h, 거리 r의 투영 기울기 (h − h_c) / r로 "A가 B와 C 사이"를 부등식으로 풀어 h_c 범위를 구한다. (RCT: 1.79 m < h_c < 2.59 m)

---

## 7. 🟨 i18n 구현 규격

### 7.1 Dictionary

```ts
// [W] src/i18n/strings/ko.ts — key source
export const ko = { 'title.start': '시작', 'login.toSignup': '처음이면 회원가입', /* … */ } as const;
export type StringKey = keyof typeof ko;   // en/ja: Record<StringKey, string> → missing key = compile error
```

```json
// [U] 06.Data/Localization/ko.json (source) — en.json / ja.json must have identical keys
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
* 🟨 Font: [W] html[data-lang] 별 Font 변수 / [U] FontRegistry로 언어별 Font Asset + CJK Fallback Chain (Noto Sans KR/JP). 🧪
* 🟨 Logo 한 줄 맞춤은 언어 변경·Resize·Font 로드 후 재계산. ✅

### 7.3 Error Mapping

```ts
type AuthErrorCode = 'invalidCredentials' | 'emailInUse' | 'weakPassword' | 'invalidId'
  | 'nicknameTaken' | 'nicknameInvalid' | 'recentLogin' | 'network' | 'unsupported' | 'notFound';
// → 'auth.err.{code}' keys in ko/en/ja. Never show raw backend messages.
```

### 7.4 Parity Check

* [W] npm run i18n:check (ko 기준 missing/extra → exit 1). ✅
* [U] EditMode LocalizationParityTests: Key 집합 동일, 빈 값 0, {param} 일치, ja 값에 Hangul(\uAC00-\uD7A3) 포함 금지. 🧪

---

## 8. 🟨 Audio 구현 규격

| 항목 | [W] ✅ | [U] 🧪 |
| --- | --- | --- |
| Graph | Web Audio master → bgm(0.6)/sfx(0.8)/ui(0.7) | AudioMixer Master → BGM/SFX/UI Group |
| Context Unlock | 첫 Gesture에서 생성/resume | 불필요 (Native), WebGL은 첫 Gesture 후 재생 |
| File 우선 | public/assets/audio/bgm\_{id}.mp3 | 05.Audio/{SFX,BGM}/{id} (AssetRegistry Key) |
| 대체 | SoundSynth | ProceduralSfx (AudioClip.Create) |
| 연타 제한 | 같은 ID 45 ms | 동일 |
| Music | ScreenContext.music, 0.6 s Fade | 동일 (Crossfade 2 AudioSource) |
| Loop | bgm_loops.json + 선행 무음 Skip | AudioClip Loop Point / Import 설정 |
| Video Audio | registerMedia(el) | VideoPlayer → AudioSource(SFX Group) |
| Session Rule | 기본 OFF, soundOn Session Key, Logout 시 Reset | 동일 (SessionPrefs) |

---

## 9. 🟨 Asset Pipeline 규격

### 9.1 [W] ✅

| 단계 | 도구 | 결과 |
| --- | --- | --- |
| 투입 | raw_assets/ | 원본 |
| 감시 | Vite Plugin server.watcher (1.2 s Debounce) | 자동 변환 |
| 변환 | tools/build-assets.mjs (sharp + ffmpeg-static) | Chroma Key, Sprite Sheet(WebP+JSON), 배경, Video delogo |
| 목록 | manifest.json (dev middleware **+ build closeBundle() 출력**) | Runtime Registry |
| 점검 | npm run assets:check | 누락 표 |

> ⚠️ **교훈 (Toyville)**: Manifest를 dev 전용으로 두면 배포본 전체가 Placeholder가 된다 → Build 시 반드시 생성.

### 9.2 [U] 🧪

| 단계 | 도구 | 결과 |
| --- | --- | --- |
| 투입 | raw_assets/ → Editor Menu {NS}/Assets/Import Raw Assets | 규칙 경로로 이동 |
| Import 설정 | AssetPostprocessor | Humanoid Rig, ASTC Texture, Vorbis Audio, Video Transcode, Animation Clip 이름 검증 |
| 등록 | AssetRegistry (Key → Addressable/Resources Path) | 없으면 PlaceholderFactory |
| 점검 | EditMode AssetCoverageTests | 필수/선택 Asset 표 보고 |

### 9.3 Placeholder Factory 계약

```csharp
public interface IPlaceholderFactory
{
    GameObject CreateCharacter(string characterId, Color tint);   // primitive mannequin
    GameObject CreateEnvironment(string themeId);                 // code-built court/stage
    AudioClip CreateSfx(string sfxId);                            // procedural clip
    IFallbackSequence CreateVideoFallback(string videoId);        // same duration as video
}
```

### 9.4 Icon

* [W] npm run icons: apple-touch-icon, maskable 192/512(중앙 80% 안전 영역), desktop 16~1024, favicon.ico. ✅
* [U] Player Settings Icon(Android Adaptive Foreground/Background, iOS 1024), WebGL PWA Template Icon. 🧪

---

## 10. Video 규격

| 항목 | [W] | [U] |
| --- | --- | --- |
| 재생 | &lt;video playsinline muted> | VideoPlayer → RenderTexture |
| 비율 대응 | Blur 배경 Video + 중앙 원본 | RenderTexture 2장(Blur Shader + Fit) |
| Skip | Button | Button |
| Fallback | 그림책 컷씬 | Camera 연출 / Fallback Card (동일 길이) |
| WebGL | – | StreamingAssets URL 재생 |
| Sound | Audio Manager 등록 | SFX Group 연결 |

---

## 11. 🟨 Account · DB 규격

### 11.1 Auth 계층 (Backend 교체 가능 구조)

```ts
// [W]
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
}
```

```csharp
// [U]
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

### 11.2 Mobile Number Login (SMS 없음) ✅

```
"+82" + "010-1234 5678" → strip spaces/hyphens/leading 0 → 8–15 digits
→ alias email "821012345678@phone.{aliasDomain}" + password
display: "+82 10 1234 5678"
```

* 🟨 Alias Domain은 환경 설정값. Email Confirmation이 켜져 있으면 Alias 계정이 Login할 수 없다 → **Confirmation OFF** (가입 즉시 Login 표준과 일치).

### 11.3 Guest Nickname + 100일 TTL

| 요소 | Firebase Profile ✅ | Supabase Profile 🧪 |
| --- | --- | --- |
| 인증 | Anonymous Auth + displayName | Anonymous Sign-in |
| 중복 방지 | guestNames/{lower} Transaction 선점 | unique index on lower(username) where account_type='guest' |
| Logout | Flush → 선점 삭제 → 익명 계정 삭제 | Flush → discard_guest() RPC |
| TTL | expireAt + Firestore TTL Policy | expire_at + **pg_cron** 일일 삭제 Job |
| 등록 회원 | expireAt 없음 | expire_at null |

### 11.4 Firebase Profile Schema & Rules ✅

```
users/{uid}: profile{nickname, loginId, provider, isGuest}, {game fields}, handedness, updatedAt, expireAt?
guestNames/{nicknameLower}: uid, nickname, expireAt, claimedAt
```

```js
match /users/{uid} { allow read, write: if request.auth != null && request.auth.uid == uid; }
match /guestNames/{name} { /* create/update only own uid, hasOnly fields, takeover if expired; delete own */ }
match /{document=**} { allow read, write: if false; }
```

### 11.5 Supabase Profile Schema & Security 🧪

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

* 🟨 DB Enum 값은 **소문자**(right/left, ko/en/ja) + CHECK Constraint. 🧪
* 🟨 Client → Table 직접 Insert/Update는 **설정 Column만** 허용, 진행·점수는 RPC만.

### 11.6 Save / Sync 규칙 ✅

| 규칙 | 내용 |
| --- | --- |
| Local Key | {app}.save.{uid} |
| Load | Local → Cloud Pull → **병합** → User 설정 적용 → save:change |
| 병합 | 단조 증가 값 max, 설정은 최신 updatedAt 우선, 목록은 합집합 |
| Upload | 설정 1.5 s Debounce, 결과는 즉시 RPC + 실패 시 Local Queue 재시도 |
| Logout | Flush 후 종료 |

### 11.7 설정 저장 범위

| 범위 | [W] | [U] | 예 |
| --- | --- | --- | --- |
| Device | localStorage['{app}.settings'] | PlayerPrefs ({ns}.settings.\*) | language, layoutOverride |
| Session | SessionPrefs | SessionPrefs | sound |
| User | Cloud User Record | Cloud profiles | handedness |

---

## 12. 🟨 Ranking & Anti-Cheat (채택 시) 🧪

| 규칙 | 내용 |
| --- | --- |
| 제출 | submit_result(payload) Server Function만 (Firebase: Callable Function / Supabase: Security Definer RPC) |
| 검증 | 범위 Check, 이론적 최대 점수 상한, 최소 Play 시간, Stage 해금 여부 |
| Rate Limit | 사용자당 분당 N회 (예: 6) |
| 저장 | Result Log Insert → Progress Upsert(greatest) → Ranking Upsert → Mileage 누적 |
| 조회 | get_leaderboard(limit) — Nickname·Score·진행·순위만 |
| 이상치 | Flag Column + Admin 검토 |

---

## 13. 🟨 Gameplay Core 표준 (Pure Model) 🧪

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

### 13.2 규칙

| 규칙 | 내용 |
| --- | --- |
| Fixed Tick | 60~120 Hz, Render와 분리 (Accumulator 방식) |
| 해석적 계산 | 궤적·충돌은 가능하면 수식으로 한 번 계산해 Pre-allocated Buffer에 기록 (Frame 독립) |
| Seeded RNG | IRandom 주입, Test에서 Seed 고정 |
| 판정 Pipeline | ① Window 밖 → Miss ② 축별 Offset 계산 ③ 축별 Tier ④ min 규칙 ⑤ 기하 결과(Zone/Fault) ⑥ 확률 보정(있으면) ⑦ 결과 Event |
| Target-Solved Outcome | 결과(착지점·목표 Cell)를 먼저 정하고 물리량을 역산 → "의도한 결과"와 "보이는 궤적"이 항상 일치 |
| Zero GC | Tick 경로 할당 0 (Struct, Pool, 고정 Buffer) |
| Snapshot | View는 Read-only Snapshot만 읽음 |

### 13.3 판정 Table Template

| Tier | Timing \|Δt\| | Offset | 결과 확률/배율 | Feedback |
| --- | --- | --- | --- | --- |
| {Perfect} | { } | { } | { } | { } |

### 13.4 Headless Balance Simulation

* 🟨 Bot Player(실력 Parameter: Timing σ, 선택 정확도)로 Stage별 N판(≥ 1,000) Simulation → 승률·평균 시간·결과 분포를 docs/reports/balance.md로.
* 🟨 목표 범위 표(05 §2.4)를 벗어나면 Data만 조정하고 재실행.

---

## 14. 화면별 공통 Component 규격

| Component | 규격 |
| --- | --- |
| System Bar | 좌: Sound(항상), Home(+Tooltip), Admin Pause / 우: Language, MyPage, Logout (프로젝트 순서 명시). Portrait 2줄 허용 |
| Home | Gameplay 중 확인 Modal + pause.set(Menu), 그 외 closeAllModals() → Title |
| Modal | 열린 Handle 추적, Backdrop 닫기, System Bar 실측 높이 아래 시작 |
| Login | Home Corner · Guest(Nickname View) · Google · Apple · [Email \| Mobile Number] Tab · Password · Login · "처음이면 회원가입" |
| Signup | 선택 View → ID·Password·확인 → 가입 → 자동 Login |
| Mobile 입력 | [+82] 국가번호(+81 등 선택) + 번호(placeholder "10 1234 5678") |
| MyPage | Profile, ID, Password 마스킹+변경, 게임 설정(Handedness 등), Mileage, Guest 경고, Account 삭제, Logout |
| Result | 승패, 점수 내역, Best, 순위, 하단 Action Button (프로젝트별) |
| How to Play | 문단별 Localization Modal + 도해 Icon |
| Gameplay Control | Pointer ID 고정, Touch Block Policy, Release-to-Act |

---

## 15. 🟨 보안 · Secret 규격

| 규칙 | [W] | [U] |
| --- | --- | --- |
| Secret 위치 | .env.local (gitignore) | Config/backend.local.json (gitignore) → Build 시 Config 생성 |
| Client 공개 값 | VITE\_\* (Firebase Web Config, Supabase anon key) | Supabase URL·anon key |
| 절대 금지 | Service Account, service_role, DB Password, Admin Password, Keystore Password | 동일 |
| Dev 전용 계정 | VITE_DEV\_\* + import.meta.env.DEV Guard, 배포 환경 변수 등록 금지 | #if UNITY_EDITOR \|\| DEVELOPMENT_BUILD |
| Admin 판정 | VITE_ADMIN_IDS ✅ 또는 Backend Role | Backend role = 'admin' 🧪 |
| Build 전 검사 | dist/ grep | Build Output grep (service_role, password, sk\_) |
| 첫 Push 전 | README·문서 Secret 전수 검사 | 동일 + google-services.json 공개 여부 판단 |
| Test 계정 | E2E 종료 시 삭제 | 동일 |

---

## 16. PWA · Store 규격

### 16.1 [W] PWA ✅

```json
{ "id": "/", "start_url": "/", "scope": "/", "display": "fullscreen",
  "display_override": ["fullscreen", "standalone"], "orientation": "any",
  "icons": [ { "src": "/icons/desktop/icon-512.png", "sizes": "512x512", "purpose": "any" },
             { "src": "/icons/mobile/maskable-512.png", "sizes": "512x512", "purpose": "maskable" } ] }
```

* 최소 Service Worker(Cache 없음) + Cache-Control: no-cache, Production에서만 등록, Page.getInstallabilityErrors = [].

### 16.2 [U] Store + WebGL 🧪

| Target | 규격 |
| --- | --- |
| Android | AAB, IL2CPP, ARM64, Target API = Store 최신 요구 |
| iOS | IL2CPP, Sign in with Apple Capability, Privacy Manifest |
| WebGL | Brotli, Unity 6 PWA Template, 파일명 Hash, .wasm/.data 장기 Cache |
| Store Checklist | Privacy Policy, Account Deletion, Apple Login, Data Safety / Privacy Label, 연령 등급, 현지어 Listing |

---

## 17. 🟨 배포 규격

### 17.1 [W] Vercel ✅

```json
{ "framework": "vite", "buildCommand": "npm run build", "outputDirectory": "dist",
  "rewrites": [{ "source": "/((?!assets/|.*\\.[a-zA-Z0-9]+$).*)", "destination": "/index.html" }],
  "headers": [ { "source": "/sw.js", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
               { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] } ] }
```

> ⚠️ Hash 없는 Asset에 immutable을 쓰려면 ?v= 버전 Query 필수.

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
| Backend URL / Public Key | Backend Console | ✅ | ✅ |
| Phone Alias Domain | 프로젝트 결정 | ✅ | ✅ |
| Admin ID 목록 (Web Profile) | 운영자 | ✅ (공개 전제) | ✅ |
| Dev Admin 계정 / Password | 개발자 | ❌ | ❌ **절대 금지** |
| Service Role / Server Secret | Backend Console | ❌ | Server Function 환경에만 |

* 🟨 소셜 Login: 배포 Domain·Redirect URL을 Auth Provider 승인 목록에 등록.

---

## 18. 🟨 QA · 검증 규격

### 18.1 명령 세트

| [W] ✅ | [U] 🧪 | 통과 기준 |
| --- | --- | --- |
| npx tsc --noEmit | Unity Compile (batchmode) | Error 0 |
| npm test (Vitest) | -runTests -testPlatform EditMode | 전부 통과 (Model 결정론 포함) |
| – | -runTests -testPlatform PlayMode | 전부 통과 (Flow Smoke, Framing, Rotation) |
| npm run i18n:check | LocalizationParityTests | OK |
| npm run assets:check | AssetCoverageTests | 필수 누락 0 |
| npm run build | -executeMethod {NS}.Editor.BuildScripts.BuildAll | 성공 + Secret 0건 |
| – | Headless Simulation | 목표 범위 |

### 18.2 3-Device 화면 감사

| Profile | 해상도 | [W] CDP Emulation | [U] Audit Runner |
| --- | --- | --- | --- |
| mobile-portrait | 390×844 (DPR 2) | mobile + touch | Game View 해상도 + Touch 가정 |
| mobile-landscape | 844×390, 2400×1080(21:9) | mobile + touch | 동일 |
| desktop | 1280×720 / 1440×900 | mouse | 동일 |

검사 항목 (모든 화면 × 3언어):

- [ ] 보이는 Interactive 요소 사각형 상호 겹침 0건 ([W] getBoundingClientRect / [U] worldBound)
- [ ] Touch ≥ 44, Text ≥ 12, Safe Area 밖 잘림 0
- [ ] Runtime Exception 0
- [ ] Home → Title, Logout → Title
- [ ] **Gameplay 중 회전** → 상태 동일 + ≤ 0.2 s
- [ ] Play-Area 지표 (2D 면적 / 3D Framing·Occlusion)
- [ ] Handedness 전환 시 배치·내부 열·Animation Mirror
- [ ] Touch Block: 허용 영역 밖 입력 Injection → 상태 변화 0
- [ ] Screenshot 저장 (docs/reports/audit/{profile}-{lang}-{screen}.png)

> 팁 [W]: Vite HMR 때문에 Test의 import('/src/…')가 다른 Module Instance를 받을 수 있다 → 실제 로드 URL로 import. ✅
> 팁 [U]: Batchmode는 -nographics 시 Screenshot 불가 → Audit은 Graphics Device가 있는 Runner(Editor 또는 GPU CI)에서 실행. 🧪

### 18.3 Backend E2E (실제 Backend, 종료 후 정리)

- [ ] Email 가입 → 자동 Login → Password 변경 → 이전 Password 거부 → 새 Password Login
- [ ] Mobile Number 가입(국가번호, 하이픈·공백·선행 0) → Login
- [ ] Guest Nickname 중복 거부 → Logout 삭제 → 재사용 가능 → TTL Field 존재
- [ ] User 설정(Handedness) → Local 삭제 후 재Login 복원
- [ ] Ranking 제출 검증 실패 Case 거부 / 정상 Case 순위 반환 (채택 시)
- [ ] 타인·비Login 접근 차단, 권한 Column 직접 수정 차단
- [ ] Account 삭제 Cascade

### 18.4 운영 Smoke Test

- [ ] 운영 URL/Store Build 실행, Asset 렌더, Manifest/Asset 200
- [ ] Mobile Portrait로 Guest 시작·가입·Logout
- [ ] 일반 사용자에게 Admin UI 미표시
- [ ] PWA 설치 가능 (Web) / Store 심사 Checklist 충족 (Native)

---

## 19. Admin · Debug 도구

| 도구 | 접근 | 기능 |
| --- | --- | --- |
| Pause / Go | System Bar (Admin) | Game·Video·Audio 전체 정지 |
| Admin Tuning | Menu (Admin) | 난이도·속도·Window 배율, Manual Mode 등 |
| Layout 강제 전환 | Menu (Admin) | 자동/desktop/landscape/portrait + Device Frame |
| FPS / Profiler Overlay | Menu (Admin) | FPS, GC Alloc, Draw Call |
| Cheat Console | ~ (Admin) | 점수·해금·즉시 승리 |
| Judgment Debug Overlay | Menu (Admin) | Δt, Offset, Zone, Tier 시각화 🧪 |
| Camera Framing Overlay | Editor / Admin | 투영 기준선 표시 🧪 |

---

## 20. ⚠️ 교훈 → Form 4.0 표준화 요약

| 실제 문제 | 원인 | 표준화된 해결 | 출처 |
| --- | --- | --- | --- |
| 기획 Stack(Three.js) 불필요 | 기획 단계 Stack 고정 | Phase 0 재검토 + ADR | ✅ Toyville |
| 세로 메뉴 겹침 | Bar 높이 추정 | 실측 높이 공개 | ✅ |
| 기기별 수치 분산 | 곳곳 Hard-coding | HudProfile 단일 출처 | ✅ |
| 오른손잡이인데 방향키가 왼쪽 | 용어 정의 부재 | "주력 손 = Primary Action" 명시 | ✅ → 🧪 일반화 |
| 배포본 그림이 Placeholder | Manifest dev 전용 | Build 시 생성 | ✅ |
| 재Login 시 설정 소실 | 범위 미정의 | Device/Session/User 분류 | ✅ |
| README에 Admin Password | 문서에 Credential | Secret 파일만 + Push 전 검사 | ✅ |
| 확인 창 중 게임 진행 | Pause 미연동 | 사유별 Pause | ✅ |
| Web 전용 Form을 Unity에 적용 불가 | 계약과 구현 혼재 | **계약 + [W]/[U] Binding 분리** | 🧪 RCT |
| 문서 간 규칙 충돌 20건 | 문서 분산 작성 | **Precedence + Conflict Log + Open Decisions** | 🧪 |
| 구도 요구("NPC 1/3 크기")와 직관적 Camera 불일치 | 수치 검증 부재 | **Camera Framing 공식 + Validator** | 🧪 |
| 25% 규칙 vs 9분할 판정 충돌 | 판정 모델 미통합 | **Fault Ring + Inner Zone**, Tier min 규칙 | 🧪 |
| Timing 판정이 Frame Rate에 흔들릴 위험 | Polling 기반 | **Input Timestamp → SimClock** | 🧪 |
| ja 번역에 한국어 혼입 | 검수 부재 | Parity Test에 Hangul 검사 | 🧪 |
| Unity WebGL에서 Backend SDK 불가 위험 | Platform 제약 미확인 | **Platform 제약 Matrix** + REST Gateway | 🧪 |
| Agent가 Scene YAML 편집 시 손상 위험 | Editor 의존 | **Code-first Builder + Batchmode** | 🧪 |
| Rule의 시작(Serve) 누락 | Spec Gap | Gap 기록 + 기본안 | 🧪 |

---

## 21. Phase Plan Template

| Phase | 내용 | 산출물 | DoD |
| --- | --- | --- | --- |
| 0 | 문서 정독, 충돌·Gap 보고, Stack 재검토(ADR), Repository·Rules·Backend 준비 | ADR, DECISIONS, Skeleton | **Gate G0** |
| 1 | App Shell: Layer, EventBus, Pause, Clock, Settings, LayoutManager + HudProfile, i18n, Audio, Router, System Bar, Video Fallback | 전 화면 이동 | 3 Layout × 3 언어 전환 |
| 2 | Pure Model + Data Table + Unit Test + Headless Simulation | Test, balance.md | Test 100% |
| 3 | Engine Presentation (Scene/Camera/Board), Input, HUD, Placeholder | 1 Stage 완주 | Play-Area 지표 통과 |
| 4 | 전체 Flow, Stage 진행, 연출, Handedness, Pause/Home | Offline 전체 Loop | Flow Smoke |
| 5 | Account·DB·Ranking·Rules/RLS·TTL | E2E 보고 | E2E 통과 |
| 6 | Asset Pipeline + 실제 Asset + Audio/Video + Icon | Asset 반영 | Asset 유무 모두 완주 |
| 7 | Analytics, 성능, 3기기 × 3언어 감사, Design 재정비, Balance | audit/, performance.md | 겹침 0, FPS 목표 |
| 8 | 보안 검사, Build, 배포/Store, Smoke Test | 운영 URL / Build | 최종 DoD |

---

## 22. Cursor Rules Template (.cursor/rules/\*.mdc)

```markdown
---
description: {Game} core rules
alwaysApply: true
---
- Read docs/specs/07_*.md before major work. Precedence: user > 07 > 05/06 > a01–a15 > 02 > 01.
- 100% English code/comments/identifiers/logs/commits. User-facing text only via ko/en/ja localization keys.
- Pure, deterministic model for rules/judgment/AI (fixed tick, seeded IRandom) with unit tests.
- Balance values only in data files. No magic numbers in gameplay code.
- Never commit secrets. Admin UI only for server-side admin role.
- (Unity) Never hand-edit .unity/.prefab/.asset YAML; use Editor builder scripts. Never delete .meta files.
- (Unity) Zero allocations in Update/Tick paths; pool objects; UnityWebRequest for HTTP; no threads on WebGL.
- Record decisions in docs/DECISIONS.md; report before changing stack or scope.
```

```markdown
---
description: Layout & localization rules
globs: {ui paths}, {localization paths}
---
- Three layout profiles via root attribute/class only (desktop / mobile-landscape / mobile-portrait), hand-right/hand-left.
- Touch >= 44, text >= 12, zero overlap, safe area respected, measured system bar height.
- Handedness: dominant hand = precision primary action ({define per project}).
- Same key set in ko/en/ja; ja must be natural Japanese (no Hangul).
```

---

## 23. 07 Master Execution Prompt Skeleton (복사하여 프로젝트별 작성)

```markdown
# 07. Cursor AI Agent Master Execution Prompt — {Game Name}
## 0. 문서 개요 (역할 · Pipeline · Precedence · Language Policy · Conflict Resolution Log)
## 1. Agent Role & Mission (English block)
## 2. 절대 원칙 (R01~Rnn)
## 3. 프로젝트 Meta
## 4. Phase 0 — Stack Re-evaluation & ADR (Default · 대안 · Decision Trigger · Platform 제약 · Gate G0)
## 5. Repository & Project 구조 (Folder · Module/Assembly · Version Control)
## 6. Runtime Architecture (Boot · App FSM · EventBus · Pause · Clock · ScreenContext)
## 7. 화면 사양 (System Bar 매트릭스 · 화면별 표 · How to Play)
## 8. Gameplay Core (좌표계 · Rule · 공식 · 판정 · Planner · AI · Stat 공식 · Score · Code 계약 · Headless Sim 목표)
## 9. Camera / Presentation (Framing Acceptance · FX · Replay)
## 10. Character & Animation (Data · Clip 목록 · Mirror · Placeholder)
## 11. Input & Controls (Device별 Wireframe · Control 정의 · Desktop Mapping · Touch Block)
## 12. 3-Device Layout & HUD (Detect · HudProfile · Wireframe × 3 · Play-Area 목표)
## 13. UI/UX & Localization (규칙 · 저장 범위 · Localization Master Table ko/en/ja 실제 문구)
## 14. Audio (정책 · 구조 · 목록)
## 15. Art & Asset Pipeline (원칙 · Theme · Naming · Placeholder)
## 16. Video (구간 · Fallback)
## 17. Backend (Auth · Schema · Security · RPC · TTL · Gateway)
## 18. Data Tables (CSV 규칙 · Table 실제 값)
## 19. Save & Sync
## 20. Admin & Debug
## 21. Security
## 22. Performance
## 23. Testing & QA (명령 · 필수 Test · 감사 · E2E)
## 24. Build & Deploy (Target · Store Checklist)
## 25. Phase Plan (내용 · 산출물 · DoD · Gate)
## 26. Agent 보고 형식
## 27. Cursor Rules
## 28. Open Decisions (기본값 · 대안)
## 29. 최종 Definition of Done
## 30. Kickoff Prompt + Phase 진행 Prompt
```

---

## 24. [복사해서 쓰는] AI Agent Production Blueprint Directive

```text
[AI Agent Production Blueprint — Form 4.0]
You are the lead development agent for '{Game Name EN}' ({game-id}), stack profile {W2D|W3D|N3D|N2D}.
Follow the project's 07 Master Execution Prompt, then Design Master Doc 4.0 and this Form 4.0.

[Phase 0 — mandatory]
- Read all specs, report uncovered contradictions and gaps.
- Re-evaluate Engine, App/UI framework, Backend/DB, Hosting, Test/CI. Check the Platform Constraint Matrix (§1.5).
  Write docs/ADR.md. If a default changes, wait for approval (Gate G0).

[Implementation — mandatory]
1. Layer contract (game view + screen/cutscene/modal/toast/system bar), typed event bus, reason-based pause,
   SimClock with input-timestamp conversion for timing judgments.
2. LayoutManager (3 profiles, 150 ms debounce, 200 ms input lock, rotation without state loss) + single HudProfile
   + measured system bar height + root attribute/class styling + safe area.
3. Play-area: 2D max integer tile with portrait transpose, or 3D camera profiles + Framing Validator + occlusion check.
4. Handedness = dominant hand on precision primary action (as defined in 07), mirrored layout and inner mapping,
   cloud-synced per user.
5. i18n: ko source dictionary, identical en/ja keys, attribute/error/video overlay coverage, instant switch,
   canvas/3D text redraw, parity test incl. no Hangul in ja.
6. Audio: master→bgm/sfx/ui, OFF by default, session-persistent, file-first + procedural fallback, 45 ms throttle,
   screen-declared music, video audio routed.
7. Assets: placeholder factory for full playthrough, drop-in pipeline, build-time manifest (web) or registry (unity).
8. Accounts: guest nickname (unique, discard on logout, 100-day TTL), email, mobile number via alias (no SMS,
   confirmation off), Google, Apple (iOS), MyPage (masked password change, settings, account deletion).
9. Ranking (if any): server-validated submit function, public-column leaderboard, rate limit.
10. Pure deterministic model (fixed tick, seeded RNG, analytic physics, target-solved outcomes, judge pipeline),
    data-driven tables, unit tests, headless balance simulation report.
11. Security: secrets only in local secret files, no dev credentials in builds, admin via server role/ID list,
    build output secret grep.
12. QA: compile, unit tests, play/flow tests, i18n parity, asset coverage, build, 3-device × 3-language audit
    (overlap, size, exceptions, rotation, play-area, handedness, touch block), backend E2E with cleanup,
    production smoke test. Report results as tables.
13. (Unity) Code-first scenes/prefabs via builder scripts, never hand-edit YAML, batchmode tests and builds.
14. 100% English code. Markdown documents. Report to the user in their language with English technical terms.
```
