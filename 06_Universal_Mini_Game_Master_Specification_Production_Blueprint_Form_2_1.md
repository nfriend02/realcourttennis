# 📋 미니게임 표준 기획서 및 제작 청사진 (Form_2_1)
*Universal Mini-Game Master Specification & Production Blueprint — v2.1*
***검증 참조 프로젝트: 『토이빌 디펜더스: 별빛축제 대작전』 (toyville-defenders) 최종 출시본 — Vite 8 · TypeScript 5.9 · Phaser 3.90 · DOM UI Layer · Firebase 13 (Auth/Firestore/Storage) · Vercel · PWA***
*이전 버전: Form_2_0 (Toyville 기획 단계) · Form_1_7 (Claypop v2) · Form_1_6 (Chicken Run v2)*

---

## 0. 마스터 양식 개요 및 작성 규칙

본 문서는 **새 미니게임의 기본 기획(01~05)이 끝난 뒤**, 코딩 에이전트가 실제 제품을 만들 때 따르는 **기술 규격·제작 청사진**이다.
Form_2_1은 Form_2_0을 계승하되, Toyville을 실제로 구현·배포·운영하며 확인된 내용을 표준으로 확정했다.

* **Phase 0 기술 스택 재검토 의무와 ADR**
* **3기기 레이아웃 엔진** (LayoutManager + HUD Profile + 실측 --sys-h)
* **플레이 영역 최대화 구현 규격**
* **i18n 전체 처리 규격**
* **오디오 전체 처리 규격**
* **에셋 자동 파이프라인**
* **계정·DB·TTL·보안**
* **PWA 아이콘**
* **Vercel 배포**
* **3기기 자동 화면 감사 QA**

| 표시 | 의미 |
| --- | --- |
| ✅ 검증됨 | Toyville 최종본에서 동작·배포·테스트로 확인 |
| 🟨 표준 필수 | 신규 프로젝트 필수 적용 |
| 🟦 권장 | 장르/스택에 따라 선택 (미채택 시 사유 기록) |
| ⚠️ 교훈 | 실제 발생 문제 → 표준화된 해결책 |
| { } | 프로젝트별 작성 칸 |

### 0.1 절대 원칙

| # | 원칙 | 요약 |
| --- | --- | --- |
| 1 | English-Only Code | 코드·주석·키·로그·DB 필드 100% 영어, 화면 문구만 i18n ✅ |
| 2 | 3-Language UX | ko(기본)/en/ja, 즉시 전환, 키 동일성 자동 검사 ✅ |
| 3 | 3-Device Native Layout | desktop / mobile-landscape / mobile-portrait 독립 설계, 게임 중 회전 즉시 전환 ✅ |
| 4 | Play-Area First | 플레이 영역은 남는 공간 전부 + 최대 정수 타일 맞춤 ✅ |
| 5 | No-Overlap UX | 겹침 0, 터치 44px, 글자 12px 이상, 세로 상단 메뉴 2줄 ✅ |
| 6 | Sound-Respectful | 기본 OFF, 세션 유지, 단일 오디오 매니저 ✅ |
| 7 | Asset-Optional | 에셋 없이도 전체 플레이 가능, 투입 시 자동 변환 ✅ |
| 8 | **Stack Re-evaluation** | 엔진·앱 프로그램·DB는 Phase 0에서 에이전트가 재검토하여 선택/변경 🟨 |
| 9 | Secret-Safe | 비밀 정보 소스/문서/저장소/배포 환경 변수 금지(개발용), 관리자 UI는 관리자 ID에서만 ✅ |
| 10 | Testable Core | 게임 로직은 렌더링과 분리된 순수 모델 + 단위 테스트 ✅ |

---

## 1. 🟨 Phase 0 — 기술 스택 재검토 및 선택 (Stack Re-evaluation Mandate)

### 1.1 의무 규정

1. 코딩 에이전트는 **개발 시작 단계에서 반드시** 아래 세 범주를 재검토한다. 기획서·이전 Form·이전 프로젝트의 스택은 *기본 추천값*이며 강제가 아니다.
   - **① 엔진 프로그램** — 게임 렌더링·물리·애니메이션 엔진
   - **② 사이트/앱 개발 프로그램** — 앱 셸, UI 프레임워크, 크로스플랫폼 도구 (예: Vite, React, **Flutter**, Capacitor)
   - **③ DB 프로그램** — 인증·데이터베이스·파일 저장·서버 기능
2. 재검토 결과는 §1.4 **ADR 표**로 사용자에게 보고하고 저장소에 docs/ADR.md로 남긴다.
3. 기본 추천값을 유지해도 된다. 단, *왜 유지하는지* 기록한다.
4. 개발 도중 치명적 제약이 발견되면 에이전트는 **변경을 제안·실행할 수 있다**. 실행 전 이유, 영향 범위, 마이그레이션 계획을 보고한다.
5. 스택이 바뀌어도 본 Form의 **경험 표준(§4~§9, §12, §14)** 은 동일하게 충족해야 한다.

### 1.2 선택지 비교 매트릭스 (참고용)

**① 엔진 프로그램**

| 후보 | 강점 | 약점 | 적합 장르 |
| --- | --- | --- | --- |
| Phaser 3/4 ✅ | 2D 게임 기능 완비, 웹 친화, 자료 풍부 | 3D 불가 | 퍼즐, 디펜스, 러너, 캐주얼 |
| PixiJS | 초고속 2D 렌더링, 가벼움 | 게임 로직·물리 직접 구현 | 이펙트 중심, 대량 스프라이트 |
| Three.js / Babylon.js | 웹 3D 표준 | UI·게임 구조 직접 구성, 모바일 부하 | 3D 캐주얼, 3D 러너 |
| PlayCanvas / Cocos Creator | 에디터 기반, 3D/2D | 툴 종속, 빌드 체계 상이 | 에디터 협업 프로젝트 |
| Godot (Web Export) / Unity (WebGL) | 강력한 에디터·물리 | 웹 번들 크고 첫 로딩 느림, DOM i18n·폼 처리 불리 | 앱스토어 동시 출시형 |
| Canvas 2D 직접 구현 | 의존성 0 | 모든 기능 직접 작성 | 매우 단순한 게임 |

**② 사이트/앱 개발 프로그램**

| 후보 | 강점 | 약점 | 선택 기준 |
| --- | --- | --- | --- |
| Vite + Vanilla TS ✅ | 가볍고 빠름, 게임 엔진과 충돌 없음 | 화면이 많아지면 구조화 필요 | 화면 10개 내외 미니게임 |
| React / Preact / Vue / Svelte | 컴포넌트·상태 관리 | 게임 캔버스와 렌더 루프 분리 설계 필요 | 계정·상점·폼 UI가 많을 때 |
| Next.js | SSR/SEO | 게임에는 대부분 불필요 | 마케팅 사이트 겸용 |
| **Flutter (Web/Android/iOS)** | 단일 코드로 앱스토어 출시 | 웹 번들 큼, 웹 게임 엔진 연동 제약 | 앱스토어 출시가 핵심일 때 (Flame 엔진 조합) |
| Capacitor / Ionic | 웹 게임을 그대로 앱 패키징 | 네이티브 기능 플러그인 의존 | 웹 우선 + 스토어 출시 |
| Tauri / Electron | 데스크톱 설치 앱 | 배포 용량(Electron) | PC 전용 배포 |

