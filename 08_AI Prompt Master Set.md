# 🎾 08. AI Prompt Master Set — Real Court Tennis

> 이 문서는 Real Court Tennis의 **최종 Design Concept & Vibe**와, 게임에 투입할 모든 AI 생성 Asset(Image / Video / Motion)의 **Prompt 원본**, 그리고 **Motion Video → ffmpeg → Game Sprite Pipeline**을 한곳에 모은 기준 문서다.
> 기준 문서: 07_Cursor_AI_Agent_Master_Execution_Prompt_realcourttennis.md (§10 Character, §15 Art, §16 Video), src/data/\*.json (실제 Game Data).
> 문서 언어 규칙: 설명은 한국어, 기술 용어는 English. **Prompt 본문은 AI Tool 인식률을 위해 English로 작성**한다. 이미지·영상 안에는 어떤 언어의 글자도 넣지 않는다(UI Text는 게임이 ko / en / ja로 덧입힌다).

---

## 0. 사용 방법

1. §1의 **Design Concept & Vibe**와 §2의 **Global Style Block**을 먼저 읽는다.
2. 각 Prompt는 [STYLE] 자리에 §2.1 Style Block을, 끝에 §2.2 Negative Block을 붙여서 사용한다. (Tool이 Negative Prompt 칸을 따로 지원하면 그 칸에 넣는다.) Motion Video(§6)는 §6.2의 전용 [MOTION_STYLE]을 쓴다.
3. 같은 Character / Venue가 여러 장면에 나오므로, **Character Reference Sheet(§5.2)를 가장 먼저 만들고** 이후 모든 생성에서 Reference Image(Character Reference / Image Prompt / Start Frame)로 고정한다.
4. 완성 파일은 §12의 **파일명 규칙**대로 넣는다. 파일이 있으면 게임이 자동으로 사용하고, 없으면 기존 Procedural 연출로 대체한다(Code 수정 불필요).

### 0.1 제작 우선순위 (추천 순서)

| 순서 | 항목 | 이유 |
| --- | --- | --- |
| 1 | §5.2 Character Turnaround Sheet × 3 | 모든 Character 생성의 기준 Reference |
| 2 | §6 Motion Video **Tier 1** (Player back 8종 × 3명) | 게임 체감 품질을 가장 크게 바꾸는 Asset |
| 3 | §6 Motion Video Tier 1 (NPC front 8종 × 3명) | 상대 선수 동작 |
| 4 | §4 Title, §5.3 Portrait, §7 Stage Key Art | 메뉴 화면 품질 |
| 5 | §3 Intro, §8 / §9 Stage Video | 연출 |
| 6 | §6 Tier 2 Motion, §10 / §11 추가 Image / Motion | 완성도 |

### 0.2 추천 Tool (예시, 교체 가능)

| 용도 | Tool 예시 | 비고 |
| --- | --- | --- |
| Still Image | Midjourney, Imagen, GPT Image, FLUX | Character 일관성은 Reference 기능 사용 |
| Image → Video | Veo, Kling, Runway, Sora | **Start Frame = Key Art / Turnaround** 로 지정하면 일관성이 높다 |
| Motion (Green Screen) | Kling, Runway, Veo (Image-to-Video) | Start Frame = §6.4의 **Pose Start Frame** |
| Background 제거 보조 | Runway Remove Background 등 | Green 품질이 나쁠 때만 (기본은 ffmpeg chromakey) |
| Upscale / Format | Topaz, cwebp, ffmpeg | §13 후처리 참조 |

---

## 1. 전체 Design Concept & Vibe

### 1.1 One-line Concept

**"눈높이에서 보는 진짜 테니스 — 동네 아침 코트에서 챔피언십의 밤까지."**
(English: *Real tennis from eye level — from a sunny neighborhood morning court to a championship night.*)

### 1.2 Vibe Keywords

| Keyword | 의미 | 화면에서의 표현 |
| --- | --- | --- |
| **Sunlit Clean** | 밝고 청량한 여름 Sports | 높은 명도, 맑은 하늘, 깨끗한 흰 Line |
| **Eye-Level Telephoto** | 선수 바로 뒤, 눈높이 망원 시점 | 압축된 원근, 네트가 가슴~머리 사이, 상대는 1/3 크기 |
| **Refined Cel-Shaded** | Realistic 70% : Anime 30% | 2-tone Ramp Shading, 얇고 세련된 Outline, Rim Light |
| **Watercolor Air** | 수채화풍 Texture와 공기 원근 | 하늘·관중석·원경이 부드럽게 번짐 |
| **Rising Stakes** | Stage가 오를수록 더 큰 무대 | Day → Sunset → Indoor → Night, 관중·조명·열기 증가 |
| **Snappy Impact** | 타구감 | 빠른 Forward Swing + 긴 Follow-through, Perfect Hit의 흰 Spark, 형광 노랑 Ball Trail |

### 1.3 Visual 원칙 (07 §15.1 확정)

| 항목 | 규격 |
| --- | --- |
| Style | Realistic Cel-Shaded 3D, 7.5 Heads 비율, 깨끗한 Silhouette |
| Tone | 밝고 청량한 여름 Sports, 세련된 Outline + 수채화풍 Texture |
| Costume / Props | Polo Shirt, Tennis Shorts / Skirt, Carbon Racket, **Fluorescent Yellow Ball**, Wristband, Headband / Visor |
| Camera Language | Telephoto(85–200 mm 상당), Eye-level, 후방 Baseline 시점이 기본 |
| 금지 | Text / Logo / Watermark / Brand Mark, Baked Shadow(Character Texture), 과도한 Bloom, Horror·Gritty Tone |

### 1.4 Stage Journey (감정 곡선)

| Stage | Theme | Venue (UI 이름) | 감정 | Court Color | Sky / Light |
| --- | --- | --- | --- | --- | --- |
| 1–3 | day | 주간 스포츠 센터 | 설렘, 가벼운 출발 | Green Hard #3E8E5E | #5FB4F0 → #CFEAFB 맑은 하늘 |
| 4–5 | sunset | 석양 코트 | 낭만, 집중 | Terracotta Hard #C4673F | #F0784A → #FCD39B 노을 |
| 6–7 | indoor | 실내 코트 | 프로의 긴장감 | Blue Urethane #2F6FAE + Wood Surround #B9874F | 깨끗한 천장 조명 |
| 8–10 | night | 야간 프로 경기장 | 열광, 클라이맥스 | Navy Hard #24578F | #070B1E → #1C2650 밤하늘 + Floodlight |

### 1.5 Color Palette

| 역할 | Color |
| --- | --- |
| Brand Accent (Ball / Highlight) | Fluorescent Yellow #E3FF3B |
| UI Deep Navy | #0E1A33 |
| Court Line | Pure White #FFFFFF |
| David (CHAR_01) | Blue #2E7DD7 |
| Susan (CHAR_02) | Pink #E04F8A |
| Wolfson (CHAR_03) | Orange #F29B2E |
| Chroma Key (Motion 전용, 게임 화면에 나오지 않음) | Pure Green #00FF00 |

---

## 2. Global Style Block (모든 Prompt 공통)

### 2.1 [STYLE] — Style Block

```text
realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition, no text
```

### 2.2 Negative Block

```text
text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions
```

### 2.3 Technical Spec

| 종류 | 생성 해상도 | 최종 파일 | 비고 |
| --- | --- | --- | --- |
| Landscape Key Art | 16:9, 2560×1440 이상 | .webp, 1920×1080, Quality 82 | 중앙 9:16 Safe Area에 핵심 피사체 |
| Portrait Key Art | 9:16, 1440×2560 이상 | .webp, 1080×1920 | Mobile Portrait 전용 |
| Character Portrait | 3:4, 1536×2048 | .webp, 768×1024 | Setup 화면 Card |
| Character Sheet | 16:9 또는 3:2 | .png (원본 보관) | 3D / Motion Reference, 게임 미사용 |
| Stage Key Art | 16:9, 1920×1080 | .webp, 1280×720 | Stage Tile 배경 (Tile에서 Crop됨) |
| Video (연출) | 16:9, 1920×1080, 24 or 30 fps | .mp4 H.264, yuv420p, +faststart | 중앙 9:16 Safe Area 유지, Skip 가능 |
| **Motion Video (원본)** | **16:9, 1920×1080 이상, 24–30 fps, 4.0 s** | 원본 .mp4 그대로 raw_assets/images_src/motion/ | ffmpeg가 Sprite Atlas로 변환 (§6.7) |

