# Implementation Report — Real Court Tennis (web3d)

## Verification

| Check | Result |
| --- | --- |
| npm run build (tsc strict + vite) | OK — JS 670 kB (gzip 179 kB) |
| npm test | 24 / 24 passed |
| npm run i18n:check | 149 keys × 3 languages |
| npm run e2e | Desktop / Mobile Landscape / Mobile Portrait, Console Error 0 |
| npm run sim -- 200 | docs/reports/balance.md |

## Implemented Scope (07 기준)

- **Phase 1 Core Model**: Analytic Ball Flight (Net / Bounce / Spin Gravity), 900-sample Predictor, Racket-Face Hit Judge (25% Fault Ring, 3×3 Zone), Target-solved Shot Planner, Auto Positioning, Release-to-Swing, Serve (Toss Timing, 2 Attempts), Point / Match Rule, Score Formula.
- **Phase 2 AI**: NPC Brain (Reach Check, Return Roll, Error Shot, Target Style, Smash), Stage 1–10 + Free Mode L1–L5.
- **Phase 3 View**: Telephoto Camera (Fly-in / Follow / Orbit / Replay), Toon Material + Outline, Procedural Mannequin, Ball Trail / Shadow / Landing Marker / Timing Ring, Spark, Crowd, Day / Night / Indoor Theme.
- **Phase 4 UX**: Intro → Title → Login / Signup → Match Setup → Match → Score, System Bar, How to Play, My Page, Pause (Menu / Hidden / Rotation) + 3-2-1 Countdown, Hit-stop, Winner Replay, ko / en / ja, Left / Right Hand Layout.
- **Phase 5 Backend**: MockBackend + FirebaseBackend (Auth + Firestore, Lazy Chunk), firestore.rules, firestore.indexes.json (Ranking Index, Guest TTL) — ADR-002.
- **Assets**: 08_AI Prompt Master Set.md + public/assets/ Slot 연결 (Intro / Title / Character Portrait / Stage Tile / Stage Intro·Clear·Fail Video).

## Balance Summary (200 matches / cell)

| Bot | S1 | S5 | S9 | S10 |
| --- | --- | --- | --- | --- |
| Skilled (40 ms) | 100% | 97% | 85% | 72% |
| Average (70 ms) | 95% | 85% | 51% | 39% |

Stage 9–10이 숙련 Player에게도 도전적인 곡선을 형성합니다 (상세: balance.md).

## Known Gaps

- 실제 Character Model / Intro Video / Audio Asset 미투입 (Q03) — Placeholder로 완전 동작.
- Firebase Project / OAuth Provider 미설정 (Q01, Q02) — MockBackend로 동작.
- Headless e2e의 Serve는 swiftshader Frame 지연으로 Sim Time이 Wall Time보다 느려 Miss 판정됨 (실기기 영향 없음).
- Capacitor Native Packaging은 후속 Phase.