**③ DB 프로그램**

| 후보 | 강점 | 약점 | 선택 기준 |
| --- | --- | --- | --- |
| Firebase (Auth/Firestore/Storage) ✅ | 게스트(익명)·이메일·Google 인증, 보안 규칙, TTL, 무료 한도 | 복잡한 쿼리·집계 약함 | 개인 진행 저장 중심 |
| Supabase (Postgres) | SQL, 랭킹·통계 쿼리, RLS | 익명 로그인·TTL은 별도 설계 | 랭킹·분석·관계형 데이터 |
| Appwrite / PocketBase | 자체 호스팅 가능 | 운영 부담 | 데이터 주권·비용 통제 |
| 자체 서버 + DB | 완전한 자유 | 개발·운영 비용 최대 | 대규모·특수 요구 |

### 1.3 결정 트리거 (재검토 시 반드시 확인할 질문)

- [ ] 2D인가 3D인가? 동시 오브젝트 수는? (모바일 60fps 목표)
- [ ] 앱스토어 출시가 필요한가, 웹 + PWA로 충분한가?
- [ ] 계정 방식: 게스트(별명)·이메일·휴대폰번호(SMS 없이)·소셜 중 무엇이 필요한가?
- [ ] 랭킹/통계/친구 등 서버 쿼리 요구가 있는가?
- [ ] 데이터 자동 삭제(TTL) 요구가 있는가? (예: 게스트 100일)
- [ ] 무료 한도·예상 비용·지역 규제(개인정보) 문제는?
- [ ] 다국어 텍스트·폼·접근성 처리를 어느 계층(DOM vs 캔버스)이 맡는가?

### 1.4 ADR (Architecture Decision Record) 작성 양식

| 범주 | 선택안 | 검토한 대안 | 선택 이유 | 변경 시 영향 | 상태 |
| --- | --- | --- | --- | --- | --- |
| 엔진 | { } | { } | { } | { } | 제안 / 확정 / 변경됨 |
| 앱 개발 프로그램 | { } | { } | { } | { } | |
| DB/백엔드 | { } | { } | { } | { } | |
| 호스팅/배포 | { } | { } | { } | { } | |
| 테스트 도구 | { } | { } | { } | { } | |

> ⚠️ **교훈 (Toyville)** : Form_2_0은 "Phaser 3 + Three.js/Canvas 하이브리드"를 규정했지만, 최종 구현은 **Phaser 캔버스(게임 필드) + DOM(모든 UI)** 였다. Three.js는 필요 없었다. 기획 단계의 스택은 가설이며, 재검토 의무가 필요한 이유다.

---

## 2. 마스터 문서 메타 정보

| 항목 | 작성 칸 | Toyville 검증값 |
| --- | --- | --- |
| 게임명 (ko/en/ja) | { } | 토이빌 디펜더스 / Toyville Defenders / トイビル・ディフェンダーズ |
| 영문 ID | {kebab-case} | toyville-defenders |
| 양식 버전 | Form_2_1 | — |
| 엔진 (ADR 결과) | { } | Phaser 3.90 |
| 앱 셸 (ADR 결과) | { } | Vite 8 + TypeScript 5.9 (Vanilla DOM) |
| DB/백엔드 (ADR 결과) | { } | Firebase 13: Auth(익명/이메일/Google), Firestore, Storage, Analytics(운영만) |
| 호스팅 | { } | Vercel (GitHub 연동 자동 배포) |
| 개발 포트 | 3000 | 3000 |
| 레이아웃 | desktop · mobile-landscape · mobile-portrait | 동일 |
| 언어 | ko · en · ja | 동일 (500키) |
| 테스트 | { } | Vitest 21건 + i18n 검사 + CDP 3기기 감사 + Firebase E2E |

---

## 3. 표준 폴더 구조 (✅ Toyville 최종 구조 일반화)

```
📁 {game-id}/
├── index.html                    # 레이어 DOM + PWA/아이콘 메타
├── vite.config.ts                # 포트 3000, 에셋 매니페스트(dev 미들웨어 + build 출력), raw_assets 감시
├── vercel.json                   # SPA rewrite, 캐시 헤더
├── firebase.json / .firebaserc   # rules·indexes 배포 설정
├── firestore.rules / firestore.indexes.json (TTL) / storage.rules
├── .env.example                  # 키 이름만 (값 없음) — 커밋
├── .env.local                    # 실제 값 — 절대 커밋 금지
├── docs/ADR.md                   # Phase 0 스택 결정 기록
├── 📁 src/
│   ├── main.ts                   # 부팅: settings → layout → i18n → audio → (assets, auth) → overlay → intro → SW 등록
│   ├── 📁 core/                  # EventBus, Settings(기기), SessionPrefs(세션), Pause(사유별), Assets(매니페스트), AdminTuning
│   ├── 📁 layout/                # LayoutManager, HudProfile
│   ├── 📁 i18n/                  # i18n.ts + strings/ko.ts(기준) · en.ts · ja.ts
│   ├── 📁 audio/                 # AudioManager(버스·파일·루프), SoundSynth(대체 신스·SFX ID·음악 ID)
│   ├── 📁 auth/                  # AuthService(인터페이스·Mock), FirebaseBackend, adminPolicy, guestNames, firebaseConfig
│   ├── 📁 save/                  # SaveSystem(로컬·병합·이벤트), CloudSave(디바운스 업로드)
│   ├── 📁 data/                  # *.json 밸런스·스테이지·엔티티, cutscenes.ts, gameData.ts(타입)
│   ├── 📁 game/                  # {Game}Model(순수 로직), {Game}Scene(엔진 렌더), GridMapper, PhaserGame, *.test.ts
│   ├── 📁 app/                   # Router, nav, SystemOverlay, Menu, MyPage, AdminPage, CheatConsole
│   │   └── 📁 screens/           # Intro, Title, Login, Signup, Lobby, StageSelect, {Play}, Result, Album, Codex …
│   ├── 📁 ui/                    # dom helpers, modal, homeButton, fitText, CutscenePlayer, HowToPlay, art
│   └── 📁 styles/                # base.css(토큰·레이어) · system.css(바·모달) · screens.css · {play}.css · cutscene.css
├── 📁 public/
│   ├── manifest.webmanifest · sw.js · favicon.ico
│   ├── 📁 icons/{mobile,desktop,source}/
│   └── 📁 assets/                # 변환 결과 (anim, stages, items, videos, audio, portraits, ui)
├── 📁 raw_assets/                # AI 생성 원본 투입 폴더 (README에 파일명 규칙)
└── 📁 tools/                     # build-assets, asset-config.json, manifest, check-assets, check-i18n, compose-audio, build-icons
```

