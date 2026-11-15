# 🎬 09. Flow Prompt Full Set for each object — Real Court Tennis

> 08_AI Prompt Master Set.md의 모든 Prompt를 **Object 하나당 완성된 Prompt 1개**로 펼친 복붙 전용 모음집이다. 공통 Style, Character 설명, View, Action, Tempo, Negative가 각 Prompt 안에 모두 들어 있으므로 **Code Block 하나를 그대로 Google Flow Prompt 창에 붙여넣으면** 된다.
> 이 문서는 npm run prompts (tools/prompts/build-flow-prompts.ts)로 자동 생성된다. 문구를 바꾸려면 Script의 표를 고친 뒤 다시 생성한다.

---

## 0. Google Flow 작업 규칙

| 항목 | 설정 |
| --- | --- |
| Image Model | Flow 기본 Image Model (Nano Banana Pro). Character가 나오는 Image는 **Reference Image로 해당 Character의 Turnaround(I-01~03)** 를 첨부 |
| Video Model | **Veo 3.1 (Quality 권장, Fast 가능)** |
| Video 길이 | **4 s** (Frames to Video는 4 / 6 / 8 s 지원). Intro만 **6 s** |
| Aspect Ratio | 기본 **16:9 Landscape**. Portrait 표시가 있는 항목만 9:16 |
| Motion Video 모드 | **Video Frames (Frames to Video)** — + Add start frame에 Pose Start Frame(I-04~09). **End Frame 표시가 있는 Clip은 같은 이미지를 + Add end frame에도** 넣는다 → Loop가 끊김 없이 이어지고 Swing 후 Ready 자세로 정확히 복귀. **Backhand 계열(bh_*, reach_bh)은 Start Frame = Key Pose(_bh_key / _slice_key), End Frame = _start.jpg** (Ready 자세에서 시작하면 Video Model이 Forehand로 바꿔버림) |
| Stage Video 모드 | Video Frames — Start Frame = 해당 Stage Key Art |
| Negative | Flow에는 별도 Negative 칸이 없으므로 각 Prompt 끝의 Avoid: 문장으로 포함되어 있다 |
| 출력 수 | 동작 Video는 **2–4개 생성 후 Timing·Key 품질이 가장 좋은 것**을 고른다 |
| Audio | Motion Video의 Audio는 게임에서 쓰지 않는다(무시해도 됨) |

### 0.1 생성 순서

1. **I-01 ~ I-03** Character Turnaround (모든 Character 작업의 Reference)
2. **I-04 ~ I-09** Pose Start Frame (Character × Back / Front)
2-1. **I-10 ~ I-21** Backhand / Slice Key Pose (Backhand Motion의 Start Frame — 라켓이 Backhand 쪽에 있는지 꼭 확인)
3. **M-xxx Tier 1** Motion (Character마다 Back 10개 → Front 10개, A/B안 포함)
4. Title / Portrait / Stage Key Art (I-22 이후)
5. Intro / Stage Video (V-xx)
6. Tier 2 · Extra Motion, 추가 Image

### 0.2 받은 파일 처리 (11/10 updated)

Flow에서 받은 원본(jpg / png / mp4)은 **각 항목의 넣을 곳 이름으로 바꿔서 Inbox 폴더(raw_assets/images_src/)에만** 넣는다. public/assets/에는 직접 넣지 않는다.

| Inbox 하위 폴더 | 넣는 것 | 변환 결과 |
| --- | --- | --- |
| images/{title, stages, characters, concept, ui, howto, vfx, crowd}/ | 게임 Image (jpg / png) | public/assets/images/…/\*.webp (가로 최대 1920 px 등, tools/assets/assets.config.json) |
| icons/ | App Icon | public/assets/icons/\*.png (1024×1024 중앙 Crop) |
| video/{intro, stages, crowd}/ | 연출 Video (mp4) | public/assets/video/…/\*.mp4 (H.264, Web 재생 최적화, 이름 끝 \_4s / \_6s 길이로 자동 Trim) |
| motion/{char_0N}/{back, front}/ | Motion Video (mp4) + \_start.jpg | public/assets/motion/… Sprite Atlas (npm run motion 자동 실행) |
| references/ | Turnaround 등 Flow Reference 전용 | 변환 안 함 (게임 미사용) |

```powershell
npm run images                 # 새로 넣거나 바뀐 파일만 변환 + 바뀐 Motion Set 재빌드
npm run images -- --missing    # 아직 안 넣은 파일 목록까지 출력
npm run images -- --force      # 전부 다시 변환
npm run motion -- --preview    # Motion Timing 확인용 Contact Sheet (raw_assets/_preview/motion)
npm run motion:audit -- char_01/back --grid   # Clip별 동작 구간 측정 + 0.1 s 검토 Grid (raw_assets/_preview/motion_audit)
npm run motion:audit -- --write               # 검토 결과를 motion.config.json overrides에 반영
```

---

## 목차 · 진행 Checklist

| ✓ | ID | Object | 저장 위치 |
| --- | --- | --- | --- |
| ☐ | I-01 | David (데이비드) Turnaround Sheet | raw_assets/images_src/references/char_01_turnaround.jpg |
| ☐ | I-02 | Susan (수잔) Turnaround Sheet | raw_assets/images_src/references/char_02_turnaround.jpg |
| ☐ | I-03 | Wolfson (울프슨) Turnaround Sheet | raw_assets/images_src/references/char_03_turnaround.jpg |
| ☐ | I-04 | David Pose Start Frame — Back (Player용) | raw_assets/images_src/motion/char_01/back/\_start.jpg |
| ☐ | I-05 | David Pose Start Frame — Front (NPC용) | raw_assets/images_src/motion/char_01/front/\_start.jpg |
| ☐ | I-06 | Susan Pose Start Frame — Back (Player용) | raw_assets/images_src/motion/char_02/back/\_start.jpg |
| ☐ | I-07 | Susan Pose Start Frame — Front (NPC용) | raw_assets/images_src/motion/char_02/front/\_start.jpg |
| ☐ | I-08 | Wolfson Pose Start Frame — Back (Player용) | raw_assets/images_src/motion/char_03/back/\_start.jpg |
| ☐ | I-09 | Wolfson Pose Start Frame — Front (NPC용) | raw_assets/images_src/motion/char_03/front/\_start.jpg |
| ☐ | I-10 | David Backhand Key Pose — Back (Player용) | raw_assets/images_src/motion/char_01/back/\_bh_key.jpg |
| ☐ | I-11 | David Slice Key Pose — Back (Player용) | raw_assets/images_src/motion/char_01/back/\_slice_key.jpg |
| ☐ | I-12 | David Backhand Key Pose — Front (NPC용) | raw_assets/images_src/motion/char_01/front/\_bh_key.jpg |
| ☐ | I-13 | David Slice Key Pose — Front (NPC용) | raw_assets/images_src/motion/char_01/front/\_slice_key.jpg |
| ☐ | I-14 | Susan Backhand Key Pose — Back (Player용) | raw_assets/images_src/motion/char_02/back/\_bh_key.jpg |
| ☐ | I-15 | Susan Slice Key Pose — Back (Player용) | raw_assets/images_src/motion/char_02/back/\_slice_key.jpg |
| ☐ | I-16 | Susan Backhand Key Pose — Front (NPC용) | raw_assets/images_src/motion/char_02/front/\_bh_key.jpg |
| ☐ | I-17 | Susan Slice Key Pose — Front (NPC용) | raw_assets/images_src/motion/char_02/front/\_slice_key.jpg |
| ☐ | I-18 | Wolfson Backhand Key Pose — Back (Player용) | raw_assets/images_src/motion/char_03/back/\_bh_key.jpg |
| ☐ | I-19 | Wolfson Slice Key Pose — Back (Player용) | raw_assets/images_src/motion/char_03/back/\_slice_key.jpg |
| ☐ | I-20 | Wolfson Backhand Key Pose — Front (NPC용) | raw_assets/images_src/motion/char_03/front/\_bh_key.jpg |
| ☐ | I-21 | Wolfson Slice Key Pose — Front (NPC용) | raw_assets/images_src/motion/char_03/front/\_slice_key.jpg |
| ☐ | I-22 | David Setup Card Portrait | raw_assets/images_src/images/characters/char_01_portrait.jpg |
| ☐ | I-23 | Susan Setup Card Portrait | raw_assets/images_src/images/characters/char_02_portrait.jpg |
| ☐ | I-24 | Wolfson Setup Card Portrait | raw_assets/images_src/images/characters/char_03_portrait.jpg |
| ☐ | I-25 | Title Key Visual — Landscape | raw_assets/images_src/images/title/title_key_visual_landscape.jpg |
| ☐ | I-26 | Title Key Visual — Portrait | raw_assets/images_src/images/title/title_key_visual_portrait.jpg |
| ☐ | I-27 | Stage 1 Key Art (day) | raw_assets/images_src/images/stages/stage_01_key.jpg |
| ☐ | I-28 | Stage 2 Key Art (day) | raw_assets/images_src/images/stages/stage_02_key.jpg |
| ☐ | I-29 | Stage 3 Key Art (day) | raw_assets/images_src/images/stages/stage_03_key.jpg |
| ☐ | I-30 | Stage 4 Key Art (sunset) | raw_assets/images_src/images/stages/stage_04_key.jpg |
| ☐ | I-31 | Stage 5 Key Art (sunset) | raw_assets/images_src/images/stages/stage_05_key.jpg |
| ☐ | I-32 | Stage 6 Key Art (indoor) | raw_assets/images_src/images/stages/stage_06_key.jpg |
| ☐ | I-33 | Stage 7 Key Art (indoor) | raw_assets/images_src/images/stages/stage_07_key.jpg |
| ☐ | I-34 | Stage 8 Key Art (night) | raw_assets/images_src/images/stages/stage_08_key.jpg |
| ☐ | I-35 | Stage 9 Key Art (night) | raw_assets/images_src/images/stages/stage_09_key.jpg |
| ☐ | I-36 | Stage 10 Key Art (night) | raw_assets/images_src/images/stages/stage_10_key.jpg |
| ☐ | I-37 | David Gameplay Back View (Store / 홍보) | raw_assets/images_src/images/concept/char_01_gameplay_day.jpg |
| ☐ | I-38 | Susan Gameplay Back View (Store / 홍보) | raw_assets/images_src/images/concept/char_02_gameplay_sunset.jpg |
| ☐ | I-39 | Wolfson Gameplay Back View (Store / 홍보) | raw_assets/images_src/images/concept/char_03_gameplay_night.jpg |
| ☐ | I-40 | David Victory Still | raw_assets/images_src/images/characters/char_01_victory.jpg |
| ☐ | I-41 | David Defeat Still | raw_assets/images_src/images/characters/char_01_defeat.jpg |
| ☐ | I-42 | Susan Victory Still | raw_assets/images_src/images/characters/char_02_victory.jpg |
| ☐ | I-43 | Susan Defeat Still | raw_assets/images_src/images/characters/char_02_defeat.jpg |
| ☐ | I-44 | Wolfson Victory Still | raw_assets/images_src/images/characters/char_03_victory.jpg |
| ☐ | I-45 | Wolfson Defeat Still | raw_assets/images_src/images/characters/char_03_defeat.jpg |
| ☐ | I-46 | App Icon | raw_assets/images_src/icons/app_icon_1024.jpg |
| ☐ | I-47 | Share Image (Open Graph) | raw_assets/images_src/images/ui/og_share_1200x630.jpg |
| ☐ | I-48 | Splash — Portrait | raw_assets/images_src/images/ui/splash_portrait.jpg |
| ☐ | I-49 | Menu Background — Landscape | raw_assets/images_src/images/ui/bg_menu_landscape.jpg |
| ☐ | I-50 | Menu Background — Portrait | raw_assets/images_src/images/ui/bg_menu_portrait.jpg |
| ☐ | I-51 | Score Background — Win | raw_assets/images_src/images/ui/bg_score_win.jpg |
| ☐ | I-52 | Score Background — Lose | raw_assets/images_src/images/ui/bg_score_lose.jpg |
| ☐ | I-53 | How to Play 1 — 이동 | raw_assets/images_src/images/howto/howto_01.jpg |
| ☐ | I-54 | How to Play 2 — 스트로크 선택 | raw_assets/images_src/images/howto/howto_02.jpg |
| ☐ | I-55 | How to Play 3 — 떼는 순간 스윙 | raw_assets/images_src/images/howto/howto_03.jpg |
| ☐ | I-56 | How to Play 4 — 서브 | raw_assets/images_src/images/howto/howto_04.jpg |
| ☐ | I-57 | VFX — Perfect Hit Flash | raw_assets/images_src/images/vfx/fx_hit_perfect.jpg |
| ☐ | I-58 | VFX — Great Hit Ring | raw_assets/images_src/images/vfx/fx_hit_great.jpg |
| ☐ | I-59 | VFX — Bounce Dust | raw_assets/images_src/images/vfx/fx_bounce_dust.jpg |
| ☐ | I-60 | VFX — Confetti Burst | raw_assets/images_src/images/vfx/fx_confetti.jpg |
| ☐ | I-61 | VFX — Net Hit Ripple | raw_assets/images_src/images/vfx/fx_net_shake.jpg |
| ☐ | I-62 | Crowd Sprite Sheet — day | raw_assets/images_src/images/crowd/crowd_day.jpg |
| ☐ | I-63 | Crowd Sprite Sheet — sunset | raw_assets/images_src/images/crowd/crowd_sunset.jpg |
| ☐ | I-64 | Crowd Sprite Sheet — indoor | raw_assets/images_src/images/crowd/crowd_indoor.jpg |
| ☐ | I-65 | Crowd Sprite Sheet — night | raw_assets/images_src/images/crowd/crowd_night.jpg |
| ☐ | V-01 | Intro 6 s | raw_assets/images_src/video/intro/intro_6s.mp4 |
| ☐ | V-02 | Stage 1 Intro 4 s | raw_assets/images_src/video/stages/stage_01_intro_4s.mp4 |
| ☐ | V-03 | Stage 2 Intro 4 s | raw_assets/images_src/video/stages/stage_02_intro_4s.mp4 |
| ☐ | V-04 | Stage 3 Intro 4 s | raw_assets/images_src/video/stages/stage_03_intro_4s.mp4 |
| ☐ | V-05 | Stage 4 Intro 4 s | raw_assets/images_src/video/stages/stage_04_intro_4s.mp4 |
| ☐ | V-06 | Stage 5 Intro 4 s | raw_assets/images_src/video/stages/stage_05_intro_4s.mp4 |
| ☐ | V-07 | Stage 6 Intro 4 s | raw_assets/images_src/video/stages/stage_06_intro_4s.mp4 |
| ☐ | V-08 | Stage 7 Intro 4 s | raw_assets/images_src/video/stages/stage_07_intro_4s.mp4 |
| ☐ | V-09 | Stage 8 Intro 4 s | raw_assets/images_src/video/stages/stage_08_intro_4s.mp4 |
| ☐ | V-10 | Stage 9 Intro 4 s | raw_assets/images_src/video/stages/stage_09_intro_4s.mp4 |
| ☐ | V-11 | Stage 10 Intro 4 s | raw_assets/images_src/video/stages/stage_10_intro_4s.mp4 |
| ☐ | V-12 | Stage 1 Clear 4 s | raw_assets/images_src/video/stages/stage_01_clear_4s.mp4 |
| ☐ | V-13 | Stage 1 Fail 4 s | raw_assets/images_src/video/stages/stage_01_fail_4s.mp4 |
| ☐ | V-14 | Stage 2 Clear 4 s | raw_assets/images_src/video/stages/stage_02_clear_4s.mp4 |
| ☐ | V-15 | Stage 2 Fail 4 s | raw_assets/images_src/video/stages/stage_02_fail_4s.mp4 |
| ☐ | V-16 | Stage 3 Clear 4 s | raw_assets/images_src/video/stages/stage_03_clear_4s.mp4 |
| ☐ | V-17 | Stage 3 Fail 4 s | raw_assets/images_src/video/stages/stage_03_fail_4s.mp4 |
| ☐ | V-18 | Stage 4 Clear 4 s | raw_assets/images_src/video/stages/stage_04_clear_4s.mp4 |
| ☐ | V-19 | Stage 4 Fail 4 s | raw_assets/images_src/video/stages/stage_04_fail_4s.mp4 |
| ☐ | V-20 | Stage 5 Clear 4 s | raw_assets/images_src/video/stages/stage_05_clear_4s.mp4 |
| ☐ | V-21 | Stage 5 Fail 4 s | raw_assets/images_src/video/stages/stage_05_fail_4s.mp4 |
| ☐ | V-22 | Stage 6 Clear 4 s | raw_assets/images_src/video/stages/stage_06_clear_4s.mp4 |
| ☐ | V-23 | Stage 6 Fail 4 s | raw_assets/images_src/video/stages/stage_06_fail_4s.mp4 |
| ☐ | V-24 | Stage 7 Clear 4 s | raw_assets/images_src/video/stages/stage_07_clear_4s.mp4 |
| ☐ | V-25 | Stage 7 Fail 4 s | raw_assets/images_src/video/stages/stage_07_fail_4s.mp4 |
| ☐ | V-26 | Stage 8 Clear 4 s | raw_assets/images_src/video/stages/stage_08_clear_4s.mp4 |
| ☐ | V-27 | Stage 8 Fail 4 s | raw_assets/images_src/video/stages/stage_08_fail_4s.mp4 |
| ☐ | V-28 | Stage 9 Clear 4 s | raw_assets/images_src/video/stages/stage_09_clear_4s.mp4 |
| ☐ | V-29 | Stage 9 Fail 4 s | raw_assets/images_src/video/stages/stage_09_fail_4s.mp4 |
| ☐ | V-30 | Stage 10 Clear 4 s | raw_assets/images_src/video/stages/stage_10_clear_4s.mp4 |
| ☐ | V-31 | Stage 10 Fail 4 s | raw_assets/images_src/video/stages/stage_10_fail_4s.mp4 |
| ☐ | V-32 | Crowd Cheer Loop (선택) | raw_assets/images_src/video/crowd/crowd_cheer_loop.mp4 |
| ☐ | M-001 | David · back · idle — Ready 대기 | raw_assets/images_src/motion/char_01/back/idle.mp4 |
| ☐ | M-002 | David · back · run_left — 화면 왼쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_01/back/run_left.mp4 |
| ☐ | M-003 | David · back · run_right — 화면 오른쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_01/back/run_right.mp4 |
| ☐ | M-004 | David · back · fh_mid — Forehand 허리 높이 | raw_assets/images_src/motion/char_01/back/fh_mid.mp4 |
| ☐ | M-005 | David · back · bh_mid — Backhand 허리 높이 (11/10 updated) | raw_assets/images_src/motion/char_01/back/bh_mid.mp4 |
| ☐ | M-006 | David · back · serve — Toss → Serve | raw_assets/images_src/motion/char_01/back/serve.mp4 |
| ☐ | M-007 | David · back · victory — Match 승리 (A안) | raw_assets/images_src/motion/char_01/back/victory.mp4 |
| ☐ | M-008 | David · back · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장) | raw_assets/images_src/motion/char_01/back/victory.mp4 |
| ☐ | M-009 | David · back · defeat — Match 패배 (A안) | raw_assets/images_src/motion/char_01/back/defeat.mp4 |
| ☐ | M-010 | David · back · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장) | raw_assets/images_src/motion/char_01/back/defeat.mp4 |
| ☐ | M-011 | David · back · fh_high — Forehand 어깨 높이 / Smash 대체 | raw_assets/images_src/motion/char_01/back/fh_high.mp4 |
| ☐ | M-012 | David · back · fh_low — Forehand 무릎 높이 | raw_assets/images_src/motion/char_01/back/fh_low.mp4 |
| ☐ | M-013 | David · back · bh_high — Backhand 어깨 높이 (11/10 updated) | raw_assets/images_src/motion/char_01/back/bh_high.mp4 |
| ☐ | M-014 | David · back · bh_low — Backhand 무릎 높이 (11/10 updated) | raw_assets/images_src/motion/char_01/back/bh_low.mp4 |
| ☐ | M-015 | David · back · serve_ready — Serve 대기 | raw_assets/images_src/motion/char_01/back/serve_ready.mp4 |
| ☐ | M-016 | David · back · split — Split Step | raw_assets/images_src/motion/char_01/back/split.mp4 |
| ☐ | M-017 | David · back · point_win — 득점 반응 | raw_assets/images_src/motion/char_01/back/point_win.mp4 |
| ☐ | M-018 | David · back · point_lose — 실점 반응 | raw_assets/images_src/motion/char_01/back/point_lose.mp4 |
| ☐ | M-019 | David · back · smash — Smash | raw_assets/images_src/motion/char_01/back/smash.mp4 |
| ☐ | M-020 | David · back · reach_fh — 먼 공 Forehand (Extended Reach) | raw_assets/images_src/motion/char_01/back/reach_fh.mp4 |
| ☐ | M-021 | David · back · reach_bh — 먼 공 Backhand (Slice Reach) (11/10 updated) | raw_assets/images_src/motion/char_01/back/reach_bh.mp4 |
| ☐ | M-022 | David · back · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated) | raw_assets/images_src/motion/char_01/back/run_forward.mp4 |
| ☐ | M-023 | David · back · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated) | raw_assets/images_src/motion/char_01/back/run_back.mp4 |
| ☐ | M-024 | David · back · walk_in — Match 입장 | raw_assets/images_src/motion/char_01/back/walk_in.mp4 |
| ☐ | M-025 | David · front · idle — Ready 대기 | raw_assets/images_src/motion/char_01/front/idle.mp4 |
| ☐ | M-026 | David · front · run_left — 화면 왼쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_01/front/run_left.mp4 |
| ☐ | M-027 | David · front · run_right — 화면 오른쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_01/front/run_right.mp4 |
| ☐ | M-028 | David · front · fh_mid — Forehand 허리 높이 | raw_assets/images_src/motion/char_01/front/fh_mid.mp4 |
| ☐ | M-029 | David · front · bh_mid — Backhand 허리 높이 | raw_assets/images_src/motion/char_01/front/bh_mid.mp4 |
| ☐ | M-030 | David · front · serve — Toss → Serve | raw_assets/images_src/motion/char_01/front/serve.mp4 |
| ☐ | M-031 | David · front · victory — Match 승리 (A안) | raw_assets/images_src/motion/char_01/front/victory.mp4 |
| ☐ | M-032 | David · front · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장) | raw_assets/images_src/motion/char_01/front/victory.mp4 |
| ☐ | M-033 | David · front · defeat — Match 패배 (A안) | raw_assets/images_src/motion/char_01/front/defeat.mp4 |
| ☐ | M-034 | David · front · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장) | raw_assets/images_src/motion/char_01/front/defeat.mp4 |
| ☐ | M-035 | David · front · fh_high — Forehand 어깨 높이 / Smash 대체 | raw_assets/images_src/motion/char_01/front/fh_high.mp4 |
| ☐ | M-036 | David · front · fh_low — Forehand 무릎 높이 | raw_assets/images_src/motion/char_01/front/fh_low.mp4 |
| ☐ | M-037 | David · front · bh_high — Backhand 어깨 높이 | raw_assets/images_src/motion/char_01/front/bh_high.mp4 |
| ☐ | M-038 | David · front · bh_low — Backhand 무릎 높이 | raw_assets/images_src/motion/char_01/front/bh_low.mp4 |
| ☐ | M-039 | David · front · serve_ready — Serve 대기 | raw_assets/images_src/motion/char_01/front/serve_ready.mp4 |
| ☐ | M-040 | David · front · split — Split Step | raw_assets/images_src/motion/char_01/front/split.mp4 |
| ☐ | M-041 | David · front · point_win — 득점 반응 | raw_assets/images_src/motion/char_01/front/point_win.mp4 |
| ☐ | M-042 | David · front · point_lose — 실점 반응 | raw_assets/images_src/motion/char_01/front/point_lose.mp4 |
| ☐ | M-043 | David · front · smash — Smash | raw_assets/images_src/motion/char_01/front/smash.mp4 |
| ☐ | M-044 | David · front · reach_fh — 먼 공 Forehand (Extended Reach) | raw_assets/images_src/motion/char_01/front/reach_fh.mp4 |
| ☐ | M-045 | David · front · reach_bh — 먼 공 Backhand (Slice Reach) | raw_assets/images_src/motion/char_01/front/reach_bh.mp4 |
| ☐ | M-046 | David · front · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated) | raw_assets/images_src/motion/char_01/front/run_forward.mp4 |
| ☐ | M-047 | David · front · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated) | raw_assets/images_src/motion/char_01/front/run_back.mp4 |
| ☐ | M-048 | David · front · walk_in — Match 입장 | raw_assets/images_src/motion/char_01/front/walk_in.mp4 |
| ☐ | M-049 | Susan · back · idle — Ready 대기 | raw_assets/images_src/motion/char_02/back/idle.mp4 |
| ☐ | M-050 | Susan · back · run_left — 화면 왼쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_02/back/run_left.mp4 |
| ☐ | M-051 | Susan · back · run_right — 화면 오른쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_02/back/run_right.mp4 |
| ☐ | M-052 | Susan · back · fh_mid — Forehand 허리 높이 | raw_assets/images_src/motion/char_02/back/fh_mid.mp4 |
| ☐ | M-053 | Susan · back · bh_mid — Backhand 허리 높이 (11/10 updated) | raw_assets/images_src/motion/char_02/back/bh_mid.mp4 |
| ☐ | M-054 | Susan · back · serve — Toss → Serve | raw_assets/images_src/motion/char_02/back/serve.mp4 |
| ☐ | M-055 | Susan · back · victory — Match 승리 (A안) | raw_assets/images_src/motion/char_02/back/victory.mp4 |
| ☐ | M-056 | Susan · back · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장) | raw_assets/images_src/motion/char_02/back/victory.mp4 |
| ☐ | M-057 | Susan · back · defeat — Match 패배 (A안) | raw_assets/images_src/motion/char_02/back/defeat.mp4 |
| ☐ | M-058 | Susan · back · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장) | raw_assets/images_src/motion/char_02/back/defeat.mp4 |
| ☐ | M-059 | Susan · back · fh_high — Forehand 어깨 높이 / Smash 대체 | raw_assets/images_src/motion/char_02/back/fh_high.mp4 |
| ☐ | M-060 | Susan · back · fh_low — Forehand 무릎 높이 | raw_assets/images_src/motion/char_02/back/fh_low.mp4 |
| ☐ | M-061 | Susan · back · bh_high — Backhand 어깨 높이 (11/10 updated) | raw_assets/images_src/motion/char_02/back/bh_high.mp4 |
| ☐ | M-062 | Susan · back · bh_low — Backhand 무릎 높이 (11/10 updated) | raw_assets/images_src/motion/char_02/back/bh_low.mp4 |
| ☐ | M-063 | Susan · back · serve_ready — Serve 대기 | raw_assets/images_src/motion/char_02/back/serve_ready.mp4 |
| ☐ | M-064 | Susan · back · split — Split Step | raw_assets/images_src/motion/char_02/back/split.mp4 |
| ☐ | M-065 | Susan · back · point_win — 득점 반응 | raw_assets/images_src/motion/char_02/back/point_win.mp4 |
| ☐ | M-066 | Susan · back · point_lose — 실점 반응 | raw_assets/images_src/motion/char_02/back/point_lose.mp4 |
| ☐ | M-067 | Susan · back · smash — Smash | raw_assets/images_src/motion/char_02/back/smash.mp4 |
| ☐ | M-068 | Susan · back · reach_fh — 먼 공 Forehand (Extended Reach) | raw_assets/images_src/motion/char_02/back/reach_fh.mp4 |
| ☐ | M-069 | Susan · back · reach_bh — 먼 공 Backhand (Slice Reach) | raw_assets/images_src/motion/char_02/back/reach_bh.mp4 |
| ☐ | M-070 | Susan · back · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated) | raw_assets/images_src/motion/char_02/back/run_forward.mp4 |
| ☐ | M-071 | Susan · back · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated) | raw_assets/images_src/motion/char_02/back/run_back.mp4 |
| ☐ | M-072 | Susan · back · walk_in — Match 입장 | raw_assets/images_src/motion/char_02/back/walk_in.mp4 |
| ☐ | M-073 | Susan · front · idle — Ready 대기 | raw_assets/images_src/motion/char_02/front/idle.mp4 |
| ☐ | M-074 | Susan · front · run_left — 화면 왼쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_02/front/run_left.mp4 |
| ☐ | M-075 | Susan · front · run_right — 화면 오른쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_02/front/run_right.mp4 |
| ☐ | M-076 | Susan · front · fh_mid — Forehand 허리 높이 | raw_assets/images_src/motion/char_02/front/fh_mid.mp4 |
| ☐ | M-077 | Susan · front · bh_mid — Backhand 허리 높이 | raw_assets/images_src/motion/char_02/front/bh_mid.mp4 |
| ☐ | M-078 | Susan · front · serve — Toss → Serve | raw_assets/images_src/motion/char_02/front/serve.mp4 |
| ☐ | M-079 | Susan · front · victory — Match 승리 (A안) | raw_assets/images_src/motion/char_02/front/victory.mp4 |
| ☐ | M-080 | Susan · front · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장) | raw_assets/images_src/motion/char_02/front/victory.mp4 |
| ☐ | M-081 | Susan · front · defeat — Match 패배 (A안) | raw_assets/images_src/motion/char_02/front/defeat.mp4 |
| ☐ | M-082 | Susan · front · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장) | raw_assets/images_src/motion/char_02/front/defeat.mp4 |
| ☐ | M-083 | Susan · front · fh_high — Forehand 어깨 높이 / Smash 대체 | raw_assets/images_src/motion/char_02/front/fh_high.mp4 |
| ☐ | M-084 | Susan · front · fh_low — Forehand 무릎 높이 | raw_assets/images_src/motion/char_02/front/fh_low.mp4 |
| ☐ | M-085 | Susan · front · bh_high — Backhand 어깨 높이 | raw_assets/images_src/motion/char_02/front/bh_high.mp4 |
| ☐ | M-086 | Susan · front · bh_low — Backhand 무릎 높이 | raw_assets/images_src/motion/char_02/front/bh_low.mp4 |
| ☐ | M-087 | Susan · front · serve_ready — Serve 대기 | raw_assets/images_src/motion/char_02/front/serve_ready.mp4 |
| ☐ | M-088 | Susan · front · split — Split Step | raw_assets/images_src/motion/char_02/front/split.mp4 |
| ☐ | M-089 | Susan · front · point_win — 득점 반응 | raw_assets/images_src/motion/char_02/front/point_win.mp4 |
| ☐ | M-090 | Susan · front · point_lose — 실점 반응 | raw_assets/images_src/motion/char_02/front/point_lose.mp4 |
| ☐ | M-091 | Susan · front · smash — Smash | raw_assets/images_src/motion/char_02/front/smash.mp4 |
| ☐ | M-092 | Susan · front · reach_fh — 먼 공 Forehand (Extended Reach) | raw_assets/images_src/motion/char_02/front/reach_fh.mp4 |
| ☐ | M-093 | Susan · front · reach_bh — 먼 공 Backhand (Slice Reach) | raw_assets/images_src/motion/char_02/front/reach_bh.mp4 |
| ☐ | M-094 | Susan · front · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated) | raw_assets/images_src/motion/char_02/front/run_forward.mp4 |
| ☐ | M-095 | Susan · front · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated) | raw_assets/images_src/motion/char_02/front/run_back.mp4 |
| ☐ | M-096 | Susan · front · walk_in — Match 입장 | raw_assets/images_src/motion/char_02/front/walk_in.mp4 |
| ☐ | M-097 | Wolfson · back · idle — Ready 대기 | raw_assets/images_src/motion/char_03/back/idle.mp4 |
| ☐ | M-098 | Wolfson · back · run_left — 화면 왼쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_03/back/run_left.mp4 |
| ☐ | M-099 | Wolfson · back · run_right — 화면 오른쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_03/back/run_right.mp4 |
| ☐ | M-100 | Wolfson · back · fh_mid — Forehand 허리 높이 | raw_assets/images_src/motion/char_03/back/fh_mid.mp4 |
| ☐ | M-101 | Wolfson · back · bh_mid — Backhand 허리 높이 (11/10 updated) | raw_assets/images_src/motion/char_03/back/bh_mid.mp4 |
| ☐ | M-102 | Wolfson · back · serve — Toss → Serve | raw_assets/images_src/motion/char_03/back/serve.mp4 |
| ☐ | M-103 | Wolfson · back · victory — Match 승리 (A안) | raw_assets/images_src/motion/char_03/back/victory.mp4 |
| ☐ | M-104 | Wolfson · back · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장) | raw_assets/images_src/motion/char_03/back/victory.mp4 |
| ☐ | M-105 | Wolfson · back · defeat — Match 패배 (A안) | raw_assets/images_src/motion/char_03/back/defeat.mp4 |
| ☐ | M-106 | Wolfson · back · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장) | raw_assets/images_src/motion/char_03/back/defeat.mp4 |
| ☐ | M-107 | Wolfson · back · fh_high — Forehand 어깨 높이 / Smash 대체 | raw_assets/images_src/motion/char_03/back/fh_high.mp4 |
| ☐ | M-108 | Wolfson · back · fh_low — Forehand 무릎 높이 | raw_assets/images_src/motion/char_03/back/fh_low.mp4 |
| ☐ | M-109 | Wolfson · back · bh_high — Backhand 어깨 높이 (11/10 updated) | raw_assets/images_src/motion/char_03/back/bh_high.mp4 |
| ☐ | M-110 | Wolfson · back · bh_low — Backhand 무릎 높이 (11/10 updated) | raw_assets/images_src/motion/char_03/back/bh_low.mp4 |
| ☐ | M-111 | Wolfson · back · serve_ready — Serve 대기 | raw_assets/images_src/motion/char_03/back/serve_ready.mp4 |
| ☐ | M-112 | Wolfson · back · split — Split Step | raw_assets/images_src/motion/char_03/back/split.mp4 |
| ☐ | M-113 | Wolfson · back · point_win — 득점 반응 | raw_assets/images_src/motion/char_03/back/point_win.mp4 |
| ☐ | M-114 | Wolfson · back · point_lose — 실점 반응 | raw_assets/images_src/motion/char_03/back/point_lose.mp4 |
| ☐ | M-115 | Wolfson · back · smash — Smash | raw_assets/images_src/motion/char_03/back/smash.mp4 |
| ☐ | M-116 | Wolfson · back · reach_fh — 먼 공 Forehand (Extended Reach) | raw_assets/images_src/motion/char_03/back/reach_fh.mp4 |
| ☐ | M-117 | Wolfson · back · reach_bh — 먼 공 Backhand (Slice Reach) | raw_assets/images_src/motion/char_03/back/reach_bh.mp4 |
| ☐ | M-118 | Wolfson · back · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated) | raw_assets/images_src/motion/char_03/back/run_forward.mp4 |
| ☐ | M-119 | Wolfson · back · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated) | raw_assets/images_src/motion/char_03/back/run_back.mp4 |
| ☐ | M-120 | Wolfson · back · walk_in — Match 입장 | raw_assets/images_src/motion/char_03/back/walk_in.mp4 |
| ☐ | M-121 | Wolfson · front · idle — Ready 대기 | raw_assets/images_src/motion/char_03/front/idle.mp4 |
| ☐ | M-122 | Wolfson · front · run_left — 화면 왼쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_03/front/run_left.mp4 |
| ☐ | M-123 | Wolfson · front · run_right — 화면 오른쪽 이동 (11/10 updated) | raw_assets/images_src/motion/char_03/front/run_right.mp4 |
| ☐ | M-124 | Wolfson · front · fh_mid — Forehand 허리 높이 | raw_assets/images_src/motion/char_03/front/fh_mid.mp4 |
| ☐ | M-125 | Wolfson · front · bh_mid — Backhand 허리 높이 | raw_assets/images_src/motion/char_03/front/bh_mid.mp4 |
| ☐ | M-126 | Wolfson · front · serve — Toss → Serve | raw_assets/images_src/motion/char_03/front/serve.mp4 |
| ☐ | M-127 | Wolfson · front · victory — Match 승리 (A안) | raw_assets/images_src/motion/char_03/front/victory.mp4 |
| ☐ | M-128 | Wolfson · front · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장) | raw_assets/images_src/motion/char_03/front/victory.mp4 |
| ☐ | M-129 | Wolfson · front · defeat — Match 패배 (A안) | raw_assets/images_src/motion/char_03/front/defeat.mp4 |
| ☐ | M-130 | Wolfson · front · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장) | raw_assets/images_src/motion/char_03/front/defeat.mp4 |
| ☐ | M-131 | Wolfson · front · fh_high — Forehand 어깨 높이 / Smash 대체 | raw_assets/images_src/motion/char_03/front/fh_high.mp4 |
| ☐ | M-132 | Wolfson · front · fh_low — Forehand 무릎 높이 | raw_assets/images_src/motion/char_03/front/fh_low.mp4 |
| ☐ | M-133 | Wolfson · front · bh_high — Backhand 어깨 높이 | raw_assets/images_src/motion/char_03/front/bh_high.mp4 |
| ☐ | M-134 | Wolfson · front · bh_low — Backhand 무릎 높이 | raw_assets/images_src/motion/char_03/front/bh_low.mp4 |
| ☐ | M-135 | Wolfson · front · serve_ready — Serve 대기 | raw_assets/images_src/motion/char_03/front/serve_ready.mp4 |
| ☐ | M-136 | Wolfson · front · split — Split Step | raw_assets/images_src/motion/char_03/front/split.mp4 |
| ☐ | M-137 | Wolfson · front · point_win — 득점 반응 | raw_assets/images_src/motion/char_03/front/point_win.mp4 |
| ☐ | M-138 | Wolfson · front · point_lose — 실점 반응 | raw_assets/images_src/motion/char_03/front/point_lose.mp4 |
| ☐ | M-139 | Wolfson · front · smash — Smash | raw_assets/images_src/motion/char_03/front/smash.mp4 |
| ☐ | M-140 | Wolfson · front · reach_fh — 먼 공 Forehand (Extended Reach) | raw_assets/images_src/motion/char_03/front/reach_fh.mp4 |
| ☐ | M-141 | Wolfson · front · reach_bh — 먼 공 Backhand (Slice Reach) | raw_assets/images_src/motion/char_03/front/reach_bh.mp4 |
| ☐ | M-142 | Wolfson · front · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated) | raw_assets/images_src/motion/char_03/front/run_forward.mp4 |
| ☐ | M-143 | Wolfson · front · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated) | raw_assets/images_src/motion/char_03/front/run_back.mp4 |
| ☐ | M-144 | Wolfson · front · walk_in — Match 입장 | raw_assets/images_src/motion/char_03/front/walk_in.mp4 |