> 🟨 **Safe Area 규칙**: 게임은 연출 Video / Image를 object-fit: cover로 채운다. Mobile Portrait에서는 16:9 화면의 **가운데 약 1/3 폭**만 보이므로, 모든 Landscape 소재의 핵심 피사체를 화면 중앙 세로 띠에 둔다.

---

## 3. Intro Video (6 s) — intro_6s.mp4

App 실행 직후 재생. 기본 Muted, Skip 가능. 끝 프레임은 Title 화면과 자연스럽게 이어지도록 **Logo가 들어갈 빈 하늘(Negative Space)** 로 마무리한다(Logo는 게임 UI가 얹는다).

### 3.1 Shot List

| 시간 | Shot | 내용 |
| --- | --- | --- |
| 0.0–1.5 s | Extreme Macro | 아침 햇살 속 형광 노랑 Ball의 Felt 표면, 이슬 반짝임, 천천히 회전 |
| 1.5–3.0 s | Low Eye-level Tracking | Racket Strings가 Ball을 때리는 순간(Slow Motion), 흰 Spark 몇 개 |
| 3.0–4.5 s | Telephoto Follow | Ball이 흰 Trail을 남기며 Net 위를 넘어감, 뒤로 Day → Sunset → Night 하늘이 빠르게 Time-lapse 전환 |
| 4.5–6.0 s | Wide Rising Crane | 텅 빈 Night Stadium Court를 Baseline 뒤 눈높이에서 보다가 위로 상승, Floodlight가 차례로 켜지며 상단 하늘에 빈 공간 |

### 3.2 Prompt

```text
6-second cinematic game intro, 16:9. [STYLE].
Shot 1 (0-1.5s): extreme macro of a fluorescent yellow tennis ball with fuzzy felt texture and sparkling morning dew, slowly rotating in warm sunlight, shallow depth of field.
Shot 2 (1.5-3s): low eye-level slow-motion shot of carbon racket strings striking the ball, strings flexing, a few small white spark particles burst from the contact point.
Shot 3 (3-4.5s): telephoto follow shot, the ball flies over the tennis net leaving a soft white light trail, the sky behind transitions in a smooth time-lapse from clear blue day to orange sunset to deep navy night.
Shot 4 (4.5-6s): from eye level behind the baseline of an empty night stadium tennis court with a navy blue hard surface and crisp white lines, the camera cranes upward while floodlights switch on one by one, ending on a calm wide frame with open dark-blue sky in the upper third for a logo.
Smooth match cuts, energetic but clean, no people visible, no text.
```

**Audio (선택)**: crisp tennis ball pop, airy whoosh, rising synth-pop swell, distant crowd roar on the final shot, ends on a soft cymbal tail

---

## 4. Title (첫 화면) Key Visual

Title 화면 배경. 화면 상단 중앙에 Logo + Tagline, 하단 중앙에 Start Button이 얹히므로 **상단 30%와 하단 20%는 복잡하지 않게** 비운다.

### 4.1 Landscape — title_key_visual_landscape.webp

```text
Title screen key visual for a tennis game, 16:9. [STYLE].
Eye-level telephoto view from just behind the baseline of a beautiful green hard tennis court (#3E8E5E) at golden late afternoon, crisp white lines leading toward the net, the far court compressed by the long lens.
Three tennis players stand together on the near side, seen from behind and three-quarter back view: center a man in a blue polo (#2E7DD7) with white shorts and white headband holding a carbon racket over his shoulder; left a young woman in a pink polo (#E04F8A) and white pleated skirt with a honey-blonde ponytail; right a tall man in an orange polo (#F29B2E) and navy shorts with short black hair.
A fluorescent yellow ball floats mid-air above the net catching the sun, with a faint white trail.
White modern stands with a soft watercolor crowd in the distance, clear sky with gentle clouds in the upper third kept open and uncluttered for a logo, lower fifth kept simple.
Hopeful, sunny, premium sports game mood, no text.
```

### 4.2 Portrait — title_key_visual_portrait.webp

```text
Title screen key visual for a tennis game, vertical 9:16. [STYLE].
Low eye-level telephoto view along the center service line of a green hard tennis court (#3E8E5E), the net crossing the middle of the frame.
In the lower-middle, a man in a blue polo (#2E7DD7) and white shorts with a white headband is seen from behind in a ready stance holding a carbon racket; far across the net a small opponent silhouette.
A fluorescent yellow ball glows above the net with a soft white trail.
Upper third: clean bright blue sky with soft watercolor clouds, open for a logo. Bottom fifth: plain court surface for a button.
Fresh, sunny, energetic, no text.
```

---

## 5. Character Image Prompts

Character는 3명이며 Player가 1명을 고르면 나머지 2명이 Stage 상대(NPC)가 된다. 모든 Character는 **7.5 Heads, 운동선수 체형, 같은 Shading 규칙**을 따른다.

### 5.1 Character Bible

| ID | Name (ko / en / ja) | 성별 / 나이 | Type | Height | Skin | Hair | Top | Bottom | Accessory | 성격 / Motion 톤 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CHAR_01 | 데이비드 / David / デイビッド | 남 / 20대 중반 | Balanced All-Rounder | 1.82 m | #E8BE9A | Short dark brown #3B2A1E | Blue Polo #2E7DD7 (흰 Collar 라인) | White Shorts #F4F6FA | White Headband, White Wristband | 침착, 자신감 — **교과서적이고 매끄러운 Swing** |
| CHAR_02 | 수잔 / Susan / スーザン | 여 / 20대 초반 | Agile Technician | 1.68 m | #F1CBA8 | Honey blonde #C9873A High Ponytail | Pink Polo #E04F8A | White Pleated Skirt #FFFFFF | White Visor, Pink Wristband | 경쾌, 민첩 — **빠르고 가벼운 Footwork, 짧고 날카로운 Swing** |
| CHAR_03 | 울프슨 / Wolfson / ウルフソン | 남 / 20대 후반 | Power All-Rounder | 1.88 m | #C98E64 | Short black #141414 Fade | Orange Polo #F29B2E | Navy Shorts #26324A | Black Wristband, Sports Watch | 묵직, 대담 — **크게 감는 Backswing, 폭발적인 Follow-through** |

공통 Props: Carbon Racket(Black / Graphite Frame, 흰 Strings, Character Color Grip Tape), White Tennis Shoes. 모든 Character는 **오른손잡이**로 만든다(왼손잡이 Player는 게임이 좌우 반전).

{CHARACTER_DESCRIPTION} 값 (이 문서의 모든 Character Prompt에서 공통 사용):

* **CHAR_01 David**
  ```text
  a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape
  ```
* **CHAR_02 Susan**
  ```text
  a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape
  ```
* **CHAR_03 Wolfson**
  ```text
  a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape
  ```

### 5.2 Reference Turnaround Sheet (모든 Character 생성의 기준) — char_0N_turnaround.png

```text
Character turnaround reference sheet, front view, side view, back view, and three-quarter view, full body, neutral A-pose holding a carbon tennis racket in the right hand, plain light gray background, even studio lighting, no shadows on the character, [STYLE], 7.5 heads tall athletic proportions.
Character: {CHARACTER_DESCRIPTION}
```

### 5.3 Setup Card Portrait (게임 사용) — char_0N_portrait.webp

Match Setup의 Character Card에 3:4로 표시된다(얼굴~허리, 상단 정렬).

```text
Character select portrait, 3:4 vertical, waist-up, three-quarter front view, holding a carbon tennis racket resting on the shoulder, confident pose, soft gradient background in {COLOR} fading to white, subtle court-line shapes in the background, [STYLE].
Character: {CHARACTER_DESCRIPTION}
```