* 🟨 화면 하나 = 파일 하나(screens/\*Screen.ts), 각 화면은 ScreenContext를 선언한다.
* 🟨 엔진 의존 코드는 game/\*Scene.ts에만 둔다. 모델·데이터·UI는 엔진을 몰라야 엔진 교체가 쉽다.

---

## 4. 런타임 아키텍처

### 4.1 화면 레이어 (z-index 계약)

| 레이어 | z | 역할 | 포인터 |
| --- | --- | --- | --- |
| #game-root | 0 | 엔진 캔버스 (전체 화면) | 플레이 화면에서만 |
| #screen-layer | 1 | 현재 화면 DOM | 빈 영역은 통과 |
| #cutscene-layer | 5 | 영상/그림책 컷씬 | 컷씬 중 |
| #modal-layer | 7 | 모달 (메뉴, 마이페이지, 확인 창) | 모달 중 |
| #toast-layer | 8 | 토스트 | 없음 |
| #system-overlay | 9 | 상단 시스템 바 | 버튼만 |

* 🟨 **UI는 DOM, 게임 필드는 캔버스.** 텍스트·폼·접근성·반응형·i18n은 DOM이 압도적으로 쉽다. ✅

### 4.2 타입 지정 이벤트 버스 (예시 계약)

```ts
type Events = {
  'layout:change': LayoutProfile;      // 프로필이 실제로 바뀔 때만
  'viewport:resize': void;              // 디바운스된 리사이즈
  'language:change': Lang;
  'sound:change': boolean;
  'pause:change': { paused: boolean; adminFrozen: boolean };
  'hand:change': 'right' | 'left';
  'save:change': void;
  'assets:updated': string;
};
```

### 4.3 일시정지 컨트롤러 (사유별)

```ts
type PauseReason = 'admin' | 'menu' | 'hidden';   // 사유가 하나라도 있으면 정지
pause.set('menu', true);   // 메뉴/확인 창
pause.set('hidden', document.hidden);  // 탭 전환
```
* 🟨 확인 창·메뉴·관리자 정지·탭 숨김이 서로를 덮어쓰지 않도록 **사유 집합**으로 관리. ✅

### 4.4 Router + ScreenContext (시스템 바 선언형 제어)

```ts
interface ScreenContext {
  showLang: boolean;         // 언어 버튼
  showHand: boolean;         // 손잡이 버튼 (플레이 화면)
  menu: 'none' | 'lobby' | 'battle' | 'result';
  music?: MusicId | null;    // 화면 진입 시 자동 재생 (undefined = 유지)
  showHelp?: boolean;        // How to Play 알약
  showHome?: boolean;        // 홈 버튼 (+말풍선)
  showAccount?: boolean;     // 마이페이지·로그아웃 알약 (로그인 시)
}
```
* router.go(screen) = 이전 화면 unmount → 새 화면 mount → applyI18n → 음악 교체 → html[data-screen] 갱신 → 시스템 바 재렌더. ✅

---

## 5. 🟨 3기기 레이아웃 엔진 규격

### 5.1 LayoutManager 계약

```ts
type LayoutProfile = 'desktop' | 'mobile-landscape' | 'mobile-portrait';

function detect(): LayoutProfile {
  const w = visualViewport?.width ?? innerWidth;
  const h = visualViewport?.height ?? innerHeight;
  if (h > w) return 'mobile-portrait';
  const coarse = matchMedia('(pointer: coarse)').matches;
  if (coarse && Math.min(w, h) < 900) return 'mobile-landscape';
  return 'desktop';
}
```

| 기능 | 규격 |
| --- | --- |
| 이벤트 | resize, orientationchange, visualViewport.resize → 150ms 디바운스 |
| 적용 | html[data-layout], html[data-pointer], HUD 프로필 CSS 변수, --vh |
| 브로드캐스트 | 프로필이 바뀔 때만 layout:change (리사이즈는 viewport:resize) |
| 입력 잠금 | 전환 후 200ms inputLocked = true |
| 강제 전환 | 관리자 설정 layoutOverride / DEV 전용 ?layout= URL 파라미터 |
| 미리보기 | 강제 프로필 ≠ 실제 화면이면 html.layout-framed (기기 프레임) |

### 5.2 HUD Profile (기기별 프리셋 단일 출처)

```ts
interface HudProfile { sysBar: 'single' | 'stacked'; sysBtn: number; pillH: number; pillFont: number; /* + 프로젝트별 */ }

export const HUD_PROFILES: Record<LayoutProfile, HudProfile> = {
  desktop:            { sysBar: 'single',  sysBtn: 44, pillH: 28, pillFont: 12 },
  'mobile-landscape': { sysBar: 'single',  sysBtn: 42, pillH: 28, pillFont: 12 },
  'mobile-portrait':  { sysBar: 'stacked', sysBtn: 42, pillH: 30, pillFont: 12.5 },
};
// applyHudProfile(): html[data-sysbar], --sys-btn, --pill-h, --pill-fs 설정. 어디서나 hudProfile()로 조회.
```
* 🟨 LayoutManager가 프로필 전환 시 **HUD 프로필을 먼저 적용한 뒤** layout:change를 보낸다 → 화면·게임 씬이 같은 값으로 한 프레임에 재배치. ✅
* 🟦 프로젝트별 항목 추가 예: cardBarH, padW, panelMode('fixed'|'slide'|'sheet'), hudMode('row'|'stacked').

### 5.3 시스템 바 높이 실측

```ts
new ResizeObserver(() => root.style.setProperty('--sys-h', `${bar.offsetHeight}px`)).observe(bar);
```
* 🟨 모달 backdrop padding-top, 로비 상단, 플레이 화면 상단 행, 고정 배지 위치는 모두 var(--sys-h) 사용. ✅
* ⚠️ **교훈** : 추정 높이(52px\*2)로 계산했던 세로 그리드가 알약 표시 여부에 따라 겹쳤다 → 실측 변수로 해결.

### 5.4 CSS 작성 규칙

* 🟨 기기별 규칙은 미디어쿼리 대신 **html[data-layout='…'] 속성 선택자**로 작성 (강제 전환·미리보기와 일관). ✅
* 🟨 손잡이는 html[data-hand='left']로 그리드 영역 이름만 바꿔 좌우 반전. ✅
* 🟨 노치: --safe-t/b/l/r: env(safe-area-inset-\*)를 가장자리 패딩에 포함. ✅
* 🟨 루트: #app { position: fixed; inset: 0; overflow: hidden }, touch-action: manipulation, overscroll-behavior: none. ✅

### 5.5 플레이 화면 그리드 (✅ Toyville 최종값 — 오른손잡이 기본)