총 **Image 65개 · 연출 Video 32개 · Motion Video 144개** (Motion A/B안 포함).

---

## A. Character 기준 Image (Turnaround · Pose Start Frame)

### I-01 · David (데이비드) Turnaround Sheet

* **넣을 곳**: raw_assets/images_src/references/char_01_turnaround.jpg
* **게임 파일**: 없음 (Flow Reference 전용)
* **Flow 설정**: Image · 16:9 · Reference 없음 (최초 기준 Image)

```text
Character turnaround reference sheet showing the same character four times side by side: front view, side view, back view, and three-quarter view, full body, neutral A-pose holding a carbon tennis racket in the right hand, plain light gray background, even studio lighting, no shadows on the character, 7.5 heads tall athletic proportions, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Every view shows exactly the same face, hairstyle, outfit colors and racket.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-02 · Susan (수잔) Turnaround Sheet

* **넣을 곳**: raw_assets/images_src/references/char_02_turnaround.jpg
* **게임 파일**: 없음 (Flow Reference 전용)
* **Flow 설정**: Image · 16:9 · Reference 없음 (최초 기준 Image)

```text
Character turnaround reference sheet showing the same character four times side by side: front view, side view, back view, and three-quarter view, full body, neutral A-pose holding a carbon tennis racket in the right hand, plain light gray background, even studio lighting, no shadows on the character, 7.5 heads tall athletic proportions, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Every view shows exactly the same face, hairstyle, outfit colors and racket.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-03 · Wolfson (울프슨) Turnaround Sheet

* **넣을 곳**: raw_assets/images_src/references/char_03_turnaround.jpg
* **게임 파일**: 없음 (Flow Reference 전용)
* **Flow 설정**: Image · 16:9 · Reference 없음 (최초 기준 Image)

```text
Character turnaround reference sheet showing the same character four times side by side: front view, side view, back view, and three-quarter view, full body, neutral A-pose holding a carbon tennis racket in the right hand, plain light gray background, even studio lighting, no shadows on the character, 7.5 heads tall athletic proportions, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Every view shows exactly the same face, hairstyle, outfit colors and racket.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-04 · David Pose Start Frame — Back (Player용)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/\_start.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_01_turnaround.jpg
* **사용처**: Motion Video의 Start Frame (End Frame 겸용)

```text
Full body straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image, the character stands in a tennis ready stance, knees slightly bent, carbon racket held in front with both hands, centered, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-05 · David Pose Start Frame — Front (NPC용)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/\_start.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_01_turnaround.jpg
* **사용처**: Motion Video의 Start Frame (End Frame 겸용)

```text
Full body straight front view facing the camera at eye level, the racket hand is on the left side of the image, the character stands in a tennis ready stance, knees slightly bent, carbon racket held in front with both hands, centered, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-06 · Susan Pose Start Frame — Back (Player용)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/\_start.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_02_turnaround.jpg
* **사용처**: Motion Video의 Start Frame (End Frame 겸용)

```text
Full body straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image, the character stands in a tennis ready stance, knees slightly bent, carbon racket held in front with both hands, centered, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-07 · Susan Pose Start Frame — Front (NPC용)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/\_start.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_02_turnaround.jpg
* **사용처**: Motion Video의 Start Frame (End Frame 겸용)

```text
Full body straight front view facing the camera at eye level, the racket hand is on the left side of the image, the character stands in a tennis ready stance, knees slightly bent, carbon racket held in front with both hands, centered, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-08 · Wolfson Pose Start Frame — Back (Player용)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/\_start.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_03_turnaround.jpg
* **사용처**: Motion Video의 Start Frame (End Frame 겸용)

```text
Full body straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image, the character stands in a tennis ready stance, knees slightly bent, carbon racket held in front with both hands, centered, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-09 · Wolfson Pose Start Frame — Front (NPC용)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/\_start.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_03_turnaround.jpg
* **사용처**: Motion Video의 Start Frame (End Frame 겸용)

```text
Full body straight front view facing the camera at eye level, the racket hand is on the left side of the image, the character stands in a tennis ready stance, knees slightly bent, carbon racket held in front with both hands, centered, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-10 · David Backhand Key Pose — Back (Player용)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/\_bh_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_01_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: bh_mid / bh_high / bh_low Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓이 화면 **왼쪽**에 있고 두 손이 모두 손잡이를 잡고 있어야 한다. 아니면 다시 생성.

```text
Full body straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image, the character is frozen at the peak of a two-handed tennis backswing on the non-racket side: BOTH hands hold the racket handle together (left hand above the right hand), both hands are next to the character's own left hip, the racket is on the LEFT side of the image with the racket head pointing back and up at shoulder height, the right arm crosses in front of the chest, the shoulders are fully coiled so the left shoulder is closer to the camera and the right shoulder points away from the camera, the head looks away from the camera over the right shoulder, knees bent, weight loaded on the left foot, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: one-handed grip, racket on the right side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-11 · David Slice Key Pose — Back (Player용)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/\_slice_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_01_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: reach_bh Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓 헤드가 화면 **왼쪽** 위(왼쪽 어깨 뒤)에 있어야 한다.

```text
Full body straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image, the character is frozen at the peak of a one-handed slice backswing on the non-racket side in a wide stretching lunge toward the character's own left side: only the right hand holds the racket, the right arm crosses in front of the chest, the racket head is high behind the character's own left shoulder on the LEFT side of the image with the racket face slightly open, the left hand lightly touches the throat of the racket, the shoulders are fully coiled so the left shoulder is closer to the camera and the right shoulder points away from the camera, the head looks away from the camera over the right shoulder, deep knee bend on the left leg, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: two-handed grip, racket on the right side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-12 · David Backhand Key Pose — Front (NPC용)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/\_bh_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_01_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: bh_mid / bh_high / bh_low Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓이 화면 **오른쪽**에 있고 두 손이 모두 손잡이를 잡고 있어야 한다. 아니면 다시 생성.

```text
Full body straight front view facing the camera at eye level, the racket hand is on the left side of the image, the character is frozen at the peak of a two-handed tennis backswing on the non-racket side: BOTH hands hold the racket handle together (left hand above the right hand), both hands are next to the character's own left hip, the racket is on the RIGHT side of the image with the racket head pointing back and up at shoulder height, the right arm crosses in front of the chest, the shoulders are fully coiled so the right shoulder is closer to the camera than the left shoulder and the chest turns toward the right side of the image, the head looks toward the camera over the right shoulder, knees bent, weight loaded on the left foot, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: one-handed grip, racket on the left side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-13 · David Slice Key Pose — Front (NPC용)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/\_slice_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_01_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: reach_bh Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓 헤드가 화면 **오른쪽** 위(왼쪽 어깨 뒤)에 있어야 한다.

```text
Full body straight front view facing the camera at eye level, the racket hand is on the left side of the image, the character is frozen at the peak of a one-handed slice backswing on the non-racket side in a wide stretching lunge toward the character's own left side: only the right hand holds the racket, the right arm crosses in front of the chest, the racket head is high behind the character's own left shoulder on the RIGHT side of the image with the racket face slightly open, the left hand lightly touches the throat of the racket, the shoulders are fully coiled so the right shoulder is closer to the camera than the left shoulder and the chest turns toward the right side of the image, the head looks toward the camera over the right shoulder, deep knee bend on the left leg, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: two-handed grip, racket on the left side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-14 · Susan Backhand Key Pose — Back (Player용)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/\_bh_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_02_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: bh_mid / bh_high / bh_low Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓이 화면 **왼쪽**에 있고 두 손이 모두 손잡이를 잡고 있어야 한다. 아니면 다시 생성.

```text
Full body straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image, the character is frozen at the peak of a two-handed tennis backswing on the non-racket side: BOTH hands hold the racket handle together (left hand above the right hand), both hands are next to the character's own left hip, the racket is on the LEFT side of the image with the racket head pointing back and up at shoulder height, the right arm crosses in front of the chest, the shoulders are fully coiled so the left shoulder is closer to the camera and the right shoulder points away from the camera, the head looks away from the camera over the right shoulder, knees bent, weight loaded on the left foot, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: one-handed grip, racket on the right side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-15 · Susan Slice Key Pose — Back (Player용)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/\_slice_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_02_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: reach_bh Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓 헤드가 화면 **왼쪽** 위(왼쪽 어깨 뒤)에 있어야 한다.

```text
Full body straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image, the character is frozen at the peak of a one-handed slice backswing on the non-racket side in a wide stretching lunge toward the character's own left side: only the right hand holds the racket, the right arm crosses in front of the chest, the racket head is high behind the character's own left shoulder on the LEFT side of the image with the racket face slightly open, the left hand lightly touches the throat of the racket, the shoulders are fully coiled so the left shoulder is closer to the camera and the right shoulder points away from the camera, the head looks away from the camera over the right shoulder, deep knee bend on the left leg, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: two-handed grip, racket on the right side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-16 · Susan Backhand Key Pose — Front (NPC용)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/\_bh_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_02_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: bh_mid / bh_high / bh_low Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓이 화면 **오른쪽**에 있고 두 손이 모두 손잡이를 잡고 있어야 한다. 아니면 다시 생성.

```text
Full body straight front view facing the camera at eye level, the racket hand is on the left side of the image, the character is frozen at the peak of a two-handed tennis backswing on the non-racket side: BOTH hands hold the racket handle together (left hand above the right hand), both hands are next to the character's own left hip, the racket is on the RIGHT side of the image with the racket head pointing back and up at shoulder height, the right arm crosses in front of the chest, the shoulders are fully coiled so the right shoulder is closer to the camera than the left shoulder and the chest turns toward the right side of the image, the head looks toward the camera over the right shoulder, knees bent, weight loaded on the left foot, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: one-handed grip, racket on the left side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-17 · Susan Slice Key Pose — Front (NPC용)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/\_slice_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_02_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: reach_bh Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓 헤드가 화면 **오른쪽** 위(왼쪽 어깨 뒤)에 있어야 한다.

```text
Full body straight front view facing the camera at eye level, the racket hand is on the left side of the image, the character is frozen at the peak of a one-handed slice backswing on the non-racket side in a wide stretching lunge toward the character's own left side: only the right hand holds the racket, the right arm crosses in front of the chest, the racket head is high behind the character's own left shoulder on the RIGHT side of the image with the racket face slightly open, the left hand lightly touches the throat of the racket, the shoulders are fully coiled so the right shoulder is closer to the camera than the left shoulder and the chest turns toward the right side of the image, the head looks toward the camera over the right shoulder, deep knee bend on the left leg, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: two-handed grip, racket on the left side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-18 · Wolfson Backhand Key Pose — Back (Player용)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/\_bh_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_03_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: bh_mid / bh_high / bh_low Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓이 화면 **왼쪽**에 있고 두 손이 모두 손잡이를 잡고 있어야 한다. 아니면 다시 생성.

```text
Full body straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image, the character is frozen at the peak of a two-handed tennis backswing on the non-racket side: BOTH hands hold the racket handle together (left hand above the right hand), both hands are next to the character's own left hip, the racket is on the LEFT side of the image with the racket head pointing back and up at shoulder height, the right arm crosses in front of the chest, the shoulders are fully coiled so the left shoulder is closer to the camera and the right shoulder points away from the camera, the head looks away from the camera over the right shoulder, knees bent, weight loaded on the left foot, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: one-handed grip, racket on the right side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-19 · Wolfson Slice Key Pose — Back (Player용)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/\_slice_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_03_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: reach_bh Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓 헤드가 화면 **왼쪽** 위(왼쪽 어깨 뒤)에 있어야 한다.

```text
Full body straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image, the character is frozen at the peak of a one-handed slice backswing on the non-racket side in a wide stretching lunge toward the character's own left side: only the right hand holds the racket, the right arm crosses in front of the chest, the racket head is high behind the character's own left shoulder on the LEFT side of the image with the racket face slightly open, the left hand lightly touches the throat of the racket, the shoulders are fully coiled so the left shoulder is closer to the camera and the right shoulder points away from the camera, the head looks away from the camera over the right shoulder, deep knee bend on the left leg, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: two-handed grip, racket on the right side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-20 · Wolfson Backhand Key Pose — Front (NPC용)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/\_bh_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_03_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: bh_mid / bh_high / bh_low Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓이 화면 **오른쪽**에 있고 두 손이 모두 손잡이를 잡고 있어야 한다. 아니면 다시 생성.

```text
Full body straight front view facing the camera at eye level, the racket hand is on the left side of the image, the character is frozen at the peak of a two-handed tennis backswing on the non-racket side: BOTH hands hold the racket handle together (left hand above the right hand), both hands are next to the character's own left hip, the racket is on the RIGHT side of the image with the racket head pointing back and up at shoulder height, the right arm crosses in front of the chest, the shoulders are fully coiled so the right shoulder is closer to the camera than the left shoulder and the chest turns toward the right side of the image, the head looks toward the camera over the right shoulder, knees bent, weight loaded on the left foot, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: one-handed grip, racket on the left side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-21 · Wolfson Slice Key Pose — Front (NPC용)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/\_slice_key.jpg
* **게임 파일**: 없음 (Flow Start / End Frame 전용)
* **Flow 설정**: Image · 16:9 · Reference = char_03_turnaround.jpg + 같은 View의 \_start.jpg
* **사용처**: reach_bh Motion Video의 **Start Frame** (End Frame은 \_start.jpg)
* **검수**: 라켓 헤드가 화면 **오른쪽** 위(왼쪽 어깨 뒤)에 있어야 한다.