| ID | {COLOR} | Pose 추가 |
| --- | --- | --- |
| CHAR_01 | blue (#2E7DD7) | slight calm smile, looking at the viewer |
| CHAR_02 | pink (#E04F8A) | cheerful wink, ponytail swinging, racket spun in hand |
| CHAR_03 | orange (#F29B2E) | serious gaze, racket gripped firmly across the chest |

### 5.4 Gameplay Back View (Promotion / Store Screenshot용)

```text
Eye-level telephoto view from behind the player at the baseline, the player in a ready stance seen from behind occupying the lower-center of the frame, the tennis net crossing between chest and head height, a small opponent far across the court, [STYLE], {THEME_LIGHTING}.
Player: {CHARACTER_DESCRIPTION}
```

### 5.5 Victory / Defeat Still (Score 화면 · Store용) — char_0N_victory.webp, char_0N_defeat.webp

```text
Victory: full body, the character raising the racket high with a fist pump, joyful shout, small white sparkles, confetti in the air, [STYLE], {THEME_LIGHTING}. Character: {CHARACTER_DESCRIPTION}
Defeat: full body, the character crouching with hands on knees, head down, racket on the ground, gentle wind, hopeful mood, [STYLE], {THEME_LIGHTING}. Character: {CHARACTER_DESCRIPTION}
```

---

## 6. Character / NPC Motion Video (4 s) → ffmpeg → Game Sprite

### 6.1 원리 — 왜 Motion Video로 Sprite를 만드는가

게임 Camera는 항상 **Player 바로 뒤, 눈높이 망원**이고 좌우 회전이 최대 8°로 제한된다. 그래서:

* Player는 화면에서 **항상 등(Back View)** 만 보인다.
* NPC는 Net 건너편에서 **항상 정면(Front View)** 만 보인다.

따라서 각 Character를 **Back / Front 2방향**의 Motion Video로 만들고, ffmpeg로 Frame을 분해해 Sprite Atlas로 만들면 3D 공간 안에서 Camera를 향하는 Billboard로 그려도 완전한 3D Model과 구분하기 어려운 품질을 얻는다. AI Video의 자연스러운 관절·옷·머리카락 움직임을 그대로 쓸 수 있는 것이 가장 큰 장점이다.

```text
AI Video (4 s, green screen, back / front)
  → raw_assets/images_src/motion/{char_0N}/{back|front}/{clipId}.mp4
  → npm run motion  (ffmpeg: chromakey → despill → set-wide crop → fps resample → lanczos scale → tile)
  → public/assets/motion/{char_0N}/{view}/{clipId}.webp  +  manifest.json
  → Game: SpriteCharacter (Camera-facing Billboard, Contact Marker 동기화)
```

* 파일이 없으면 기존 Procedural Mannequin이 그대로 동작한다(Clip 단위 Fallback도 지원, §6.8).
* 구현: tools/motion/build-motion.ts, tools/motion/motion.config.json, src/view/spriteCharacter.ts.

### 6.2 촬영 규칙 (모든 Motion Video 필수)

| # | 규칙 | 이유 |
| --- | --- | --- |
| 1 | **Background = 균일한 Pure Green #00FF00**, 바닥도 같은 Green, 바닥 그림자·반사 없음 | ffmpeg chromakey로 깨끗하게 제거 |
| 2 | **Camera 완전 고정** (Locked-off, No Pan / Zoom / Shake) | 모든 Frame이 같은 좌표계여야 발 위치가 고정됨 |
| 3 | **눈높이 정면 / 정후면, 망원(85 mm 상당), 원근 왜곡 없음** | 게임 Camera 시점과 일치 |
| 4 | **전신이 화면 높이의 75–85%**, 머리 위·발 아래 여백, 화면 중앙 | Racket을 크게 휘둘러도 잘리지 않음 |
| 5 | **제자리 동작** (Running도 Treadmill처럼 제자리) | 게임이 위치 이동을 담당 |
| 6 | **Ball 없음** (보이지 않는 Ball을 치는 동작) | Ball은 게임이 그린다 |
| 7 | **Motion Blur 없음, High Shutter Speed** | Blur는 Green이 섞여 반투명 잔상이 됨 |
| 8 | **Green과 비슷한 색 금지** (옷·소품에 초록 계열 금지) | Key 시 구멍 방지 |
| 9 | **Timing 표준 준수** (§6.3) | 게임이 Contact 순간을 Marker로 맞춤 |
| 10 | **오른손잡이**로 생성 | 왼손잡이는 게임이 좌우 반전 |
| 11 | Start Frame = §6.4 **Pose Start Frame** (같은 Character, 같은 구도) | Clip 간 체형·의상·크기 일관성 |

#### [MOTION_STYLE] — Motion 전용 Style Block

```text
realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body in frame, character occupies 80% of frame height, centered, locked-off static camera, eye-level telephoto 85mm lens, no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed, 30 fps, 4 seconds, no ball, no text
```

#### Motion Negative Block

```text
camera movement, zoom, pan, shake, cut, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark
```

### 6.3 Clip 목록 · Timing 표준 · 우선순위 (11/10 updated)

모든 Clip은 **정확히 4.0 s**. 게임 연결 ID = 파일명. Timing은 tools/motion/motion.config.json 기본값과 같다(생성 결과가 어긋나면 §6.7.3에서 보정).

| Clip ID | Tier | 용도 (게임 State) | Loop | 0 – 4 s Timing 표준 | 사용 구간 · Marker |
| --- | --- | --- | --- | --- | --- |
| idle | **1** | Ready / Idle / 대기 | Pingpong | 4 s 내내 Ready Stance, 무릎 굽혀 가볍게 Bounce, Racket 앞 | 0.5–2.5 s |
| run_left | **1** | 화면 왼쪽으로 이동 | Loop | 0.5 s부터 화면 왼쪽 방향으로 제자리 Side-shuffle / Run | 1.0–3.0 s |
| run_right | **1** | 화면 오른쪽으로 이동 | Loop | 위와 대칭, 화면 오른쪽 방향 | 1.0–3.0 s |
| fh_mid | **1** | Forehand 허리 높이 | Once | 0–1.0 Ready → **1.0–1.6 Unit Turn & Backswing (Peak 1.6)** → **1.6–2.0 Forward Swing, Contact 2.0** → 2.0–2.8 Follow-through → 2.8–4.0 Recover | 1.1–2.9 s · backswing 1.6, contact 2.0 |
| bh_mid | **1** | Backhand 허리 높이 | Once | 위와 같은 Timing, 양손 Backhand | 동일 |
| serve | **1** | Toss → Serve | Once | 0–0.8 Serve Stance → **0.8 Toss 시작**(빈손 Toss) → 1.4 Trophy Pose → 1.4–2.2 Knee Bend & Upward Swing, **Contact 2.2**(머리 위 Full Extension) → 2.2–3.0 Follow-through, 한 발 착지 → Recover | 0.6–3.2 s · toss 0.8, contact 2.2 |
| victory | **1** | Match 승리 | Once (마지막 Frame 유지) | 0–0.3 Neutral → 0.3–3.7 환호 동작 → 3.7–4.0 Pose 유지 | 0.3–3.7 s |
| defeat | **1** | Match 패배 | Once | 0–0.3 Neutral → 0.3–3.7 아쉬움 동작 → Pose 유지 | 0.3–3.7 s |
| fh_high | 2 | Forehand 어깨 높이 / NPC Smash | Once | fh_mid와 같은 Timing, Contact 어깨~머리 높이 | 동일 |
| fh_low | 2 | Forehand 무릎 높이 | Once | 같은 Timing, 깊게 낮춘 자세, Contact 무릎 높이 | 동일 |
| bh_high | 2 | Backhand 어깨 높이 | Once | 같은 Timing, 높은 타점 | 동일 |
| bh_low | 2 | Backhand 무릎 높이 | Once | 같은 Timing, 낮은 자세 | 동일 |
| serve_ready | 2 | Serve 대기 | Loop | Baseline에서 옆으로 선 자세, 체중 이동, Grip 고쳐 잡기 (Ball 없음) | 0.5–3.5 s |
| split | 2 | 상대 타구 순간 Split Step | Once | 0–1.6 Ready → **1.6–2.0 작은 Hop**, 2.0 착지 → Ready | 1.6–2.4 s |

* **Tier 1 = 최소 세트**: Character당 8 Clip × 2 View → 3명 = **48 Video**. Tier 2까지 = 14 Clip × 2 × 3 = **84 Video**.
* Tier 2가 없으면 자동 대체: fh_high / fh_low → fh_mid, bh\_\* → bh_mid → fh_mid, serve_ready / split → idle.
* **11/10 검토 결과** (132 Clip, 상세 docs/reports/motion_review.md):
  * Flow 결과는 위 Timing 표준보다 Contact가 0.05–0.3 s 늦고 Backswing Peak가 1.8–2.1 s였다. 그래서 표의 사용 구간 · Marker는 기획 기준값으로만 쓰고, 게임은 Clip마다 Frame 검토로 기록한 실제 값(tools/motion/motion.review.json → motion.config.json overrides)을 쓴다.
  * Serve는 Toss 0.9–1.1 s, Contact 2.1–2.35 s였다.
  * 달리기(run\_\*)는 대부분 반복 보폭 주기가 없고 끝에서 몸을 돌렸다. 일부는 중간에 라켓 Swing이 섞여 있었다. 그래서 게임은 깨끗한 구간만 Pingpong / Crossfade로 재생하고, Prompt에는 §6.6의 Running cycle: 문장을 추가했다.
  * Spec과 다른 Clip은 게임에서 제외하고 다른 Clip으로 대체한다(§6.8): char_01/back/reach_bh, Back run_right 3개.

### 6.4 Pose Start Frame (Image) — raw_assets/images_src/motion/{char_0N}/{view}/\_start.jpg

Image-to-Video Tool의 Start Frame으로 쓰는 기준 이미지. **Character × View마다 1장**(총 6장)을 만든다.

```text
Full body {VIEW_TEXT} of the character standing in a tennis ready stance, knees slightly bent, carbon racket held in front with both hands, centered, character occupies 80% of frame height, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, thin refined dark outlines, no text.
Character: {CHARACTER_DESCRIPTION}
```

| View | {VIEW_TEXT} |
| --- | --- |
| back (Player용) | straight back view seen from directly behind at eye level, the face not visible, the racket hand on the right side of the image |
| front (NPC용) | straight front view facing the camera at eye level, the racket hand on the left side of the image |

### 6.5 Motion Prompt Template

```text
4-second character motion clip, 16:9. [MOTION_STYLE]. Start frame: the provided pose start frame.
View: {VIEW_TEXT}.
Character: {CHARACTER_DESCRIPTION}.
Action: {ACTION}.
Tempo: {TEMPO}.
The character stays in place at the center of the frame for the whole clip.
```

{TEMPO} (Character 개성, §5.1):

| ID | {TEMPO} |
| --- | --- |
| CHAR_01 David | smooth, textbook technique, balanced and controlled, relaxed shoulders |
| CHAR_02 Susan | quick and light, springy footwork, compact sharp swing, ponytail bouncing |
| CHAR_03 Wolfson | heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through |

### 6.6 Clip별 {ACTION} 값 (11/10 updated)

> back과 front는 같은 {ACTION}을 쓰고 {VIEW_TEXT}만 바꾼다. "screen left / right"는 **화면 기준** 방향이다.
> 11/10: 달리기 Clip(run_left, run_right, §11의 run_forward, run_back)은 {ACTION} 뒤에 아래 Running cycle: 문장을 한 줄 더 넣는다. 09 문서의 해당 Prompt에는 이미 들어 있다.
> Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.

| Clip ID | {ACTION} |
| --- | --- |
| idle | ready stance for the full 4 seconds, knees bent, weight on the balls of the feet, gentle rhythmic bouncing, racket held in front with both hands, small natural breathing and shoulder movement, no big changes |
| run_left | from 0.5s, running sideways toward the screen-left direction in place like on a treadmill, quick side-shuffle steps, racket held ready in front, body leaning slightly into the movement, continuous steady rhythm until 4s. Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time. |
| run_right | from 0.5s, running sideways toward the screen-right direction in place like on a treadmill, quick side-shuffle steps, racket held ready in front, body leaning slightly into the movement, continuous steady rhythm until 4s. Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time. |
| fh_mid | 0-1.0s ready stance; 1.0-1.6s unit turn of the shoulders and a full forehand backswing on the right side, peak of the backswing exactly at 1.6s; 1.6-2.0s fast forward swing, the racket meets an imaginary ball at waist height in front of the body exactly at 2.0s; 2.0-2.8s full follow-through finishing over the left shoulder; 2.8-4.0s recover back to ready stance |
| fh_high | same timing as a waist-high forehand, but the contact at 2.0s is at shoulder-to-head height with an extended arm, the follow-through finishes high |
| fh_low | same timing as a waist-high forehand, but the player bends the knees deeply and the contact at 2.0s is at knee height, low-to-high brushing swing |
| bh_mid | 0-1.0s ready stance; 1.0-1.6s shoulder turn and a two-handed backhand backswing on the left side, peak exactly at 1.6s; 1.6-2.0s fast forward swing, contact with an imaginary ball at waist height exactly at 2.0s; 2.0-2.8s full follow-through over the right shoulder; 2.8-4.0s recover to ready stance |
| bh_high | same timing as a waist-high two-handed backhand, but the contact at 2.0s is at shoulder height, high finish |
| bh_low | same timing as a waist-high two-handed backhand, but with deep knee bend and contact at knee height |
| serve | 0-0.8s sideways serve stance at the baseline; at 0.8s the left hand rises to toss an imaginary ball, reaching the trophy pose at 1.4s with the racket cocked behind the head; 1.4-2.2s knees bend and the body explodes upward, the racket hits an imaginary ball at full overhead extension exactly at 2.2s; 2.2-3.0s follow-through across the body landing one step forward; 3.0-4.0s recover to ready stance |
| serve_ready | standing sideways at the baseline preparing to serve, calm focused breathing, small weight shifts between feet, adjusting the racket grip, looking toward the opponent, subtle continuous motion, no ball |
| split | 0-1.6s ready stance; 1.6-2.0s a small explosive split-step hop with both feet, landing wide and balanced at 2.0s; 2.0-4.0s alert ready stance |
| victory | 0-0.3s neutral; 0.3-3.7s joyful celebration: fist pump, racket raised high overhead, an energetic jump and a triumphant shout; 3.7-4.0s hold the final triumphant pose |
| defeat | 0-0.3s neutral; 0.3-3.7s disappointed reaction: head drops, hands on knees, a deep breath, then a small resigned nod; 3.7-4.0s hold the final pose, hopeful not tragic |

### 6.7 ffmpeg 처리 Pipeline (구현 완료)

#### 6.7.1 파일 배치

```text
raw_assets/images_src/motion/
├── char_01/ back/  idle.mp4  run_left.mp4  run_right.mp4  fh_mid.mp4  bh_mid.mp4  serve.mp4  victory.mp4  defeat.mp4 …
│            front/ (같은 파일명)
├── char_02/ back/ … front/ …
└── char_03/ back/ … front/ …
```

.mp4 / .mov / .webm / .mkv 지원. 알 수 없는 파일명은 경고 후 건너뛴다.

#### 6.7.2 실행

```bash
npm run motion                 # 모든 Character / View 변환
npm run motion -- char_02      # 한 Character만
npm run motion -- --preview    # Timing 확인용 Contact Sheet (raw_assets/_preview/motion/*.jpg, 0.167 s 간격 Timestamp)
```

ffmpeg는 ffmpeg-static devDependency로 Project에 포함되어 있어 별도 설치가 필요 없다.

처리 단계 (tools/motion/build-motion.ts):

| 단계 | ffmpeg / 처리 | 결과 |
| --- | --- | --- |
| 1 Silhouette 검출 | chromakey → despill → alphaextract → erosion → 1/4 scale 을 Raw Gray로 읽어 Frame별 Bounding Box 계산 | Clip별 Union Box |
| 2 Set 공통 Crop | 같은 Character / View의 모든 Clip Union + 3% Padding | Clip 전환 시 발·중심 위치 고정 |
| 3 Scale 기준 | idle 시작 0.25 s의 서 있는 키(px) ÷ heightM (characters.json) | pxPerMeter → 실제 키로 3D 배치 |
| 4 Atlas 생성 | fps → chromakey → despill → crop → scale(lanczos) → format=rgba → tile → libwebp (Alpha 포함) | {clipId}.webp |
| 5 Manifest | Cell 크기, Frame 수, fps, Loop, Marker(구간 기준 초), frameWidthM / frameHeightM / anchorX / footY | manifest.json |

#### 6.7.3 Timing 보정 (가장 중요한 품질 단계) (11/10 updated)

**11/10부터 기본 절차는 Motion Audit**이다. 아래 1–4의 수동 절차는 참고용으로 남긴다.

```bash
npm run motion:audit -- char_01/back --grid   # Clip별 동작 측정 + 0.1 s 간격 검토 Grid (raw_assets/_preview/motion_audit/)
# Grid를 보고 Swing / Serve의 backswing·contact(toss), 잘못 생성된 Clip(exclude), 쓸 구간(range)을 tools/motion/motion.review.json에 기록
npm run motion:audit -- --write               # 132 Clip의 start / end / markers / loop / crossfade / stabilize / exclude → motion.config.json overrides
npm run motion -- char_01/back                # Atlas 재생성
```

* Swing: Backswing 0.55 s 전부터 Contact 0.85 s 뒤 Follow-through까지 자른다. Backswing이 1.0 s 전이면 Key Pose(Backhand 계열)부터 시작한다.
* Loop: 첫 Frame과 끝 Frame이 맞는(이음새 15 % 이하) 가장 긴 구간을 고르고, 이음새가 5–20 %면 0.2 s Crossfade로 잇는다. 반복 주기가 없으면 가장 안정된 구간을 Pingpong으로 재생한다.
* stabilize: 발이 키의 5 % 넘게 미끄러지는 Clip은 Frame별 보정값 dx를 Manifest에 저장해 게임에서 상쇄한다.
* 결과 보고서: docs/reports/motion_audit.md(측정), docs/reports/motion_review.md(검토 요약).

1. npm run motion -- --preview 로 Contact Sheet를 연다.
2. 실제 Backswing Peak와 Contact 시각을 Timestamp로 읽는다.
3. tools/motion/motion.config.json 의 overrides에 Clip별로 기록한다.

```json
"overrides": {
  "char_03/back/fh_mid": { "start": 1.2, "end": 3.1, "markers": { "backswing": 1.72, "contact": 2.13 } },
  "char_02/front/serve": { "markers": { "toss": 0.7, "contact": 2.05 } }
}
```

4. npm run motion 재실행. Marker가 정확할수록 **공이 Racket에 맞는 순간과 Sprite의 Contact Frame이 정확히 일치**한다.

Key 품질 조정 (motion.config.json → key): 초록 테두리가 남으면 similarity를 0.02씩 올리고, 머리카락·Racket String이 사라지면 내린다. despillMix는 녹색 반사(Spill) 제거 강도다.

### 6.8 게임 적용 방식 (src/view/spriteCharacter.ts) (11/10 updated)

| 게임 State | 사용 Clip | 재생 방식 |
| --- | --- | --- |
| ready / idle | idle | Pingpong Loop |
| run | run_left / run_right (속도 비례 재생 속도) | Loop |
| backswing (Player: Button 누르는 동안 / NPC: Contact 0.32 s 전부터 자동) | Ball 방향 기준 fh\_\* / bh\_\* | 시작 → backswing Marker까지 재생 후 정지 |
| swing | 같은 Clip | backswing → contact 구간을 **0.1 s로 압축**(폭발적인 Forward Swing) 후 Follow-through는 원래 속도 |
| recovery | 같은 Clip | Follow-through 이어서 재생 |
| toss (Player Serve) | serve | toss → contact 구간을 게임 Toss 시간(0.6 s)에 맞춰 늘이고 줄임 |
| Serve 타격 (Player / NPC) | serve | contact부터 재생 |
| serve_ready | serve_ready | Loop |
| split | split | Once |
| 승리 / 패배 | victory / defeat | Once 후 마지막 Frame 유지 |

* Forehand / Backhand는 **Ball이 몸의 어느 쪽에 있는지**로 결정한다. NPC는 AI가 Forehand만 고르더라도 Backhand 쪽 공에는 bh\_\* Clip이 나온다.
* 왼손잡이 Player는 Sprite를 좌우 반전하고 run_left ↔ run_right를 바꿔 쓴다.
* Theme별 조명 Tint(visual.json → motion.tint): Night는 푸른 기, Sunset은 따뜻한 기를 더해 배경과 어울리게 한다.
* 조정값(swingToContactSec, npcWindupSec, 달리기 재생 속도 등)은 모두 src/data/visual.json → motion에 있다.
* **11/10 보완**
  * **제외 Clip 대체**: exclude된 reach_bh는 bh_mid로 재생한다. Back run_right가 없으면 run_left를 좌우 반전해 재생한다.
  * **Backswing**: Clip의 backswing Marker까지 backswingSec(0.32 s) 동안 재생한다. NPC Windup이 Take-back 중간에 끊기지 않는다.
  * **발 고정**: Manifest의 dx로 Frame별 좌우 미끄러짐을 상쇄한다.
  * **추가 State**: 앞뒤 이동은 run_forward / run_back을 쓴다. 득점·실점 직후에는 point_win / point_lose(pointReactionSec)를, Match Intro에는 walk_in을, NPC Smash에는 smash를, 먼 공에는 reach_fh / reach_bh를 쓴다.
  * **Sprite 로딩**: Sprite를 불러오는 동안 Mannequin은 숨기고, Sprite가 없을 때만 Mannequin을 표시한다(깜빡임 제거).

### 6.9 Texture Memory Budget

| View | Cell Height | Swing Clip (36 Frame) | 14 Clip 합계 (대략) |
| --- | --- | --- | --- |
| back (Player, 화면에 크게) | 240 px | ≈ 8.5 MB (GPU) | ≈ 80 MB |
| front (NPC, 화면에 작게) | 128 px | ≈ 2.5 MB | ≈ 23 MB |

저사양 Mobile에서 부족하면 motion.config.json의 views.back.cellHeight를 200, Swing fps를 16으로 낮춘다. Atlas 한 장은 최대 4096 px(Mobile GPU 호환)로 제한된다.

---

## 7. Stage Key Art (Stage 1–10) — stage_NN_key.webp

Match Setup의 Stage Tile 배경이자, §8 / §9 Video의 **Start Frame**으로 사용한다. Character가 Player 선택에 따라 바뀌므로 **Stage Art는 사람 없는 Venue 중심**으로 만든다(관중은 원경 Watercolor 군중으로만).

### 7.1 공통 Prompt Template

```text
Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, empty court with no players, {VENUE}, {SURFACE}, {LIGHTING}, {CROWD}, {DETAIL}, [STYLE].
```

### 7.2 Stage별 값

| Stage | Theme | {VENUE} | {SURFACE} | {LIGHTING} | {CROWD} | {DETAIL} |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | day | a friendly community sports center tennis court surrounded by green windscreens and young trees | green hard court (#3E8E5E) | fresh 9 AM morning sun, soft long shadows, light dew sparkle | a few spectators scattered on small white bleachers | a ball basket near the net post, birds in a clear blue sky |
| 2 | day | the same community sports center, festive with plain colorful pennant flags without text | green hard court (#3E8E5E) | bright late-morning sun, clear sky (#5FB4F0) | half-filled white stands, relaxed families | water bottles on a bench, gentle breeze moving the flags |
| 3 | day | a larger outdoor stadium court at the sports center with tall white stands | green hard court (#3E8E5E) | high noon sun, crisp short shadows, vivid summer clarity | full white stands with a watercolor crowd | heat shimmer at the far end, umbrellas in the stands |
| 4 | sunset | a seaside hillside tennis court with palm trees and a distant ocean horizon | terracotta orange hard court (#C4673F) | golden hour, warm orange sky (#F0784A to #FCD39B), long dramatic shadows | a modest crowd in silhouette | sun glare on the net tape, seagulls far away |
| 5 | sunset | the same hillside court at dusk with string lights along the fence | terracotta orange hard court (#C4673F) | magic hour, pink-purple sky, first string lights turning on | a lively crowd with warm rim light | first evening star, glowing fence lights reflected on the court |
| 6 | indoor | a modern indoor tennis hall with tall windows and skylights | blue urethane court (#2F6FAE) with warm wooden surround (#B9874F) | clean even ceiling lights mixed with soft daylight from the skylights | sparse spectators in dark seats | polished floor reflections, hanging acoustic panels |
| 7 | indoor | a professional indoor arena at night with a curved roof truss | blue urethane court (#2F6FAE) with wooden surround (#B9874F) | bright LED arena lighting, cool white tone, subtle haze | packed dark stands with a watercolor crowd | camera rigs on the side, glossy court reflections |
| 8 | night | an outdoor professional night stadium | navy blue hard court (#24578F) | powerful floodlights from four towers, deep navy night sky (#070B1E) | half-filled stands with excited fans | light beams cutting through faint mist, moths near the lights |
| 9 | night | the same night stadium for a semi-final, larger and more dramatic | navy blue hard court (#24578F) | floodlights plus warm accent spotlights on the court | fully packed stands, thousands of tiny phone lights twinkling | waving plain color flags without text, energetic atmosphere |
| 10 | night | a grand championship final stadium with a towering bowl of stands | navy blue hard court (#24578F) | dramatic spotlights converging on center court, light haze, golden accents | a roaring sold-out crowd, glittering phone lights everywhere | confetti cannons standing ready at the corners, an empty trophy pedestal beside the net post |

---

## 8. Stage 시작 Intro Video (4 s × 10) — stage_NN_intro_4s.mp4

게임에서는 이 Video 위에 **VS Card**(이름 / Type / Lv)와 Skip Button이 얹힌다. 따라서 **화면 중앙 상단~중앙은 지나치게 복잡하지 않게** 하고, 마지막 0.5 s는 Baseline 뒤 눈높이(게임 Camera와 같은 구도)로 끝나 실제 Match 화면에 자연스럽게 이어지게 한다. Start Frame에 stage_NN_key.webp를 사용한다.

### 8.1 공통 Prompt Template

```text
4-second stage intro video, 16:9, [STYLE]. Start frame: the provided stage key art.
0-2s: {OPENING_MOVE}.
2-3.5s: {VENUE_BEAT}.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
No players visible, no text, smooth continuous camera motion.
```

### 8.2 Stage별 값

| Stage | {OPENING_MOVE} | {VENUE_BEAT} |
| --- | --- | --- |
| 1 | slow aerial glide over the community sports center at morning, trees and courts below | a ball bounces once on the empty green court and rolls to the net, a bird flies past |
| 2 | camera dolly along the colorful pennant flags fluttering in the breeze | families settle in the white stands and wave, sunlight flickers through the flags |
| 3 | sweeping crane down from the bright noon sky past tall white stands | the crowd stands up and claps in a ripple, heat shimmer above the court |
| 4 | drone shot rising from the ocean horizon toward the hillside court at golden hour | palm leaves sway, the sun flares across the net tape |
| 5 | slow push in along the fence as string lights turn on one by one at dusk | the crowd's silhouettes cheer under a pink-purple sky, the first star appears |
| 6 | tracking shot through a glass entrance into the bright indoor tennis hall | skylight beams shift across the blue court, a ball machine rolls a ball to the baseline |
| 7 | fast dolly under the curved roof truss as the arena LED lights snap on | the packed stands roar, glossy reflections slide across the blue court |
| 8 | aerial approach to the night stadium as the four floodlight towers ignite | light beams cut through faint mist, the crowd waves scarves |
| 9 | orbiting shot around the packed stadium as thousands of phone lights twinkle | warm spotlights sweep across the navy court, flags wave in unison |
| 10 | dramatic rising crane revealing the giant championship bowl, spotlights converging on center court | a burst of golden sparks from the corner cannons, the roaring crowd stands, the empty trophy pedestal gleams |

**Audio (선택)**: Stage 1–7 light upbeat synth-pop sting, birds or hall ambience, Stage 8–10 deep drum hit, crowd roar swelling, stadium echo.

---

## 9. Stage Ending Video (Clear / Fail, 각 4 s × 10)

* Clear: stage_NN_clear_4s.mp4 / Fail: stage_NN_fail_4s.mp4
* 게임에서는 이 Video 위에 **"승리 / 패배" Banner**와 Skip이 얹히고, 끝나면 "점수 보기" Card가 나온다. Banner가 화면 중앙에 오므로 **중앙의 핵심 동작은 0–2.5 s 안에** 끝낸다.
* 사람(Character)은 등장시키지 않거나 **Racket / Ball / 관중 / 조명** 같은 사물·환경으로 감정을 표현한다(Player 선택 Character와 충돌 방지). Character의 승리 / 패배 동작은 §6 victory / defeat Sprite가 담당한다.

### 9.1 Clear 공통 Template

```text
4-second victory ending video, 16:9, [STYLE], {VENUE_SHORT}.
0-1.5s: {CLEAR_HERO}.
1.5-3s: {CLEAR_CROWD}.
3-4s: slow pull back to a calm wide shot of the court, warm celebratory light, open center space.
No players visible, no text.
```

### 9.2 Fail 공통 Template

```text
4-second defeat ending video, 16:9, [STYLE], {VENUE_SHORT}, gentle and hopeful rather than sad.
0-1.5s: {FAIL_HERO}.
1.5-3s: {FAIL_MOOD}.
3-4s: slow push in toward the net with a soft glint of light suggesting "try again", open center space.
No players visible, no text.
```

### 9.3 Stage별 값

| Stage | {VENUE_SHORT} | {CLEAR_HERO} | {CLEAR_CROWD} | {FAIL_HERO} | {FAIL_MOOD} |
| --- | --- | --- | --- | --- | --- |
| 1 | community sports center green court, morning | the yellow ball lands right on the white baseline, a puff of chalk-like sparkle | a few spectators clap, birds take off into the blue sky | the ball clips the net tape and drops back slowly | a soft breeze rolls the ball across the green court, sunlight stays bright |
| 2 | community sports center with pennant flags, late morning | a racket is tossed spinning into the air against the sun | families cheer, pennant flags flutter wildly | the ball rolls slowly to rest against the net | pennant flags sway calmly, a water bottle on the bench glistens |
| 3 | outdoor stadium court at noon, full white stands | the ball rockets past the far baseline leaving a bright trail | the full stands erupt in a standing ovation, hats thrown up | a racket lies on the hot green court, the ball beside it | heat shimmer, the crowd claps politely, clouds drift |
| 4 | seaside hillside court at golden hour | the ball cuts through a sun flare and kisses the line | the silhouetted crowd cheers, seagulls soar over the ocean | the ball bounces out past the line into long golden shadows | palm leaves sway, the sun dips toward the ocean |
| 5 | hillside court at dusk with string lights | string lights flash brighter all at once as the ball lands in | the crowd waves glowing phone lights under a pink sky | the ball rests in the corner under the string lights | the first evening star twinkles, lights glow softly on the court |
| 6 | modern indoor hall with skylights, blue court | the ball skids on the blue court and sprays tiny white sparks | scattered spectators rise and applaud, skylight beams brighten | the ball machine stops, one ball rolls along the baseline | skylight beams move slowly across the empty court |
| 7 | professional indoor arena with LED lights | the arena LEDs pulse in a wave as the ball lands in | the packed stands roar, camera flashes sparkle | the ball hits the net and the LED lights dim slightly | quiet arena hum, glossy reflections on the blue court |
| 8 | night stadium under floodlights | the ball streaks under the floodlights with a long glowing trail | fans wave scarves, floodlight beams sweep the sky | the ball bounces wide into the dark beyond the lines | mist drifts through the floodlight beams, the crowd's murmur fades |
| 9 | packed semi-final night stadium | a burst of white sparks as the ball lands on the line | thousands of phone lights wave like a sea of stars | the ball rolls to a stop at the net under a single spotlight | the phone lights slowly sway, the stadium hushes |
| 10 | grand championship final stadium | confetti cannons blast golden confetti as the ball lands in | fireworks burst above the bowl, the trophy pedestal shines in a spotlight | the trophy pedestal stands empty under a fading spotlight | golden confetti drifts unused in the haze, the crowd applauds respectfully |

**Audio (선택)**: Clear bright victory jingle, crowd cheer, Fail soft descending piano phrase, gentle crowd applause. (게임은 별도 Jingle bgm_victory / bgm_defeat도 재생하므로 Video Audio는 작게 Mix하거나 생략 가능.)

---

## 10. 추가 Image Prompts

게임 완성도와 Store 출시에 필요한 추가 이미지. **연결 상태**가 "후속"인 항목은 파일만 먼저 만들어 두면 다음 개발 단계에서 같은 파일명으로 연결한다.

### 10.1 App Icon — public/assets/icons/app_icon_1024.png (후속: PWA Manifest / Store)

```text
Mobile game app icon, 1024x1024 square, no rounded corners (the OS masks them), a single fluorescent yellow tennis ball with a crisp white seam bursting forward from a deep navy (#0E1A33) background, a short white speed trail and a few white sparks, a thin arc of a white court line behind it, bold simple silhouette readable at 48 px, [STYLE], no text.
```

### 10.2 Share Image / Splash — images/ui/og_share_1200x630.webp, images/ui/splash_portrait.webp (후속)

```text
Share image, 1200x630: eye-level telephoto view over a navy night stadium tennis court under floodlights, the three players (blue polo man, pink polo woman, orange polo man) seen from behind on the near baseline, a glowing yellow ball above the net, left 40% calm dark sky for a title overlay, [STYLE], no text.
Splash, 9:16: a fluorescent yellow tennis ball resting on a crisp white baseline of a green hard court, soft morning light, shallow depth of field, large empty upper half, [STYLE], no text.
```

### 10.3 Menu Background (Login / Match Setup) — images/ui/bg_menu_landscape.webp, images/ui/bg_menu_portrait.webp (후속)

UI Card가 위에 올라가므로 **저대비·부드러운 Blur 느낌**으로 만든다.

```text
Soft background for a game menu, {RATIO}, a tennis court seen from a high angle with gentle depth of field, large calm areas, pastel sky blue and court green with white line accents, subtle watercolor texture, low contrast, slightly blurred so UI panels stay readable, [STYLE], no people, no text.
```

### 10.4 Score 화면 Background — images/ui/bg_score_win.webp, images/ui/bg_score_lose.webp (후속)

```text
Win: celebratory background, golden confetti drifting over an empty tennis court at sunset, warm bokeh lights, center kept calm for score numbers, [STYLE], no text.
Lose: calm hopeful background, an empty tennis court at blue hour with soft lights, a single ball resting by the net, center kept calm for score numbers, [STYLE], no text.
```

### 10.5 How to Play 삽화 (4장) — images/howto/howto_0N.webp (후속, 현재 SVG)

```text
Clean instructional illustration, 4:3, [STYLE], simple flat background in soft court green, {SCENE}, large clear shapes readable on a phone, no text, no arrows with text.
```

| # | {SCENE} |
| --- | --- |
| 01 이동 | a player seen from behind gliding sideways on a tennis court, soft motion lines showing movement left and right, a translucent trapezoid touch pad shape in the lower left corner |
| 02 스트로크 선택 | a player seen from behind with three glowing ghost poses of the racket at high, middle and low heights on the forehand side and the backhand side |
| 03 떼는 순간 스윙 | close view of a racket meeting a fluorescent yellow ball at the exact moment of contact, a shrinking white timing ring around the ball turning yellow, white sparks |
| 04 서브 | a player seen from behind tossing a ball high above the head in a trophy pose, a dotted arc showing the toss path, the service box highlighted softly across the net |

### 10.6 VFX Sprite Sheet — images/vfx/ (후속, 현재 Procedural Particle) (11/10 updated)

> 11/10 Playtest 반영: 게임 표시 크기는 src/data/visual.json → fx.items에서 조정한다. 경기 종료 Camera가 Player에 가까워 Confetti가 화면 전체를 덮었다. 그래서 fx_confetti를 5.0 m → **2.6 m**로 줄이고, Player 위 3.2 m 높이에 2.2 m 간격으로 3번 터지게 바꿨다.

투명 배경이 어려운 Tool은 **Pure Black Background**로 만들고 게임에서 Additive Blend로 쓴다.

```text
Sprite sheet of a {EFFECT}, 8 frames in a single row on a pure black background, each frame centered and the same size, frames progress from start to end, glowing, clean cel-shaded effect style, no text.
```

| 파일 | {EFFECT} |
| --- | --- |
| fx_hit_perfect.webp | bright white and fluorescent yellow impact flash with radiating sharp sparks, expanding then fading |
| fx_hit_great.webp | white impact ring burst, smaller and softer |
| fx_bounce_dust.webp | small puff of court dust kicked up by a bouncing ball, soft and quick |
| fx_confetti.webp | burst of colorful confetti pieces (blue, pink, orange, yellow) spreading and falling |
| fx_net_shake.webp | small white ripple shock lines indicating a net hit |

### 10.7 Crowd Sprite Sheet — images/crowd/crowd\_{theme}.webp (후속, 현재 Capsule 관중)

```text
Sprite sheet of seated tennis spectators for a game crowd, 4 columns x 2 rows on a pure chroma green background (#00FF00), each cell one person seen from the front sitting, varied outfits in bright summer colors, cel-shaded 3D style with thin outlines, row 1 calm sitting poses, row 2 cheering poses with raised arms, {THEME_CLOTHING}, no text.
```

| Theme | {THEME_CLOTHING} |
| --- | --- |
| day | t-shirts, sun hats and sunglasses |
| sunset | light jackets, warm rim light from the side |
| indoor | casual sportswear, even lighting |
| night | team scarves and glowing phone lights in hand, cool blue rim light |

---

## 11. 추가 Motion Prompts (선택, 후속 연결) (11/10 updated)

§6 Tier 1 / 2 이후 완성도를 더 높이는 Motion. 같은 §6.2 규칙 · [MOTION_STYLE] · §6.5 Template을 사용하고, 파일은 같은 raw_assets/images_src/motion/{char}/{view}/에 넣는다(현재 Tool은 미등록 ID를 건너뛰므로, 연결할 때 motion.config.json → clips에 추가한다).

| Clip ID | 용도 | {ACTION} |
| --- | --- | --- |
| point_win | 득점 직후 짧은 반응 | 0-0.5s neutral; 0.5-2.5s a quick fist pump and a short "come on" shout, racket tapped against the palm; 2.5-4.0s return to ready stance |
| point_lose | 실점 직후 짧은 반응 | 0-0.5s neutral; 0.5-2.5s looks up briefly, shakes the head, adjusts the racket strings with the fingers; 2.5-4.0s return to ready stance |
| smash | NPC / Player 강타 | 0-1.0s backpedal into sideways stance with the left hand pointing up; 1.0-1.6s racket cocked behind the head; contact at full overhead extension exactly at 2.0s with a jump; 2.0-2.8s violent follow-through and landing; 2.8-4.0s recover |
| reach_fh | 먼 공 Forehand (Extended Reach) | same timing as a forehand, but a big lunge step to the right, the arm and racket fully extended at contact at 2.0s, then a push-off recovery |
| reach_bh | 먼 공 Backhand | same timing as a backhand, a big lunge to the left with a one-handed slice reach at contact at 2.0s |
| run_forward / run_back | 앞뒤 이동 | running in place toward / away from the camera, steady rhythm, racket ready. Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time. |
| walk_in | Match 시작 입장 (Intro 4 s 동안) | walking calmly into position from the screen edge to the center, bouncing on the toes, rolling the shoulders, then settling into ready stance at 3.5s |
| crowd_cheer_loop (Video) | 관중 Billboard Loop | seated crowd row on green screen, people clapping and cheering in a seamless loop |

---

## 12. Asset 폴더 & 파일명 규칙

Flow에서 받은 **원본(jpg / png / mp4)은 전부 Inbox raw_assets/images_src/에만** 넣고, npm run images가 게임용 파일을 public/assets/에 만든다(public/assets/는 직접 편집하지 않는다). Inbox는 public/assets/와 같은 하위 구조이며, 파일명은 확장자만 다르고 같다(정확한 이름은 09 문서의 넣을 곳). **파일이 없으면 자동으로 Procedural 연출로 대체**되므로 순서 상관없이 하나씩 넣어도 된다.

```text
raw_assets/                                     ← AI 원본 (게임 미배포)
├── images_src/                                 ← Inbox: Flow 다운로드를 이름만 바꿔 넣는 곳
│   ├── images/{title,stages,characters,concept,ui,howto,vfx,crowd}/*.jpg|png  → public/assets/images/…/*.webp
│   ├── icons/app_icon_1024.jpg                                    → public/assets/icons/app_icon_1024.png
│   ├── video/{intro,stages,crowd}/*.mp4                           → public/assets/video/…/*.mp4 (H.264, `_4s`/`_6s` Trim)
│   ├── motion/char_0N/{back|front}/{clipId}.mp4, _start.jpg       → public/assets/motion/… (Sprite Atlas, §6.7)
│   └── references/char_0N_turnaround.jpg                          ← Flow Reference 전용, 변환 안 함
└── _preview/motion/                            ← npm run motion -- --preview 결과 (Git 제외)

public/assets/                                  ← 게임 배포 Asset (npm run images / motion 결과)
├── motion/                                     ← npm run motion 결과 (자동 생성, 직접 편집 금지)
│   └── char_0N/{back|front}/{clipId}.webp + manifest.json      (게임 연결됨)
├── video/
│   ├── intro/intro_6s.mp4                                       (게임 연결됨)
│   └── stages/stage_NN_{intro|clear|fail}_4s.mp4                (게임 연결됨)
├── images/
│   ├── title/title_key_visual_{landscape|portrait}.webp        (게임 연결됨)
│   ├── stages/stage_NN_key.webp                                 (게임 연결됨)
│   ├── characters/char_0N_portrait.webp                         (게임 연결됨)
│   │              char_0N_turnaround.png, char_0N_victory.webp, char_0N_defeat.webp  (참고 · 홍보)
│   ├── ui/        og_share_1200x630.webp, splash_portrait.webp, bg_menu_*.webp, bg_score_*.webp  (후속)
│   ├── howto/     howto_01–04.webp                              (후속)
│   ├── vfx/       fx_*.webp                                     (후속)
│   ├── crowd/     crowd_{day|sunset|indoor|night}.webp          (후속)
│   └── concept/   Mood Board, 시안 (게임 미사용)
├── audio/bgm, audio/sfx                        ← 07 §14.3 (현재 Procedural, 후속)
└── icons/app_icon_1024.png                     ← Store / PWA (후속)
```

| Asset | 게임 연결 위치 | 없을 때 |
| --- | --- | --- |
| motion/char_0N/back/\* | Player 캐릭터 (Match 중) | Procedural Toon Mannequin |
| motion/char_0N/front/\* | NPC 캐릭터 (Match 중) | Procedural Toon Mannequin |
| intro_6s.mp4 | Intro 화면 | Logo + Court Silhouette Card |
| title_key_visual\_\*.webp | Title 화면 배경 | Court Silhouette 배경 |
| char_0N_portrait.webp | Match Setup Character Card | SVG Portrait |
| stage_NN_key.webp | Match Setup Stage Tile | Theme Gradient |
| stage_NN_intro_4s.mp4 | Match 시작 (VS Card 아래) | Camera Fly-in 4 s |
| stage_NN_clear/fail_4s.mp4 | Match 종료 (Banner 아래) | Victory / Defeat Pose + Camera Orbit |

> Free Mode는 Stage Video를 사용하지 않고 항상 Camera 연출로 진행한다. Motion Sprite는 Stage / Free 모두 사용한다.

---

## 13. 후처리 & 검수 Checklist

### 13.1 변환 Command (예시)

```bash
# 원본을 raw_assets/images_src/ 에 넣은 뒤
npm run images                 # Image → WebP, Icon → PNG, Video → H.264 mp4, 바뀐 Motion Set → Sprite Atlas
npm run images -- --missing    # 아직 안 넣은 파일 목록
npm run images -- --force      # 전부 다시 변환
npm run motion -- --preview    # Motion Timing 확인
```

변환 품질·크기는 tools/assets/assets.config.json(Image quality / 최대 가로, Video CRF 등)과 tools/motion/motion.config.json에서 조정한다. Project 안의 ffmpeg(node_modules/ffmpeg-static/ffmpeg.exe)를 자동 사용하므로 PATH 설정이 필요 없다.

### 13.2 검수 항목 (11/10 updated)

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | Text / Logo | 화면 어디에도 글자·숫자·Brand Mark 없음 |
| 2 | Character 일관성 | §5.1 Color / Hair / Accessory 일치, 손가락·Racket 형태 정상, Clip 간 의상 변화 없음 |
| 3 | Theme 일관성 | Stage별 Court Color가 §1.4 Hex와 일치 |
| 4 | Safe Area | 핵심 피사체가 화면 중앙 세로 1/3 띠 안에 있음 (Portrait Crop 대비) |
| 5 | Overlay 공간 | Intro / Ending Video 중앙에 UI Card가 올라가도 가독성 유지 |
| 6 | 길이 | Intro 6.0 s, Stage Intro / Ending / Motion 4.0 s (±0.2 s) |
| 7 | 용량 | 연출 Video 4 s ≤ 3 MB, 6 s ≤ 5 MB, Image ≤ 400 KB 권장 |
| 8 | 톤 | 밝고 청량, Fail / Defeat도 "다시 도전" 느낌 (우울·공포 톤 금지) |
| 9 | **Motion: Key 품질** | Preview에서 초록 테두리·구멍 없음 (머리카락, Racket String 포함) |
| 10 | **Motion: 고정성** | Camera 흔들림 없음, idle에서 발 위치가 Frame 내내 고정 |
| 11 | **Motion: Timing** | Swing Contact가 2.0 s(Serve 2.2 s) ±0.15 s, 벗어나면 overrides로 보정 |
| 12 | **Motion: 방향** | back은 얼굴이 안 보임, front는 정면, run_left는 화면 왼쪽으로 달림 |
| 13 | **Motion: 게임 확인** | npm run dev로 Match에 들어가 Contact 순간 Racket과 Ball이 맞는지 확인 |
| 14 | **Motion: Stroke 방향** (11/10) | 오른손잡이 Forehand는 back에서 화면 오른쪽, front에서 화면 왼쪽. Backhand·reach_bh는 그 반대쪽. run_right는 몸이 화면 오른쪽을 향함 |
| 15 | **Motion: 달리기 품질** (11/10) | 같은 보폭이 반복되고, 몸을 돌리지 않으며, 중간에 Swing이 없음. npm run motion:audit -- --grid Grid로 확인 |
| 16 | **전체 Playtest** (11/10) | npm run dev 실행 상태에서 npm run e2e:play: Character·Theme 4조합이 Bot 자동 조작으로 Intro → Match → 종료 → 스코어 보기 → Score 화면까지 오류 없이 완주 (docs/reports/playtest/) |