```css
/* Desktop: HUD는 시스템 바 행 공유, 우측 상세 패널 고정, D-Pad 숨김 */
html[data-layout='desktop'] .battle-ui {
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-template-rows: var(--sys-h) minmax(0, 1fr) 96px;
  grid-template-areas: 'hud hud' 'play panel' 'cards act';
}
/* Mobile landscape: 오른손잡이 = 방향키 오른쪽 */
html[data-layout='mobile-landscape'] .battle-ui {
  grid-template-columns: 122px minmax(0, 1fr) 122px;
  grid-template-rows: 46px minmax(0, 1fr) 70px;
  grid-template-areas: 'hud hud hud' 'act play dpad' 'cards cards cards';
}
html[data-layout='mobile-landscape'][data-hand='left'] .battle-ui {
  grid-template-areas: 'hud hud hud' 'dpad play act' 'cards cards cards';
}
/* Mobile portrait: 상단은 --sys-h 아래, 하단 패드 행 */
html[data-layout='mobile-portrait'] .battle-ui {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) auto 128px;
  grid-template-areas: 'hud hud' 'play play' 'cards cards' 'act dpad';
  padding-top: calc(var(--sys-h) + var(--safe-t));
}
html[data-layout='mobile-portrait'][data-hand='left'] .battle-ui {
  grid-template-areas: 'hud hud' 'play play' 'cards cards' 'dpad act';
}
```
* ⚠️ **교훈** : 초기 값은 오른손잡이에 'dpad play act'(방향키 왼쪽)였다. **오른손잡이 = 방향키가 오른손 엄지 쪽**으로 기획서에 명시한다.

---

## 6. 🟨 플레이 영역 최대화 구현 규격

### 6.1 캔버스와 보드의 분리

```ts
// Engine: 캔버스는 항상 전체 화면
new Phaser.Game({ scale: { mode: Phaser.Scale.RESIZE }, parent: gameRoot, input: { activePointers: 2 } });

// Scene.update(): 레이아웃 키가 바뀔 때만 재계산 (저비용 no-op)
const rect = host.playRect();          // DOM .play-area 의 getBoundingClientRect (캔버스 좌표)
const portrait = host.portrait();
mapper.fit(rect, /* transposed */ portrait);
```

### 6.2 GridMapper (논리 좌표 ↔ 화면 좌표, 세로 전치)

```ts
fit(area: Rect, transposed: boolean) {
  const sc = transposed ? rows : cols, sr = transposed ? cols : rows;
  tile = Math.max(16, Math.floor(Math.min(area.width / sc, area.height / sr)));  // 최대 정수 타일
  originX = Math.round(area.x + (area.width - tile * sc) / 2);                    // 중앙 정렬
  originY = Math.round(area.y + (area.height - tile * sr) / 2);
}
toScreen(c, r)      // 논리 → 화면 (전치 반영)
fromScreen(x, y)    // 화면 → 논리 타일 (터치/드래그)
screenDelta(dx, dy) // D-Pad 화면 방향 → 논리 방향 (전치 시 축 교환)
```
* 🟨 게임 모델은 항상 *가로 기준 논리 좌표*만 사용. 회전은 화면 변환 계층에서만 처리 → 게임 중 회전해도 상태 무손실. ✅
* 🟨 DOM에서 끌어온 드래그도 같은 매퍼로 타일을 찾는다 (tileAtClient(clientX, clientY)). ✅

### 6.3 면적 측정 (QA 자동화)

```js
const play = document.querySelector('.play-area').getBoundingClientRect();
const ratio = (play.width * play.height) / (innerWidth * innerHeight);   // 목표: desktop ≥ .65, landscape ≥ .55, portrait ≥ .50
```

### 6.4 확대 기법 구현 옵션

| 기법 | 구현 포인트 |
| --- | --- |
| 집중 모드 | 진행 단계에서 html.focus-mode → 카드 바/패드 축소·반투명, 준비 단계 해제 |
| 패드 오버레이 | 가로 모드 패드 열을 position:absolute로 플레이 영역 가장자리에 겹치고 그리드 열 제거 |
| 전체 화면 | document.documentElement.requestFullscreen() 버튼 (iOS Safari 미지원 → PWA 설치 안내) |
| 핀치 줌 | 엔진 카메라 zoom/scroll, UI는 DOM이라 영향 없음 |
| 고해상도 | 엔진 resolution = min(devicePixelRatio, 2) (성능 상한) |

---

## 7. 🟨 i18n 전체 처리 규격

### 7.1 파일 구조와 타입 안전

```ts
// src/i18n/strings/ko.ts — 기준 사전 (키의 원천)
export const ko = {
  'title.start': '별빛 모험 시작',
  'login.toSignup': '처음이면 회원가입',
  'auth.err.weakPassword': '비밀번호는 {min}자 이상이어야 해요.',
  // ...
} as const;
export type StringKey = keyof typeof ko;

// en.ts / ja.ts — Record<StringKey, string> 로 선언 → 누락 키는 컴파일 오류
```

### 7.2 런타임 API

| API | 역할 |
| --- | --- |
| detectLanguage() | 저장값 → navigator.language(ja/en) → ko |
| t(key, params?) | 현재 언어 → ko → 키 이름 순 대체, {name} 치환 |
| tIn(lang, key) | 특정 언어 문구 (언어 알약 라벨 등) |
| i18nSpan(key, params?) | &lt;span data-i18n="key" data-i18n-params='{}'>현재 문구&lt;/span> 생성 |
| data-i18n-attr="placeholder" | 텍스트 대신 속성에 번역 적용 (placeholder, aria-label, title) |
| applyI18n(root) | root 안의 모든 [data-i18n] 갱신 (화면 mount 시 + 언어 변경 시) |
| setLanguage(lang) | 저장 → html[lang], html[data-lang] → applyI18n(document) → language:change |

* 🟨 캔버스 텍스트, 동적으로 생성된 목록, 열린 모달은 language:change를 구독해 다시 그린다. ✅
* 🟨 언어별 폰트: html[data-lang='en'] { --font: 'Nunito', … } 방식. ✅
* 🟨 로고 한 줄 맞춤(fitText)은 language:change, viewport:resize, document.fonts.ready, 화면 DOM 변경 시 재계산. ✅

### 7.3 오류 메시지 매핑

```ts
type AuthErrorCode = 'invalidCredentials' | 'emailInUse' | 'weakPassword' | 'invalidId'
  | 'nicknameTaken' | 'nicknameInvalid' | 'recentLogin' | 'network' | 'unsupported' | 'notFound';
const AUTH_ERROR_KEYS: Record<AuthErrorCode, StringKey> = { emailInUse: 'auth.err.emailInUse', /* … */ };
```
* 🟨 백엔드 원본 오류 문자열을 화면에 그대로 노출하지 않는다.

### 7.4 검사 스크립트 (npm run i18n:check) ✅

```js
// ko.ts 키 집합과 en/ja 키 집합 비교 → missing / extra 출력, 불일치 시 exit 1
```
* 🟨 빌드·커밋 전 필수 실행. (Toyville 최종: ko/en/ja 각 500키, OK)