```text
Full body straight front view facing the camera at eye level, the racket hand is on the left side of the image, the character is frozen at the peak of a one-handed slice backswing on the non-racket side in a wide stretching lunge toward the character's own left side: only the right hand holds the racket, the right arm crosses in front of the chest, the racket head is high behind the character's own left shoulder on the RIGHT side of the image with the racket face slightly open, the left hand lightly touches the throat of the racket, the shoulders are fully coiled so the right shoulder is closer to the camera than the left shoulder and the chest turns toward the right side of the image, the head looks toward the camera over the right shoulder, deep knee bend on the left leg, centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: two-handed grip, racket on the left side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

## B. 게임 화면 Image

### I-22 · David Setup Card Portrait

* **넣을 곳**: raw_assets/images_src/images/characters/char_01_portrait.jpg
* **게임 파일**: public/assets/images/characters/char_01_portrait.webp
* **Flow 설정**: Image · **3:4 Portrait** · Reference = char_01_turnaround.jpg

```text
Character select portrait, vertical 3:4, waist-up, three-quarter front view, holding a carbon tennis racket resting on the shoulder, slight calm smile, looking at the viewer, soft gradient background in blue (#2E7DD7) fading to white, subtle tennis court line shapes in the background, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-23 · Susan Setup Card Portrait

* **넣을 곳**: raw_assets/images_src/images/characters/char_02_portrait.jpg
* **게임 파일**: public/assets/images/characters/char_02_portrait.webp
* **Flow 설정**: Image · **3:4 Portrait** · Reference = char_02_turnaround.jpg

```text
Character select portrait, vertical 3:4, waist-up, three-quarter front view, holding a carbon tennis racket resting on the shoulder, cheerful wink, ponytail swinging, racket spun in hand, soft gradient background in pink (#E04F8A) fading to white, subtle tennis court line shapes in the background, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-24 · Wolfson Setup Card Portrait

* **넣을 곳**: raw_assets/images_src/images/characters/char_03_portrait.jpg
* **게임 파일**: public/assets/images/characters/char_03_portrait.webp
* **Flow 설정**: Image · **3:4 Portrait** · Reference = char_03_turnaround.jpg

```text
Character select portrait, vertical 3:4, waist-up, three-quarter front view, holding a carbon tennis racket resting on the shoulder, serious gaze, racket gripped firmly across the chest, soft gradient background in orange (#F29B2E) fading to white, subtle tennis court line shapes in the background, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-25 · Title Key Visual — Landscape

* **넣을 곳**: raw_assets/images_src/images/title/title_key_visual_landscape.jpg
* **게임 파일**: public/assets/images/title/title_key_visual_landscape.webp
* **Flow 설정**: Image · 16:9 · Reference = I-01, I-02, I-03

```text
Title screen key visual for a tennis game, 16:9, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Eye-level telephoto view from just behind the baseline of a beautiful green hard tennis court (#3E8E5E) at golden late afternoon, crisp white lines leading toward the net, the far court compressed by the long lens.
Three tennis players stand together on the near side, seen from behind and in three-quarter back view: in the center a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape, holding the racket over his shoulder; on the left a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape; on the right a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
A fluorescent yellow ball floats mid-air above the net catching the sun, with a faint white trail.
White modern stands with a soft watercolor crowd in the distance, clear sky with gentle clouds in the upper third kept open and uncluttered for a logo, lower fifth kept simple for a button.
Hopeful, sunny, premium sports game mood.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-26 · Title Key Visual — Portrait

* **넣을 곳**: raw_assets/images_src/images/title/title_key_visual_portrait.jpg
* **게임 파일**: public/assets/images/title/title_key_visual_portrait.webp
* **Flow 설정**: Image · **9:16 Portrait** · Reference = I-01

```text
Title screen key visual for a tennis game, vertical 9:16, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Low eye-level telephoto view along the center service line of a green hard tennis court (#3E8E5E), the net crossing the middle of the frame.
In the lower middle, a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape, seen from behind in a ready stance; far across the net a small opponent silhouette.
A fluorescent yellow ball glows above the net with a soft white trail.
Upper third: clean bright blue sky with soft watercolor clouds, open for a logo. Bottom fifth: plain court surface for a button.
Fresh, sunny, energetic.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-27 · Stage 1 Key Art (day)

* **넣을 곳**: raw_assets/images_src/images/stages/stage_01_key.jpg
* **게임 파일**: public/assets/images/stages/stage_01_key.webp
* **Flow 설정**: Image · 16:9 · Reference 없음
* **사용처**: Stage Tile 배경 + Stage Intro / Ending Video의 Start Frame

```text
Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, an empty court with no players, a friendly community sports center tennis court surrounded by green windscreens and young trees, green hard court (#3E8E5E), fresh 9 AM morning sun, soft long shadows, light dew sparkle, a few spectators scattered on small white bleachers, a ball basket near the net post, birds in a clear blue sky, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Crisp white court lines with correct tennis court proportions, the net centered, the main subject inside the central vertical third of the frame.
Avoid: people on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-28 · Stage 2 Key Art (day)

* **넣을 곳**: raw_assets/images_src/images/stages/stage_02_key.jpg
* **게임 파일**: public/assets/images/stages/stage_02_key.webp
* **Flow 설정**: Image · 16:9 · Reference 없음
* **사용처**: Stage Tile 배경 + Stage Intro / Ending Video의 Start Frame

```text
Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, an empty court with no players, the same community sports center, festive with plain colorful pennant flags without text, green hard court (#3E8E5E), bright late-morning sun, clear sky (#5FB4F0), half-filled white stands, relaxed families, water bottles on a bench, gentle breeze moving the flags, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Crisp white court lines with correct tennis court proportions, the net centered, the main subject inside the central vertical third of the frame.
Avoid: people on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-29 · Stage 3 Key Art (day)

* **넣을 곳**: raw_assets/images_src/images/stages/stage_03_key.jpg
* **게임 파일**: public/assets/images/stages/stage_03_key.webp
* **Flow 설정**: Image · 16:9 · Reference 없음
* **사용처**: Stage Tile 배경 + Stage Intro / Ending Video의 Start Frame

```text
Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, an empty court with no players, a larger outdoor stadium court at the sports center with tall white stands, green hard court (#3E8E5E), high noon sun, crisp short shadows, vivid summer clarity, full white stands with a watercolor crowd, heat shimmer at the far end, umbrellas in the stands, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Crisp white court lines with correct tennis court proportions, the net centered, the main subject inside the central vertical third of the frame.
Avoid: people on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-30 · Stage 4 Key Art (sunset)

* **넣을 곳**: raw_assets/images_src/images/stages/stage_04_key.jpg
* **게임 파일**: public/assets/images/stages/stage_04_key.webp
* **Flow 설정**: Image · 16:9 · Reference 없음
* **사용처**: Stage Tile 배경 + Stage Intro / Ending Video의 Start Frame

```text
Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, an empty court with no players, a seaside hillside tennis court with palm trees and a distant ocean horizon, terracotta orange hard court (#C4673F), golden hour, warm orange sky (#F0784A to #FCD39B), long dramatic shadows, a modest crowd in silhouette, sun glare on the net tape, seagulls far away, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Crisp white court lines with correct tennis court proportions, the net centered, the main subject inside the central vertical third of the frame.
Avoid: people on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-31 · Stage 5 Key Art (sunset)

* **넣을 곳**: raw_assets/images_src/images/stages/stage_05_key.jpg
* **게임 파일**: public/assets/images/stages/stage_05_key.webp
* **Flow 설정**: Image · 16:9 · Reference 없음
* **사용처**: Stage Tile 배경 + Stage Intro / Ending Video의 Start Frame

```text
Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, an empty court with no players, the same hillside court at dusk with string lights along the fence, terracotta orange hard court (#C4673F), magic hour, pink-purple sky, first string lights turning on, a lively crowd with warm rim light, first evening star, glowing fence lights reflected on the court, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Crisp white court lines with correct tennis court proportions, the net centered, the main subject inside the central vertical third of the frame.
Avoid: people on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-32 · Stage 6 Key Art (indoor)

* **넣을 곳**: raw_assets/images_src/images/stages/stage_06_key.jpg
* **게임 파일**: public/assets/images/stages/stage_06_key.webp
* **Flow 설정**: Image · 16:9 · Reference 없음
* **사용처**: Stage Tile 배경 + Stage Intro / Ending Video의 Start Frame

```text
Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, an empty court with no players, a modern indoor tennis hall with tall windows and skylights, blue urethane court (#2F6FAE) with warm wooden surround (#B9874F), clean even ceiling lights mixed with soft daylight from the skylights, sparse spectators in dark seats, polished floor reflections, hanging acoustic panels, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Crisp white court lines with correct tennis court proportions, the net centered, the main subject inside the central vertical third of the frame.
Avoid: people on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-33 · Stage 7 Key Art (indoor)

* **넣을 곳**: raw_assets/images_src/images/stages/stage_07_key.jpg
* **게임 파일**: public/assets/images/stages/stage_07_key.webp
* **Flow 설정**: Image · 16:9 · Reference 없음
* **사용처**: Stage Tile 배경 + Stage Intro / Ending Video의 Start Frame

```text
Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, an empty court with no players, a professional indoor arena at night with a curved roof truss, blue urethane court (#2F6FAE) with wooden surround (#B9874F), bright LED arena lighting, cool white tone, subtle haze, packed dark stands with a watercolor crowd, camera rigs on the side, glossy court reflections, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Crisp white court lines with correct tennis court proportions, the net centered, the main subject inside the central vertical third of the frame.
Avoid: people on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-34 · Stage 8 Key Art (night)

* **넣을 곳**: raw_assets/images_src/images/stages/stage_08_key.jpg
* **게임 파일**: public/assets/images/stages/stage_08_key.webp
* **Flow 설정**: Image · 16:9 · Reference 없음
* **사용처**: Stage Tile 배경 + Stage Intro / Ending Video의 Start Frame

```text
Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, an empty court with no players, an outdoor professional night stadium, navy blue hard court (#24578F), powerful floodlights from four towers, deep navy night sky (#070B1E), half-filled stands with excited fans, light beams cutting through faint mist, moths near the lights, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Crisp white court lines with correct tennis court proportions, the net centered, the main subject inside the central vertical third of the frame.
Avoid: people on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-35 · Stage 9 Key Art (night)

* **넣을 곳**: raw_assets/images_src/images/stages/stage_09_key.jpg
* **게임 파일**: public/assets/images/stages/stage_09_key.webp
* **Flow 설정**: Image · 16:9 · Reference 없음
* **사용처**: Stage Tile 배경 + Stage Intro / Ending Video의 Start Frame

```text
Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, an empty court with no players, the same night stadium for a semi-final, larger and more dramatic, navy blue hard court (#24578F), floodlights plus warm accent spotlights on the court, fully packed stands, thousands of tiny phone lights twinkling, waving plain color flags without text, energetic atmosphere, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Crisp white court lines with correct tennis court proportions, the net centered, the main subject inside the central vertical third of the frame.
Avoid: people on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-36 · Stage 10 Key Art (night)

* **넣을 곳**: raw_assets/images_src/images/stages/stage_10_key.jpg
* **게임 파일**: public/assets/images/stages/stage_10_key.webp
* **Flow 설정**: Image · 16:9 · Reference 없음
* **사용처**: Stage Tile 배경 + Stage Intro / Ending Video의 Start Frame

```text
Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, an empty court with no players, a grand championship final stadium with a towering bowl of stands, navy blue hard court (#24578F), dramatic spotlights converging on center court, light haze, golden accents, a roaring sold-out crowd, glittering phone lights everywhere, confetti cannons standing ready at the corners, an empty trophy pedestal beside the net post, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Crisp white court lines with correct tennis court proportions, the net centered, the main subject inside the central vertical third of the frame.
Avoid: people on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

## C. 홍보 · Score · 추가 Image

### I-37 · David Gameplay Back View (Store / 홍보)

* **넣을 곳**: raw_assets/images_src/images/concept/char_01_gameplay_day.jpg
* **게임 파일**: public/assets/images/concept/char_01_gameplay_day.webp
* **Flow 설정**: Image · 16:9 · Reference = char_01_turnaround.jpg

```text
Eye-level telephoto view from behind the player at the baseline of a tennis court, the player in a ready stance seen from behind occupying the lower center of the frame, the tennis net crossing between chest and head height, a small opponent far across the court, a fluorescent yellow ball in flight with a soft white trail, bright clear summer daylight, blue sky (#5FB4F0), green hard court (#3E8E5E), white stands, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Player: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-38 · Susan Gameplay Back View (Store / 홍보)

* **넣을 곳**: raw_assets/images_src/images/concept/char_02_gameplay_sunset.jpg
* **게임 파일**: public/assets/images/concept/char_02_gameplay_sunset.webp
* **Flow 설정**: Image · 16:9 · Reference = char_02_turnaround.jpg

```text
Eye-level telephoto view from behind the player at the baseline of a tennis court, the player in a ready stance seen from behind occupying the lower center of the frame, the tennis net crossing between chest and head height, a small opponent far across the court, a fluorescent yellow ball in flight with a soft white trail, warm golden-hour sunset light, orange sky (#F0784A to #FCD39B), terracotta hard court (#C4673F), long shadows, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Player: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-39 · Wolfson Gameplay Back View (Store / 홍보)

* **넣을 곳**: raw_assets/images_src/images/concept/char_03_gameplay_night.jpg
* **게임 파일**: public/assets/images/concept/char_03_gameplay_night.webp
* **Flow 설정**: Image · 16:9 · Reference = char_03_turnaround.jpg

```text
Eye-level telephoto view from behind the player at the baseline of a tennis court, the player in a ready stance seen from behind occupying the lower center of the frame, the tennis net crossing between chest and head height, a small opponent far across the court, a fluorescent yellow ball in flight with a soft white trail, floodlit night stadium, deep navy sky (#070B1E), navy blue hard court (#24578F), glowing crowd lights, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Player: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-40 · David Victory Still

* **넣을 곳**: raw_assets/images_src/images/characters/char_01_victory.jpg
* **게임 파일**: public/assets/images/characters/char_01_victory.webp
* **Flow 설정**: Image · 3:4 Portrait · Reference = char_01_turnaround.jpg

```text
Full body victory pose on a tennis court, the character raising the racket high with a fist pump and a joyful shout, small white sparkles and colorful confetti in the air, bright clear summer daylight, blue sky (#5FB4F0), green hard court (#3E8E5E), white stands, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-41 · David Defeat Still

* **넣을 곳**: raw_assets/images_src/images/characters/char_01_defeat.jpg
* **게임 파일**: public/assets/images/characters/char_01_defeat.webp
* **Flow 설정**: Image · 3:4 Portrait · Reference = char_01_turnaround.jpg

```text
Full body defeat pose on a tennis court, the character crouching with hands on knees and head down, the racket resting on the ground, a gentle breeze, disappointed but hopeful mood, bright clear summer daylight, blue sky (#5FB4F0), green hard court (#3E8E5E), white stands, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-42 · Susan Victory Still

* **넣을 곳**: raw_assets/images_src/images/characters/char_02_victory.jpg
* **게임 파일**: public/assets/images/characters/char_02_victory.webp
* **Flow 설정**: Image · 3:4 Portrait · Reference = char_02_turnaround.jpg

```text
Full body victory pose on a tennis court, the character raising the racket high with a fist pump and a joyful shout, small white sparkles and colorful confetti in the air, warm golden-hour sunset light, orange sky (#F0784A to #FCD39B), terracotta hard court (#C4673F), long shadows, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-43 · Susan Defeat Still

* **넣을 곳**: raw_assets/images_src/images/characters/char_02_defeat.jpg
* **게임 파일**: public/assets/images/characters/char_02_defeat.webp
* **Flow 설정**: Image · 3:4 Portrait · Reference = char_02_turnaround.jpg

```text
Full body defeat pose on a tennis court, the character crouching with hands on knees and head down, the racket resting on the ground, a gentle breeze, disappointed but hopeful mood, warm golden-hour sunset light, orange sky (#F0784A to #FCD39B), terracotta hard court (#C4673F), long shadows, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-44 · Wolfson Victory Still

* **넣을 곳**: raw_assets/images_src/images/characters/char_03_victory.jpg
* **게임 파일**: public/assets/images/characters/char_03_victory.webp
* **Flow 설정**: Image · 3:4 Portrait · Reference = char_03_turnaround.jpg

```text
Full body victory pose on a tennis court, the character raising the racket high with a fist pump and a joyful shout, small white sparkles and colorful confetti in the air, floodlit night stadium, deep navy sky (#070B1E), navy blue hard court (#24578F), glowing crowd lights, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-45 · Wolfson Defeat Still

* **넣을 곳**: raw_assets/images_src/images/characters/char_03_defeat.jpg
* **게임 파일**: public/assets/images/characters/char_03_defeat.webp
* **Flow 설정**: Image · 3:4 Portrait · Reference = char_03_turnaround.jpg

```text
Full body defeat pose on a tennis court, the character crouching with hands on knees and head down, the racket resting on the ground, a gentle breeze, disappointed but hopeful mood, floodlit night stadium, deep navy sky (#070B1E), navy blue hard court (#24578F), glowing crowd lights, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-46 · App Icon

* **넣을 곳**: raw_assets/images_src/icons/app_icon_1024.jpg
* **게임 파일**: public/assets/icons/app_icon_1024.png
* **Flow 설정**: Image · **1:1** (Flow에 1:1이 없으면 16:9로 생성 후 중앙 1024×1024 Crop)

```text
Mobile game app icon, square 1:1, no rounded corners, a single fluorescent yellow tennis ball with a crisp white seam bursting forward from a deep navy (#0E1A33) background, a short white speed trail and a few white sparks, a thin arc of a white court line behind it, bold simple silhouette readable at 48 pixels, centered with safe margins, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-47 · Share Image (Open Graph)

* **넣을 곳**: raw_assets/images_src/images/ui/og_share_1200x630.jpg
* **게임 파일**: public/assets/images/ui/og_share_1200x630.webp
* **Flow 설정**: Image · 16:9 (1200×630으로 Crop) · Reference = I-01~03

```text
Wide share image: eye-level telephoto view over a navy night stadium tennis court under floodlights (#24578F court), three players seen from behind on the near baseline: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape; a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape; a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape. A glowing fluorescent yellow ball above the net, the left 40% of the frame is calm dark sky for a title overlay, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-48 · Splash — Portrait

* **넣을 곳**: raw_assets/images_src/images/ui/splash_portrait.jpg
* **게임 파일**: public/assets/images/ui/splash_portrait.webp
* **Flow 설정**: Image · **9:16 Portrait**

```text
Vertical splash screen: a fluorescent yellow tennis ball resting on a crisp white baseline of a green hard court (#3E8E5E), soft morning light, shallow depth of field, a large empty upper half of soft blue sky, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Avoid: text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-49 · Menu Background — Landscape

* **넣을 곳**: raw_assets/images_src/images/ui/bg_menu_landscape.jpg
* **게임 파일**: public/assets/images/ui/bg_menu_landscape.webp
* **Flow 설정**: Image · 16:9

```text
Soft background for a game menu, 16:9, a tennis court seen from a high angle with gentle depth of field, large calm areas, pastel sky blue and court green with white line accents, subtle watercolor texture, low contrast, slightly blurred so UI panels stay readable, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Avoid: people, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-50 · Menu Background — Portrait

* **넣을 곳**: raw_assets/images_src/images/ui/bg_menu_portrait.jpg
* **게임 파일**: public/assets/images/ui/bg_menu_portrait.webp
* **Flow 설정**: Image · **9:16 Portrait**

```text
Soft background for a game menu, 9:16 vertical, a tennis court seen from a high angle with gentle depth of field, large calm areas, pastel sky blue and court green with white line accents, subtle watercolor texture, low contrast, slightly blurred so UI panels stay readable, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Avoid: people, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-51 · Score Background — Win

* **넣을 곳**: raw_assets/images_src/images/ui/bg_score_win.jpg
* **게임 파일**: public/assets/images/ui/bg_score_win.webp
* **Flow 설정**: Image · 16:9

```text
Celebratory background, golden confetti drifting over an empty tennis court at sunset, warm bokeh lights, the center kept calm and uncluttered for score numbers, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Avoid: people, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-52 · Score Background — Lose

* **넣을 곳**: raw_assets/images_src/images/ui/bg_score_lose.jpg
* **게임 파일**: public/assets/images/ui/bg_score_lose.webp
* **Flow 설정**: Image · 16:9

```text
Calm hopeful background, an empty tennis court at blue hour with soft lights, a single tennis ball resting by the net, the center kept calm and uncluttered for score numbers, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Avoid: people, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-53 · How to Play 1 — 이동

* **넣을 곳**: raw_assets/images_src/images/howto/howto_01.jpg
* **게임 파일**: public/assets/images/howto/howto_01.webp
* **Flow 설정**: Image · 4:3 (16:9로 생성 후 4:3 Crop 가능) · Reference = I-01

```text
Clean instructional illustration, 4:3, simple flat background in soft court green, a player seen from behind gliding sideways on a tennis court, soft motion lines showing movement left and right, a translucent trapezoid touch pad shape in the lower left corner, large clear shapes readable on a phone, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Avoid: arrows with text, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-54 · How to Play 2 — 스트로크 선택

* **넣을 곳**: raw_assets/images_src/images/howto/howto_02.jpg
* **게임 파일**: public/assets/images/howto/howto_02.webp
* **Flow 설정**: Image · 4:3 (16:9로 생성 후 4:3 Crop 가능) · Reference = I-01

```text
Clean instructional illustration, 4:3, simple flat background in soft court green, a player seen from behind with three glowing ghost poses of the racket at high, middle and low heights on the forehand side and the backhand side, large clear shapes readable on a phone, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Avoid: arrows with text, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-55 · How to Play 3 — 떼는 순간 스윙

* **넣을 곳**: raw_assets/images_src/images/howto/howto_03.jpg
* **게임 파일**: public/assets/images/howto/howto_03.webp
* **Flow 설정**: Image · 4:3 (16:9로 생성 후 4:3 Crop 가능) · Reference = I-01

```text
Clean instructional illustration, 4:3, simple flat background in soft court green, a close view of a racket meeting a fluorescent yellow ball at the exact moment of contact, a shrinking white timing ring around the ball turning yellow, white sparks, large clear shapes readable on a phone, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Avoid: arrows with text, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-56 · How to Play 4 — 서브

* **넣을 곳**: raw_assets/images_src/images/howto/howto_04.jpg
* **게임 파일**: public/assets/images/howto/howto_04.webp
* **Flow 설정**: Image · 4:3 (16:9로 생성 후 4:3 Crop 가능) · Reference = I-01

```text
Clean instructional illustration, 4:3, simple flat background in soft court green, a player seen from behind tossing a ball high above the head in a trophy pose, a dotted arc showing the toss path, the service box across the net highlighted softly, large clear shapes readable on a phone, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Avoid: arrows with text, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-57 · VFX — Perfect Hit Flash

* **넣을 곳**: raw_assets/images_src/images/vfx/fx_hit_perfect.jpg
* **게임 파일**: public/assets/images/vfx/fx_hit_perfect.webp
* **Flow 설정**: Image · 16:9 (가로 1줄 8 Frame)

```text
Sprite sheet of a bright white and fluorescent yellow impact flash with radiating sharp sparks, expanding then fading, exactly 8 frames in a single horizontal row on a pure black background, each frame centered in an equal-width cell, frames progress from start to end left to right, glowing clean cel-shaded effect style.
Avoid: background details, frame borders, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-58 · VFX — Great Hit Ring

* **넣을 곳**: raw_assets/images_src/images/vfx/fx_hit_great.jpg
* **게임 파일**: public/assets/images/vfx/fx_hit_great.webp
* **Flow 설정**: Image · 16:9 (가로 1줄 8 Frame)

```text
Sprite sheet of a white impact ring burst, smaller and softer, exactly 8 frames in a single horizontal row on a pure black background, each frame centered in an equal-width cell, frames progress from start to end left to right, glowing clean cel-shaded effect style.
Avoid: background details, frame borders, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-59 · VFX — Bounce Dust

* **넣을 곳**: raw_assets/images_src/images/vfx/fx_bounce_dust.jpg
* **게임 파일**: public/assets/images/vfx/fx_bounce_dust.webp
* **Flow 설정**: Image · 16:9 (가로 1줄 8 Frame)

```text
Sprite sheet of a small puff of court dust kicked up by a bouncing ball, soft and quick, exactly 8 frames in a single horizontal row on a pure black background, each frame centered in an equal-width cell, frames progress from start to end left to right, glowing clean cel-shaded effect style.
Avoid: background details, frame borders, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-60 · VFX — Confetti Burst

* **넣을 곳**: raw_assets/images_src/images/vfx/fx_confetti.jpg
* **게임 파일**: public/assets/images/vfx/fx_confetti.webp
* **Flow 설정**: Image · 16:9 (가로 1줄 8 Frame)

```text
Sprite sheet of a burst of colorful confetti pieces in blue, pink, orange and yellow spreading and falling, exactly 8 frames in a single horizontal row on a pure black background, each frame centered in an equal-width cell, frames progress from start to end left to right, glowing clean cel-shaded effect style.
Avoid: background details, frame borders, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-61 · VFX — Net Hit Ripple

* **넣을 곳**: raw_assets/images_src/images/vfx/fx_net_shake.jpg
* **게임 파일**: public/assets/images/vfx/fx_net_shake.webp
* **Flow 설정**: Image · 16:9 (가로 1줄 8 Frame)

```text
Sprite sheet of small white ripple shock lines indicating a net hit, exactly 8 frames in a single horizontal row on a pure black background, each frame centered in an equal-width cell, frames progress from start to end left to right, glowing clean cel-shaded effect style.
Avoid: background details, frame borders, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-62 · Crowd Sprite Sheet — day

* **넣을 곳**: raw_assets/images_src/images/crowd/crowd_day.jpg
* **게임 파일**: public/assets/images/crowd/crowd_day.webp
* **Flow 설정**: Image · 16:9 (4열 × 2행)

```text
Sprite sheet of seated tennis spectators for a game crowd, exactly 4 columns by 2 rows on a pure chroma green background (#00FF00), each cell one person seen from the front sitting, varied outfits in bright summer colors, t-shirts, sun hats and sunglasses, bright daylight, cel-shaded 3D style with thin outlines, row 1 calm sitting poses, row 2 cheering poses with raised arms, equal cell sizes.
Avoid: green clothing, overlapping people, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-63 · Crowd Sprite Sheet — sunset

* **넣을 곳**: raw_assets/images_src/images/crowd/crowd_sunset.jpg
* **게임 파일**: public/assets/images/crowd/crowd_sunset.webp
* **Flow 설정**: Image · 16:9 (4열 × 2행)

```text
Sprite sheet of seated tennis spectators for a game crowd, exactly 4 columns by 2 rows on a pure chroma green background (#00FF00), each cell one person seen from the front sitting, varied outfits in bright summer colors, light jackets, warm orange rim light from the side, cel-shaded 3D style with thin outlines, row 1 calm sitting poses, row 2 cheering poses with raised arms, equal cell sizes.
Avoid: green clothing, overlapping people, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-64 · Crowd Sprite Sheet — indoor

* **넣을 곳**: raw_assets/images_src/images/crowd/crowd_indoor.jpg
* **게임 파일**: public/assets/images/crowd/crowd_indoor.webp
* **Flow 설정**: Image · 16:9 (4열 × 2행)

```text
Sprite sheet of seated tennis spectators for a game crowd, exactly 4 columns by 2 rows on a pure chroma green background (#00FF00), each cell one person seen from the front sitting, varied outfits in bright summer colors, casual sportswear, even indoor lighting, cel-shaded 3D style with thin outlines, row 1 calm sitting poses, row 2 cheering poses with raised arms, equal cell sizes.
Avoid: green clothing, overlapping people, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### I-65 · Crowd Sprite Sheet — night

* **넣을 곳**: raw_assets/images_src/images/crowd/crowd_night.jpg
* **게임 파일**: public/assets/images/crowd/crowd_night.webp
* **Flow 설정**: Image · 16:9 (4열 × 2행)

```text
Sprite sheet of seated tennis spectators for a game crowd, exactly 4 columns by 2 rows on a pure chroma green background (#00FF00), each cell one person seen from the front sitting, varied outfits in bright summer colors, team scarves and glowing phone lights in hand, cool blue rim light, cel-shaded 3D style with thin outlines, row 1 calm sitting poses, row 2 cheering poses with raised arms, equal cell sizes.
Avoid: green clothing, overlapping people, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

## D. 연출 Video (Intro · Stage Intro · Stage Ending)

### V-01 · Intro 6 s

* **넣을 곳**: raw_assets/images_src/video/intro/intro_6s.mp4
* **게임 파일**: public/assets/video/intro/intro_6s.mp4
* **Flow 설정**: Video · Veo 3.1 · Text to Video · **6 s** · 16:9

```text
6-second cinematic game intro, 16:9, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
Shot 1 (0-1.5s): extreme macro of a fluorescent yellow tennis ball with fuzzy felt texture and sparkling morning dew, slowly rotating in warm sunlight, shallow depth of field.
Shot 2 (1.5-3s): low eye-level slow-motion shot of carbon racket strings striking the ball, the strings flex, a few small white spark particles burst from the contact point.
Shot 3 (3-4.5s): telephoto follow shot, the ball flies over the tennis net leaving a soft white light trail while the sky behind transitions in a smooth time-lapse from clear blue day to orange sunset to deep navy night.
Shot 4 (4.5-6s): from eye level behind the baseline of an empty night stadium tennis court with a navy blue hard surface (#24578F) and crisp white lines, the camera cranes upward while floodlights switch on one by one, ending on a calm wide frame with open dark-blue sky in the upper third.
Smooth match cuts, energetic but clean, no people visible.
Audio: crisp tennis ball pop, airy whoosh, rising synth-pop swell, distant crowd roar on the final shot, ending on a soft cymbal tail.
Avoid: people, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-02 · Stage 1 Intro 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_01_intro_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_01_intro_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_01_key.webp · **4 s** · 16:9

```text
4-second stage intro video of a friendly community sports center tennis court surrounded by green windscreens and young trees, green hard court (#3E8E5E), fresh 9 AM morning sun, soft long shadows, light dew sparkle, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-2s: slow aerial glide over the community sports center at morning, trees and courts below.
2-3.5s: a ball bounces once on the empty green court and rolls to the net, a bird flies past.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
The center of the frame stays calm and uncluttered for an overlay card. No players on the court, smooth continuous camera motion.
Audio: a light upbeat synth-pop sting with natural ambience.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-03 · Stage 2 Intro 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_02_intro_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_02_intro_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_02_key.webp · **4 s** · 16:9

```text
4-second stage intro video of the same community sports center, festive with plain colorful pennant flags without text, green hard court (#3E8E5E), bright late-morning sun, clear sky (#5FB4F0), realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-2s: camera dolly along the colorful pennant flags fluttering in the breeze.
2-3.5s: families settle in the white stands and wave, sunlight flickers through the flags.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
The center of the frame stays calm and uncluttered for an overlay card. No players on the court, smooth continuous camera motion.
Audio: a light upbeat synth-pop sting with natural ambience.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-04 · Stage 3 Intro 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_03_intro_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_03_intro_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_03_key.webp · **4 s** · 16:9

```text
4-second stage intro video of a larger outdoor stadium court at the sports center with tall white stands, green hard court (#3E8E5E), high noon sun, crisp short shadows, vivid summer clarity, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-2s: sweeping crane down from the bright noon sky past tall white stands.
2-3.5s: the crowd stands up and claps in a ripple, heat shimmer above the court.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
The center of the frame stays calm and uncluttered for an overlay card. No players on the court, smooth continuous camera motion.
Audio: a light upbeat synth-pop sting with natural ambience.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-05 · Stage 4 Intro 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_04_intro_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_04_intro_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_04_key.webp · **4 s** · 16:9

```text
4-second stage intro video of a seaside hillside tennis court with palm trees and a distant ocean horizon, terracotta orange hard court (#C4673F), golden hour, warm orange sky (#F0784A to #FCD39B), long dramatic shadows, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-2s: drone shot rising from the ocean horizon toward the hillside court at golden hour.
2-3.5s: palm leaves sway, the sun flares across the net tape.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
The center of the frame stays calm and uncluttered for an overlay card. No players on the court, smooth continuous camera motion.
Audio: a light upbeat synth-pop sting with natural ambience.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-06 · Stage 5 Intro 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_05_intro_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_05_intro_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_05_key.webp · **4 s** · 16:9

```text
4-second stage intro video of the same hillside court at dusk with string lights along the fence, terracotta orange hard court (#C4673F), magic hour, pink-purple sky, first string lights turning on, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-2s: slow push in along the fence as string lights turn on one by one at dusk.
2-3.5s: the crowd's silhouettes cheer under a pink-purple sky, the first star appears.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
The center of the frame stays calm and uncluttered for an overlay card. No players on the court, smooth continuous camera motion.
Audio: a light upbeat synth-pop sting with natural ambience.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-07 · Stage 6 Intro 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_06_intro_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_06_intro_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_06_key.webp · **4 s** · 16:9

```text
4-second stage intro video of a modern indoor tennis hall with tall windows and skylights, blue urethane court (#2F6FAE) with warm wooden surround (#B9874F), clean even ceiling lights mixed with soft daylight from the skylights, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-2s: tracking shot through a glass entrance into the bright indoor tennis hall.
2-3.5s: skylight beams shift across the blue court, a ball machine rolls a ball to the baseline.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
The center of the frame stays calm and uncluttered for an overlay card. No players on the court, smooth continuous camera motion.
Audio: a light upbeat synth-pop sting with natural ambience.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-08 · Stage 7 Intro 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_07_intro_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_07_intro_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_07_key.webp · **4 s** · 16:9

```text
4-second stage intro video of a professional indoor arena at night with a curved roof truss, blue urethane court (#2F6FAE) with wooden surround (#B9874F), bright LED arena lighting, cool white tone, subtle haze, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-2s: fast dolly under the curved roof truss as the arena LED lights snap on.
2-3.5s: the packed stands roar, glossy reflections slide across the blue court.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
The center of the frame stays calm and uncluttered for an overlay card. No players on the court, smooth continuous camera motion.
Audio: a light upbeat synth-pop sting with natural ambience.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-09 · Stage 8 Intro 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_08_intro_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_08_intro_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_08_key.webp · **4 s** · 16:9

```text
4-second stage intro video of an outdoor professional night stadium, navy blue hard court (#24578F), powerful floodlights from four towers, deep navy night sky (#070B1E), realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-2s: aerial approach to the night stadium as the four floodlight towers ignite.
2-3.5s: light beams cut through faint mist, the crowd waves scarves.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
The center of the frame stays calm and uncluttered for an overlay card. No players on the court, smooth continuous camera motion.
Audio: a deep drum hit, crowd roar swelling, stadium echo.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-10 · Stage 9 Intro 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_09_intro_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_09_intro_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_09_key.webp · **4 s** · 16:9

```text
4-second stage intro video of the same night stadium for a semi-final, larger and more dramatic, navy blue hard court (#24578F), floodlights plus warm accent spotlights on the court, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-2s: orbiting shot around the packed stadium as thousands of phone lights twinkle.
2-3.5s: warm spotlights sweep across the navy court, flags wave in unison.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
The center of the frame stays calm and uncluttered for an overlay card. No players on the court, smooth continuous camera motion.
Audio: a deep drum hit, crowd roar swelling, stadium echo.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-11 · Stage 10 Intro 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_10_intro_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_10_intro_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_10_key.webp · **4 s** · 16:9

```text
4-second stage intro video of a grand championship final stadium with a towering bowl of stands, navy blue hard court (#24578F), dramatic spotlights converging on center court, light haze, golden accents, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-2s: dramatic rising crane revealing the giant championship bowl, spotlights converging on center court.
2-3.5s: a burst of golden sparks from the corner cannons, the roaring crowd stands, the empty trophy pedestal gleams.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
The center of the frame stays calm and uncluttered for an overlay card. No players on the court, smooth continuous camera motion.
Audio: a deep drum hit, crowd roar swelling, stadium echo.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-12 · Stage 1 Clear 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_01_clear_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_01_clear_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_01_key.webp · **4 s** · 16:9

```text
4-second victory ending video at community sports center green court, morning, green hard court (#3E8E5E), fresh 9 AM morning sun, soft long shadows, light dew sparkle, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the yellow ball lands right on the white baseline, a puff of chalk-like sparkle.
1.5-3s: a few spectators clap, birds take off into the blue sky.
3-4s: a slow pull back to a calm wide shot of the court, warm celebratory light, the center of the frame open for a victory banner.
No players on the court.
Audio: a bright victory jingle and crowd cheering.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-13 · Stage 1 Fail 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_01_fail_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_01_fail_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_01_key.webp · **4 s** · 16:9

```text
4-second defeat ending video at community sports center green court, morning, green hard court (#3E8E5E), fresh 9 AM morning sun, soft long shadows, light dew sparkle, gentle and hopeful rather than sad, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball clips the net tape and drops back slowly.
1.5-3s: a soft breeze rolls the ball across the green court, sunlight stays bright.
3-4s: a slow push in toward the net with a soft glint of light suggesting another try, the center of the frame open for a banner.
No players on the court.
Audio: a soft descending piano phrase and gentle applause.
Avoid: players on the court, gloomy horror mood, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-14 · Stage 2 Clear 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_02_clear_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_02_clear_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_02_key.webp · **4 s** · 16:9

```text
4-second victory ending video at community sports center with pennant flags, late morning, green hard court (#3E8E5E), bright late-morning sun, clear sky (#5FB4F0), realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: a racket is tossed spinning into the air against the sun.
1.5-3s: families cheer, pennant flags flutter wildly.
3-4s: a slow pull back to a calm wide shot of the court, warm celebratory light, the center of the frame open for a victory banner.
No players on the court.
Audio: a bright victory jingle and crowd cheering.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-15 · Stage 2 Fail 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_02_fail_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_02_fail_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_02_key.webp · **4 s** · 16:9

```text
4-second defeat ending video at community sports center with pennant flags, late morning, green hard court (#3E8E5E), bright late-morning sun, clear sky (#5FB4F0), gentle and hopeful rather than sad, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball rolls slowly to rest against the net.
1.5-3s: pennant flags sway calmly, a water bottle on the bench glistens.
3-4s: a slow push in toward the net with a soft glint of light suggesting another try, the center of the frame open for a banner.
No players on the court.
Audio: a soft descending piano phrase and gentle applause.
Avoid: players on the court, gloomy horror mood, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-16 · Stage 3 Clear 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_03_clear_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_03_clear_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_03_key.webp · **4 s** · 16:9

```text
4-second victory ending video at outdoor stadium court at noon, full white stands, green hard court (#3E8E5E), high noon sun, crisp short shadows, vivid summer clarity, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball rockets past the far baseline leaving a bright trail.
1.5-3s: the full stands erupt in a standing ovation, hats thrown up.
3-4s: a slow pull back to a calm wide shot of the court, warm celebratory light, the center of the frame open for a victory banner.
No players on the court.
Audio: a bright victory jingle and crowd cheering.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-17 · Stage 3 Fail 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_03_fail_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_03_fail_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_03_key.webp · **4 s** · 16:9

```text
4-second defeat ending video at outdoor stadium court at noon, full white stands, green hard court (#3E8E5E), high noon sun, crisp short shadows, vivid summer clarity, gentle and hopeful rather than sad, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: a racket lies on the hot green court, the ball beside it.
1.5-3s: heat shimmer, the crowd claps politely, clouds drift.
3-4s: a slow push in toward the net with a soft glint of light suggesting another try, the center of the frame open for a banner.
No players on the court.
Audio: a soft descending piano phrase and gentle applause.
Avoid: players on the court, gloomy horror mood, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-18 · Stage 4 Clear 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_04_clear_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_04_clear_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_04_key.webp · **4 s** · 16:9

```text
4-second victory ending video at seaside hillside court at golden hour, terracotta orange hard court (#C4673F), golden hour, warm orange sky (#F0784A to #FCD39B), long dramatic shadows, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball cuts through a sun flare and kisses the line.
1.5-3s: the silhouetted crowd cheers, seagulls soar over the ocean.
3-4s: a slow pull back to a calm wide shot of the court, warm celebratory light, the center of the frame open for a victory banner.
No players on the court.
Audio: a bright victory jingle and crowd cheering.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-19 · Stage 4 Fail 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_04_fail_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_04_fail_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_04_key.webp · **4 s** · 16:9

```text
4-second defeat ending video at seaside hillside court at golden hour, terracotta orange hard court (#C4673F), golden hour, warm orange sky (#F0784A to #FCD39B), long dramatic shadows, gentle and hopeful rather than sad, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball bounces out past the line into long golden shadows.
1.5-3s: palm leaves sway, the sun dips toward the ocean.
3-4s: a slow push in toward the net with a soft glint of light suggesting another try, the center of the frame open for a banner.
No players on the court.
Audio: a soft descending piano phrase and gentle applause.
Avoid: players on the court, gloomy horror mood, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-20 · Stage 5 Clear 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_05_clear_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_05_clear_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_05_key.webp · **4 s** · 16:9

```text
4-second victory ending video at hillside court at dusk with string lights, terracotta orange hard court (#C4673F), magic hour, pink-purple sky, first string lights turning on, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: string lights flash brighter all at once as the ball lands in.
1.5-3s: the crowd waves glowing phone lights under a pink sky.
3-4s: a slow pull back to a calm wide shot of the court, warm celebratory light, the center of the frame open for a victory banner.
No players on the court.
Audio: a bright victory jingle and crowd cheering.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-21 · Stage 5 Fail 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_05_fail_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_05_fail_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_05_key.webp · **4 s** · 16:9

```text
4-second defeat ending video at hillside court at dusk with string lights, terracotta orange hard court (#C4673F), magic hour, pink-purple sky, first string lights turning on, gentle and hopeful rather than sad, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball rests in the corner under the string lights.
1.5-3s: the first evening star twinkles, lights glow softly on the court.
3-4s: a slow push in toward the net with a soft glint of light suggesting another try, the center of the frame open for a banner.
No players on the court.
Audio: a soft descending piano phrase and gentle applause.
Avoid: players on the court, gloomy horror mood, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-22 · Stage 6 Clear 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_06_clear_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_06_clear_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_06_key.webp · **4 s** · 16:9

```text
4-second victory ending video at modern indoor hall with skylights, blue court, blue urethane court (#2F6FAE) with warm wooden surround (#B9874F), clean even ceiling lights mixed with soft daylight from the skylights, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball skids on the blue court and sprays tiny white sparks.
1.5-3s: scattered spectators rise and applaud, skylight beams brighten.
3-4s: a slow pull back to a calm wide shot of the court, warm celebratory light, the center of the frame open for a victory banner.
No players on the court.
Audio: a bright victory jingle and crowd cheering.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-23 · Stage 6 Fail 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_06_fail_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_06_fail_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_06_key.webp · **4 s** · 16:9

```text
4-second defeat ending video at modern indoor hall with skylights, blue court, blue urethane court (#2F6FAE) with warm wooden surround (#B9874F), clean even ceiling lights mixed with soft daylight from the skylights, gentle and hopeful rather than sad, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball machine stops, one ball rolls along the baseline.
1.5-3s: skylight beams move slowly across the empty court.
3-4s: a slow push in toward the net with a soft glint of light suggesting another try, the center of the frame open for a banner.
No players on the court.
Audio: a soft descending piano phrase and gentle applause.
Avoid: players on the court, gloomy horror mood, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-24 · Stage 7 Clear 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_07_clear_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_07_clear_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_07_key.webp · **4 s** · 16:9

```text
4-second victory ending video at professional indoor arena with LED lights, blue urethane court (#2F6FAE) with wooden surround (#B9874F), bright LED arena lighting, cool white tone, subtle haze, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the arena LEDs pulse in a wave as the ball lands in.
1.5-3s: the packed stands roar, camera flashes sparkle.
3-4s: a slow pull back to a calm wide shot of the court, warm celebratory light, the center of the frame open for a victory banner.
No players on the court.
Audio: a bright victory jingle and crowd cheering.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-25 · Stage 7 Fail 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_07_fail_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_07_fail_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_07_key.webp · **4 s** · 16:9

```text
4-second defeat ending video at professional indoor arena with LED lights, blue urethane court (#2F6FAE) with wooden surround (#B9874F), bright LED arena lighting, cool white tone, subtle haze, gentle and hopeful rather than sad, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball hits the net and the LED lights dim slightly.
1.5-3s: quiet arena hum, glossy reflections on the blue court.
3-4s: a slow push in toward the net with a soft glint of light suggesting another try, the center of the frame open for a banner.
No players on the court.
Audio: a soft descending piano phrase and gentle applause.
Avoid: players on the court, gloomy horror mood, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-26 · Stage 8 Clear 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_08_clear_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_08_clear_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_08_key.webp · **4 s** · 16:9

```text
4-second victory ending video at night stadium under floodlights, navy blue hard court (#24578F), powerful floodlights from four towers, deep navy night sky (#070B1E), realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball streaks under the floodlights with a long glowing trail.
1.5-3s: fans wave scarves, floodlight beams sweep the sky.
3-4s: a slow pull back to a calm wide shot of the court, warm celebratory light, the center of the frame open for a victory banner.
No players on the court.
Audio: a bright victory jingle and crowd cheering.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-27 · Stage 8 Fail 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_08_fail_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_08_fail_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_08_key.webp · **4 s** · 16:9

```text
4-second defeat ending video at night stadium under floodlights, navy blue hard court (#24578F), powerful floodlights from four towers, deep navy night sky (#070B1E), gentle and hopeful rather than sad, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball bounces wide into the dark beyond the lines.
1.5-3s: mist drifts through the floodlight beams, the crowd's murmur fades.
3-4s: a slow push in toward the net with a soft glint of light suggesting another try, the center of the frame open for a banner.
No players on the court.
Audio: a soft descending piano phrase and gentle applause.
Avoid: players on the court, gloomy horror mood, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-28 · Stage 9 Clear 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_09_clear_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_09_clear_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_09_key.webp · **4 s** · 16:9

```text
4-second victory ending video at packed semi-final night stadium, navy blue hard court (#24578F), floodlights plus warm accent spotlights on the court, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: a burst of white sparks as the ball lands on the line.
1.5-3s: thousands of phone lights wave like a sea of stars.
3-4s: a slow pull back to a calm wide shot of the court, warm celebratory light, the center of the frame open for a victory banner.
No players on the court.
Audio: a bright victory jingle and crowd cheering.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-29 · Stage 9 Fail 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_09_fail_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_09_fail_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_09_key.webp · **4 s** · 16:9

```text
4-second defeat ending video at packed semi-final night stadium, navy blue hard court (#24578F), floodlights plus warm accent spotlights on the court, gentle and hopeful rather than sad, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the ball rolls to a stop at the net under a single spotlight.
1.5-3s: the phone lights slowly sway, the stadium hushes.
3-4s: a slow push in toward the net with a soft glint of light suggesting another try, the center of the frame open for a banner.
No players on the court.
Audio: a soft descending piano phrase and gentle applause.
Avoid: players on the court, gloomy horror mood, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-30 · Stage 10 Clear 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_10_clear_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_10_clear_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_10_key.webp · **4 s** · 16:9

```text
4-second victory ending video at grand championship final stadium, navy blue hard court (#24578F), dramatic spotlights converging on center court, light haze, golden accents, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: confetti cannons blast golden confetti as the ball lands in.
1.5-3s: fireworks burst above the bowl, the trophy pedestal shines in a spotlight.
3-4s: a slow pull back to a calm wide shot of the court, warm celebratory light, the center of the frame open for a victory banner.
No players on the court.
Audio: a bright victory jingle and crowd cheering.
Avoid: players on the court, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-31 · Stage 10 Fail 4 s

* **넣을 곳**: raw_assets/images_src/video/stages/stage_10_fail_4s.mp4
* **게임 파일**: public/assets/video/stages/stage_10_fail_4s.mp4
* **Flow 설정**: Video · Veo 3.1 · **Frames to Video** · Start Frame = stage_10_key.webp · **4 s** · 16:9

```text
4-second defeat ending video at grand championship final stadium, navy blue hard court (#24578F), dramatic spotlights converging on center court, light haze, golden accents, gentle and hopeful rather than sad, realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition.
0-1.5s: the trophy pedestal stands empty under a fading spotlight.
1.5-3s: golden confetti drifts unused in the haze, the crowd applauds respectfully.
3-4s: a slow push in toward the net with a soft glint of light suggesting another try, the center of the frame open for a banner.
No players on the court.
Audio: a soft descending piano phrase and gentle applause.
Avoid: players on the court, gloomy horror mood, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### V-32 · Crowd Cheer Loop (선택)

* **넣을 곳**: raw_assets/images_src/video/crowd/crowd_cheer_loop.mp4
* **게임 파일**: public/assets/video/crowd/crowd_cheer_loop.mp4
* **Flow 설정**: Video · Veo 3.1 · Text to Video · 4 s · 16:9

```text
4-second seamless loop of a single row of seated tennis spectators seen from the front on a uniform pure chroma green background (#00FF00), locked-off static camera, people clapping and cheering with raised arms in varied rhythms, bright summer outfits, cel-shaded 3D style with thin outlines, even lighting, the last frame matches the first frame.
Audio: crowd cheering.
Avoid: green clothing, camera movement, floor shadow, text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

## E. Character Motion Video (Character × View × Motion) (11/10 updated)

* **공통 Flow 설정**: Video · Veo 3.1 · **Frames to Video** · **4 s** · 16:9 · Start Frame = 해당 \_start.jpg (End Frame 표시 시 같은 이미지를 End Frame에도).
* **A/B안**: victory / defeat는 Character마다 두 가지 연출이 있다. 둘 다 생성해 보고 더 멋진 쪽을 같은 파일명으로 저장한다.
* **Tier**: 1 = 최소 세트(게임 연결), 2 = 완성 세트(게임 연결), Extra = 추가 Motion(파일 준비 후 Code 연결 예정).
* **사용 구간**: 기획 기준 구간과 Marker. 게임이 실제로 쓰는 구간은 npm run motion:audit가 Clip마다 측정해 tools/motion/motion.config.json → overrides에 기록한다(아래 E.0).

### E.0 Motion 검토 결과 · 게임 반영 · 재생성 권장 (11/10 updated)

132개 Motion Clip(3 Character × Back / Front × 22)을 이 문서와 08 §6의 동작·Stroke 방향·Timing 기준으로 Frame 단위 검토했다. 상세: docs/reports/motion_review.md, 측정값: docs/reports/motion_audit.md.

| 항목 | 검토 결과 | 게임 반영 |
| --- | --- | --- |
| Forehand / Backhand 방향 | char_01/back/reach_bh 1개를 빼고 모두 올바른 쪽 | — |
| Swing Timing | Contact가 기준(Forehand 2.0 s / Backhand 0.9 s)보다 0.05–0.3 s 늦고, Backswing Peak가 1.8–2.1 s | 0.1 s 간격 Frame Grid로 Clip마다 실제 Backswing / Contact를 기록(tools/motion/motion.review.json) → Take-back부터 Follow-through까지 끊김 없이 재생 |
| Serve / Smash | Toss 0.9–1.1 s, Contact 2.1–2.35 s (char_03 front Smash 1.85 s) | Clip별 Marker 보정 |
| char_01/back/reach_bh | Forehand 쪽 Reach로 생성됨 | 제외 → bh_mid로 대체 |
| Back run_right (3 Character) | 몸이 화면 왼쪽을 향한 채 달림 | **11/10 개정 Prompt로 다시 생성 완료** → 게임 연결 (좌우 반전 대체 해제) |
| Back run_left (Susan), run_back (Wolfson) | 쓸 구간 0.7 s / 중간에 Swing | **11/10 다시 생성 완료** → 1.1–1.7 s 반복 주기로 Loop |
| 달리기 Clip 대부분 | 반복 보폭 주기 없음, 끝에서 몸을 돌림, 발이 최대 키의 30 %까지 미끄러짐 | 깨끗한 구간(range)만 사용, 주기가 없으면 Pingpong, 작은 이음새는 0.2 s Crossfade, 발 위치 Frame별 고정(dx) |
| char_02/front/run_right, char_03/back·front/run_back | Clip 중간에 라켓 Swing | 달리는 구간만 사용 |
| Victory / Defeat / Point / Walk-in / Split | 동작 정상 | 동작 구간 자동 추출 |

**다시 생성하면 더 좋아질 Clip (필수 아님)** — 지금도 게임에서 정상 동작하지만, 다시 만들면 대체·반전 없이 원본을 쓸 수 있다.

1. ~~Back run_right 3개 (M-003, M-051, M-099), Susan Back run_left (M-050), Wolfson Back run_back (M-119)~~ → **11/10 다시 생성 완료**
2. char_01/back/reach_bh (M-021) — 생성 전 I-11(Slice Key Pose)의 라켓이 화면 왼쪽에 있는지 확인
3. Swing이 섞인 Front char_02/front/run_right (M-075), char_03/front/run_back (M-143) — NPC라 화면에 작아 생략 가능
4. Back view 달리기(Player용)는 개정 Prompt(옆모습으로 돌아서기 / Net 쪽으로 전진, End Frame 없음)를 쓴다. Front view 달리기는 Action 다음 줄의 Running cycle: 문장을 쓴다.
5. **Back view Backhand 9개 (권장)** — David M-005 · M-013 · M-014, Susan M-053 · M-061 · M-062, Wolfson M-101 · M-109 · M-110. 어깨 회전 없는 테이크백, 큰 원을 그리는 라켓, 머리 뒤로 감기는 팔로스루 → 11/10 개정 Prompt(Unit Turn → 0.3 s 짧은 스윙 → Contact 0.7 s → 오른쪽 귀 옆 피니시) 사용.

새 mp4를 넣은 뒤: npm run motion:audit -- char_0N/view --grid → Grid에서 Marker 확인 후 motion.review.json 수정 → npm run motion:audit -- --write → npm run motion -- char_0N/view.

### ▶ David (데이비드) · CHAR_01 — Back (Player용)

#### M-001 · David · back · idle — Ready 대기

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/idle.mp4
* **게임 파일**: public/assets/motion/char_01/back/idle.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: pingpong · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): ready stance for the full 4 seconds, knees bent, weight on the balls of the feet, gentle rhythmic bouncing, racket held in front with both hands, small natural breathing and shoulder movement, ends in exactly the same pose as the first frame.
Style of movement: steady and composed, small even bounces, eyes locked forward. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-002 · David · back · run_left — 화면 왼쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/run_left.mp4
* **게임 파일**: public/assets/motion/char_01/back/run_left.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · **End Frame 없음** (넣으면 정면 뒷모습으로 묶여 방향이 사라짐)
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: 2.5 s 이후 몸을 돌림 → 1.0–2.5 s 구간만 사용. 다시 만들 때는 아래 Prompt 사용.
* **11/10 검토**: Player용 달리기 Prompt(11/10 개정): Start Frame의 라켓이 화면 왼쪽을 가리키고 End Frame이 정면 뒷모습을 강제해 Flow가 방향을 무시했다. 옆 달리기는 0.5 s 안에 진행 방향 옆모습으로 돌아서게 하고 몸의 모든 부위 방향을 지정한다. run_back은 Player가 Net 쪽으로 다가갈 때 쓰이므로 뒷모습 그대로 앞으로 달린다. **End Frame은 넣지 않는다.** 처음 0.8 s(돌아서는 동작)는 게임이 자동으로 잘라낸다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided image of this exact character standing with his back to the camera.
Camera: the camera stays fixed behind the character at eye level for the whole clip and never moves.
Direction: the character moves toward the LEFT EDGE of the image for the entire clip. Everything about his body points to the left edge of the image.
Action (timed precisely): 0-0.5s he quickly turns his hips, chest, knees and toes a quarter turn so they all point to the left edge of the image; now the camera sees him in side profile running toward the left edge, his free arm and shoulder are nearest to the camera and his racket arm is on the far side of his body, his nose points to the left edge of the image. He holds the racket at waist height in front of his body with both hands, the racket head pointing to the left edge of the image. 0.5-4.0s he runs toward the left edge of the image in place like on a treadmill: the leading foot reaches out toward the left edge, the trailing foot pushes off and follows, the body leans forward toward the left edge, the arms pump gently. The same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s. He never turns back toward the camera, never turns away to face the other direction, and never swings the racket.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Style of movement: efficient smooth running steps with a level head. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: facing the camera, square back view during the run, turning around at the end, moving toward the opposite edge, racket head pointing away from the left edge, racket swing, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-003 · David · back · run_right — 화면 오른쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/run_right.mp4
* **게임 파일**: public/assets/motion/char_01/back/run_right.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · **End Frame 없음** (넣으면 정면 뒷모습으로 묶여 방향이 사라짐)
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: **아래 Prompt로 다시 생성 완료** — 오른쪽을 향한 옆모습으로 달리는 반복 주기 확인, 게임 연결됨.
* **11/10 검토**: Player용 달리기 Prompt(11/10 개정): Start Frame의 라켓이 화면 왼쪽을 가리키고 End Frame이 정면 뒷모습을 강제해 Flow가 방향을 무시했다. 옆 달리기는 0.5 s 안에 진행 방향 옆모습으로 돌아서게 하고 몸의 모든 부위 방향을 지정한다. run_back은 Player가 Net 쪽으로 다가갈 때 쓰이므로 뒷모습 그대로 앞으로 달린다. **End Frame은 넣지 않는다.** 처음 0.8 s(돌아서는 동작)는 게임이 자동으로 잘라낸다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided image of this exact character standing with his back to the camera.
Camera: the camera stays fixed behind the character at eye level for the whole clip and never moves.
Direction: the character moves toward the RIGHT EDGE of the image for the entire clip. Everything about his body points to the right edge of the image.
Action (timed precisely): 0-0.5s he quickly turns his hips, chest, knees and toes a quarter turn so they all point to the right edge of the image; now the camera sees him in side profile running toward the right edge, his right shoulder and racket arm are nearest to the camera, his nose points to the right edge of the image. He swings the racket around so the racket head also points to the right edge of the image, held at waist height in front of his body with both hands. 0.5-4.0s he runs toward the right edge of the image in place like on a treadmill: the leading foot reaches out toward the right edge, the trailing foot pushes off and follows, the body leans forward toward the right edge, the arms pump gently. The same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s. He never turns back toward the camera, never turns away to face the other direction, and never swings the racket.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Style of movement: efficient smooth running steps with a level head. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: facing the camera, square back view during the run, turning around at the end, moving toward the opposite edge, racket head pointing away from the right edge, racket swing, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-004 · David · back · fh_mid — Forehand 허리 높이

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/fh_mid.mp4
* **게임 파일**: public/assets/motion/char_01/back/fh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points away from the camera, and the right hand alone takes the racket back on the character's own right side (toward the right side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at waist height, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: classic semi-western forehand from a neutral stance, clean racket path. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-005 · David · back · bh_mid — Backhand 허리 높이 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/bh_mid.mp4
* **게임 파일**: public/assets/motion/char_01/back/bh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_01/back/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg**
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9
* **11/10 검토**: **11/10 개정 Prompt로 다시 생성 완료** — 짧은 테이크백, 오른쪽 귀 옆 피니시 확인, 게임 연결됨 (backswing 0.75 / contact 1.0).
* **11/10 검토**: Player용 Backhand Prompt(11/10 개정): 기존 Clip은 테이크백에 어깨 회전이 없고, 라켓이 크게 원을 그리며(Contact까지 0.35–0.45 s), 팔로스루가 머리 뒤로 감겼다. 개정 Prompt는 어깨를 옆으로 돌린 자세(Unit Turn)에서 0.3 s 짧은 스윙 → **Contact 0.7 s** → 오른쪽 귀 옆 피니시. Start / End Frame은 그대로(\_bh_key.jpg → \_start.jpg). 사용 구간 0.2–1.6 s · backswing 0.4 / contact 0.7.

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.4s he holds a full unit turn: hips and shoulders are turned a quarter turn to the left, so the left shoulder is closer to the camera and the back of his right shoulder points toward the net, chin tucked over the right shoulder, he keeps the knees bent in an athletic stance, both hands on the handle with the racket head low behind his own LEFT hip, never above shoulder height, the racket stays still with no loop; 0.4-0.7s one fast compact two-handed forward swing: the hips turn first, then the shoulders, the racket travels on a gentle low-to-high path from just below the waist across the front of the body from the left side of the image to the right side of the image, contact with an imaginary ball at waist height, out in front of the body, exactly at 0.7s, both arms extended forward away from the camera at contact; 0.7-1.2s the racket keeps going forward toward the net and then up while the hands keep moving to the RIGHT side of the image, the chest now squarely faces the net, the hands finish at the height of the right shoulder, the racket head points straight up next to the right ear, at 1.2s both hands and the racket are on the right side of the image and nothing is above the left shoulder; 1.2-3.0s the body relaxes and smoothly returns to the neutral ready stance of the end frame; 3.0-4.0s holds that ready stance.
Hand path checkpoints (as seen by the camera behind the player): at 0.7s the hands are out in front of the body just left of the spine, at waist height; at 0.85s the hands pass in front of the chest, hidden by his back; at 1.0s the hands appear above the RIGHT shoulder; at 1.2s the hands rest beside the right ear with the right elbow pointing down and the left elbow pointing forward toward the net. The racket travels like a windshield wiper from the left hip, through the front of the body, to the right shoulder; after contact it is never seen above the left shoulder or above the top of the head, and the hands never stop on the left side of the image.
Body: he stays seen from behind for the whole clip, the head keeps looking toward the net, his face never turns toward the camera and he never turns into a side profile.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the take-back is short and the racket never circles above the shoulders before contact, the shoulders rotate clearly from sideways at the start to square to the net at the finish, contact happens in front of the body, the racket finishes next to the right ear and never wraps around the neck or behind the head.
Style of movement: solid two-handed backhand, compact and precise. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, big looping take-back, racket raised above the head before contact, shoulders staying square during the take-back, racket wrapping around the neck, racket behind the head at the finish, racket lifted over the left shoulder after contact, finish on the left side of the image, hands stopping on the left side after contact, racket over the top of the head, face turned toward the camera, side profile, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-006 · David · back · serve — Toss → Serve

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/serve.mp4
* **게임 파일**: public/assets/motion/char_01/back/serve.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.6–3.2 s · toss 0.8 / contact 2.2

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.8s sideways serve stance at the baseline; at 0.8s the left hand rises to toss an imaginary ball (the hand is empty), reaching the trophy pose at 1.4s with the racket cocked behind the head; 1.4-2.2s the knees bend and the body explodes upward, the racket hits the imaginary ball at full overhead extension exactly at 2.2s; 2.2-3.0s follow-through across the body, landing one step forward; 3.0-4.0s recover to the ready stance.
Style of movement: classic platform serve with a fluid, even rhythm. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-007 · David · back · victory — Match 승리 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/victory.mp4
* **게임 파일**: public/assets/motion/char_01/back/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s confident celebration: a strong fist pump, then the racket raised high overhead with a proud smile; 3.7-4.0s holds the final triumphant pose still.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-008 · David · back · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/victory.mp4
* **게임 파일**: public/assets/motion/char_01/back/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s a calm nod, points the racket toward the crowd, then a controlled double fist pump; 3.7-4.0s holds the final pose still.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-009 · David · back · defeat — Match 패배 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/defeat.mp4
* **게임 파일**: public/assets/motion/char_01/back/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s hands on knees, a deep breath, then a small resigned nod; 3.7-4.0s holds the final pose still, disappointed but hopeful, never tragic.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-010 · David · back · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/defeat.mp4
* **게임 파일**: public/assets/motion/char_01/back/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s looks up at the sky, exhales slowly, taps the racket strings and resets calmly; 3.7-4.0s holds the final pose still, hopeful, never tragic.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-011 · David · back · fh_high — Forehand 어깨 높이 / Smash 대체

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/fh_high.mp4
* **게임 파일**: public/assets/motion/char_01/back/fh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points away from the camera, and the right hand alone takes the racket back on the character's own right side (toward the right side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at shoulder-to-head height with an extended arm, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing high over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: controlled high forehand, stays perfectly balanced. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-012 · David · back · fh_low — Forehand 무릎 높이

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/fh_low.mp4
* **게임 파일**: public/assets/motion/char_01/back/fh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points away from the camera, and the right hand alone takes the racket back on the character's own right side (toward the right side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at knee height after bending the knees deeply, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through brushing low-to-high and finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: deep knee bend with a smooth low-to-high lift. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-013 · David · back · bh_high — Backhand 어깨 높이 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/bh_high.mp4
* **게임 파일**: public/assets/motion/char_01/back/bh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_01/back/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9
* **11/10 검토**: **11/10 보강 Prompt로 다시 생성 완료** (1차본은 Contact 뒤 왼쪽 어깨 위로 올라가 불합격) — 어깨 높이 Contact, 1.0 s에 오른쪽 귀 옆 피니시, 게임 연결됨 (backswing 0.6 / contact 0.8).
* **11/10 검토**: Player용 Backhand Prompt(11/10 개정): 기존 Clip은 테이크백에 어깨 회전이 없고, 라켓이 크게 원을 그리며(Contact까지 0.35–0.45 s), 팔로스루가 머리 뒤로 감겼다. 개정 Prompt는 어깨를 옆으로 돌린 자세(Unit Turn)에서 0.3 s 짧은 스윙 → **Contact 0.7 s** → 오른쪽 귀 옆 피니시. Start / End Frame은 그대로(\_bh_key.jpg → \_start.jpg). 사용 구간 0.2–1.6 s · backswing 0.4 / contact 0.7.

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.4s he holds a full unit turn: hips and shoulders are turned a quarter turn to the left, so the left shoulder is closer to the camera and the back of his right shoulder points toward the net, chin tucked over the right shoulder, he stands tall with the knees only slightly bent, both hands on the handle with the racket head low behind his own LEFT hip, never above shoulder height, the racket stays still with no loop; 0.4-0.7s one fast compact two-handed forward swing: the hips turn first, then the shoulders, the racket travels on a level, flat path at shoulder height across the front of the body from the left side of the image to the right side of the image, contact with an imaginary ball at shoulder height, out in front of the body, exactly at 0.7s, both arms extended forward away from the camera at contact; 0.7-1.2s the racket keeps going forward toward the net and then up while the hands keep moving to the RIGHT side of the image, the chest now squarely faces the net, the hands finish just above the right shoulder, the racket head points straight up next to the right ear, at 1.2s both hands and the racket are on the right side of the image and nothing is above the left shoulder; 1.2-3.0s the body relaxes and smoothly returns to the neutral ready stance of the end frame; 3.0-4.0s holds that ready stance.
Hand path checkpoints (as seen by the camera behind the player): at 0.7s the hands are out in front of the body just left of the spine, at shoulder height; at 0.85s the hands pass in front of the chest, hidden by his back; at 1.0s the hands appear above the RIGHT shoulder; at 1.2s the hands rest beside the right ear with the right elbow pointing down and the left elbow pointing forward toward the net. The racket travels like a windshield wiper from the left hip, through the front of the body, to the right shoulder; after contact it is never seen above the left shoulder or above the top of the head, and the hands never stop on the left side of the image.
Body: he stays seen from behind for the whole clip, the head keeps looking toward the net, his face never turns toward the camera and he never turns into a side profile.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the take-back is short and the racket never circles above the shoulders before contact, the shoulders rotate clearly from sideways at the start to square to the net at the finish, contact happens in front of the body, the racket finishes next to the right ear and never wraps around the neck or behind the head.
Style of movement: compact high backhand, firm and steady. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, big looping take-back, racket raised above the head before contact, shoulders staying square during the take-back, racket wrapping around the neck, racket behind the head at the finish, racket lifted over the left shoulder after contact, finish on the left side of the image, hands stopping on the left side after contact, racket over the top of the head, face turned toward the camera, side profile, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-014 · David · back · bh_low — Backhand 무릎 높이 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/bh_low.mp4
* **게임 파일**: public/assets/motion/char_01/back/bh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_01/back/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9
* **11/10 검토**: **11/10 다시 생성 완료** — 짧은 테이크백, 라켓이 무릎 높이까지 내려감(무릎은 깊게 굽히지 않음), 게임 연결됨 (backswing 0.65 / contact 0.9).
* **11/10 검토**: Player용 Backhand Prompt(11/10 개정): 기존 Clip은 테이크백에 어깨 회전이 없고, 라켓이 크게 원을 그리며(Contact까지 0.35–0.45 s), 팔로스루가 머리 뒤로 감겼다. 개정 Prompt는 어깨를 옆으로 돌린 자세(Unit Turn)에서 0.3 s 짧은 스윙 → **Contact 0.7 s** → 오른쪽 귀 옆 피니시. Start / End Frame은 그대로(\_bh_key.jpg → \_start.jpg). 사용 구간 0.2–1.6 s · backswing 0.4 / contact 0.7.

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.4s he holds a full unit turn: hips and shoulders are turned a quarter turn to the left, so the left shoulder is closer to the camera and the back of his right shoulder points toward the net, chin tucked over the right shoulder, he bends both knees deeply and keeps the back straight, both feet stay planted parallel to the baseline at shoulder width with no lunge or step toward the left side of the image, both hands on the handle with the racket head low behind his own LEFT hip, never above shoulder height, the racket stays still with no loop; 0.4-0.7s one fast compact two-handed forward swing: the hips turn first, then the shoulders, the racket travels on a low-to-high lifting path starting from below the knees across the front of the body from the left side of the image to the right side of the image, contact with an imaginary ball at knee height, out in front of the body, exactly at 0.7s, both arms extended forward away from the camera at contact; 0.7-1.2s the racket keeps going forward toward the net and then up while the hands keep moving to the RIGHT side of the image, the chest now squarely faces the net, the hands finish at the height of the right shoulder, the racket head points straight up next to the right ear, at 1.2s both hands and the racket are on the right side of the image and nothing is above the left shoulder; 1.2-3.0s the body relaxes and smoothly returns to the neutral ready stance of the end frame; 3.0-4.0s holds that ready stance.
Hand path checkpoints (as seen by the camera behind the player): at 0.7s the hands are out in front of the body just left of the spine, at knee height; at 0.85s the hands pass in front of the chest, hidden by his back; at 1.0s the hands appear above the RIGHT shoulder; at 1.2s the hands rest beside the right ear with the right elbow pointing down and the left elbow pointing forward toward the net. The racket travels like a windshield wiper from the left hip, through the front of the body, to the right shoulder; after contact it is never seen above the left shoulder or above the top of the head, and the hands never stop on the left side of the image.
Body: he stays seen from behind for the whole clip, the head keeps looking toward the net, his face never turns toward the camera and he never turns into a side profile.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the take-back is short and the racket never circles above the shoulders before contact, the shoulders rotate clearly from sideways at the start to square to the net at the finish, contact happens in front of the body, the racket finishes next to the right ear and never wraps around the neck or behind the head.
Style of movement: deep balanced knee bend, smooth lift. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, big looping take-back, racket raised above the head before contact, shoulders staying square during the take-back, racket wrapping around the neck, racket behind the head at the finish, racket lifted over the left shoulder after contact, finish on the left side of the image, hands stopping on the left side after contact, racket over the top of the head, face turned toward the camera, side profile, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-015 · David · back · serve_ready — Serve 대기

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/serve_ready.mp4
* **게임 파일**: public/assets/motion/char_01/back/serve_ready.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: loop · **사용 구간**: 0.5–3.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): standing sideways at the baseline preparing to serve, calm focused breathing, small weight shifts between the feet, adjusting the racket grip, looking toward the opponent, subtle continuous motion, ends in the same pose as the first frame, the hands are empty (no ball).
Style of movement: a deep calm breath and a small nod, eyes forward. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-016 · David · back · split — Split Step

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/split.mp4
* **게임 파일**: public/assets/motion/char_01/back/split.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.6–2.4 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.6s ready stance; 1.6-2.0s a small explosive split-step hop with both feet, landing wide and balanced exactly at 2.0s; 2.0-4.0s alert ready stance, ending in the same pose as the first frame.
Style of movement: textbook balanced split step. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-017 · David · back · point_win — 득점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/point_win.mp4
* **게임 파일**: public/assets/motion/char_01/back/point_win.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s a short fist pump and a calm "come on", tapping the racket against the palm; 2.5-4.0s returns to the ready stance.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-018 · David · back · point_lose — 실점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/point_lose.mp4
* **게임 파일**: public/assets/motion/char_01/back/point_lose.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s shakes the head slightly and straightens the racket strings with the fingers; 2.5-4.0s returns to the ready stance.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-019 · David · back · smash — Smash

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/smash.mp4
* **게임 파일**: public/assets/motion/char_01/back/smash.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.0–3.0 s · contact 2.0

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.0s backpedals in place into a sideways stance with the left hand pointing up at an imaginary high ball; 1.0-1.6s racket cocked behind the head; jumps and hits at full overhead extension exactly at 2.0s; 2.0-2.8s violent follow-through and landing; 2.8-4.0s recover to the ready stance.
Style of movement: controlled precise smash. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-020 · David · back · reach_fh — 먼 공 Forehand (Extended Reach)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/reach_fh.mp4
* **게임 파일**: public/assets/motion/char_01/back/reach_fh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.1–2.9 s · contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s a big lunge step toward the character's own forehand (right) side (toward the right side of the image) while the right hand alone takes the racket back on the right side; the right arm and racket are fully extended at contact out to the right side exactly at 2.0s; 2.0-2.8s stretched forehand follow-through; 2.8-4.0s push off and recover to the ready stance in the center.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: a long balanced lunge. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-021 · David · back · reach_bh — 먼 공 Backhand (Slice Reach) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/reach_bh.mp4
* **게임 파일**: public/assets/motion/char_01/back/reach_bh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_01/back/\_slice_key.jpg** · **End Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg**
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9
* **11/10 검토**: Backhand인데 Forehand 쪽(화면 오른쪽)으로 뻗는 Reach로 생성됨 → 게임에서 제외하고 bh_mid로 대체. **다시 생성 권장** (Start Frame = \_slice_key.jpg 확인).

```text
4-second character motion clip of a tennis player hitting a one-handed backhand slice, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the one-handed slice backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.5s holds the coiled one-handed slice backswing and wide lunge of the start frame, the backswing peaks exactly at 0.5s; 0.5-0.9s high-to-low slice swing across the front of the body from the left side of the image to the right side of the image, the racket arm fully stretched, contact with an imaginary low ball exactly at 0.9s, back of the racket hand facing forward; 0.9-1.7s slice follow-through with the left arm extended backward; 1.7-3.2s pushes off and recovers to the neutral ready stance of the end frame in the center; 3.2-4.0s holds that ready stance.
Stroke check: only the right hand holds the racket, the swing starts from the coiled pose of the start frame with the racket head high behind the character's own LEFT shoulder, the racket travels high-to-low across the front of the body from the left side of the image to the right side of the image, the back of the racket hand faces forward at contact in front of the left hip, the left arm extends backward for balance.
Style of movement: a clean low slice with a balanced lunge. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed swing, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-022 · David · back · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/run_forward.mp4
* **게임 파일**: public/assets/motion/char_01/back/run_forward.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): from 0.5s, running in place toward the camera like on a treadmill, steady rhythm, racket ready in front, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: smooth even strides. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-023 · David · back · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/run_back.mp4
* **게임 파일**: public/assets/motion/char_01/back/run_back.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · **End Frame 없음** (넣으면 정면 뒷모습으로 묶여 방향이 사라짐)
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Player용 달리기 Prompt(11/10 개정): Start Frame의 라켓이 화면 왼쪽을 가리키고 End Frame이 정면 뒷모습을 강제해 Flow가 방향을 무시했다. 옆 달리기는 0.5 s 안에 진행 방향 옆모습으로 돌아서게 하고 몸의 모든 부위 방향을 지정한다. run_back은 Player가 Net 쪽으로 다가갈 때 쓰이므로 뒷모습 그대로 앞으로 달린다. **End Frame은 넣지 않는다.** 처음 0.8 s(돌아서는 동작)는 게임이 자동으로 잘라낸다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided image of this exact character standing with his back to the camera.
Camera: the camera stays fixed behind the character at eye level for the whole clip and never moves.
Direction: the character runs straight ahead, AWAY FROM THE CAMERA, toward the far distance in front of him (toward the tennis net) for the entire clip. He is seen from directly behind for the whole clip: his back, the back of his head and the soles of his shoes are what the camera sees; his face is never visible.
Action (timed precisely): 0-0.5s he leans his upper body forward and pushes off into a forward run. 0.5-4.0s he runs forward away from the camera in place like on a treadmill: strong knee drive forward, each foot kicks back toward the camera after push-off so the soles of the shoes flash toward the camera, the arms pump forward and back, the racket is held in front of his chest with both hands in the ready position with the racket head up. The same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s. He never turns sideways, never turns around to face the camera, never runs backward, and never swings the racket at any time.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Style of movement: efficient smooth running steps with a level head. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: face visible, turning sideways, side profile, turning around, running backward, backpedaling, racket swing, forehand, backhand, hitting motion, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-024 · David · back · walk_in — Match 입장

* **넣을 곳**: raw_assets/images_src/motion/char_01/back/walk_in.mp4
* **게임 파일**: public/assets/motion/char_01/back/walk_in.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/back/\_start.jpg · End Frame 없음
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.0–4.0 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): walks calmly in place with confident steps, bouncing on the toes, rolling the shoulders and swinging the racket loosely, settling into the ready stance at 3.5s.
Style of movement: composed and focused, adjusts the headband. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### ▶ David (데이비드) · CHAR_01 — Front (NPC용)

#### M-025 · David · front · idle — Ready 대기

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/idle.mp4
* **게임 파일**: public/assets/motion/char_01/front/idle.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: pingpong · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): ready stance for the full 4 seconds, knees bent, weight on the balls of the feet, gentle rhythmic bouncing, racket held in front with both hands, small natural breathing and shoulder movement, ends in exactly the same pose as the first frame.
Style of movement: steady and composed, small even bounces, eyes locked forward. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-026 · David · front · run_left — 화면 왼쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/run_left.mp4
* **게임 파일**: public/assets/motion/char_01/front/run_left.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): from 0.5s, running sideways toward the screen-left direction (the left side of the image) in place like on a treadmill, quick side-shuffle steps, racket held ready in front, body leaning slightly into the movement, continuous steady rhythm, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: efficient smooth shuffle steps with a level head. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-027 · David · front · run_right — 화면 오른쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/run_right.mp4
* **게임 파일**: public/assets/motion/char_01/front/run_right.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): from 0.5s, running sideways toward the screen-right direction (the right side of the image) in place like on a treadmill, quick side-shuffle steps, racket held ready in front, body leaning slightly into the movement, continuous steady rhythm, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: efficient smooth shuffle steps with a level head. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-028 · David · front · fh_mid — Forehand 허리 높이

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/fh_mid.mp4
* **게임 파일**: public/assets/motion/char_01/front/fh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points toward the camera, and the right hand alone takes the racket back on the character's own right side (toward the left side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at waist height, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: classic semi-western forehand from a neutral stance, clean racket path. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-029 · David · front · bh_mid — Backhand 허리 높이

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/bh_mid.mp4
* **게임 파일**: public/assets/motion/char_01/front/bh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_01/front/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg**
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.5s holds the coiled two-handed backswing of the start frame with a tiny loading settle, both hands on the handle, the backswing peaks exactly at 0.5s; 0.5-0.9s fast two-handed forward swing across the front of the body from the right side of the image to the left side of the image, contact with an imaginary ball at waist height, in front of the left hip, exactly at 0.9s; 0.9-1.7s two-handed follow-through over the character's own right shoulder with both hands still on the handle; 1.7-3.2s the body unwinds and smoothly recovers to the neutral ready stance of the end frame; 3.2-4.0s holds that ready stance.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the swing starts from the coiled pose of the start frame with the racket behind the character's own LEFT hip, the racket travels across the front of the body from the right side of the image to the left side of the image, contact happens in front of the left hip, the finish is high over the right shoulder with both hands still on the handle.
Style of movement: solid two-handed backhand, compact and precise. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-030 · David · front · serve — Toss → Serve

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/serve.mp4
* **게임 파일**: public/assets/motion/char_01/front/serve.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.6–3.2 s · toss 0.8 / contact 2.2

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.8s sideways serve stance at the baseline; at 0.8s the left hand rises to toss an imaginary ball (the hand is empty), reaching the trophy pose at 1.4s with the racket cocked behind the head; 1.4-2.2s the knees bend and the body explodes upward, the racket hits the imaginary ball at full overhead extension exactly at 2.2s; 2.2-3.0s follow-through across the body, landing one step forward; 3.0-4.0s recover to the ready stance.
Style of movement: classic platform serve with a fluid, even rhythm. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-031 · David · front · victory — Match 승리 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/victory.mp4
* **게임 파일**: public/assets/motion/char_01/front/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s confident celebration: a strong fist pump, then the racket raised high overhead with a proud smile; 3.7-4.0s holds the final triumphant pose still.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-032 · David · front · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/victory.mp4
* **게임 파일**: public/assets/motion/char_01/front/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s a calm nod, points the racket toward the crowd, then a controlled double fist pump; 3.7-4.0s holds the final pose still.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-033 · David · front · defeat — Match 패배 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/defeat.mp4
* **게임 파일**: public/assets/motion/char_01/front/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s hands on knees, a deep breath, then a small resigned nod; 3.7-4.0s holds the final pose still, disappointed but hopeful, never tragic.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-034 · David · front · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/defeat.mp4
* **게임 파일**: public/assets/motion/char_01/front/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s looks up at the sky, exhales slowly, taps the racket strings and resets calmly; 3.7-4.0s holds the final pose still, hopeful, never tragic.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-035 · David · front · fh_high — Forehand 어깨 높이 / Smash 대체

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/fh_high.mp4
* **게임 파일**: public/assets/motion/char_01/front/fh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points toward the camera, and the right hand alone takes the racket back on the character's own right side (toward the left side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at shoulder-to-head height with an extended arm, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing high over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: controlled high forehand, stays perfectly balanced. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-036 · David · front · fh_low — Forehand 무릎 높이

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/fh_low.mp4
* **게임 파일**: public/assets/motion/char_01/front/fh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points toward the camera, and the right hand alone takes the racket back on the character's own right side (toward the left side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at knee height after bending the knees deeply, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through brushing low-to-high and finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: deep knee bend with a smooth low-to-high lift. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-037 · David · front · bh_high — Backhand 어깨 높이

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/bh_high.mp4
* **게임 파일**: public/assets/motion/char_01/front/bh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_01/front/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.5s holds the coiled two-handed backswing of the start frame with a tiny loading settle, both hands on the handle, the backswing peaks exactly at 0.5s; 0.5-0.9s fast two-handed forward swing across the front of the body from the right side of the image to the left side of the image, contact with an imaginary ball at shoulder height, in front of the left hip, exactly at 0.9s; 0.9-1.7s two-handed follow-through finishing high over the character's own right shoulder with both hands still on the handle; 1.7-3.2s the body unwinds and smoothly recovers to the neutral ready stance of the end frame; 3.2-4.0s holds that ready stance.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the swing starts from the coiled pose of the start frame with the racket behind the character's own LEFT hip, the racket travels across the front of the body from the right side of the image to the left side of the image, contact happens in front of the left hip, the finish is high over the right shoulder with both hands still on the handle.
Style of movement: compact high backhand, firm and steady. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-038 · David · front · bh_low — Backhand 무릎 높이

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/bh_low.mp4
* **게임 파일**: public/assets/motion/char_01/front/bh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_01/front/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.5s holds the coiled two-handed backswing of the start frame with a tiny loading settle, both hands on the handle, the backswing peaks exactly at 0.5s; 0.5-0.9s fast two-handed forward swing across the front of the body from the right side of the image to the left side of the image, contact with an imaginary ball at knee height with a deep knee bend, in front of the left hip, exactly at 0.9s; 0.9-1.7s two-handed follow-through lifting up over the character's own right shoulder with both hands still on the handle; 1.7-3.2s the body unwinds and smoothly recovers to the neutral ready stance of the end frame; 3.2-4.0s holds that ready stance.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the swing starts from the coiled pose of the start frame with the racket behind the character's own LEFT hip, the racket travels across the front of the body from the right side of the image to the left side of the image, contact happens in front of the left hip, the finish is high over the right shoulder with both hands still on the handle.
Style of movement: deep balanced knee bend, smooth lift. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-039 · David · front · serve_ready — Serve 대기

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/serve_ready.mp4
* **게임 파일**: public/assets/motion/char_01/front/serve_ready.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: loop · **사용 구간**: 0.5–3.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): standing sideways at the baseline preparing to serve, calm focused breathing, small weight shifts between the feet, adjusting the racket grip, looking toward the opponent, subtle continuous motion, ends in the same pose as the first frame, the hands are empty (no ball).
Style of movement: a deep calm breath and a small nod, eyes forward. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-040 · David · front · split — Split Step

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/split.mp4
* **게임 파일**: public/assets/motion/char_01/front/split.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.6–2.4 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.6s ready stance; 1.6-2.0s a small explosive split-step hop with both feet, landing wide and balanced exactly at 2.0s; 2.0-4.0s alert ready stance, ending in the same pose as the first frame.
Style of movement: textbook balanced split step. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-041 · David · front · point_win — 득점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/point_win.mp4
* **게임 파일**: public/assets/motion/char_01/front/point_win.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s a short fist pump and a calm "come on", tapping the racket against the palm; 2.5-4.0s returns to the ready stance.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-042 · David · front · point_lose — 실점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/point_lose.mp4
* **게임 파일**: public/assets/motion/char_01/front/point_lose.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s shakes the head slightly and straightens the racket strings with the fingers; 2.5-4.0s returns to the ready stance.
Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-043 · David · front · smash — Smash

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/smash.mp4
* **게임 파일**: public/assets/motion/char_01/front/smash.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.0–3.0 s · contact 2.0

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.0s backpedals in place into a sideways stance with the left hand pointing up at an imaginary high ball; 1.0-1.6s racket cocked behind the head; jumps and hits at full overhead extension exactly at 2.0s; 2.0-2.8s violent follow-through and landing; 2.8-4.0s recover to the ready stance.
Style of movement: controlled precise smash. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-044 · David · front · reach_fh — 먼 공 Forehand (Extended Reach)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/reach_fh.mp4
* **게임 파일**: public/assets/motion/char_01/front/reach_fh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.1–2.9 s · contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s a big lunge step toward the character's own forehand (right) side (toward the left side of the image) while the right hand alone takes the racket back on the right side; the right arm and racket are fully extended at contact out to the right side exactly at 2.0s; 2.0-2.8s stretched forehand follow-through; 2.8-4.0s push off and recover to the ready stance in the center.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: a long balanced lunge. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-045 · David · front · reach_bh — 먼 공 Backhand (Slice Reach)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/reach_bh.mp4
* **게임 파일**: public/assets/motion/char_01/front/reach_bh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_01/front/\_slice_key.jpg** · **End Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg**
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a one-handed backhand slice, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the one-handed slice backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): 0-0.5s holds the coiled one-handed slice backswing and wide lunge of the start frame, the backswing peaks exactly at 0.5s; 0.5-0.9s high-to-low slice swing across the front of the body from the right side of the image to the left side of the image, the racket arm fully stretched, contact with an imaginary low ball exactly at 0.9s, back of the racket hand facing forward; 0.9-1.7s slice follow-through with the left arm extended backward; 1.7-3.2s pushes off and recovers to the neutral ready stance of the end frame in the center; 3.2-4.0s holds that ready stance.
Stroke check: only the right hand holds the racket, the swing starts from the coiled pose of the start frame with the racket head high behind the character's own LEFT shoulder, the racket travels high-to-low across the front of the body from the right side of the image to the left side of the image, the back of the racket hand faces forward at contact in front of the left hip, the left arm extends backward for balance.
Style of movement: a clean low slice with a balanced lunge. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed swing, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-046 · David · front · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/run_forward.mp4
* **게임 파일**: public/assets/motion/char_01/front/run_forward.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): from 0.5s, running in place toward the camera like on a treadmill, steady rhythm, racket ready in front, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: smooth even strides. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-047 · David · front · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/run_back.mp4
* **게임 파일**: public/assets/motion/char_01/front/run_back.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): from 0.5s, backpedaling in place away from the camera like on a treadmill, small quick backward steps, racket ready, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: controlled backpedal. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-048 · David · front · walk_in — Match 입장

* **넣을 곳**: raw_assets/images_src/motion/char_01/front/walk_in.mp4
* **게임 파일**: public/assets/motion/char_01/front/walk_in.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_01/front/\_start.jpg · End Frame 없음
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.0–4.0 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape.
Action (timed precisely): walks calmly in place with confident steps, bouncing on the toes, rolling the shoulders and swinging the racket loosely, settling into the ready stance at 3.5s.
Style of movement: composed and focused, adjusts the headband. Tempo and personality: smooth, textbook technique, balanced and controlled, relaxed shoulders.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### ▶ Susan (수잔) · CHAR_02 — Back (Player용)

#### M-049 · Susan · back · idle — Ready 대기

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/idle.mp4
* **게임 파일**: public/assets/motion/char_02/back/idle.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: pingpong · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): ready stance for the full 4 seconds, knees bent, weight on the balls of the feet, gentle rhythmic bouncing, racket held in front with both hands, small natural breathing and shoulder movement, ends in exactly the same pose as the first frame.
Style of movement: light springy bounces on the toes, ponytail swaying, a quick racket twirl in the hand at 2s. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-050 · Susan · back · run_left — 화면 왼쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/run_left.mp4
* **게임 파일**: public/assets/motion/char_02/back/run_left.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · **End Frame 없음** (넣으면 정면 뒷모습으로 묶여 방향이 사라짐)
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: **아래 Prompt로 다시 생성 완료** — 3.8 s부터 돌아서므로 1.0–3.6 s 구간 사용.
* **11/10 검토**: Player용 달리기 Prompt(11/10 개정): Start Frame의 라켓이 화면 왼쪽을 가리키고 End Frame이 정면 뒷모습을 강제해 Flow가 방향을 무시했다. 옆 달리기는 0.5 s 안에 진행 방향 옆모습으로 돌아서게 하고 몸의 모든 부위 방향을 지정한다. run_back은 Player가 Net 쪽으로 다가갈 때 쓰이므로 뒷모습 그대로 앞으로 달린다. **End Frame은 넣지 않는다.** 처음 0.8 s(돌아서는 동작)는 게임이 자동으로 잘라낸다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided image of this exact character standing with her back to the camera.
Camera: the camera stays fixed behind the character at eye level for the whole clip and never moves.
Direction: the character moves toward the LEFT EDGE of the image for the entire clip. Everything about her body points to the left edge of the image.
Action (timed precisely): 0-0.5s she quickly turns her hips, chest, knees and toes a quarter turn so they all point to the left edge of the image; now the camera sees her in side profile running toward the left edge, her free arm and shoulder are nearest to the camera and her racket arm is on the far side of her body, her nose points to the left edge of the image. She holds the racket at waist height in front of her body with both hands, the racket head pointing to the left edge of the image. 0.5-4.0s she runs toward the left edge of the image in place like on a treadmill: the leading foot reaches out toward the left edge, the trailing foot pushes off and follows, the body leans forward toward the left edge, the arms pump gently, her ponytail streams back behind her head away from the left edge. The same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s. She never turns back toward the camera, never turns away to face the other direction, and never swings the racket.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Style of movement: quick light running steps on the balls of the feet, springy rhythm, ponytail bouncing with every step. Tempo and personality: quick and light, springy footwork, agile and cheerful.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: facing the camera, square back view during the run, turning around at the end, moving toward the opposite edge, racket head pointing away from the left edge, racket swing, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-051 · Susan · back · run_right — 화면 오른쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/run_right.mp4
* **게임 파일**: public/assets/motion/char_02/back/run_right.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · **End Frame 없음** (넣으면 정면 뒷모습으로 묶여 방향이 사라짐)
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: **아래 Prompt로 다시 생성 완료** — 오른쪽을 향한 옆모습으로 달리는 반복 주기 확인, 게임 연결됨.
* **11/10 검토**: Player용 달리기 Prompt(11/10 개정): Start Frame의 라켓이 화면 왼쪽을 가리키고 End Frame이 정면 뒷모습을 강제해 Flow가 방향을 무시했다. 옆 달리기는 0.5 s 안에 진행 방향 옆모습으로 돌아서게 하고 몸의 모든 부위 방향을 지정한다. run_back은 Player가 Net 쪽으로 다가갈 때 쓰이므로 뒷모습 그대로 앞으로 달린다. **End Frame은 넣지 않는다.** 처음 0.8 s(돌아서는 동작)는 게임이 자동으로 잘라낸다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided image of this exact character standing with her back to the camera.
Camera: the camera stays fixed behind the character at eye level for the whole clip and never moves.
Direction: the character moves toward the RIGHT EDGE of the image for the entire clip. Everything about her body points to the right edge of the image.
Action (timed precisely): 0-0.5s she quickly turns her hips, chest, knees and toes a quarter turn so they all point to the right edge of the image; now the camera sees her in side profile running toward the right edge, her right shoulder and racket arm are nearest to the camera, her nose points to the right edge of the image. She swings the racket around so the racket head also points to the right edge of the image, held at waist height in front of her body with both hands. 0.5-4.0s she runs toward the right edge of the image in place like on a treadmill: the leading foot reaches out toward the right edge, the trailing foot pushes off and follows, the body leans forward toward the right edge, the arms pump gently, her ponytail streams back behind her head away from the right edge. The same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s. She never turns back toward the camera, never turns away to face the other direction, and never swings the racket.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Style of movement: quick light running steps on the balls of the feet, springy rhythm, ponytail bouncing with every step. Tempo and personality: quick and light, springy footwork, agile and cheerful.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: facing the camera, square back view during the run, turning around at the end, moving toward the opposite edge, racket head pointing away from the right edge, racket swing, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-052 · Susan · back · fh_mid — Forehand 허리 높이

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/fh_mid.mp4
* **게임 파일**: public/assets/motion/char_02/back/fh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points away from the camera, and the right hand alone takes the racket back on the character's own right side (toward the right side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at waist height, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: compact open-stance forehand with a quick wrist snap and a small hop at contact. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-053 · Susan · back · bh_mid — Backhand 허리 높이 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/bh_mid.mp4
* **게임 파일**: public/assets/motion/char_02/back/bh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_02/back/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg**
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9
* **11/10 검토**: **11/10 2차 생성본 적용** (M-053 v2) — 짧은 테이크백, Key Pose가 4분의 3 뒷모습이라 피니시는 오른쪽 어깨 위로 감기는 형태. 기존(큰 원 테이크백 + 목 감김)보다 개선, 게임 연결됨 (backswing 0.65 / contact 0.85).
* **11/10 검토**: Player용 Backhand Prompt(11/10 개정): 기존 Clip은 테이크백에 어깨 회전이 없고, 라켓이 크게 원을 그리며(Contact까지 0.35–0.45 s), 팔로스루가 머리 뒤로 감겼다. 개정 Prompt는 어깨를 옆으로 돌린 자세(Unit Turn)에서 0.3 s 짧은 스윙 → **Contact 0.7 s** → 오른쪽 귀 옆 피니시. Start / End Frame은 그대로(\_bh_key.jpg → \_start.jpg). 사용 구간 0.2–1.6 s · backswing 0.4 / contact 0.7.

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.4s she holds a full unit turn: hips and shoulders are turned a quarter turn to the left, so the left shoulder is closer to the camera and the back of her right shoulder points toward the net, chin tucked over the right shoulder, she keeps the knees bent in an athletic stance, both hands on the handle with the racket head low behind her own LEFT hip, never above shoulder height, the racket stays still with no loop; 0.4-0.7s one fast compact two-handed forward swing: the hips turn first, then the shoulders, the racket travels on a gentle low-to-high path from just below the waist across the front of the body from the left side of the image to the right side of the image, contact with an imaginary ball at waist height, out in front of the body, exactly at 0.7s, both arms extended forward away from the camera at contact; 0.7-1.2s the racket keeps going forward toward the net and then up while the hands keep moving to the RIGHT side of the image, the chest now squarely faces the net, the hands finish at the height of the right shoulder, the racket head points straight up next to the right ear, at 1.2s both hands and the racket are on the right side of the image and nothing is above the left shoulder; 1.2-3.0s the body relaxes and smoothly returns to the neutral ready stance of the end frame; 3.0-4.0s holds that ready stance.
Hand path checkpoints (as seen by the camera behind the player): at 0.7s the hands are out in front of the body just left of the spine, at waist height; at 0.85s the hands pass in front of the chest, hidden by her back; at 1.0s the hands appear above the RIGHT shoulder; at 1.2s the hands rest beside the right ear with the right elbow pointing down and the left elbow pointing forward toward the net. The racket travels like a windshield wiper from the left hip, through the front of the body, to the right shoulder; after contact it is never seen above the left shoulder or above the top of the head, and the hands never stop on the left side of the image.
Body: she stays seen from behind for the whole clip, the head keeps looking toward the net, her face never turns toward the camera and she never turns into a side profile.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the take-back is short and the racket never circles above the shoulders before contact, the shoulders rotate clearly from sideways at the start to square to the net at the finish, contact happens in front of the body, the racket finishes next to the right ear and never wraps around the neck or behind the head.
Style of movement: quick two-handed backhand with fast hands and a light hop. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, big looping take-back, racket raised above the head before contact, shoulders staying square during the take-back, racket wrapping around the neck, racket behind the head at the finish, racket lifted over the left shoulder after contact, finish on the left side of the image, hands stopping on the left side after contact, racket over the top of the head, face turned toward the camera, side profile, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-054 · Susan · back · serve — Toss → Serve

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/serve.mp4
* **게임 파일**: public/assets/motion/char_02/back/serve.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.6–3.2 s · toss 0.8 / contact 2.2

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.8s sideways serve stance at the baseline; at 0.8s the left hand rises to toss an imaginary ball (the hand is empty), reaching the trophy pose at 1.4s with the racket cocked behind the head; 1.4-2.2s the knees bend and the body explodes upward, the racket hits the imaginary ball at full overhead extension exactly at 2.2s; 2.2-3.0s follow-through across the body, landing one step forward; 3.0-4.0s recover to the ready stance.
Style of movement: quick pinpoint serve with a light jump and a soft landing. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-055 · Susan · back · victory — Match 승리 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/victory.mp4
* **게임 파일**: public/assets/motion/char_02/back/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s joyful celebration: jumps with both feet, spins the racket in her hand, ponytail flying, cheerful shout; 3.7-4.0s holds the final triumphant pose still.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-056 · Susan · back · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/victory.mp4
* **게임 파일**: public/assets/motion/char_02/back/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s skips forward, waves to the crowd with both hands, then a happy twirl with the racket raised; 3.7-4.0s holds the final pose still.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-057 · Susan · back · defeat — Match 패배 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/defeat.mp4
* **게임 파일**: public/assets/motion/char_02/back/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s covers her face briefly with one hand, then shakes it off with a small bounce; 3.7-4.0s holds the final pose still, disappointed but hopeful, never tragic.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-058 · Susan · back · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/defeat.mp4
* **게임 파일**: public/assets/motion/char_02/back/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s sits back on her heels for a moment, then stands up with a determined clap; 3.7-4.0s holds the final pose still, hopeful, never tragic.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-059 · Susan · back · fh_high — Forehand 어깨 높이 / Smash 대체

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/fh_high.mp4
* **게임 파일**: public/assets/motion/char_02/back/fh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points away from the camera, and the right hand alone takes the racket back on the character's own right side (toward the right side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at shoulder-to-head height with an extended arm, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing high over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: a small jump to meet the high ball with a quick snap. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-060 · Susan · back · fh_low — Forehand 무릎 높이

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/fh_low.mp4
* **게임 파일**: public/assets/motion/char_02/back/fh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points away from the camera, and the right hand alone takes the racket back on the character's own right side (toward the right side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at knee height after bending the knees deeply, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through brushing low-to-high and finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: drops low quickly with a short sliding step. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-061 · Susan · back · bh_high — Backhand 어깨 높이 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/bh_high.mp4
* **게임 파일**: public/assets/motion/char_02/back/bh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_02/back/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9
* **11/10 검토**: **11/10 다시 생성 완료** (M-061) — 어깨 높이 Contact, 오른쪽 어깨 위 피니시, 게임 연결됨 (backswing 0.8 / contact 1.05).
* **11/10 검토**: Player용 Backhand Prompt(11/10 개정): 기존 Clip은 테이크백에 어깨 회전이 없고, 라켓이 크게 원을 그리며(Contact까지 0.35–0.45 s), 팔로스루가 머리 뒤로 감겼다. 개정 Prompt는 어깨를 옆으로 돌린 자세(Unit Turn)에서 0.3 s 짧은 스윙 → **Contact 0.7 s** → 오른쪽 귀 옆 피니시. Start / End Frame은 그대로(\_bh_key.jpg → \_start.jpg). 사용 구간 0.2–1.6 s · backswing 0.4 / contact 0.7.

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.4s she holds a full unit turn: hips and shoulders are turned a quarter turn to the left, so the left shoulder is closer to the camera and the back of her right shoulder points toward the net, chin tucked over the right shoulder, she stands tall with the knees only slightly bent, both hands on the handle with the racket head low behind her own LEFT hip, never above shoulder height, the racket stays still with no loop; 0.4-0.7s one fast compact two-handed forward swing: the hips turn first, then the shoulders, the racket travels on a level, flat path at shoulder height across the front of the body from the left side of the image to the right side of the image, contact with an imaginary ball at shoulder height, out in front of the body, exactly at 0.7s, both arms extended forward away from the camera at contact; 0.7-1.2s the racket keeps going forward toward the net and then up while the hands keep moving to the RIGHT side of the image, the chest now squarely faces the net, the hands finish just above the right shoulder, the racket head points straight up next to the right ear, at 1.2s both hands and the racket are on the right side of the image and nothing is above the left shoulder; 1.2-3.0s the body relaxes and smoothly returns to the neutral ready stance of the end frame; 3.0-4.0s holds that ready stance.
Hand path checkpoints (as seen by the camera behind the player): at 0.7s the hands are out in front of the body just left of the spine, at shoulder height; at 0.85s the hands pass in front of the chest, hidden by her back; at 1.0s the hands appear above the RIGHT shoulder; at 1.2s the hands rest beside the right ear with the right elbow pointing down and the left elbow pointing forward toward the net. The racket travels like a windshield wiper from the left hip, through the front of the body, to the right shoulder; after contact it is never seen above the left shoulder or above the top of the head, and the hands never stop on the left side of the image.
Body: she stays seen from behind for the whole clip, the head keeps looking toward the net, her face never turns toward the camera and she never turns into a side profile.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the take-back is short and the racket never circles above the shoulders before contact, the shoulders rotate clearly from sideways at the start to square to the net at the finish, contact happens in front of the body, the racket finishes next to the right ear and never wraps around the neck or behind the head.
Style of movement: quick hands, takes the high ball early on the rise. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, big looping take-back, racket raised above the head before contact, shoulders staying square during the take-back, racket wrapping around the neck, racket behind the head at the finish, racket lifted over the left shoulder after contact, finish on the left side of the image, hands stopping on the left side after contact, racket over the top of the head, face turned toward the camera, side profile, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-062 · Susan · back · bh_low — Backhand 무릎 높이 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/bh_low.mp4
* **게임 파일**: public/assets/motion/char_02/back/bh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_02/back/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9
* **11/10 검토**: **11/10 2차 생성본 적용** (M-062 v2) — 무릎 높이 Contact, 잠깐 옆모습 후 1.8 s에 뒷모습 복귀. 기존(정면으로 돌아서 얼굴이 보임)보다 개선, 게임 연결됨 (backswing 0.65 / contact 0.9).
* **11/10 검토**: Player용 Backhand Prompt(11/10 개정): 기존 Clip은 테이크백에 어깨 회전이 없고, 라켓이 크게 원을 그리며(Contact까지 0.35–0.45 s), 팔로스루가 머리 뒤로 감겼다. 개정 Prompt는 어깨를 옆으로 돌린 자세(Unit Turn)에서 0.3 s 짧은 스윙 → **Contact 0.7 s** → 오른쪽 귀 옆 피니시. Start / End Frame은 그대로(\_bh_key.jpg → \_start.jpg). 사용 구간 0.2–1.6 s · backswing 0.4 / contact 0.7.

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.4s she holds a full unit turn: hips and shoulders are turned a quarter turn to the left, so the left shoulder is closer to the camera and the back of her right shoulder points toward the net, chin tucked over the right shoulder, she bends both knees deeply and keeps the back straight, both feet stay planted parallel to the baseline at shoulder width with no lunge or step toward the left side of the image, both hands on the handle with the racket head low behind her own LEFT hip, never above shoulder height, the racket stays still with no loop; 0.4-0.7s one fast compact two-handed forward swing: the hips turn first, then the shoulders, the racket travels on a low-to-high lifting path starting from below the knees across the front of the body from the left side of the image to the right side of the image, contact with an imaginary ball at knee height, out in front of the body, exactly at 0.7s, both arms extended forward away from the camera at contact; 0.7-1.2s the racket keeps going forward toward the net and then up while the hands keep moving to the RIGHT side of the image, the chest now squarely faces the net, the hands finish at the height of the right shoulder, the racket head points straight up next to the right ear, at 1.2s both hands and the racket are on the right side of the image and nothing is above the left shoulder; 1.2-3.0s the body relaxes and smoothly returns to the neutral ready stance of the end frame; 3.0-4.0s holds that ready stance.
Hand path checkpoints (as seen by the camera behind the player): at 0.7s the hands are out in front of the body just left of the spine, at knee height; at 0.85s the hands pass in front of the chest, hidden by her back; at 1.0s the hands appear above the RIGHT shoulder; at 1.2s the hands rest beside the right ear with the right elbow pointing down and the left elbow pointing forward toward the net. The racket travels like a windshield wiper from the left hip, through the front of the body, to the right shoulder; after contact it is never seen above the left shoulder or above the top of the head, and the hands never stop on the left side of the image.
Body: she stays seen from behind for the whole clip, the head keeps looking toward the net, her face never turns toward the camera and she never turns into a side profile.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the take-back is short and the racket never circles above the shoulders before contact, the shoulders rotate clearly from sideways at the start to square to the net at the finish, contact happens in front of the body, the racket finishes next to the right ear and never wraps around the neck or behind the head.
Style of movement: low quick crouch with a light sliding step. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, big looping take-back, racket raised above the head before contact, shoulders staying square during the take-back, racket wrapping around the neck, racket behind the head at the finish, racket lifted over the left shoulder after contact, finish on the left side of the image, hands stopping on the left side after contact, racket over the top of the head, face turned toward the camera, side profile, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-063 · Susan · back · serve_ready — Serve 대기

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/serve_ready.mp4
* **게임 파일**: public/assets/motion/char_02/back/serve_ready.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: loop · **사용 구간**: 0.5–3.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): standing sideways at the baseline preparing to serve, calm focused breathing, small weight shifts between the feet, adjusting the racket grip, looking toward the opponent, subtle continuous motion, ends in the same pose as the first frame, the hands are empty (no ball).
Style of movement: rocks quickly heel to toe and adjusts her visor. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-064 · Susan · back · split — Split Step

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/split.mp4
* **게임 파일**: public/assets/motion/char_02/back/split.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.6–2.4 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.6s ready stance; 1.6-2.0s a small explosive split-step hop with both feet, landing wide and balanced exactly at 2.0s; 2.0-4.0s alert ready stance, ending in the same pose as the first frame.
Style of movement: very quick, slightly higher split step with a feather-light landing. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-065 · Susan · back · point_win — 득점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/point_win.mp4
* **게임 파일**: public/assets/motion/char_02/back/point_win.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s a small hop and a racket twirl with a cheerful "yes!"; 2.5-4.0s returns to the ready stance.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-066 · Susan · back · point_lose — 실점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/point_lose.mp4
* **게임 파일**: public/assets/motion/char_02/back/point_lose.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s puffs her cheeks, then a quick bounce to reset; 2.5-4.0s returns to the ready stance.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-067 · Susan · back · smash — Smash

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/smash.mp4
* **게임 파일**: public/assets/motion/char_02/back/smash.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.0–3.0 s · contact 2.0

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.0s backpedals in place into a sideways stance with the left hand pointing up at an imaginary high ball; 1.0-1.6s racket cocked behind the head; jumps and hits at full overhead extension exactly at 2.0s; 2.0-2.8s violent follow-through and landing; 2.8-4.0s recover to the ready stance.
Style of movement: a high scissor-kick jump smash. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-068 · Susan · back · reach_fh — 먼 공 Forehand (Extended Reach)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/reach_fh.mp4
* **게임 파일**: public/assets/motion/char_02/back/reach_fh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.1–2.9 s · contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s a big lunge step toward the character's own forehand (right) side (toward the right side of the image) while the right hand alone takes the racket back on the right side; the right arm and racket are fully extended at contact out to the right side exactly at 2.0s; 2.0-2.8s stretched forehand follow-through; 2.8-4.0s push off and recover to the ready stance in the center.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: a fast sliding lunge, almost a split. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-069 · Susan · back · reach_bh — 먼 공 Backhand (Slice Reach)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/reach_bh.mp4
* **게임 파일**: public/assets/motion/char_02/back/reach_bh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_02/back/\_slice_key.jpg** · **End Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg**
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a one-handed backhand slice, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the one-handed slice backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.5s holds the coiled one-handed slice backswing and wide lunge of the start frame, the backswing peaks exactly at 0.5s; 0.5-0.9s high-to-low slice swing across the front of the body from the left side of the image to the right side of the image, the racket arm fully stretched, contact with an imaginary low ball exactly at 0.9s, back of the racket hand facing forward; 0.9-1.7s slice follow-through with the left arm extended backward; 1.7-3.2s pushes off and recovers to the neutral ready stance of the end frame in the center; 3.2-4.0s holds that ready stance.
Stroke check: only the right hand holds the racket, the swing starts from the coiled pose of the start frame with the racket head high behind the character's own LEFT shoulder, the racket travels high-to-low across the front of the body from the left side of the image to the right side of the image, the back of the racket hand faces forward at contact in front of the left hip, the left arm extends backward for balance.
Style of movement: a quick sliding slice, light on the feet. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed swing, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-070 · Susan · back · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/run_forward.mp4
* **게임 파일**: public/assets/motion/char_02/back/run_forward.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): from 0.5s, running in place toward the camera like on a treadmill, steady rhythm, racket ready in front, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: quick light steps. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-071 · Susan · back · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/run_back.mp4
* **게임 파일**: public/assets/motion/char_02/back/run_back.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · **End Frame 없음** (넣으면 정면 뒷모습으로 묶여 방향이 사라짐)
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Player용 달리기 Prompt(11/10 개정): Start Frame의 라켓이 화면 왼쪽을 가리키고 End Frame이 정면 뒷모습을 강제해 Flow가 방향을 무시했다. 옆 달리기는 0.5 s 안에 진행 방향 옆모습으로 돌아서게 하고 몸의 모든 부위 방향을 지정한다. run_back은 Player가 Net 쪽으로 다가갈 때 쓰이므로 뒷모습 그대로 앞으로 달린다. **End Frame은 넣지 않는다.** 처음 0.8 s(돌아서는 동작)는 게임이 자동으로 잘라낸다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided image of this exact character standing with her back to the camera.
Camera: the camera stays fixed behind the character at eye level for the whole clip and never moves.
Direction: the character runs straight ahead, AWAY FROM THE CAMERA, toward the far distance in front of her (toward the tennis net) for the entire clip. She is seen from directly behind for the whole clip: her back, the back of her head and the soles of her shoes are what the camera sees; her face is never visible.
Action (timed precisely): 0-0.5s she leans her upper body forward and pushes off into a forward run. 0.5-4.0s she runs forward away from the camera in place like on a treadmill: strong knee drive forward, each foot kicks back toward the camera after push-off so the soles of the shoes flash toward the camera, the arms pump forward and back, the racket is held in front of her chest with both hands in the ready position with the racket head up. The same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s. She never turns sideways, never turns around to face the camera, never runs backward, and never swings the racket at any time.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Style of movement: quick light running steps on the balls of the feet, springy rhythm, ponytail bouncing with every step. Tempo and personality: quick and light, springy footwork, agile and cheerful.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: face visible, turning sideways, side profile, turning around, running backward, backpedaling, racket swing, forehand, backhand, hitting motion, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-072 · Susan · back · walk_in — Match 입장

* **넣을 곳**: raw_assets/images_src/motion/char_02/back/walk_in.mp4
* **게임 파일**: public/assets/motion/char_02/back/walk_in.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/back/\_start.jpg · End Frame 없음
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.0–4.0 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): walks calmly in place with confident steps, bouncing on the toes, rolling the shoulders and swinging the racket loosely, settling into the ready stance at 3.5s.
Style of movement: bouncy and cheerful, tightens her ponytail. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### ▶ Susan (수잔) · CHAR_02 — Front (NPC용)

#### M-073 · Susan · front · idle — Ready 대기

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/idle.mp4
* **게임 파일**: public/assets/motion/char_02/front/idle.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: pingpong · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): ready stance for the full 4 seconds, knees bent, weight on the balls of the feet, gentle rhythmic bouncing, racket held in front with both hands, small natural breathing and shoulder movement, ends in exactly the same pose as the first frame.
Style of movement: light springy bounces on the toes, ponytail swaying, a quick racket twirl in the hand at 2s. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-074 · Susan · front · run_left — 화면 왼쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/run_left.mp4
* **게임 파일**: public/assets/motion/char_02/front/run_left.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): from 0.5s, running sideways toward the screen-left direction (the left side of the image) in place like on a treadmill, quick side-shuffle steps, racket held ready in front, body leaning slightly into the movement, continuous steady rhythm, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: fast light crossover steps, ponytail flying sideways. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-075 · Susan · front · run_right — 화면 오른쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/run_right.mp4
* **게임 파일**: public/assets/motion/char_02/front/run_right.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Clip 중간에 라켓 Swing이 들어 있음 → 달리는 2.2–3.9 s 구간만 사용. **다시 생성 권장**.
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): from 0.5s, running sideways toward the screen-right direction (the right side of the image) in place like on a treadmill, quick side-shuffle steps, racket held ready in front, body leaning slightly into the movement, continuous steady rhythm, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: fast light crossover steps, ponytail flying sideways. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-076 · Susan · front · fh_mid — Forehand 허리 높이

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/fh_mid.mp4
* **게임 파일**: public/assets/motion/char_02/front/fh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points toward the camera, and the right hand alone takes the racket back on the character's own right side (toward the left side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at waist height, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: compact open-stance forehand with a quick wrist snap and a small hop at contact. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-077 · Susan · front · bh_mid — Backhand 허리 높이

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/bh_mid.mp4
* **게임 파일**: public/assets/motion/char_02/front/bh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_02/front/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg**
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.5s holds the coiled two-handed backswing of the start frame with a tiny loading settle, both hands on the handle, the backswing peaks exactly at 0.5s; 0.5-0.9s fast two-handed forward swing across the front of the body from the right side of the image to the left side of the image, contact with an imaginary ball at waist height, in front of the left hip, exactly at 0.9s; 0.9-1.7s two-handed follow-through over the character's own right shoulder with both hands still on the handle; 1.7-3.2s the body unwinds and smoothly recovers to the neutral ready stance of the end frame; 3.2-4.0s holds that ready stance.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the swing starts from the coiled pose of the start frame with the racket behind the character's own LEFT hip, the racket travels across the front of the body from the right side of the image to the left side of the image, contact happens in front of the left hip, the finish is high over the right shoulder with both hands still on the handle.
Style of movement: quick two-handed backhand with fast hands and a light hop. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-078 · Susan · front · serve — Toss → Serve

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/serve.mp4
* **게임 파일**: public/assets/motion/char_02/front/serve.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.6–3.2 s · toss 0.8 / contact 2.2

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.8s sideways serve stance at the baseline; at 0.8s the left hand rises to toss an imaginary ball (the hand is empty), reaching the trophy pose at 1.4s with the racket cocked behind the head; 1.4-2.2s the knees bend and the body explodes upward, the racket hits the imaginary ball at full overhead extension exactly at 2.2s; 2.2-3.0s follow-through across the body, landing one step forward; 3.0-4.0s recover to the ready stance.
Style of movement: quick pinpoint serve with a light jump and a soft landing. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-079 · Susan · front · victory — Match 승리 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/victory.mp4
* **게임 파일**: public/assets/motion/char_02/front/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s joyful celebration: jumps with both feet, spins the racket in her hand, ponytail flying, cheerful shout; 3.7-4.0s holds the final triumphant pose still.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-080 · Susan · front · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/victory.mp4
* **게임 파일**: public/assets/motion/char_02/front/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s skips forward, waves to the crowd with both hands, then a happy twirl with the racket raised; 3.7-4.0s holds the final pose still.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-081 · Susan · front · defeat — Match 패배 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/defeat.mp4
* **게임 파일**: public/assets/motion/char_02/front/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s covers her face briefly with one hand, then shakes it off with a small bounce; 3.7-4.0s holds the final pose still, disappointed but hopeful, never tragic.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-082 · Susan · front · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/defeat.mp4
* **게임 파일**: public/assets/motion/char_02/front/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s sits back on her heels for a moment, then stands up with a determined clap; 3.7-4.0s holds the final pose still, hopeful, never tragic.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-083 · Susan · front · fh_high — Forehand 어깨 높이 / Smash 대체

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/fh_high.mp4
* **게임 파일**: public/assets/motion/char_02/front/fh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points toward the camera, and the right hand alone takes the racket back on the character's own right side (toward the left side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at shoulder-to-head height with an extended arm, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing high over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: a small jump to meet the high ball with a quick snap. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-084 · Susan · front · fh_low — Forehand 무릎 높이

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/fh_low.mp4
* **게임 파일**: public/assets/motion/char_02/front/fh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points toward the camera, and the right hand alone takes the racket back on the character's own right side (toward the left side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at knee height after bending the knees deeply, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through brushing low-to-high and finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: drops low quickly with a short sliding step. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-085 · Susan · front · bh_high — Backhand 어깨 높이

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/bh_high.mp4
* **게임 파일**: public/assets/motion/char_02/front/bh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_02/front/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.5s holds the coiled two-handed backswing of the start frame with a tiny loading settle, both hands on the handle, the backswing peaks exactly at 0.5s; 0.5-0.9s fast two-handed forward swing across the front of the body from the right side of the image to the left side of the image, contact with an imaginary ball at shoulder height, in front of the left hip, exactly at 0.9s; 0.9-1.7s two-handed follow-through finishing high over the character's own right shoulder with both hands still on the handle; 1.7-3.2s the body unwinds and smoothly recovers to the neutral ready stance of the end frame; 3.2-4.0s holds that ready stance.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the swing starts from the coiled pose of the start frame with the racket behind the character's own LEFT hip, the racket travels across the front of the body from the right side of the image to the left side of the image, contact happens in front of the left hip, the finish is high over the right shoulder with both hands still on the handle.
Style of movement: quick hands, takes the high ball early on the rise. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-086 · Susan · front · bh_low — Backhand 무릎 높이

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/bh_low.mp4
* **게임 파일**: public/assets/motion/char_02/front/bh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_02/front/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.5s holds the coiled two-handed backswing of the start frame with a tiny loading settle, both hands on the handle, the backswing peaks exactly at 0.5s; 0.5-0.9s fast two-handed forward swing across the front of the body from the right side of the image to the left side of the image, contact with an imaginary ball at knee height with a deep knee bend, in front of the left hip, exactly at 0.9s; 0.9-1.7s two-handed follow-through lifting up over the character's own right shoulder with both hands still on the handle; 1.7-3.2s the body unwinds and smoothly recovers to the neutral ready stance of the end frame; 3.2-4.0s holds that ready stance.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the swing starts from the coiled pose of the start frame with the racket behind the character's own LEFT hip, the racket travels across the front of the body from the right side of the image to the left side of the image, contact happens in front of the left hip, the finish is high over the right shoulder with both hands still on the handle.
Style of movement: low quick crouch with a light sliding step. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-087 · Susan · front · serve_ready — Serve 대기

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/serve_ready.mp4
* **게임 파일**: public/assets/motion/char_02/front/serve_ready.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: loop · **사용 구간**: 0.5–3.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): standing sideways at the baseline preparing to serve, calm focused breathing, small weight shifts between the feet, adjusting the racket grip, looking toward the opponent, subtle continuous motion, ends in the same pose as the first frame, the hands are empty (no ball).
Style of movement: rocks quickly heel to toe and adjusts her visor. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-088 · Susan · front · split — Split Step

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/split.mp4
* **게임 파일**: public/assets/motion/char_02/front/split.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.6–2.4 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.6s ready stance; 1.6-2.0s a small explosive split-step hop with both feet, landing wide and balanced exactly at 2.0s; 2.0-4.0s alert ready stance, ending in the same pose as the first frame.
Style of movement: very quick, slightly higher split step with a feather-light landing. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-089 · Susan · front · point_win — 득점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/point_win.mp4
* **게임 파일**: public/assets/motion/char_02/front/point_win.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s a small hop and a racket twirl with a cheerful "yes!"; 2.5-4.0s returns to the ready stance.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-090 · Susan · front · point_lose — 실점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/point_lose.mp4
* **게임 파일**: public/assets/motion/char_02/front/point_lose.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s puffs her cheeks, then a quick bounce to reset; 2.5-4.0s returns to the ready stance.
Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-091 · Susan · front · smash — Smash

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/smash.mp4
* **게임 파일**: public/assets/motion/char_02/front/smash.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.0–3.0 s · contact 2.0

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.0s backpedals in place into a sideways stance with the left hand pointing up at an imaginary high ball; 1.0-1.6s racket cocked behind the head; jumps and hits at full overhead extension exactly at 2.0s; 2.0-2.8s violent follow-through and landing; 2.8-4.0s recover to the ready stance.
Style of movement: a high scissor-kick jump smash. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-092 · Susan · front · reach_fh — 먼 공 Forehand (Extended Reach)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/reach_fh.mp4
* **게임 파일**: public/assets/motion/char_02/front/reach_fh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.1–2.9 s · contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s a big lunge step toward the character's own forehand (right) side (toward the left side of the image) while the right hand alone takes the racket back on the right side; the right arm and racket are fully extended at contact out to the right side exactly at 2.0s; 2.0-2.8s stretched forehand follow-through; 2.8-4.0s push off and recover to the ready stance in the center.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: a fast sliding lunge, almost a split. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-093 · Susan · front · reach_bh — 먼 공 Backhand (Slice Reach)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/reach_bh.mp4
* **게임 파일**: public/assets/motion/char_02/front/reach_bh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_02/front/\_slice_key.jpg** · **End Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg**
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a one-handed backhand slice, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the one-handed slice backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): 0-0.5s holds the coiled one-handed slice backswing and wide lunge of the start frame, the backswing peaks exactly at 0.5s; 0.5-0.9s high-to-low slice swing across the front of the body from the right side of the image to the left side of the image, the racket arm fully stretched, contact with an imaginary low ball exactly at 0.9s, back of the racket hand facing forward; 0.9-1.7s slice follow-through with the left arm extended backward; 1.7-3.2s pushes off and recovers to the neutral ready stance of the end frame in the center; 3.2-4.0s holds that ready stance.
Stroke check: only the right hand holds the racket, the swing starts from the coiled pose of the start frame with the racket head high behind the character's own LEFT shoulder, the racket travels high-to-low across the front of the body from the right side of the image to the left side of the image, the back of the racket hand faces forward at contact in front of the left hip, the left arm extends backward for balance.
Style of movement: a quick sliding slice, light on the feet. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed swing, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-094 · Susan · front · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/run_forward.mp4
* **게임 파일**: public/assets/motion/char_02/front/run_forward.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): from 0.5s, running in place toward the camera like on a treadmill, steady rhythm, racket ready in front, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: quick light steps. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-095 · Susan · front · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/run_back.mp4
* **게임 파일**: public/assets/motion/char_02/front/run_back.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): from 0.5s, backpedaling in place away from the camera like on a treadmill, small quick backward steps, racket ready, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: nimble quick backpedal. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-096 · Susan · front · walk_in — Match 입장

* **넣을 곳**: raw_assets/images_src/motion/char_02/front/walk_in.mp4
* **게임 파일**: public/assets/motion/char_02/front/walk_in.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_02/front/\_start.jpg · End Frame 없음
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.0–4.0 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape.
Action (timed precisely): walks calmly in place with confident steps, bouncing on the toes, rolling the shoulders and swinging the racket loosely, settling into the ready stance at 3.5s.
Style of movement: bouncy and cheerful, tightens her ponytail. Tempo and personality: quick and light, springy footwork, compact sharp swing, ponytail bouncing.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### ▶ Wolfson (울프슨) · CHAR_03 — Back (Player용)

#### M-097 · Wolfson · back · idle — Ready 대기

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/idle.mp4
* **게임 파일**: public/assets/motion/char_03/back/idle.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: pingpong · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): ready stance for the full 4 seconds, knees bent, weight on the balls of the feet, gentle rhythmic bouncing, racket held in front with both hands, small natural breathing and shoulder movement, ends in exactly the same pose as the first frame.
Style of movement: heavy grounded stance, slow powerful shoulder roll, taps the racket once against the shoe. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-098 · Wolfson · back · run_left — 화면 왼쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/run_left.mp4
* **게임 파일**: public/assets/motion/char_03/back/run_left.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · **End Frame 없음** (넣으면 정면 뒷모습으로 묶여 방향이 사라짐)
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Player용 달리기 Prompt(11/10 개정): Start Frame의 라켓이 화면 왼쪽을 가리키고 End Frame이 정면 뒷모습을 강제해 Flow가 방향을 무시했다. 옆 달리기는 0.5 s 안에 진행 방향 옆모습으로 돌아서게 하고 몸의 모든 부위 방향을 지정한다. run_back은 Player가 Net 쪽으로 다가갈 때 쓰이므로 뒷모습 그대로 앞으로 달린다. **End Frame은 넣지 않는다.** 처음 0.8 s(돌아서는 동작)는 게임이 자동으로 잘라낸다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided image of this exact character standing with his back to the camera.
Camera: the camera stays fixed behind the character at eye level for the whole clip and never moves.
Direction: the character moves toward the LEFT EDGE of the image for the entire clip. Everything about his body points to the left edge of the image.
Action (timed precisely): 0-0.5s he quickly turns his hips, chest, knees and toes a quarter turn so they all point to the left edge of the image; now the camera sees him in side profile running toward the left edge, his free arm and shoulder are nearest to the camera and his racket arm is on the far side of his body, his nose points to the left edge of the image. He holds the racket at waist height in front of his body with both hands, the racket head pointing to the left edge of the image. 0.5-4.0s he runs toward the left edge of the image in place like on a treadmill: the leading foot reaches out toward the left edge, the trailing foot drives hard off the ground and follows, the body leans forward toward the left edge, the arms pump powerfully. The same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s. He never turns back toward the camera, never turns away to face the other direction, and never swings the racket.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Style of movement: big powerful running strides with heavy footfalls, strong knee drive, low center of gravity. Tempo and personality: heavy and explosive, powerful driving legs, determined.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: facing the camera, square back view during the run, turning around at the end, moving toward the opposite edge, racket head pointing away from the left edge, racket swing, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-099 · Wolfson · back · run_right — 화면 오른쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/run_right.mp4
* **게임 파일**: public/assets/motion/char_03/back/run_right.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · **End Frame 없음** (넣으면 정면 뒷모습으로 묶여 방향이 사라짐)
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: **아래 Prompt로 다시 생성 완료** — 오른쪽을 향한 옆모습으로 달리는 반복 주기 확인, 게임 연결됨.
* **11/10 검토**: Player용 달리기 Prompt(11/10 개정): Start Frame의 라켓이 화면 왼쪽을 가리키고 End Frame이 정면 뒷모습을 강제해 Flow가 방향을 무시했다. 옆 달리기는 0.5 s 안에 진행 방향 옆모습으로 돌아서게 하고 몸의 모든 부위 방향을 지정한다. run_back은 Player가 Net 쪽으로 다가갈 때 쓰이므로 뒷모습 그대로 앞으로 달린다. **End Frame은 넣지 않는다.** 처음 0.8 s(돌아서는 동작)는 게임이 자동으로 잘라낸다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided image of this exact character standing with his back to the camera.
Camera: the camera stays fixed behind the character at eye level for the whole clip and never moves.
Direction: the character moves toward the RIGHT EDGE of the image for the entire clip. Everything about his body points to the right edge of the image.
Action (timed precisely): 0-0.5s he quickly turns his hips, chest, knees and toes a quarter turn so they all point to the right edge of the image; now the camera sees him in side profile running toward the right edge, his right shoulder and racket arm are nearest to the camera, his nose points to the right edge of the image. He swings the racket around so the racket head also points to the right edge of the image, held at waist height in front of his body with both hands. 0.5-4.0s he runs toward the right edge of the image in place like on a treadmill: the leading foot reaches out toward the right edge, the trailing foot drives hard off the ground and follows, the body leans forward toward the right edge, the arms pump powerfully. The same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s. He never turns back toward the camera, never turns away to face the other direction, and never swings the racket.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Style of movement: big powerful running strides with heavy footfalls, strong knee drive, low center of gravity. Tempo and personality: heavy and explosive, powerful driving legs, determined.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: facing the camera, square back view during the run, turning around at the end, moving toward the opposite edge, racket head pointing away from the right edge, racket swing, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-100 · Wolfson · back · fh_mid — Forehand 허리 높이

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/fh_mid.mp4
* **게임 파일**: public/assets/motion/char_03/back/fh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points away from the camera, and the right hand alone takes the racket back on the character's own right side (toward the right side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at waist height, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: heavy topspin forehand with a huge loop backswing and a windshield-wiper finish. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-101 · Wolfson · back · bh_mid — Backhand 허리 높이 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/bh_mid.mp4
* **게임 파일**: public/assets/motion/char_03/back/bh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_03/back/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg**
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9
* **11/10 검토**: **11/10 2차 생성본 적용** (M-101 v2) — 짧은 테이크백, 1.2 s부터 오른쪽 귀 옆 피니시, 게임 연결됨 (backswing 0.7 / contact 0.9).
* **11/10 검토**: Player용 Backhand Prompt(11/10 개정): 기존 Clip은 테이크백에 어깨 회전이 없고, 라켓이 크게 원을 그리며(Contact까지 0.35–0.45 s), 팔로스루가 머리 뒤로 감겼다. 개정 Prompt는 어깨를 옆으로 돌린 자세(Unit Turn)에서 0.3 s 짧은 스윙 → **Contact 0.7 s** → 오른쪽 귀 옆 피니시. Start / End Frame은 그대로(\_bh_key.jpg → \_start.jpg). 사용 구간 0.2–1.6 s · backswing 0.4 / contact 0.7.

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.4s he holds a full unit turn: hips and shoulders are turned a quarter turn to the left, so the left shoulder is closer to the camera and the back of his right shoulder points toward the net, chin tucked over the right shoulder, he keeps the knees bent in an athletic stance, both hands on the handle with the racket head low behind his own LEFT hip, never above shoulder height, the racket stays still with no loop; 0.4-0.7s one fast compact two-handed forward swing: the hips turn first, then the shoulders, the racket travels on a gentle low-to-high path from just below the waist across the front of the body from the left side of the image to the right side of the image, contact with an imaginary ball at waist height, out in front of the body, exactly at 0.7s, both arms extended forward away from the camera at contact; 0.7-1.2s the racket keeps going forward toward the net and then up while the hands keep moving to the RIGHT side of the image, the chest now squarely faces the net, the hands finish at the height of the right shoulder, the racket head points straight up next to the right ear, at 1.2s both hands and the racket are on the right side of the image and nothing is above the left shoulder; 1.2-3.0s the body relaxes and smoothly returns to the neutral ready stance of the end frame; 3.0-4.0s holds that ready stance.
Hand path checkpoints (as seen by the camera behind the player): at 0.7s the hands are out in front of the body just left of the spine, at waist height; at 0.85s the hands pass in front of the chest, hidden by his back; at 1.0s the hands appear above the RIGHT shoulder; at 1.2s the hands rest beside the right ear with the right elbow pointing down and the left elbow pointing forward toward the net. The racket travels like a windshield wiper from the left hip, through the front of the body, to the right shoulder; after contact it is never seen above the left shoulder or above the top of the head, and the hands never stop on the left side of the image.
Body: he stays seen from behind for the whole clip, the head keeps looking toward the net, his face never turns toward the camera and he never turns into a side profile.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the take-back is short and the racket never circles above the shoulders before contact, the shoulders rotate clearly from sideways at the start to square to the net at the finish, contact happens in front of the body, the racket finishes next to the right ear and never wraps around the neck or behind the head.
Style of movement: powerful two-handed backhand with a big shoulder turn and strong hip drive. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, big looping take-back, racket raised above the head before contact, shoulders staying square during the take-back, racket wrapping around the neck, racket behind the head at the finish, racket lifted over the left shoulder after contact, finish on the left side of the image, hands stopping on the left side after contact, racket over the top of the head, face turned toward the camera, side profile, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-102 · Wolfson · back · serve — Toss → Serve

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/serve.mp4
* **게임 파일**: public/assets/motion/char_03/back/serve.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.6–3.2 s · toss 0.8 / contact 2.2

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.8s sideways serve stance at the baseline; at 0.8s the left hand rises to toss an imaginary ball (the hand is empty), reaching the trophy pose at 1.4s with the racket cocked behind the head; 1.4-2.2s the knees bend and the body explodes upward, the racket hits the imaginary ball at full overhead extension exactly at 2.2s; 2.2-3.0s follow-through across the body, landing one step forward; 3.0-4.0s recover to the ready stance.
Style of movement: big pinpoint power serve with a deep knee bend and a huge leap. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-103 · Wolfson · back · victory — Match 승리 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/victory.mp4
* **게임 파일**: public/assets/motion/char_03/back/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s thunderous celebration: roars with both arms flexed and the racket held high overhead; 3.7-4.0s holds the final triumphant pose still.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-104 · Wolfson · back · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/victory.mp4
* **게임 파일**: public/assets/motion/char_03/back/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s drops to his knees and roars to the sky, then rises and beats his chest once; 3.7-4.0s holds the final pose still.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-105 · Wolfson · back · defeat — Match 패배 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/defeat.mp4
* **게임 파일**: public/assets/motion/char_03/back/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s turns half away, hands on hips, lowers the head and exhales hard; 3.7-4.0s holds the final pose still, disappointed but hopeful, never tragic.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-106 · Wolfson · back · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/defeat.mp4
* **게임 파일**: public/assets/motion/char_03/back/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s crouches with the racket across his knees, stares ahead, then slowly stands up; 3.7-4.0s holds the final pose still, hopeful, never tragic.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-107 · Wolfson · back · fh_high — Forehand 어깨 높이 / Smash 대체

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/fh_high.mp4
* **게임 파일**: public/assets/motion/char_03/back/fh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points away from the camera, and the right hand alone takes the racket back on the character's own right side (toward the right side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at shoulder-to-head height with an extended arm, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing high over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: aggressive high forehand driven downward with full body weight. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-108 · Wolfson · back · fh_low — Forehand 무릎 높이

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/fh_low.mp4
* **게임 파일**: public/assets/motion/char_03/back/fh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points away from the camera, and the right hand alone takes the racket back on the character's own right side (toward the right side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at knee height after bending the knees deeply, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through brushing low-to-high and finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: lunging low, a powerful brush up the back of the ball. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-109 · Wolfson · back · bh_high — Backhand 어깨 높이 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/bh_high.mp4
* **게임 파일**: public/assets/motion/char_03/back/bh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_03/back/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9
* **11/10 검토**: **11/10 다시 생성 완료** (M-109) — 짧은 테이크백, 1.1 s에 오른쪽 귀 옆 피니시, 게임 연결됨 (backswing 0.7 / contact 0.85).
* **11/10 검토**: Player용 Backhand Prompt(11/10 개정): 기존 Clip은 테이크백에 어깨 회전이 없고, 라켓이 크게 원을 그리며(Contact까지 0.35–0.45 s), 팔로스루가 머리 뒤로 감겼다. 개정 Prompt는 어깨를 옆으로 돌린 자세(Unit Turn)에서 0.3 s 짧은 스윙 → **Contact 0.7 s** → 오른쪽 귀 옆 피니시. Start / End Frame은 그대로(\_bh_key.jpg → \_start.jpg). 사용 구간 0.2–1.6 s · backswing 0.4 / contact 0.7.

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.4s he holds a full unit turn: hips and shoulders are turned a quarter turn to the left, so the left shoulder is closer to the camera and the back of his right shoulder points toward the net, chin tucked over the right shoulder, he stands tall with the knees only slightly bent, both hands on the handle with the racket head low behind his own LEFT hip, never above shoulder height, the racket stays still with no loop; 0.4-0.7s one fast compact two-handed forward swing: the hips turn first, then the shoulders, the racket travels on a level, flat path at shoulder height across the front of the body from the left side of the image to the right side of the image, contact with an imaginary ball at shoulder height, out in front of the body, exactly at 0.7s, both arms extended forward away from the camera at contact; 0.7-1.2s the racket keeps going forward toward the net and then up while the hands keep moving to the RIGHT side of the image, the chest now squarely faces the net, the hands finish just above the right shoulder, the racket head points straight up next to the right ear, at 1.2s both hands and the racket are on the right side of the image and nothing is above the left shoulder; 1.2-3.0s the body relaxes and smoothly returns to the neutral ready stance of the end frame; 3.0-4.0s holds that ready stance.
Hand path checkpoints (as seen by the camera behind the player): at 0.7s the hands are out in front of the body just left of the spine, at shoulder height; at 0.85s the hands pass in front of the chest, hidden by his back; at 1.0s the hands appear above the RIGHT shoulder; at 1.2s the hands rest beside the right ear with the right elbow pointing down and the left elbow pointing forward toward the net. The racket travels like a windshield wiper from the left hip, through the front of the body, to the right shoulder; after contact it is never seen above the left shoulder or above the top of the head, and the hands never stop on the left side of the image.
Body: he stays seen from behind for the whole clip, the head keeps looking toward the net, his face never turns toward the camera and he never turns into a side profile.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the take-back is short and the racket never circles above the shoulders before contact, the shoulders rotate clearly from sideways at the start to square to the net at the finish, contact happens in front of the body, the racket finishes next to the right ear and never wraps around the neck or behind the head.
Style of movement: big high backhand driven through with the whole torso. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, big looping take-back, racket raised above the head before contact, shoulders staying square during the take-back, racket wrapping around the neck, racket behind the head at the finish, racket lifted over the left shoulder after contact, finish on the left side of the image, hands stopping on the left side after contact, racket over the top of the head, face turned toward the camera, side profile, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-110 · Wolfson · back · bh_low — Backhand 무릎 높이 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/bh_low.mp4
* **게임 파일**: public/assets/motion/char_03/back/bh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_03/back/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9
* **11/10 검토**: **11/10 3차 생성본 적용** (M-110 v3, 발 고정 문장 추가 Prompt) — 1 · 2차는 왼쪽 런지 후 손이 머리 왼쪽에 머물러 불합격. 3차는 발 고정, 무릎 높이 Contact 후 손이 오른쪽으로 이동, 오른쪽 어깨 위 피니시, 게임 연결됨 (backswing 0.75 / contact 0.95).
* **11/10 검토**: Player용 Backhand Prompt(11/10 개정): 기존 Clip은 테이크백에 어깨 회전이 없고, 라켓이 크게 원을 그리며(Contact까지 0.35–0.45 s), 팔로스루가 머리 뒤로 감겼다. 개정 Prompt는 어깨를 옆으로 돌린 자세(Unit Turn)에서 0.3 s 짧은 스윙 → **Contact 0.7 s** → 오른쪽 귀 옆 피니시. Start / End Frame은 그대로(\_bh_key.jpg → \_start.jpg). 사용 구간 0.2–1.6 s · backswing 0.4 / contact 0.7.

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.4s he holds a full unit turn: hips and shoulders are turned a quarter turn to the left, so the left shoulder is closer to the camera and the back of his right shoulder points toward the net, chin tucked over the right shoulder, he bends both knees deeply and keeps the back straight, both feet stay planted parallel to the baseline at shoulder width with no lunge or step toward the left side of the image, both hands on the handle with the racket head low behind his own LEFT hip, never above shoulder height, the racket stays still with no loop; 0.4-0.7s one fast compact two-handed forward swing: the hips turn first, then the shoulders, the racket travels on a low-to-high lifting path starting from below the knees across the front of the body from the left side of the image to the right side of the image, contact with an imaginary ball at knee height, out in front of the body, exactly at 0.7s, both arms extended forward away from the camera at contact; 0.7-1.2s the racket keeps going forward toward the net and then up while the hands keep moving to the RIGHT side of the image, the chest now squarely faces the net, the hands finish at the height of the right shoulder, the racket head points straight up next to the right ear, at 1.2s both hands and the racket are on the right side of the image and nothing is above the left shoulder; 1.2-3.0s the body relaxes and smoothly returns to the neutral ready stance of the end frame; 3.0-4.0s holds that ready stance.
Hand path checkpoints (as seen by the camera behind the player): at 0.7s the hands are out in front of the body just left of the spine, at knee height; at 0.85s the hands pass in front of the chest, hidden by his back; at 1.0s the hands appear above the RIGHT shoulder; at 1.2s the hands rest beside the right ear with the right elbow pointing down and the left elbow pointing forward toward the net. The racket travels like a windshield wiper from the left hip, through the front of the body, to the right shoulder; after contact it is never seen above the left shoulder or above the top of the head, and the hands never stop on the left side of the image.
Body: he stays seen from behind for the whole clip, the head keeps looking toward the net, his face never turns toward the camera and he never turns into a side profile.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the take-back is short and the racket never circles above the shoulders before contact, the shoulders rotate clearly from sideways at the start to square to the net at the finish, contact happens in front of the body, the racket finishes next to the right ear and never wraps around the neck or behind the head.
Style of movement: heavy low lunge with strong leg drive. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, big looping take-back, racket raised above the head before contact, shoulders staying square during the take-back, racket wrapping around the neck, racket behind the head at the finish, racket lifted over the left shoulder after contact, finish on the left side of the image, hands stopping on the left side after contact, racket over the top of the head, face turned toward the camera, side profile, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-111 · Wolfson · back · serve_ready — Serve 대기

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/serve_ready.mp4
* **게임 파일**: public/assets/motion/char_03/back/serve_ready.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: loop · **사용 구간**: 0.5–3.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): standing sideways at the baseline preparing to serve, calm focused breathing, small weight shifts between the feet, adjusting the racket grip, looking toward the opponent, subtle continuous motion, ends in the same pose as the first frame, the hands are empty (no ball).
Style of movement: rolls his neck, wide stance, intimidating stare. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-112 · Wolfson · back · split — Split Step

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/split.mp4
* **게임 파일**: public/assets/motion/char_03/back/split.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.6–2.4 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.6s ready stance; 1.6-2.0s a small explosive split-step hop with both feet, landing wide and balanced exactly at 2.0s; 2.0-4.0s alert ready stance, ending in the same pose as the first frame.
Style of movement: low heavy split step with a wide powerful landing. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-113 · Wolfson · back · point_win — 득점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/point_win.mp4
* **게임 파일**: public/assets/motion/char_03/back/point_win.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s a loud roar with a clenched fist pumped downward; 2.5-4.0s returns to the ready stance.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-114 · Wolfson · back · point_lose — 실점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/point_lose.mp4
* **게임 파일**: public/assets/motion/char_03/back/point_lose.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s glares at the racket and taps it against his shoe; 2.5-4.0s returns to the ready stance.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-115 · Wolfson · back · smash — Smash

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/smash.mp4
* **게임 파일**: public/assets/motion/char_03/back/smash.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.0–3.0 s · contact 2.0

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.0s backpedals in place into a sideways stance with the left hand pointing up at an imaginary high ball; 1.0-1.6s racket cocked behind the head; jumps and hits at full overhead extension exactly at 2.0s; 2.0-2.8s violent follow-through and landing; 2.8-4.0s recover to the ready stance.
Style of movement: a brutal full-power smash with a heavy landing. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-116 · Wolfson · back · reach_fh — 먼 공 Forehand (Extended Reach)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/reach_fh.mp4
* **게임 파일**: public/assets/motion/char_03/back/reach_fh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.1–2.9 s · contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s a big lunge step toward the character's own forehand (right) side (toward the right side of the image) while the right hand alone takes the racket back on the right side; the right arm and racket are fully extended at contact out to the right side exactly at 2.0s; 2.0-2.8s stretched forehand follow-through; 2.8-4.0s push off and recover to the ready stance in the center.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: a huge powerful lunge with a strong push-off. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-117 · Wolfson · back · reach_bh — 먼 공 Backhand (Slice Reach)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/reach_bh.mp4
* **게임 파일**: public/assets/motion/char_03/back/reach_bh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_03/back/\_slice_key.jpg** · **End Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg**
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a one-handed backhand slice, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the one-handed slice backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.5s holds the coiled one-handed slice backswing and wide lunge of the start frame, the backswing peaks exactly at 0.5s; 0.5-0.9s high-to-low slice swing across the front of the body from the left side of the image to the right side of the image, the racket arm fully stretched, contact with an imaginary low ball exactly at 0.9s, back of the racket hand facing forward; 0.9-1.7s slice follow-through with the left arm extended backward; 1.7-3.2s pushes off and recovers to the neutral ready stance of the end frame in the center; 3.2-4.0s holds that ready stance.
Stroke check: only the right hand holds the racket, the swing starts from the coiled pose of the start frame with the racket head high behind the character's own LEFT shoulder, the racket travels high-to-low across the front of the body from the left side of the image to the right side of the image, the back of the racket hand faces forward at contact in front of the left hip, the left arm extends backward for balance.
Style of movement: a long stretching slice with heavy leg drive. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed swing, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-118 · Wolfson · back · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/run_forward.mp4
* **게임 파일**: public/assets/motion/char_03/back/run_forward.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): from 0.5s, running in place toward the camera like on a treadmill, steady rhythm, racket ready in front, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: heavy driving strides. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-119 · Wolfson · back · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/run_back.mp4
* **게임 파일**: public/assets/motion/char_03/back/run_back.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · **End Frame 없음** (넣으면 정면 뒷모습으로 묶여 방향이 사라짐)
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: **아래 Prompt로 다시 생성 완료** — 뒷모습 그대로 Net 방향으로 달림, Swing 없음.
* **11/10 검토**: Player용 달리기 Prompt(11/10 개정): Start Frame의 라켓이 화면 왼쪽을 가리키고 End Frame이 정면 뒷모습을 강제해 Flow가 방향을 무시했다. 옆 달리기는 0.5 s 안에 진행 방향 옆모습으로 돌아서게 하고 몸의 모든 부위 방향을 지정한다. run_back은 Player가 Net 쪽으로 다가갈 때 쓰이므로 뒷모습 그대로 앞으로 달린다. **End Frame은 넣지 않는다.** 처음 0.8 s(돌아서는 동작)는 게임이 자동으로 잘라낸다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided image of this exact character standing with his back to the camera.
Camera: the camera stays fixed behind the character at eye level for the whole clip and never moves.
Direction: the character runs straight ahead, AWAY FROM THE CAMERA, toward the far distance in front of him (toward the tennis net) for the entire clip. He is seen from directly behind for the whole clip: his back, the back of his head and the soles of his shoes are what the camera sees; his face is never visible.
Action (timed precisely): 0-0.5s he leans his upper body forward and pushes off into a forward run. 0.5-4.0s he runs forward away from the camera in place like on a treadmill: strong knee drive forward, each foot kicks back toward the camera after push-off so the soles of the shoes flash toward the camera, the arms pump forward and back, the racket is held in front of his chest with both hands in the ready position with the racket head up. The same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s. He never turns sideways, never turns around to face the camera, never runs backward, and never swings the racket at any time.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Style of movement: big powerful running strides with heavy footfalls, strong knee drive, low center of gravity. Tempo and personality: heavy and explosive, powerful driving legs, determined.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: face visible, turning sideways, side profile, turning around, running backward, backpedaling, racket swing, forehand, backhand, hitting motion, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-120 · Wolfson · back · walk_in — Match 입장

* **넣을 곳**: raw_assets/images_src/motion/char_03/back/walk_in.mp4
* **게임 파일**: public/assets/motion/char_03/back/walk_in.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/back/\_start.jpg · End Frame 없음
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.0–4.0 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): walks calmly in place with confident steps, bouncing on the toes, rolling the shoulders and swinging the racket loosely, settling into the ready stance at 3.5s.
Style of movement: slow intimidating walk, stretches his arms wide. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

### ▶ Wolfson (울프슨) · CHAR_03 — Front (NPC용)

#### M-121 · Wolfson · front · idle — Ready 대기

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/idle.mp4
* **게임 파일**: public/assets/motion/char_03/front/idle.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: pingpong · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): ready stance for the full 4 seconds, knees bent, weight on the balls of the feet, gentle rhythmic bouncing, racket held in front with both hands, small natural breathing and shoulder movement, ends in exactly the same pose as the first frame.
Style of movement: heavy grounded stance, slow powerful shoulder roll, taps the racket once against the shoe. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-122 · Wolfson · front · run_left — 화면 왼쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/run_left.mp4
* **게임 파일**: public/assets/motion/char_03/front/run_left.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): from 0.5s, running sideways toward the screen-left direction (the left side of the image) in place like on a treadmill, quick side-shuffle steps, racket held ready in front, body leaning slightly into the movement, continuous steady rhythm, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: big powerful strides with heavy footfalls. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-123 · Wolfson · front · run_right — 화면 오른쪽 이동 (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/run_right.mp4
* **게임 파일**: public/assets/motion/char_03/front/run_right.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): from 0.5s, running sideways toward the screen-right direction (the right side of the image) in place like on a treadmill, quick side-shuffle steps, racket held ready in front, body leaning slightly into the movement, continuous steady rhythm, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: big powerful strides with heavy footfalls. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-124 · Wolfson · front · fh_mid — Forehand 허리 높이

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/fh_mid.mp4
* **게임 파일**: public/assets/motion/char_03/front/fh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points toward the camera, and the right hand alone takes the racket back on the character's own right side (toward the left side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at waist height, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: heavy topspin forehand with a huge loop backswing and a windshield-wiper finish. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-125 · Wolfson · front · bh_mid — Backhand 허리 높이

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/bh_mid.mp4
* **게임 파일**: public/assets/motion/char_03/front/bh_mid.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_03/front/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg**
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.5s holds the coiled two-handed backswing of the start frame with a tiny loading settle, both hands on the handle, the backswing peaks exactly at 0.5s; 0.5-0.9s fast two-handed forward swing across the front of the body from the right side of the image to the left side of the image, contact with an imaginary ball at waist height, in front of the left hip, exactly at 0.9s; 0.9-1.7s two-handed follow-through over the character's own right shoulder with both hands still on the handle; 1.7-3.2s the body unwinds and smoothly recovers to the neutral ready stance of the end frame; 3.2-4.0s holds that ready stance.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the swing starts from the coiled pose of the start frame with the racket behind the character's own LEFT hip, the racket travels across the front of the body from the right side of the image to the left side of the image, contact happens in front of the left hip, the finish is high over the right shoulder with both hands still on the handle.
Style of movement: powerful two-handed backhand with a big shoulder turn and strong hip drive. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-126 · Wolfson · front · serve — Toss → Serve

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/serve.mp4
* **게임 파일**: public/assets/motion/char_03/front/serve.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.6–3.2 s · toss 0.8 / contact 2.2

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.8s sideways serve stance at the baseline; at 0.8s the left hand rises to toss an imaginary ball (the hand is empty), reaching the trophy pose at 1.4s with the racket cocked behind the head; 1.4-2.2s the knees bend and the body explodes upward, the racket hits the imaginary ball at full overhead extension exactly at 2.2s; 2.2-3.0s follow-through across the body, landing one step forward; 3.0-4.0s recover to the ready stance.
Style of movement: big pinpoint power serve with a deep knee bend and a huge leap. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-127 · Wolfson · front · victory — Match 승리 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/victory.mp4
* **게임 파일**: public/assets/motion/char_03/front/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s thunderous celebration: roars with both arms flexed and the racket held high overhead; 3.7-4.0s holds the final triumphant pose still.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-128 · Wolfson · front · victory_b — Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/victory.mp4
* **게임 파일**: public/assets/motion/char_03/front/victory.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s drops to his knees and roars to the sky, then rises and beats his chest once; 3.7-4.0s holds the final pose still.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-129 · Wolfson · front · defeat — Match 패배 (A안)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/defeat.mp4
* **게임 파일**: public/assets/motion/char_03/front/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s turns half away, hands on hips, lowers the head and exhales hard; 3.7-4.0s holds the final pose still, disappointed but hopeful, never tragic.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-130 · Wolfson · front · defeat_b — Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/defeat.mp4
* **게임 파일**: public/assets/motion/char_03/front/defeat.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame 없음
* **Tier**: 1 · **Loop**: once · **사용 구간**: 0.3–3.7 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.3s neutral standing pose; 0.3-3.7s crouches with the racket across his knees, stares ahead, then slowly stands up; 3.7-4.0s holds the final pose still, hopeful, never tragic.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-131 · Wolfson · front · fh_high — Forehand 어깨 높이 / Smash 대체

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/fh_high.mp4
* **게임 파일**: public/assets/motion/char_03/front/fh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points toward the camera, and the right hand alone takes the racket back on the character's own right side (toward the left side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at shoulder-to-head height with an extended arm, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through finishing high over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: aggressive high forehand driven downward with full body weight. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-132 · Wolfson · front · fh_low — Forehand 무릎 높이

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/fh_low.mp4
* **게임 파일**: public/assets/motion/char_03/front/fh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.1–2.9 s · backswing 1.6 / contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points toward the camera, and the right hand alone takes the racket back on the character's own right side (toward the left side of the image), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball at knee height after bending the knees deeply, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through brushing low-to-high and finishing over the character's own left shoulder; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: lunging low, a powerful brush up the back of the ball. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-133 · Wolfson · front · bh_high — Backhand 어깨 높이

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/bh_high.mp4
* **게임 파일**: public/assets/motion/char_03/front/bh_high.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_03/front/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.5s holds the coiled two-handed backswing of the start frame with a tiny loading settle, both hands on the handle, the backswing peaks exactly at 0.5s; 0.5-0.9s fast two-handed forward swing across the front of the body from the right side of the image to the left side of the image, contact with an imaginary ball at shoulder height, in front of the left hip, exactly at 0.9s; 0.9-1.7s two-handed follow-through finishing high over the character's own right shoulder with both hands still on the handle; 1.7-3.2s the body unwinds and smoothly recovers to the neutral ready stance of the end frame; 3.2-4.0s holds that ready stance.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the swing starts from the coiled pose of the start frame with the racket behind the character's own LEFT hip, the racket travels across the front of the body from the right side of the image to the left side of the image, contact happens in front of the left hip, the finish is high over the right shoulder with both hands still on the handle.
Style of movement: big high backhand driven through with the whole torso. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-134 · Wolfson · front · bh_low — Backhand 무릎 높이

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/bh_low.mp4
* **게임 파일**: public/assets/motion/char_03/front/bh_low.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_03/front/\_bh_key.jpg** · **End Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg**
* **Tier**: 2 · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.5s holds the coiled two-handed backswing of the start frame with a tiny loading settle, both hands on the handle, the backswing peaks exactly at 0.5s; 0.5-0.9s fast two-handed forward swing across the front of the body from the right side of the image to the left side of the image, contact with an imaginary ball at knee height with a deep knee bend, in front of the left hip, exactly at 0.9s; 0.9-1.7s two-handed follow-through lifting up over the character's own right shoulder with both hands still on the handle; 1.7-3.2s the body unwinds and smoothly recovers to the neutral ready stance of the end frame; 3.2-4.0s holds that ready stance.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the swing starts from the coiled pose of the start frame with the racket behind the character's own LEFT hip, the racket travels across the front of the body from the right side of the image to the left side of the image, contact happens in front of the left hip, the finish is high over the right shoulder with both hands still on the handle.
Style of movement: heavy low lunge with strong leg drive. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-135 · Wolfson · front · serve_ready — Serve 대기

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/serve_ready.mp4
* **게임 파일**: public/assets/motion/char_03/front/serve_ready.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: loop · **사용 구간**: 0.5–3.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): standing sideways at the baseline preparing to serve, calm focused breathing, small weight shifts between the feet, adjusting the racket grip, looking toward the opponent, subtle continuous motion, ends in the same pose as the first frame, the hands are empty (no ball).
Style of movement: rolls his neck, wide stance, intimidating stare. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-136 · Wolfson · front · split — Split Step

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/split.mp4
* **게임 파일**: public/assets/motion/char_03/front/split.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: 2 · **Loop**: once · **사용 구간**: 1.6–2.4 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.6s ready stance; 1.6-2.0s a small explosive split-step hop with both feet, landing wide and balanced exactly at 2.0s; 2.0-4.0s alert ready stance, ending in the same pose as the first frame.
Style of movement: low heavy split step with a wide powerful landing. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-137 · Wolfson · front · point_win — 득점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/point_win.mp4
* **게임 파일**: public/assets/motion/char_03/front/point_win.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s a loud roar with a clenched fist pumped downward; 2.5-4.0s returns to the ready stance.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-138 · Wolfson · front · point_lose — 실점 반응

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/point_lose.mp4
* **게임 파일**: public/assets/motion/char_03/front/point_lose.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.5–2.5 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.5s neutral ready stance; 0.5-2.5s glares at the racket and taps it against his shoe; 2.5-4.0s returns to the ready stance.
Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks and a short natural vocal reaction.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-139 · Wolfson · front · smash — Smash

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/smash.mp4
* **게임 파일**: public/assets/motion/char_03/front/smash.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.0–3.0 s · contact 2.0

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.0s backpedals in place into a sideways stance with the left hand pointing up at an imaginary high ball; 1.0-1.6s racket cocked behind the head; jumps and hits at full overhead extension exactly at 2.0s; 2.0-2.8s violent follow-through and landing; 2.8-4.0s recover to the ready stance.
Style of movement: a brutal full-power smash with a heavy landing. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-140 · Wolfson · front · reach_fh — 먼 공 Forehand (Extended Reach)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/reach_fh.mp4
* **게임 파일**: public/assets/motion/char_03/front/reach_fh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: once · **사용 구간**: 1.1–2.9 s · contact 2.0

```text
4-second character motion clip of a tennis player hitting a forehand groundstroke with the right hand, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-1.0s ready stance; 1.0-1.6s a big lunge step toward the character's own forehand (right) side (toward the left side of the image) while the right hand alone takes the racket back on the right side; the right arm and racket are fully extended at contact out to the right side exactly at 2.0s; 2.0-2.8s stretched forehand follow-through; 2.8-4.0s push off and recover to the ready stance in the center.
Stroke check: the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body.
Style of movement: a huge powerful lunge with a strong push-off. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-141 · Wolfson · front · reach_bh — 먼 공 Backhand (Slice Reach)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/reach_bh.mp4
* **게임 파일**: public/assets/motion/char_03/front/reach_bh.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · **Start Frame = raw_assets/images_src/motion/char_03/front/\_slice_key.jpg** · **End Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg**
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.3–1.9 s · backswing 0.5 / contact 0.9

```text
4-second character motion clip of a tennis player hitting a one-handed backhand slice, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided key frame shows this exact character already coiled at the peak of the one-handed slice backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): 0-0.5s holds the coiled one-handed slice backswing and wide lunge of the start frame, the backswing peaks exactly at 0.5s; 0.5-0.9s high-to-low slice swing across the front of the body from the right side of the image to the left side of the image, the racket arm fully stretched, contact with an imaginary low ball exactly at 0.9s, back of the racket hand facing forward; 0.9-1.7s slice follow-through with the left arm extended backward; 1.7-3.2s pushes off and recovers to the neutral ready stance of the end frame in the center; 3.2-4.0s holds that ready stance.
Stroke check: only the right hand holds the racket, the swing starts from the coiled pose of the start frame with the racket head high behind the character's own LEFT shoulder, the racket travels high-to-low across the front of the body from the right side of the image to the left side of the image, the back of the racket hand faces forward at contact in front of the left hip, the left arm extends backward for balance.
Style of movement: a long stretching slice with heavy leg drive. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: two-handed swing, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-142 · Wolfson · front · run_forward — 앞으로 이동 (Camera 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/run_forward.mp4
* **게임 파일**: public/assets/motion/char_03/front/run_forward.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): from 0.5s, running in place toward the camera like on a treadmill, steady rhythm, racket ready in front, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: heavy driving strides. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-143 · Wolfson · front · run_back — 뒤로 이동 (Camera 반대 방향) (11/10 updated)

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/run_back.mp4
* **게임 파일**: public/assets/motion/char_03/front/run_back.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame = 같은 \_start.jpg
* **Tier**: extra · **Loop**: loop · **사용 구간**: 1.0–3.0 s
* **11/10 검토**: 1.7–2.7 s에 Swing이 들어 있음 → 0.4–1.6 s 구간만 사용. **다시 생성 권장**.
* **11/10 검토**: Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(stabilize). 다시 생성할 때는 Running cycle: 문장이 들어간 아래 Prompt를 쓴다.

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character; the clip ends on the same pose as the start frame.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): from 0.5s, backpedaling in place away from the camera like on a treadmill, small quick backward steps, racket ready, the body never leaves the center of the frame.
Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.
Style of movement: heavy strong backpedal. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

#### M-144 · Wolfson · front · walk_in — Match 입장

* **넣을 곳**: raw_assets/images_src/motion/char_03/front/walk_in.mp4
* **게임 파일**: public/assets/motion/char_03/front/walk_in.webp + manifest.json (Sprite Atlas)
* **Flow 설정**: Frames to Video · 4 s · 16:9 · Start Frame = raw_assets/images_src/motion/char_03/front/\_start.jpg · End Frame 없음
* **Tier**: extra · **Loop**: once · **사용 구간**: 0.0–4.0 s

```text
4-second character motion clip, 16:9, realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed.
Start frame: the provided pose start frame of this exact character.
View: straight front view facing the camera at eye level, the racket hand is on the left side of the image. The view angle never changes.
Character: a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape.
Action (timed precisely): walks calmly in place with confident steps, bouncing on the toes, rolling the shoulders and swinging the racket loosely, settling into the ready stance at 3.5s.
Style of movement: slow intimidating walk, stretches his arms wide. Tempo and personality: heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music, letters, numbers, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions.
```