---

## 8. 🟨 오디오 전체 처리 규격

### 8.1 AudioManager 계약

```ts
class AudioManager {
  init(): void;                       // sound/pause 이벤트 구독, 첫 제스처(pointerdown/keydown)에서 컨텍스트 unlock
  get enabled(): boolean;             // sessionPrefs.sound && !pause.adminFrozen
  sfx(id: SfxId): void;               // 버퍼 있으면 재생, 없으면 신스 대체; 같은 ID 45ms 내 재발생 무시
  playMusic(id: MusicId | null): void;// 파일(bgm_{id}) 우선, 실패 시 시퀀서; 0.6s 페이드 인, 0.12 타임상수 페이드 아웃
  duck(seconds: number): void;        // 대사 중 BGM 50%
  registerMedia(el): () => void;      // <video>/<audio> 음소거·관리자 정지 연동
}
```

| 항목 | 규격 |
| --- | --- |
| 그래프 | master → bgm(0.6) / sfx(0.8) / ui(0.7); ui\_\* ID는 ui 버스 |
| 컨텍스트 | 사운드 ON + 사용자 제스처 시에만 생성/resume, OFF 시 suspend |
| 파일 이름 | public/assets/audio/bgm\_{musicId}.mp3, sfx\_{sfxId}.mp3 (mp3/ogg/wav 허용) |
| 루프 | audio/bgm_loops.json = { "bgm_lobby": 32.0, … } 루프 길이(초); 디코딩 후 선행 무음(<0.004, 최대 0.25s) 건너뛰기 |
| 프리로드 | 컨텍스트 생성 시 모든 sfx\_\* 비동기 로드 |
| 음악 선택 | ScreenContext.music (Router가 자동 호출), 컷씬 def.music, 보스 등장 시 boss |
| 영상 | 모든 컷씬 영상은 muted 시작 + registerMedia |

### 8.2 SessionPrefs (사운드 세션 규칙)

```ts
// 기본 OFF. 켜면 localStorage `{app}.session.{owner}.soundOn = '1'` (새로고침 유지)
// 로그인 성공: bindUser(uid) — 로그인 전 ON 상태를 사용자 세션으로 이월
// 로그아웃: reset() — OFF 복귀
```

### 8.3 절차적 사운드 생성 도구 (npm run audio:compose) 🟦

* Node + ffmpeg-static으로 BGM 루프·효과음을 합성해 raw_assets/audio/에 mp3로 출력, 루프 길이 JSON 동시 생성. ✅
* 같은 이름의 실제 음원으로 교체하면 자동 우선 사용.

---

## 9. 🟨 에셋 파이프라인 규격

### 9.1 흐름

| 단계 | 도구 | 결과 |
| --- | --- | --- |
| 투입 | 사용자/AI 도구 → raw_assets/ | 원본 |
| 감시 | Vite 플러그인 server.watcher (1.2s 디바운스, 큐 직렬 처리) | 자동 변환 트리거 |
| 변환 | tools/build-assets.mjs (sharp + ffmpeg-static) | 크로마키 투명화, 스프라이트 시트(WebP+JSON), 아이템 시트 분할, 배경 리사이즈/심리스 타일, 영상 delogo |
| 설정 | tools/asset-config.json | 기본 frames 48 · frameSize 256 · cols 8 · fps 12 · keyLow/High, 엔티티별 오버라이드, itemSheets{cols,rows,names} |
| 목록 | tools/manifest.mjs → /assets/manifest.json | { files[], sheets{id:{action:meta}} } |
| 알림 | HMR 커스텀 이벤트 {app}:assets-updated | 토스트 "새 에셋 준비됨 · 새로고침" |
| 점검 | npm run assets:check | 누락 에셋 표 |

### 9.2 런타임 Asset Registry

```ts
assets.load()            // manifest.json?t=… (no-store) — 실패해도 게임은 플레이스홀더로 진행
assets.has(rel) / find(rel) / list(prefix) / url(rel)  // url에 ?v= 버전 쿼리
```

### 9.3 ⚠️ 매니페스트 배포 누락 방지 (교훈)

* 매니페스트를 dev 서버 미들웨어로만 제공하고 파일은 .gitignore에 있었으므로, **배포본에서 모든 그림이 플레이스홀더로 나올 뻔했다**.
* 🟨 표준: Vite 플러그인 closeBundle()에서 dist/assets/manifest.json을 반드시 생성한다.

```ts
closeBundle() {
  fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(outDir, 'assets', 'manifest.json'), JSON.stringify(buildManifest()));
}
```

### 9.4 설치 아이콘 빌드 (npm run icons) ✅

| 출력 | 규격 | 용도 |
| --- | --- | --- |
| icons/mobile/apple-touch-icon(-167/-152/-120).png | 불투명, 180/167/152/120 | iOS 홈 화면 |
| icons/mobile/maskable-192/512.png | 핵심 피사체 중앙 80% 안전 영역 | 안드로이드 설치 |
| icons/mobile/icon-192/512/1024.png | 전체 채움 정사각형 | 모바일 범용 |
| icons/desktop/icon-16…1024.png | 투명 배경 둥근 타일 | 데스크톱 설치·탭 |
| icons/desktop/favicon.ico, toyville.ico | PNG 내장 ICO (16~256) | 브라우저 탭, 윈도우 바로가기 |

* 생성 이미지가 둥근 모서리/흰 배경을 포함하면 스크립트에서 코너 채움·배경 제거 처리.

---

## 10. 🟨 계정 · DB 규격 (기본: Firebase — ADR로 변경 가능)

### 10.1 AuthService 계층 (백엔드 교체 가능 구조)

```ts
type AuthProvider = 'guest' | 'password' | 'google';
interface AppUser { uid: string; displayName: string; loginId: string | null; provider: AuthProvider; isGuest: boolean; }

interface AuthBackend {
  restore(): Promise<AppUser | null>;
  guest(nickname: string): Promise<AppUser>;
  google(): Promise<AppUser>;
  withPassword(loginEmail: string, pw: string): Promise<AppUser>;
  signUp(loginEmail: string, pw: string): Promise<AppUser>;
  changePassword(loginEmail: string, current: string, next: string): Promise<void>;  // 재인증 후 변경
  discardGuest(user: AppUser): Promise<void>;   // 별명 해제 + 익명 계정 삭제
  signOut(): Promise<void>;
}
// FirebaseBackend (운영) / MockBackend (DEV 전용, 로컬 계정)
// AuthService: onBeforeSignOut(hook) → 저장 flush → 게스트면 discardGuest → signOut
```

### 10.2 휴대폰번호 로그인 (SMS 없이) ✅

```ts
// "+82" + "010-1234 5678" → 공백·하이픈·선행 0 제거 → 8~15자리 검증
phoneLoginEmail('+82', '010 1234 5678') === '821012345678@phone.{domain}'   // 이메일/비밀번호 인증의 별칭 계정
displayLoginId('821012345678@phone.{domain}') === '+82 10 1234 5678'
```
* 🟨 휴대폰번호 SMS 인증 기능은 사용하지 않는다(요구사항). 별칭 도메인은 환경 변수 VITE_PHONE_ALIAS_DOMAIN.

### 10.3 게스트 별명 + 100일 TTL ✅

| 요소 | 규격 |
| --- | --- |
| 인증 | Firebase 익명 로그인 + updateProfile(displayName) |
| 별명 규칙 | 2~12자 [\p{L}\p{N}\_] |
| 중복 방지 | guestNames/{nicknameLower} 문서를 **트랜잭션으로 선점** (만료된 선점은 인수 가능) |
| 로그아웃 | 저장 flush → 별명 문서 삭제 → 익명 계정 삭제 → 로컬 저장 삭제 (다시 찾을 수 없음, 별명 재사용 가능) |
| 서버 기록 | users/{uid}.expireAt = now + 100일 (저장할 때마다 갱신) → Firestore TTL 정책이 자동 삭제 |
| 등록 회원 | expireAt 없음 → 영구 보관 |

### 10.4 Firestore 스키마

```
users/{uid}
  profile: { nickname, loginId, provider, isGuest }
  happinessPoints, starShards, stageStars{}, research{}, bonusPoints, weapons{}, albumMeta[], mileage   ← 게임별로 교체
  handedness: 'right' | 'left'            ← 사용자 설정(기기 간 동기화)
  updatedAt: serverTimestamp
  expireAt?: Timestamp                    ← 게스트만
guestNames/{nicknameLower}
  uid, nickname, expireAt, claimedAt
```

### 10.5 보안 규칙 (✅ 배포·검증된 형태)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /guestNames/{name} {
      allow get: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.keys().hasOnly(['uid', 'nickname', 'expireAt', 'claimedAt']);
      allow update: if request.auth != null
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.keys().hasOnly(['uid', 'nickname', 'expireAt', 'claimedAt'])
        && (resource.data.uid == request.auth.uid || resource.data.expireAt < request.time);
      allow delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }
    match /{document=**} { allow read, write: if false; }
  }
}
```
* 🟦 필드 화이트리스트(hasOnly)를 users에도 적용할 경우, **새 저장 필드를 추가할 때마다 규칙도 갱신**해야 한다 (누락 시 저장 실패).

```json
// firestore.indexes.json — TTL 정책
{ "indexes": [], "fieldOverrides": [
  { "collectionGroup": "users",      "fieldPath": "expireAt", "ttl": true, "indexes": [] },
  { "collectionGroup": "guestNames", "fieldPath": "expireAt", "ttl": true, "indexes": [] }
] }
```
* Storage 규칙: users/{uid}/\*\* 본인만, 5MB 제한. ✅

### 10.6 SaveSystem / CloudSave 규칙

| 규칙 | 내용 |
| --- | --- |
| 로컬 키 | {app}.save.{uid} |
| 로드 | 로컬 → 클라우드 pull → **병합** → 사용자 설정 적용(예: 손잡이) → save:change |
| 병합 | 단조 증가 값(별점, 마일리지, 연구)은 max, 소비 재화·설정은 **최신 updatedAt 우선**, 목록은 합집합 |
| 업로드 | 1.5s 디바운스 setDoc(merge), undefined 필드는 제외 |
| 로그아웃 | flush()로 즉시 업로드 후 세션 종료 |
| 로컬 전용 세션 | guest\_/local\_ uid(Mock)는 클라우드 생략 |

### 10.7 설정 저장 범위 구현

| 범위 | 저장소 | 예 |
| --- | --- | --- |
| 기기 | localStorage['{app}.settings'] | language, layoutOverride, bigText, showFps |
| 세션 | SessionPrefs | sound |
| 사용자(동기화) | users/{uid} 필드 | handedness |

```ts
// 사용자 설정 동기화 패턴
bus.on('hand:change', (hand) => { if (auth.user && save.state.handedness !== hand) save.update(d => d.handedness = hand); });
// loadFor(): settings.set('handedness', data.handedness ?? 'right');
```

---

## 11. 화면별 구현 규격 (공통 컴포넌트)

| 컴포넌트 | 규격 |
| --- | --- |
| 시스템 바 | .sys-left(사운드, 관리자 Pause, 홈+말풍선) · .sys-pills(How to Play, 마이페이지, 로그아웃) · .sys-rounds(손잡이, 언어, 메뉴). 세로 모드 2줄 그리드 |
| 홈 버튼 | homeCornerHtml()(카드 우상단) + goHome(): 플레이 중이면 확인 모달 + pause.set('menu', true), 그 외 closeAllModals() → title |
| 모달 | 열린 핸들 추적, closeAllModals(), backdrop 클릭 닫기, padding-top: var(--sys-h) |
| 로그인 | 홈 코너 · 게스트(별명 뷰) · Google · [이메일|휴대폰번호] 탭 · 비밀번호 · 로그인 · "처음이면 회원가입" |
| 회원가입 | 선택 뷰(이메일/휴대폰) → 폼(아이디, 비밀번호, 확인) → 가입 → loadFor → 로비 |
| 휴대폰 입력 | [+82] 국가번호 칸(기본) + 번호 칸(placeholder "10 1234 5678") |
| 마이페이지 | 프로필, 아이디, 비밀번호 마스킹+변경 폼, 마일리지, 게스트 경고, 로그아웃/닫기 |
| 로그아웃 | 확인 모달 → auth.signOut() → closeAllModals() → title |
| How to Play | 문단별 i18n 모달 |
| 컷씬 | 영상 있으면 video-backdrop(흐림) + cut-video + Skip, 없으면 대사 그림책 |

---

## 12. 🟨 보안 · 비밀 정보 규격

| 규칙 | 내용 |
| --- | --- |
| 비밀 정보 위치 | .env.local 만 (gitignore). 소스·README·문서·커밋 메시지 금지 |
| 공개 저장소 | 첫 푸시 전 README/문서의 비밀번호·키 전수 검사 |
| 클라이언트 환경 변수 | VITE\_\* 는 **번들에 그대로 포함되는 공개 값**. Firebase web config는 공개 전제이며 보안은 규칙이 담당 |
| 개발용 관리자 계정 | VITE_DEV_ADMIN_ACCOUNTS는 DEV 빌드에서만 사용(import.meta.env.DEV 가드), **배포 환경 변수 등록 금지** |
| 관리자 판정 | VITE_ADMIN_IDS(이메일/휴대폰 별칭 목록)와 로그인 ID 일치 시에만 관리자 UI 렌더 |
| 배포 전 검사 | dist/assets/\*.js에서 개발 비밀번호·VITE_DEV\_\* 문자열 grep → 0건 확인 |
| 테스트 계정 | E2E 테스트로 만든 계정·문서는 테스트 종료 시 삭제 |

---

## 13. PWA · 설치 규격

```html
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" href="/icons/desktop/icon-32.png" type="image/png" sizes="32x32" />
<link rel="apple-touch-icon" href="/icons/mobile/apple-touch-icon.png" sizes="180x180" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="{ShortName}" />
<meta name="theme-color" content="{#hex}" />
```

```json
{
  "id": "/", "start_url": "/", "scope": "/",
  "display": "fullscreen", "display_override": ["fullscreen", "standalone"], "orientation": "any",
  "icons": [
    { "src": "/icons/desktop/icon-192.png", "sizes": "192x192", "purpose": "any" },
    { "src": "/icons/desktop/icon-512.png", "sizes": "512x512", "purpose": "any" },
    { "src": "/icons/mobile/maskable-192.png", "sizes": "192x192", "purpose": "maskable" },
    { "src": "/icons/mobile/maskable-512.png", "sizes": "512x512", "purpose": "maskable" }
  ]
}
```
* 🟨 purpose: any = 데스크톱 타일 아이콘, maskable = 모바일(안드로이드) 아이콘, iOS = apple-touch-icon.
* 🟨 sw.js는 설치 가능 조건용 최소 서비스 워커(캐시 없음) + Cache-Control: no-cache. 운영 빌드에서만 등록.
* 🟨 검증: Chrome Page.getInstallabilityErrors = 빈 배열. ✅

---

## 14. 🟨 배포 규격 (기본: GitHub → Vercel)

### 14.1 vercel.json

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/((?!assets/|.*\\.[a-zA-Z0-9]+$).*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/sw.js", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```
* ⚠️ public/assets/의 파일은 해시 이름이 아니다. immutable 캐시를 쓰려면 **URL 버전 쿼리(?v=)를 반드시 붙이거나**, 교체 가능성이 있는 파일은 짧은 캐시를 쓴다. (매니페스트는 no-store + ?t=로 조회)

### 14.2 환경 변수 등록표 (Production + Preview)

| 키 | 값 출처 | 배포 등록 |
| --- | --- | --- |
| VITE_FIREBASE_API_KEY … VITE_FIREBASE_MEASUREMENT_ID (7개) | Firebase 콘솔 웹 앱 설정 | ✅ |
| VITE_PHONE_ALIAS_DOMAIN | 예: phone.{game}.test | ✅ |
| VITE_ADMIN_IDS | 관리자 이메일, 휴대폰 별칭 (쉼표 구분) | ✅ |
| VITE_DEV_ADMIN_ACCOUNTS | 개발용 비밀번호 포함 | ❌ **절대 등록 금지** |

* CLI 예: vercel env add KEY production --value "…" --no-sensitive --yes
* 🟨 Google 로그인을 쓰면 배포 도메인({project}.vercel.app)을 **Firebase Auth 승인 도메인**에 추가.
* 🟨 Vercel 프로젝트를 GitHub 저장소에 연결 → main 푸시 시 자동 운영 배포.
* 🟨 Firebase 규칙·TTL 인덱스 배포: firebase deploy --only firestore:rules,firestore:indexes,storage.

### 14.3 운영 유지

* Vercel(정적 호스팅) + Firebase(서버리스) = 개발 PC와 무관하게 상시 운영.
* 무료 한도(읽기/쓰기/대역폭) 모니터링, 게스트 TTL로 저장량 자동 관리.

---

## 15. 🟨 QA · 검증 규격

### 15.1 명령 세트

| 명령 | 통과 기준 |
| --- | --- |
| npx tsc --noEmit | 오류 0 |
| npm test (Vitest) | 전부 통과 (게임 모델 결정론 테스트 포함) |
| npm run i18n:check | i18n OK |
| npm run assets:check | 필수 에셋 누락 0 (선택 에셋은 표로 보고) |
| npm run build | 성공 + dist/assets/manifest.json 존재 + 비밀 문자열 0건 |

### 15.2 3기기 자동 화면 감사 (헤드리스 Chrome, CDP)

| 기기 프로필 | 뷰포트 | 에뮬레이션 |
| --- | --- | --- |
| mobile-portrait | 390×844, DPR 2 | mobile + touch |
| mobile-landscape | 844×390, DPR 2 | mobile + touch |
| desktop | 1280×720 / 1440×900 | mouse |

검사 항목 (모든 화면: intro, title, login, signup, lobby, stage select, play, result, my page, menu):

- [ ] 보이는 버튼·알약·패널의 사각형 **상호 겹침 0건**
- [ ] 터치 대상 ≥ 44px(모바일), 글자 ≥ 12px
- [ ] 화면 밖으로 잘린 요소 0건
- [ ] 페이지 오류(Runtime.exceptionThrown) 0건
- [ ] 홈 버튼 → 첫 화면, 로그아웃 → 첫 화면
- [ ] **게임 중 회전**(세로↔가로) → 화면 유지 + 0.2초 내 레이아웃 전환
- [ ] 플레이 영역 면적 비율 측정·보고 (§6.3)
- [ ] 3개 언어로 동일 감사 반복 (잘림·겹침)
- [ ] 손잡이 좌/우 전환 시 방향키 위치 확인

> 팁: 개발 서버 HMR 때문에 테스트 코드에서 import('/src/…')가 다른 모듈 인스턴스를 받을 수 있다 → performance.getEntriesByType('resource')에서 실제 로드된 URL(?t=)을 찾아 import한다.

### 15.3 계정·DB E2E (실제 백엔드, 테스트 후 정리)

- [ ] 이메일 가입 → 로비 → 프로필 저장 확인 → 비밀번호 변경 → 로그아웃 → 이전 비밀번호 거부 → 새 비밀번호 로그인
- [ ] 휴대폰 가입(+82, 하이픈/공백) → 선행 0 포함 번호로 로그인
- [ ] 게스트 별명 사용 중 중복 거부(별도 브라우저 컨텍스트) → 로그아웃 후 재사용 가능 → 익명 계정 삭제 → expireAt 존재
- [ ] 사용자 설정(손잡이) 변경 → 다른 기기 가정(로컬 삭제) 재로그인 시 복원
- [ ] DB CRUD + 타인/비로그인 접근 403, Storage 업로드/다운로드/삭제 + 타인 차단

### 15.4 운영 배포 스모크 테스트

- [ ] 운영 URL 200, 매니페스트 200(파일 수 확인), 이미지 렌더
- [ ] 모바일 세로 에뮬레이션으로 게스트 시작·가입·로그아웃
- [ ] 게스트에게 관리자 UI 미표시
- [ ] PWA 설치 가능 오류 0

---

## 16. 관리자 · 디버그 도구

| 도구 | 접근 | 기능 |
| --- | --- | --- |
| Pause / Go | 시스템 바 (관리자만) | 게임·영상·오디오 전체 정지, 정지 배지 |
| Admin Page | 메뉴 (관리자만) | 난이도 배율 등 Admin Tuning (테스트 포함) |
| 레이아웃 강제 전환 | 메뉴 (관리자만) | 자동/데스크톱/모바일 가로/모바일 세로 + 기기 프레임 미리보기 |
| FPS 표시 | 메뉴 (관리자만) | 성능 확인 |
| 치트 콘솔 | ~ 키 (관리자만) | 재화 추가, 웨이브 스킵, 스테이지 클리어 등 |
| 전체 스테이지 열기 | 메뉴 (관리자만) | 진행 잠금 해제 |

---

## 17. ⚠️ Toyville 교훈 → Form 2.1 표준화 요약

| 실제 문제 | 원인 | 표준화된 해결 |
| --- | --- | --- |
| 기획 스택(Three.js)이 불필요 | 기획 단계 스택 고정 | §1 Phase 0 재검토 의무 + ADR |
| 세로 화면 메뉴 겹침 | 바 높이 추정값 사용 | 실측 --sys-h + 세로 2줄 바 |
| 기기별 수치 분산 | CSS 곳곳에 하드코딩 | HUD Profile 단일 출처 |
| 오른손잡이인데 방향키가 왼쪽 | 용어 정의 부재 | "오른손잡이 = 방향키 오른쪽" 명시 + 사용자별 클라우드 저장 |
| 시작 버튼 50% 축소 시 터치 불편 | 축소 요구와 최소 크기 충돌 | 터치 44px 하한 우선 |
| 배포본 그림이 플레이스홀더로 나올 뻔함 | 매니페스트가 dev 전용·gitignore | 빌드 시 매니페스트 생성 |
| 다시 로그인하면 설정이 사라짐 | 설정 범위 미정의 | 기기/세션/사용자 범위 분류표 |
| README에 관리자 비밀번호 | 문서에 자격 증명 기록 | 비밀 정보는 .env.local만, 첫 푸시 전 검사 |
| 게스트 데이터 무한 누적 | 삭제 정책 없음 | 별명 선점 + 로그아웃 시 삭제 + 100일 TTL |
| 확인 창 동안 게임 진행 | 일시정지 미연동 | 사유별 Pause, 확인 창 = menu 사유 |
| 회전 직후 오조작 | 레이아웃 전환 중 입력 | 200ms 입력 잠금 |
| 테스트 import가 상태를 못 읽음 | Vite HMR 모듈 URL | 실제 로드 URL로 import |

---

## 18. 개발 단계 (Phase Plan)

| Phase | 내용 | 산출물 |
| --- | --- | --- |
| 0 | 기획 검토 + **스택 재검토(ADR)** + 저장소·환경 변수·백엔드 프로젝트 생성 | docs/ADR.md, .env.example |
| 1 | 앱 셸: 레이어, EventBus, Settings/SessionPrefs/Pause, LayoutManager+HudProfile, i18n, AudioManager, Router, SystemOverlay | 빈 화면 3기기 전환 동작 |
| 2 | 게임 모델(순수 로직) + 단위 테스트 + 데이터 JSON | \*Model.ts, \*.test.ts |
| 3 | 엔진 씬 + GridMapper + 플레이 화면 그리드(3기기·손잡이) | 플레이스홀더로 1스테이지 완주 |
| 4 | 전체 화면 흐름, 컷씬, 결과, 로비, 수집 요소 | 처음~엔딩 완주 |
| 5 | 계정(게스트/이메일/휴대폰/Google), 저장·병합, 마이페이지, 규칙·TTL 배포 | E2E 통과 |
| 6 | 에셋 파이프라인 + 실제 에셋 투입 + 오디오 생성/교체 + 아이콘 | 에셋 반영 |
| 7 | 3기기 × 3언어 화면 감사, 디자인 재정비, 플레이 영역 면적 최적화 | 감사 보고 |
| 8 | 보안 검사, 빌드, GitHub 푸시, Vercel 배포, 환경 변수·승인 도메인, 운영 스모크 테스트 | 운영 URL |

---

## 19. [복사해서 쓰는] AI 에이전트 실행 프롬프트 (Production Blueprint Directive)

```text
[AI Agent Production Blueprint — Form 2.1]
당신은 '{게임명 영문}' ({game-id}) 웹 미니게임의 주도 개발 에이전트입니다.
기획 문서 01~05와 본 Form 2.1을 따릅니다.

[Phase 0 — 필수]
- 엔진 프로그램, 사이트/앱 개발 프로그램(Vite/React/Flutter/Capacitor 등), DB 프로그램(Firebase/Supabase 등),
  호스팅을 이 게임 요구사항으로 재검토하여 선택 또는 변경하고 docs/ADR.md와 보고서로 제출한 뒤 착수하십시오.
  기본 추천값(Vite+TS, Phaser 3, Firebase, Vercel)은 강제가 아닙니다. 개발 중 변경이 필요하면 이유와 영향을 보고 후 실행하십시오.

[구현 필수]
1. 레이어 구조(#game-root 캔버스 + DOM 화면/컷씬/모달/토스트/시스템 바), 타입 이벤트 버스, 사유별 Pause.
2. LayoutManager(desktop/mobile-landscape/mobile-portrait, 150ms 디바운스, 200ms 입력 잠금, 게임 중 회전 무손실)
   + HUD Profile 단일 출처 + 실측 --sys-h + html[data-layout]/[data-hand] CSS.
3. 플레이 영역: 캔버스 전체 화면, 보드는 playRect에 최대 정수 타일, 세로 전치(GridMapper), 패널 오버레이,
   목표 면적(desktop .65 / landscape .55 / portrait .50) 측정.
4. 오른손잡이 기본 = 방향키 오른쪽, 사용자별 클라우드 저장.
5. i18n: ko 기준 타입 사전, en/ja 동일 키, data-i18n/-params/-attr, 즉시 전환, 캔버스 텍스트 재그리기, 오류 코드 매핑, i18n:check.
6. 오디오: master→bgm/sfx/ui 버스, 기본 OFF·세션 유지, 제스처 unlock, 파일 우선·신스 대체, 루프 표, 45ms 연타 제한,
   ScreenContext.music, 영상 registerMedia, 덕킹.
7. 에셋: raw_assets 자동 변환, manifest(dev + build closeBundle), 플레이스홀더 완주, 아이콘 빌드, PWA.
8. 계정: 게스트(별명 트랜잭션, 로그아웃 삭제, 100일 TTL), 이메일, 휴대폰번호(국가번호, SMS 없음), Google,
   가입 즉시 로그인, 마이페이지(마스킹+변경), 홈 버튼(게임 중 확인+일시정지), 보안 규칙·TTL 배포.
9. 보안: 비밀 정보 .env.local만, VITE_DEV_* 배포 금지, 관리자 UI는 VITE_ADMIN_IDS 일치 시만, 번들 grep 검사.
10. QA: tsc, Vitest, i18n:check, build, CDP 3기기×3언어 감사(겹침·크기·오류·회전·면적), 실제 백엔드 E2E(정리 포함),
    운영 스모크 테스트. 결과를 표로 보고하십시오.
11. 100% English Code Base. 사용자 보고는 사용자의 언어로 작성하십시오.
```
