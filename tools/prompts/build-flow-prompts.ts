/**
 * Generates "09_Flow Prompt Full Set for each object.md": every prompt from 08 fully expanded
 * (style + subject + action + view + tempo + negative) so each block is one copy-paste into Google Flow.
 *
 *   npm run prompts
 *
 * Source of truth for wording: 08_AI Prompt Master Set.md. Edit the tables below, then regenerate.
 */
import { writeFileSync } from 'node:fs';
import { plainMarkdown } from '../docs/plainMarkdown';
import { join } from 'node:path';

// ------------------------------------------------------------------ shared blocks (08 §2, §6.2)

const STYLE =
  'realistic cel-shaded 3D render, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, soft rim light, subtle watercolor texture in sky and background, bright clean summer sports mood, crisp white court lines, fluorescent yellow tennis ball, high clarity, cinematic composition';
const NEG =
  'text, letters, numbers, logo, watermark, signature, brand marks, scoreboard digits, banner text, subtitles, UI, frame border, extra fingers, deformed hands, extra limbs, duplicated racket, broken racket strings, melted face, blurry, low resolution, oversaturated, heavy bloom, horror, gritty, dirty, photo-realistic skin pores, chibi, super-deformed proportions';
const MOTION_STYLE =
  'realistic cel-shaded 3D character animation, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines, full body always in frame, the character occupies 80% of the frame height and stays centered, locked-off static camera, eye-level telephoto 85mm lens, absolutely no camera movement, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, even soft studio lighting, crisp limbs, no motion blur, high shutter speed';
const MOTION_NEG =
  'camera movement, zoom, pan, shake, cuts, multiple shots, motion blur, ghosting, floor shadow, green clothing, green racket, cropped feet, cropped head, cropped racket, extra limbs, extra rackets, morphing outfit, changing hairstyle, tennis ball, text, logo, watermark, background music';

// ------------------------------------------------------------------ characters (08 §5.1)

type CharId = 'char_01' | 'char_02' | 'char_03';
type ThemeId = 'day' | 'sunset' | 'indoor' | 'night';

interface Char {
  id: CharId;
  name: string;
  ko: string;
  desc: string;
  tempo: string;
  portraitColor: string;
  portraitPose: string;
  promoTheme: ThemeId;
}

const CHARS: Char[] = [
  {
    id: 'char_01',
    name: 'David',
    ko: '데이비드',
    desc: 'a right-handed man in his mid-twenties, 182 cm, balanced athletic build, warm light skin (#E8BE9A), short neat dark brown hair (#3B2A1E), calm confident expression, blue polo shirt (#2E7DD7) with thin white collar trim, white tennis shorts, white headband, white wristband on the right wrist, white tennis shoes, black carbon racket with blue grip tape',
    tempo: 'smooth, textbook technique, balanced and controlled, relaxed shoulders',
    portraitColor: 'blue (#2E7DD7)',
    portraitPose: 'slight calm smile, looking at the viewer',
    promoTheme: 'day',
  },
  {
    id: 'char_02',
    name: 'Susan',
    ko: '수잔',
    desc: 'a right-handed woman in her early twenties, 168 cm, slim agile athletic build, fair skin (#F1CBA8), honey-blonde hair (#C9873A) in a high bouncy ponytail, bright playful expression, pink polo shirt (#E04F8A), white pleated tennis skirt, white visor, pink wristband, white tennis shoes, black carbon racket with pink grip tape',
    tempo: 'quick and light, springy footwork, compact sharp swing, ponytail bouncing',
    portraitColor: 'pink (#E04F8A)',
    portraitPose: 'cheerful wink, ponytail swinging, racket spun in hand',
    promoTheme: 'sunset',
  },
  {
    id: 'char_03',
    name: 'Wolfson',
    ko: '울프슨',
    desc: 'a right-handed man in his late twenties, 188 cm, tall powerful build with broad shoulders, tan skin (#C98E64), short black fade haircut (#141414), bold determined expression, orange polo shirt (#F29B2E), navy tennis shorts (#26324A), black wristband, sports watch on the left wrist, white tennis shoes, black carbon racket with orange grip tape',
    tempo: 'heavy and explosive, big shoulder coil, powerful hip rotation, long follow-through',
    portraitColor: 'orange (#F29B2E)',
    portraitPose: 'serious gaze, racket gripped firmly across the chest',
    promoTheme: 'night',
  },
];

const THEME_LIGHT: Record<ThemeId, string> = {
  day: 'bright clear summer daylight, blue sky (#5FB4F0), green hard court (#3E8E5E), white stands',
  sunset: 'warm golden-hour sunset light, orange sky (#F0784A to #FCD39B), terracotta hard court (#C4673F), long shadows',
  indoor: 'clean even indoor arena lighting, blue urethane court (#2F6FAE) with wooden surround (#B9874F)',
  night: 'floodlit night stadium, deep navy sky (#070B1E), navy blue hard court (#24578F), glowing crowd lights',
};

type View = 'back' | 'front';
const VIEW_TEXT: Record<View, string> = {
  back: 'straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image',
  front: 'straight front view facing the camera at eye level, the racket hand is on the left side of the image',
};
const VIEW_KO: Record<View, string> = { back: 'Back (Player용)', front: 'Front (NPC용)' };

// ------------------------------------------------------------------ motion clips (08 §6.3, §6.6, §11)

type Loop = 'pingpong' | 'loop' | 'once';
interface Motion {
  id: string;
  file: string;
  tier: '1' | '2' | 'extra';
  ko: string;
  loop: Loop;
  segment: string;
  endFrame: boolean;
  stroke?: Stroke;
  /** Start frame override (coiled pose); the end frame is then the neutral `_start.jpg`. */
  keyFrame?: KeyFrame;
  action: string;
  flavor: Record<CharId, string>;
  /** Run clips: adds RUN_CYCLE after the action line. */
  cycle?: boolean;
}

const UPDATED = ' (11/10 updated)';

/** 11/10 addition to every run prompt: Flow runs had no repeating stride, turned around, or swung the racket mid-clip. */
const RUN_CYCLE =
  'Running cycle: the same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s, the body never turns and keeps exactly the same facing direction for the whole clip, and the racket stays in the ready position in front of the body with no swing at any time.';

/**
 * Back-view runs (Player). Flow ignored "screen-right" while the start frame's racket pointed screen-left and the
 * end frame forced a square back view, so side runs turn to a profile and name every body part's direction, and
 * run_back (played when the Player moves toward the net) is a forward run away from the camera. No end frame.
 * Verified on 11/10 Flow output (char_01/02/03 run_right, char_02 run_left, char_03 run_back).
 */
const PRONOUN: Record<CharId, { s: string; p: string }> = {
  char_01: { s: 'he', p: 'his' },
  char_02: { s: 'she', p: 'her' },
  char_03: { s: 'he', p: 'his' },
};
const BACK_RUN: Record<CharId, { style: string; tempo: string; arms: string; push: string; extra: string }> = {
  char_01: {
    style: 'efficient smooth running steps with a level head',
    tempo: 'smooth, textbook technique, balanced and controlled, relaxed shoulders',
    arms: 'the arms pump gently',
    push: 'pushes off and follows',
    extra: '',
  },
  char_02: {
    style: 'quick light running steps on the balls of the feet, springy rhythm, ponytail bouncing with every step',
    tempo: 'quick and light, springy footwork, agile and cheerful',
    arms: 'the arms pump gently',
    push: 'pushes off and follows',
    extra: ', her ponytail streams back behind her head away from the {EDGE} edge',
  },
  char_03: {
    style: 'big powerful running strides with heavy footfalls, strong knee drive, low center of gravity',
    tempo: 'heavy and explosive, powerful driving legs, determined',
    arms: 'the arms pump powerfully',
    push: 'drives hard off the ground and follows',
    extra: '',
  },
};
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function backRunPrompt(c: Char, clip: string): string | null {
  const pr = PRONOUN[c.id];
  const r = BACK_RUN[c.id];
  const head = `4-second character motion clip, 16:9, ${MOTION_STYLE}.
Start frame: the provided image of this exact character standing with ${pr.p} back to the camera.
Camera: the camera stays fixed behind the character at eye level for the whole clip and never moves.`;
  const tail = (avoid: string) => `Character: ${c.desc}.
Style of movement: ${r.style}. Tempo and personality: ${r.tempo}.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: ${avoid}, ${MOTION_NEG}, ${NEG}.`;
  if (clip === 'run_left' || clip === 'run_right') {
    const edge = clip === 'run_right' ? 'right' : 'left';
    const E = edge.toUpperCase();
    const near = edge === 'right'
      ? `${pr.p} right shoulder and racket arm are nearest to the camera, ${pr.p} nose points to the right edge of the image. ${cap(pr.s)} swings the racket around so the racket head also points to the right edge of the image, held at waist height in front of ${pr.p} body with both hands`
      : `${pr.p} free arm and shoulder are nearest to the camera and ${pr.p} racket arm is on the far side of ${pr.p} body, ${pr.p} nose points to the left edge of the image. ${cap(pr.s)} holds the racket at waist height in front of ${pr.p} body with both hands, the racket head pointing to the left edge of the image`;
    return `${head}
Direction: the character moves toward the ${E} EDGE of the image for the entire clip. Everything about ${pr.p} body points to the ${edge} edge of the image.
Action (timed precisely): 0-0.5s ${pr.s} quickly turns ${pr.p} hips, chest, knees and toes a quarter turn so they all point to the ${edge} edge of the image; now the camera sees ${pr.s === 'she' ? 'her' : 'him'} in side profile running toward the ${edge} edge, ${near}. 0.5-4.0s ${pr.s} runs toward the ${edge} edge of the image in place like on a treadmill: the leading foot reaches out toward the ${edge} edge, the trailing foot ${r.push}, the body leans forward toward the ${edge} edge, ${r.arms}${r.extra.replace('{EDGE}', edge)}. The same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s. ${cap(pr.s)} never turns back toward the camera, never turns away to face the other direction, and never swings the racket.
${tail(`facing the camera, square back view during the run, turning around at the end, moving toward the opposite edge, racket head pointing away from the ${edge} edge, racket swing`)}`;
  }
  if (clip === 'run_back') {
    return `${head}
Direction: the character runs straight ahead, AWAY FROM THE CAMERA, toward the far distance in front of ${pr.s === 'she' ? 'her' : 'him'} (toward the tennis net) for the entire clip. ${cap(pr.s)} is seen from directly behind for the whole clip: ${pr.p} back, the back of ${pr.p} head and the soles of ${pr.p} shoes are what the camera sees; ${pr.p} face is never visible.
Action (timed precisely): 0-0.5s ${pr.s} leans ${pr.p} upper body forward and pushes off into a forward run. 0.5-4.0s ${pr.s} runs forward away from the camera in place like on a treadmill: strong knee drive forward, each foot kicks back toward the camera after push-off so the soles of the shoes flash toward the camera, the arms pump forward and back, the racket is held in front of ${pr.p} chest with both hands in the ready position with the racket head up. The same two-step running cycle repeats again and again with an identical pose at 1.0s, 2.0s and 3.0s. ${cap(pr.s)} never turns sideways, never turns around to face the camera, never runs backward, and never swings the racket at any time.
${tail('face visible, turning sideways, side profile, turning around, running backward, backpedaling, racket swing, forehand, backhand, hitting motion')}`;
  }
  return null;
}

/**
 * Back-view two-handed backhands (Player). The 11/10 review found no shoulder turn in the take-back, a long looping
 * take-back (0.35–0.45 s to contact) and a follow-through that wraps behind the head. The game holds the coiled frame
 * and plays the last 0.25 s before contact, so the prompt asks for a compact 0.3 s forward swing from a full unit turn.
 */
const BACK_BH_HEIGHT: Record<string, { contact: string; legs: string; path: string; finish: string }> = {
  bh_high: {
    contact: 'at shoulder height',
    legs: 'stands tall with the knees only slightly bent',
    path: 'a level, flat path at shoulder height',
    finish: 'the hands finish just above the right shoulder',
  },
  bh_mid: {
    contact: 'at waist height',
    legs: 'keeps the knees bent in an athletic stance',
    path: 'a gentle low-to-high path from just below the waist',
    finish: 'the hands finish at the height of the right shoulder',
  },
  bh_low: {
    contact: 'at knee height',
    legs: 'bends both knees deeply and keeps the back straight, both feet stay planted parallel to the baseline at shoulder width with no lunge or step toward the left side of the image',
    path: 'a low-to-high lifting path starting from below the knees',
    finish: 'the hands finish at the height of the right shoulder',
  },
};

function backBhPrompt(c: Char, m: Motion): string | null {
  const h = BACK_BH_HEIGHT[m.id];
  if (!h || m.stroke !== 'bh2') return null;
  const pr = PRONOUN[c.id];
  const P = pr.p;
  return `4-second character motion clip of a tennis player hitting a two-handed backhand groundstroke, 16:9, ${MOTION_STYLE}.
Start frame: the provided key frame shows this exact character already coiled at the peak of the two-handed backswing on the non-racket side; end frame: the same character in the neutral ready stance.
View: straight back view seen from directly behind at eye level, the face is not visible, the racket hand is on the right side of the image. The view angle never changes.
Character: ${c.desc}.
Action (timed precisely): 0-0.4s ${pr.s} holds a full unit turn: hips and shoulders are turned a quarter turn to the left, so the left shoulder is closer to the camera and the back of ${P} right shoulder points toward the net, chin tucked over the right shoulder, ${pr.s} ${h.legs}, both hands on the handle with the racket head low behind ${P} own LEFT hip, never above shoulder height, the racket stays still with no loop; 0.4-0.7s one fast compact two-handed forward swing: the hips turn first, then the shoulders, the racket travels on ${h.path} across the front of the body from the left side of the image to the right side of the image, contact with an imaginary ball ${h.contact}, out in front of the body, exactly at 0.7s, both arms extended forward away from the camera at contact; 0.7-1.2s the racket keeps going forward toward the net and then up while the hands keep moving to the RIGHT side of the image, the chest now squarely faces the net, ${h.finish}, the racket head points straight up next to the right ear, at 1.2s both hands and the racket are on the right side of the image and nothing is above the left shoulder; 1.2-3.0s the body relaxes and smoothly returns to the neutral ready stance of the end frame; 3.0-4.0s holds that ready stance.
Hand path checkpoints (as seen by the camera behind the player): at 0.7s the hands are out in front of the body just left of the spine, ${h.contact}; at 0.85s the hands pass in front of the chest, hidden by ${P} back; at 1.0s the hands appear above the RIGHT shoulder; at 1.2s the hands rest beside the right ear with the right elbow pointing down and the left elbow pointing forward toward the net. The racket travels like a windshield wiper from the left hip, through the front of the body, to the right shoulder; after contact it is never seen above the left shoulder or above the top of the head, and the hands never stop on the left side of the image.
Body: ${pr.s} stays seen from behind for the whole clip, the head keeps looking toward the net, ${P} face never turns toward the camera and ${pr.s} never turns into a side profile.
Stroke check: BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the take-back is short and the racket never circles above the shoulders before contact, the shoulders rotate clearly from sideways at the start to square to the net at the finish, contact happens in front of the body, the racket finishes next to the right ear and never wraps around the neck or behind the head.
Style of movement: ${m.flavor[c.id]}. Tempo and personality: ${c.tempo}.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks.
Avoid: one-handed swing, letting go of the racket with the left hand, big looping take-back, racket raised above the head before contact, shoulders staying square during the take-back, racket wrapping around the neck, racket behind the head at the finish, racket lifted over the left shoulder after contact, finish on the left side of the image, hands stopping on the left side after contact, racket over the top of the head, face turned toward the camera, side profile, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact, ${MOTION_NEG}, ${NEG}.`;
}

const BACK_BH_NOTE =
  'Player용 Backhand Prompt(11/10 개정): 기존 Clip은 테이크백에 어깨 회전이 없고, 라켓이 크게 원을 그리며(Contact까지 0.35–0.45 s), 팔로스루가 머리 뒤로 감겼다. 개정 Prompt는 어깨를 옆으로 돌린 자세(Unit Turn)에서 0.3 s 짧은 스윙 → **Contact 0.7 s** → 오른쪽 귀 옆 피니시. Start / End Frame은 그대로(`_bh_key.jpg` → `_start.jpg`). 사용 구간 0.2–1.6 s · backswing 0.4 / contact 0.7.';

/** 11/10 motion review (docs/reports/motion_review.md, tools/motion/motion.review.json) per generated clip. */
const RUN_NOTE =
  'Flow 결과에 반복되는 보폭 주기가 없거나 끝에서 몸을 돌리는 경우가 많아, 게임은 깨끗한 구간만 잘라 Pingpong / Crossfade Loop로 재생하고 발 위치를 Frame마다 고정한다(`stabilize`). 다시 생성할 때는 `Running cycle:` 문장이 들어간 아래 Prompt를 쓴다.';
const BACK_RUN_NOTE =
  'Player용 달리기 Prompt(11/10 개정): Start Frame의 라켓이 화면 왼쪽을 가리키고 End Frame이 정면 뒷모습을 강제해 Flow가 방향을 무시했다. 옆 달리기는 0.5 s 안에 진행 방향 옆모습으로 돌아서게 하고 몸의 모든 부위 방향을 지정한다. `run_back`은 Player가 Net 쪽으로 다가갈 때 쓰이므로 뒷모습 그대로 앞으로 달린다. **End Frame은 넣지 않는다.** 처음 0.8 s(돌아서는 동작)는 게임이 자동으로 잘라낸다.';
const REVIEW_NOTES: Record<string, string> = {
  'char_01/back/reach_bh': 'Backhand인데 Forehand 쪽(화면 오른쪽)으로 뻗는 Reach로 생성됨 → 게임에서 제외하고 `bh_mid`로 대체. **다시 생성 권장** (Start Frame = `_slice_key.jpg` 확인).',
  'char_01/back/run_right': '**아래 Prompt로 다시 생성 완료** — 오른쪽을 향한 옆모습으로 달리는 반복 주기 확인, 게임 연결됨.',
  'char_01/back/bh_mid': '**11/10 개정 Prompt로 다시 생성 완료** — 짧은 테이크백, 오른쪽 귀 옆 피니시 확인, 게임 연결됨 (backswing 0.75 / contact 1.0).',
  'char_01/back/bh_low': '**11/10 다시 생성 완료** — 짧은 테이크백, 라켓이 무릎 높이까지 내려감(무릎은 깊게 굽히지 않음), 게임 연결됨 (backswing 0.65 / contact 0.9).',
  'char_02/back/bh_high': '**11/10 다시 생성 완료** (M-061) — 어깨 높이 Contact, 오른쪽 어깨 위 피니시, 게임 연결됨 (backswing 0.8 / contact 1.05).',
  'char_02/back/bh_mid': '**11/10 2차 생성본 적용** (M-053 v2) — 짧은 테이크백, Key Pose가 4분의 3 뒷모습이라 피니시는 오른쪽 어깨 위로 감기는 형태. 기존(큰 원 테이크백 + 목 감김)보다 개선, 게임 연결됨 (backswing 0.65 / contact 0.85).',
  'char_02/back/bh_low': '**11/10 2차 생성본 적용** (M-062 v2) — 무릎 높이 Contact, 잠깐 옆모습 후 1.8 s에 뒷모습 복귀. 기존(정면으로 돌아서 얼굴이 보임)보다 개선, 게임 연결됨 (backswing 0.65 / contact 0.9).',
  'char_03/back/bh_high': '**11/10 다시 생성 완료** (M-109) — 짧은 테이크백, 1.1 s에 오른쪽 귀 옆 피니시, 게임 연결됨 (backswing 0.7 / contact 0.85).',
  'char_03/back/bh_mid': '**11/10 2차 생성본 적용** (M-101 v2) — 짧은 테이크백, 1.2 s부터 오른쪽 귀 옆 피니시, 게임 연결됨 (backswing 0.7 / contact 0.9).',
  'char_03/back/bh_low': '**11/10 3차 생성본 적용** (M-110 v3, 발 고정 문장 추가 Prompt) — 1 · 2차는 왼쪽 런지 후 손이 머리 왼쪽에 머물러 불합격. 3차는 발 고정, 무릎 높이 Contact 후 손이 오른쪽으로 이동, 오른쪽 어깨 위 피니시, 게임 연결됨 (backswing 0.75 / contact 0.95).',
  'char_01/back/bh_high': '**11/10 보강 Prompt로 다시 생성 완료** (1차본은 Contact 뒤 왼쪽 어깨 위로 올라가 불합격) — 어깨 높이 Contact, 1.0 s에 오른쪽 귀 옆 피니시, 게임 연결됨 (backswing 0.6 / contact 0.8).',
  'char_02/back/run_right': '**아래 Prompt로 다시 생성 완료** — 오른쪽을 향한 옆모습으로 달리는 반복 주기 확인, 게임 연결됨.',
  'char_03/back/run_right': '**아래 Prompt로 다시 생성 완료** — 오른쪽을 향한 옆모습으로 달리는 반복 주기 확인, 게임 연결됨.',
  'char_01/back/run_left': '2.5 s 이후 몸을 돌림 → 1.0–2.5 s 구간만 사용. 다시 만들 때는 아래 Prompt 사용.',
  'char_02/back/run_left': '**아래 Prompt로 다시 생성 완료** — 3.8 s부터 돌아서므로 1.0–3.6 s 구간 사용.',
  'char_02/front/run_right': 'Clip 중간에 라켓 Swing이 들어 있음 → 달리는 2.2–3.9 s 구간만 사용. **다시 생성 권장**.',
  'char_03/back/run_back': '**아래 Prompt로 다시 생성 완료** — 뒷모습 그대로 Net 방향으로 달림, Swing 없음.',
  'char_03/front/run_back': '1.7–2.7 s에 Swing이 들어 있음 → 0.4–1.6 s 구간만 사용. **다시 생성 권장**.',
};

/** Right-handed source clips: forehand side as it appears in the image for each camera view. */
const SIDE_IMG: Record<View, { fh: string; bh: string }> = {
  back: { fh: 'toward the right side of the image', bh: 'toward the left side of the image' },
  front: { fh: 'toward the left side of the image', bh: 'toward the right side of the image' },
};

function dedupeAvoid(line: string): string {
  const terms = line.slice('Avoid: '.length).replace(/\.$/, '').split(/,\s*/);
  return `Avoid: ${[...new Set(terms.map((t) => t.trim()).filter(Boolean))].join(', ')}.`;
}

/** Direction the net lies in for each camera view (front view: the character faces the camera across the net). */
const NET_DIR: Record<View, string> = { back: 'away from the camera', front: 'toward the camera' };

type Stroke = 'fh' | 'bh2' | 'bh1';

/** Stroke identity stated up front, re-checked with body mechanics only that stroke has, and the opposite stroke excluded. */
/**
 * Stroke identity stated up front, re-checked with body mechanics only that stroke has. Flow has no negative field,
 * so the opposite stroke is never named (naming it in "Avoid" primes the model toward it); avoid terms describe poses.
 */
const STROKE: Record<Stroke, { headline: string; check: string; avoid: string }> = {
  fh: {
    headline: 'a tennis player hitting a forehand groundstroke with the right hand',
    check:
      "the right hand alone swings the racket on the character's own right side, the racket arm never crosses in front of the chest before contact, the palm side of the racket hand faces forward at contact, the left arm points toward the ball and then folds across the body",
    avoid: 'two-handed grip during the swing, racket arm crossing the chest before contact, racket taken back on the left side',
  },
  bh2: {
    headline: 'a tennis player hitting a two-handed backhand groundstroke',
    check:
      "BOTH hands grip the racket handle for the entire swing (left hand above the right hand), the swing starts from the coiled pose of the start frame with the racket behind the character's own LEFT hip, the racket travels across the front of the body {BH_PATH}, contact happens in front of the left hip, the finish is high over the right shoulder with both hands still on the handle",
    avoid: 'one-handed swing, letting go of the racket with the left hand, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact',
  },
  bh1: {
    headline: 'a tennis player hitting a one-handed backhand slice',
    check:
      "only the right hand holds the racket, the swing starts from the coiled pose of the start frame with the racket head high behind the character's own LEFT shoulder, the racket travels high-to-low across the front of the body {BH_PATH}, the back of the racket hand faces forward at contact in front of the left hip, the left arm extends backward for balance",
    avoid: 'two-handed swing, the racket moving back to the other side before contact, reversing the swing direction, open palm facing forward at contact',
  },
};

/** Image-space travel of a right-hander's backhand swing, and where the coiled racket sits in the key frame. */
const BH_IMG: Record<View, { path: string; racketSide: string; nearShoulder: string; look: string }> = {
  back: {
    path: 'from the left side of the image to the right side of the image',
    racketSide: 'LEFT',
    nearShoulder: 'the left shoulder is closer to the camera and the right shoulder points away from the camera',
    look: 'away from the camera over the right shoulder',
  },
  front: {
    path: 'from the right side of the image to the left side of the image',
    racketSide: 'RIGHT',
    nearShoulder: 'the right shoulder is closer to the camera than the left shoulder and the chest turns toward the right side of the image',
    look: 'toward the camera over the right shoulder',
  },
};

type KeyFrame = '_bh_key' | '_slice_key';

const SWING_TIMING_FH =
  "0-1.0s ready stance; 1.0-1.6s the left hand releases the racket and points toward the incoming ball, the shoulders coil so the left shoulder points {NET}, and the right hand alone takes the racket back on the character's own right side ({FH_IMG}), the backswing peaks exactly at 1.6s; 1.6-2.0s fast forward swing on the right side of the body, the racket meets an imaginary ball {HEIGHT}, in front of the right hip, exactly at 2.0s; 2.0-2.8s full forehand follow-through {FINISH}; 2.8-4.0s the left hand returns to the racket and the character recovers to the same ready stance as the first frame";
/** Starts from the coiled backhand key frame (start frame) and ends on the neutral ready pose (end frame). */
const SWING_TIMING_BH =
  "0-0.5s holds the coiled two-handed backswing of the start frame with a tiny loading settle, both hands on the handle, the backswing peaks exactly at 0.5s; 0.5-0.9s fast two-handed forward swing across the front of the body {BH_PATH}, contact with an imaginary ball {HEIGHT}, in front of the left hip, exactly at 0.9s; 0.9-1.7s two-handed follow-through {FINISH} with both hands still on the handle; 1.7-3.2s the body unwinds and smoothly recovers to the neutral ready stance of the end frame; 3.2-4.0s holds that ready stance";
const fh = (height: string, finish: string) => SWING_TIMING_FH.replace('{HEIGHT}', height).replace('{FINISH}', finish);
const bh = (height: string, finish: string) => SWING_TIMING_BH.replace('{HEIGHT}', height).replace('{FINISH}', finish);

const MOTIONS: Motion[] = [
  {
    id: 'idle', file: 'idle', tier: '1', ko: 'Ready 대기', loop: 'pingpong', segment: '0.5–2.5 s', endFrame: true,
    action: 'ready stance for the full 4 seconds, knees bent, weight on the balls of the feet, gentle rhythmic bouncing, racket held in front with both hands, small natural breathing and shoulder movement, ends in exactly the same pose as the first frame',
    flavor: {
      char_01: 'steady and composed, small even bounces, eyes locked forward',
      char_02: 'light springy bounces on the toes, ponytail swaying, a quick racket twirl in the hand at 2s',
      char_03: 'heavy grounded stance, slow powerful shoulder roll, taps the racket once against the shoe',
    },
  },
  {
    id: 'run_left', file: 'run_left', tier: '1', ko: '화면 왼쪽 이동', loop: 'loop', segment: '1.0–3.0 s', endFrame: true, cycle: true,
    action: 'from 0.5s, running sideways toward the screen-left direction (the left side of the image) in place like on a treadmill, quick side-shuffle steps, racket held ready in front, body leaning slightly into the movement, continuous steady rhythm, the body never leaves the center of the frame',
    flavor: {
      char_01: 'efficient smooth shuffle steps with a level head',
      char_02: 'fast light crossover steps, ponytail flying sideways',
      char_03: 'big powerful strides with heavy footfalls',
    },
  },
  {
    id: 'run_right', file: 'run_right', tier: '1', ko: '화면 오른쪽 이동', loop: 'loop', segment: '1.0–3.0 s', endFrame: true, cycle: true,
    action: 'from 0.5s, running sideways toward the screen-right direction (the right side of the image) in place like on a treadmill, quick side-shuffle steps, racket held ready in front, body leaning slightly into the movement, continuous steady rhythm, the body never leaves the center of the frame',
    flavor: {
      char_01: 'efficient smooth shuffle steps with a level head',
      char_02: 'fast light crossover steps, ponytail flying sideways',
      char_03: 'big powerful strides with heavy footfalls',
    },
  },
  {
    id: 'fh_mid', file: 'fh_mid', stroke: 'fh', tier: '1', ko: 'Forehand 허리 높이', loop: 'once', segment: '1.1–2.9 s · backswing 1.6 / contact 2.0', endFrame: true,
    action: fh('at waist height', 'finishing over the character\'s own left shoulder'),
    flavor: {
      char_01: 'classic semi-western forehand from a neutral stance, clean racket path',
      char_02: 'compact open-stance forehand with a quick wrist snap and a small hop at contact',
      char_03: 'heavy topspin forehand with a huge loop backswing and a windshield-wiper finish',
    },
  },
  {
    id: 'bh_mid', file: 'bh_mid', stroke: 'bh2', keyFrame: '_bh_key', tier: '1', ko: 'Backhand 허리 높이', loop: 'once', segment: '0.3–1.9 s · backswing 0.5 / contact 0.9', endFrame: true,
    action: bh('at waist height', 'over the character\'s own right shoulder'),
    flavor: {
      char_01: 'solid two-handed backhand, compact and precise',
      char_02: 'quick two-handed backhand with fast hands and a light hop',
      char_03: 'powerful two-handed backhand with a big shoulder turn and strong hip drive',
    },
  },
  {
    id: 'serve', file: 'serve', tier: '1', ko: 'Toss → Serve', loop: 'once', segment: '0.6–3.2 s · toss 0.8 / contact 2.2', endFrame: true,
    action: '0-0.8s sideways serve stance at the baseline; at 0.8s the left hand rises to toss an imaginary ball (the hand is empty), reaching the trophy pose at 1.4s with the racket cocked behind the head; 1.4-2.2s the knees bend and the body explodes upward, the racket hits the imaginary ball at full overhead extension exactly at 2.2s; 2.2-3.0s follow-through across the body, landing one step forward; 3.0-4.0s recover to the ready stance',
    flavor: {
      char_01: 'classic platform serve with a fluid, even rhythm',
      char_02: 'quick pinpoint serve with a light jump and a soft landing',
      char_03: 'big pinpoint power serve with a deep knee bend and a huge leap',
    },
  },
  {
    id: 'victory', file: 'victory', tier: '1', ko: 'Match 승리 (A안)', loop: 'once', segment: '0.3–3.7 s', endFrame: false,
    action: '0-0.3s neutral standing pose; 0.3-3.7s {CELEBRATION}; 3.7-4.0s holds the final triumphant pose still',
    flavor: {
      char_01: 'confident celebration: a strong fist pump, then the racket raised high overhead with a proud smile',
      char_02: 'joyful celebration: jumps with both feet, spins the racket in her hand, ponytail flying, cheerful shout',
      char_03: 'thunderous celebration: roars with both arms flexed and the racket held high overhead',
    },
  },
  {
    id: 'victory_b', file: 'victory', tier: '1', ko: 'Match 승리 (B안 — A와 비교 후 하나를 victory.mp4로 저장)', loop: 'once', segment: '0.3–3.7 s', endFrame: false,
    action: '0-0.3s neutral standing pose; 0.3-3.7s {CELEBRATION}; 3.7-4.0s holds the final pose still',
    flavor: {
      char_01: 'a calm nod, points the racket toward the crowd, then a controlled double fist pump',
      char_02: 'skips forward, waves to the crowd with both hands, then a happy twirl with the racket raised',
      char_03: 'drops to his knees and roars to the sky, then rises and beats his chest once',
    },
  },
  {
    id: 'defeat', file: 'defeat', tier: '1', ko: 'Match 패배 (A안)', loop: 'once', segment: '0.3–3.7 s', endFrame: false,
    action: '0-0.3s neutral standing pose; 0.3-3.7s {CELEBRATION}; 3.7-4.0s holds the final pose still, disappointed but hopeful, never tragic',
    flavor: {
      char_01: 'hands on knees, a deep breath, then a small resigned nod',
      char_02: 'covers her face briefly with one hand, then shakes it off with a small bounce',
      char_03: 'turns half away, hands on hips, lowers the head and exhales hard',
    },
  },
  {
    id: 'defeat_b', file: 'defeat', tier: '1', ko: 'Match 패배 (B안 — A와 비교 후 하나를 defeat.mp4로 저장)', loop: 'once', segment: '0.3–3.7 s', endFrame: false,
    action: '0-0.3s neutral standing pose; 0.3-3.7s {CELEBRATION}; 3.7-4.0s holds the final pose still, hopeful, never tragic',
    flavor: {
      char_01: 'looks up at the sky, exhales slowly, taps the racket strings and resets calmly',
      char_02: 'sits back on her heels for a moment, then stands up with a determined clap',
      char_03: 'crouches with the racket across his knees, stares ahead, then slowly stands up',
    },
  },
  {
    id: 'fh_high', file: 'fh_high', stroke: 'fh', tier: '2', ko: 'Forehand 어깨 높이 / Smash 대체', loop: 'once', segment: '1.1–2.9 s · backswing 1.6 / contact 2.0', endFrame: true,
    action: fh('at shoulder-to-head height with an extended arm', 'finishing high over the character\'s own left shoulder'),
    flavor: {
      char_01: 'controlled high forehand, stays perfectly balanced',
      char_02: 'a small jump to meet the high ball with a quick snap',
      char_03: 'aggressive high forehand driven downward with full body weight',
    },
  },
  {
    id: 'fh_low', file: 'fh_low', stroke: 'fh', tier: '2', ko: 'Forehand 무릎 높이', loop: 'once', segment: '1.1–2.9 s · backswing 1.6 / contact 2.0', endFrame: true,
    action: fh('at knee height after bending the knees deeply', 'brushing low-to-high and finishing over the character\'s own left shoulder'),
    flavor: {
      char_01: 'deep knee bend with a smooth low-to-high lift',
      char_02: 'drops low quickly with a short sliding step',
      char_03: 'lunging low, a powerful brush up the back of the ball',
    },
  },
  {
    id: 'bh_high', file: 'bh_high', stroke: 'bh2', keyFrame: '_bh_key', tier: '2', ko: 'Backhand 어깨 높이', loop: 'once', segment: '0.3–1.9 s · backswing 0.5 / contact 0.9', endFrame: true,
    action: bh('at shoulder height', 'finishing high over the character\'s own right shoulder'),
    flavor: {
      char_01: 'compact high backhand, firm and steady',
      char_02: 'quick hands, takes the high ball early on the rise',
      char_03: 'big high backhand driven through with the whole torso',
    },
  },
  {
    id: 'bh_low', file: 'bh_low', stroke: 'bh2', keyFrame: '_bh_key', tier: '2', ko: 'Backhand 무릎 높이', loop: 'once', segment: '0.3–1.9 s · backswing 0.5 / contact 0.9', endFrame: true,
    action: bh('at knee height with a deep knee bend', 'lifting up over the character\'s own right shoulder'),
    flavor: {
      char_01: 'deep balanced knee bend, smooth lift',
      char_02: 'low quick crouch with a light sliding step',
      char_03: 'heavy low lunge with strong leg drive',
    },
  },
  {
    id: 'serve_ready', file: 'serve_ready', tier: '2', ko: 'Serve 대기', loop: 'loop', segment: '0.5–3.5 s', endFrame: true,
    action: 'standing sideways at the baseline preparing to serve, calm focused breathing, small weight shifts between the feet, adjusting the racket grip, looking toward the opponent, subtle continuous motion, ends in the same pose as the first frame, the hands are empty (no ball)',
    flavor: {
      char_01: 'a deep calm breath and a small nod, eyes forward',
      char_02: 'rocks quickly heel to toe and adjusts her visor',
      char_03: 'rolls his neck, wide stance, intimidating stare',
    },
  },
  {
    id: 'split', file: 'split', tier: '2', ko: 'Split Step', loop: 'once', segment: '1.6–2.4 s', endFrame: true,
    action: '0-1.6s ready stance; 1.6-2.0s a small explosive split-step hop with both feet, landing wide and balanced exactly at 2.0s; 2.0-4.0s alert ready stance, ending in the same pose as the first frame',
    flavor: {
      char_01: 'textbook balanced split step',
      char_02: 'very quick, slightly higher split step with a feather-light landing',
      char_03: 'low heavy split step with a wide powerful landing',
    },
  },
  {
    id: 'point_win', file: 'point_win', tier: 'extra', ko: '득점 반응', loop: 'once', segment: '0.5–2.5 s', endFrame: true,
    action: '0-0.5s neutral ready stance; 0.5-2.5s {CELEBRATION}; 2.5-4.0s returns to the ready stance',
    flavor: {
      char_01: 'a short fist pump and a calm "come on", tapping the racket against the palm',
      char_02: 'a small hop and a racket twirl with a cheerful "yes!"',
      char_03: 'a loud roar with a clenched fist pumped downward',
    },
  },
  {
    id: 'point_lose', file: 'point_lose', tier: 'extra', ko: '실점 반응', loop: 'once', segment: '0.5–2.5 s', endFrame: true,
    action: '0-0.5s neutral ready stance; 0.5-2.5s {CELEBRATION}; 2.5-4.0s returns to the ready stance',
    flavor: {
      char_01: 'shakes the head slightly and straightens the racket strings with the fingers',
      char_02: 'puffs her cheeks, then a quick bounce to reset',
      char_03: 'glares at the racket and taps it against his shoe',
    },
  },
  {
    id: 'smash', file: 'smash', tier: 'extra', ko: 'Smash', loop: 'once', segment: '1.0–3.0 s · contact 2.0', endFrame: true,
    action: '0-1.0s backpedals in place into a sideways stance with the left hand pointing up at an imaginary high ball; 1.0-1.6s racket cocked behind the head; jumps and hits at full overhead extension exactly at 2.0s; 2.0-2.8s violent follow-through and landing; 2.8-4.0s recover to the ready stance',
    flavor: {
      char_01: 'controlled precise smash',
      char_02: 'a high scissor-kick jump smash',
      char_03: 'a brutal full-power smash with a heavy landing',
    },
  },
  {
    id: 'reach_fh', file: 'reach_fh', stroke: 'fh', tier: 'extra', ko: '먼 공 Forehand (Extended Reach)', loop: 'once', segment: '1.1–2.9 s · contact 2.0', endFrame: true,
    action: '0-1.0s ready stance; 1.0-1.6s a big lunge step toward the character\'s own forehand (right) side ({FH_IMG}) while the right hand alone takes the racket back on the right side; the right arm and racket are fully extended at contact out to the right side exactly at 2.0s; 2.0-2.8s stretched forehand follow-through; 2.8-4.0s push off and recover to the ready stance in the center',
    flavor: {
      char_01: 'a long balanced lunge',
      char_02: 'a fast sliding lunge, almost a split',
      char_03: 'a huge powerful lunge with a strong push-off',
    },
  },
  {
    id: 'reach_bh', file: 'reach_bh', stroke: 'bh1', keyFrame: '_slice_key', tier: 'extra', ko: '먼 공 Backhand (Slice Reach)', loop: 'once', segment: '0.3–1.9 s · backswing 0.5 / contact 0.9', endFrame: true,
    action: '0-0.5s holds the coiled one-handed slice backswing and wide lunge of the start frame, the backswing peaks exactly at 0.5s; 0.5-0.9s high-to-low slice swing across the front of the body {BH_PATH}, the racket arm fully stretched, contact with an imaginary low ball exactly at 0.9s, back of the racket hand facing forward; 0.9-1.7s slice follow-through with the left arm extended backward; 1.7-3.2s pushes off and recovers to the neutral ready stance of the end frame in the center; 3.2-4.0s holds that ready stance',
    flavor: {
      char_01: 'a clean low slice with a balanced lunge',
      char_02: 'a quick sliding slice, light on the feet',
      char_03: 'a long stretching slice with heavy leg drive',
    },
  },
  {
    id: 'run_forward', file: 'run_forward', tier: 'extra', ko: '앞으로 이동 (Camera 방향)', loop: 'loop', segment: '1.0–3.0 s', endFrame: true, cycle: true,
    action: 'from 0.5s, running in place toward the camera like on a treadmill, steady rhythm, racket ready in front, the body never leaves the center of the frame',
    flavor: { char_01: 'smooth even strides', char_02: 'quick light steps', char_03: 'heavy driving strides' },
  },
  {
    id: 'run_back', file: 'run_back', tier: 'extra', ko: '뒤로 이동 (Camera 반대 방향)', loop: 'loop', segment: '1.0–3.0 s', endFrame: true, cycle: true,
    action: 'from 0.5s, backpedaling in place away from the camera like on a treadmill, small quick backward steps, racket ready, the body never leaves the center of the frame',
    flavor: { char_01: 'controlled backpedal', char_02: 'nimble quick backpedal', char_03: 'heavy strong backpedal' },
  },
  {
    id: 'walk_in', file: 'walk_in', tier: 'extra', ko: 'Match 입장', loop: 'once', segment: '0.0–4.0 s', endFrame: false,
    action: 'walks calmly in place with confident steps, bouncing on the toes, rolling the shoulders and swinging the racket loosely, settling into the ready stance at 3.5s',
    flavor: {
      char_01: 'composed and focused, adjusts the headband',
      char_02: 'bouncy and cheerful, tightens her ponytail',
      char_03: 'slow intimidating walk, stretches his arms wide',
    },
  },
];

// ------------------------------------------------------------------ stages (08 §7–§9)

interface Stage {
  n: number;
  theme: ThemeId;
  venue: string;
  surface: string;
  lighting: string;
  crowd: string;
  detail: string;
  opening: string;
  beat: string;
  short: string;
  clearHero: string;
  clearCrowd: string;
  failHero: string;
  failMood: string;
}

const STAGES: Stage[] = [
  { n: 1, theme: 'day', venue: 'a friendly community sports center tennis court surrounded by green windscreens and young trees', surface: 'green hard court (#3E8E5E)', lighting: 'fresh 9 AM morning sun, soft long shadows, light dew sparkle', crowd: 'a few spectators scattered on small white bleachers', detail: 'a ball basket near the net post, birds in a clear blue sky', opening: 'slow aerial glide over the community sports center at morning, trees and courts below', beat: 'a ball bounces once on the empty green court and rolls to the net, a bird flies past', short: 'community sports center green court, morning', clearHero: 'the yellow ball lands right on the white baseline, a puff of chalk-like sparkle', clearCrowd: 'a few spectators clap, birds take off into the blue sky', failHero: 'the ball clips the net tape and drops back slowly', failMood: 'a soft breeze rolls the ball across the green court, sunlight stays bright' },
  { n: 2, theme: 'day', venue: 'the same community sports center, festive with plain colorful pennant flags without text', surface: 'green hard court (#3E8E5E)', lighting: 'bright late-morning sun, clear sky (#5FB4F0)', crowd: 'half-filled white stands, relaxed families', detail: 'water bottles on a bench, gentle breeze moving the flags', opening: 'camera dolly along the colorful pennant flags fluttering in the breeze', beat: 'families settle in the white stands and wave, sunlight flickers through the flags', short: 'community sports center with pennant flags, late morning', clearHero: 'a racket is tossed spinning into the air against the sun', clearCrowd: 'families cheer, pennant flags flutter wildly', failHero: 'the ball rolls slowly to rest against the net', failMood: 'pennant flags sway calmly, a water bottle on the bench glistens' },
  { n: 3, theme: 'day', venue: 'a larger outdoor stadium court at the sports center with tall white stands', surface: 'green hard court (#3E8E5E)', lighting: 'high noon sun, crisp short shadows, vivid summer clarity', crowd: 'full white stands with a watercolor crowd', detail: 'heat shimmer at the far end, umbrellas in the stands', opening: 'sweeping crane down from the bright noon sky past tall white stands', beat: 'the crowd stands up and claps in a ripple, heat shimmer above the court', short: 'outdoor stadium court at noon, full white stands', clearHero: 'the ball rockets past the far baseline leaving a bright trail', clearCrowd: 'the full stands erupt in a standing ovation, hats thrown up', failHero: 'a racket lies on the hot green court, the ball beside it', failMood: 'heat shimmer, the crowd claps politely, clouds drift' },
  { n: 4, theme: 'sunset', venue: 'a seaside hillside tennis court with palm trees and a distant ocean horizon', surface: 'terracotta orange hard court (#C4673F)', lighting: 'golden hour, warm orange sky (#F0784A to #FCD39B), long dramatic shadows', crowd: 'a modest crowd in silhouette', detail: 'sun glare on the net tape, seagulls far away', opening: 'drone shot rising from the ocean horizon toward the hillside court at golden hour', beat: 'palm leaves sway, the sun flares across the net tape', short: 'seaside hillside court at golden hour', clearHero: 'the ball cuts through a sun flare and kisses the line', clearCrowd: 'the silhouetted crowd cheers, seagulls soar over the ocean', failHero: 'the ball bounces out past the line into long golden shadows', failMood: 'palm leaves sway, the sun dips toward the ocean' },
  { n: 5, theme: 'sunset', venue: 'the same hillside court at dusk with string lights along the fence', surface: 'terracotta orange hard court (#C4673F)', lighting: 'magic hour, pink-purple sky, first string lights turning on', crowd: 'a lively crowd with warm rim light', detail: 'first evening star, glowing fence lights reflected on the court', opening: 'slow push in along the fence as string lights turn on one by one at dusk', beat: "the crowd's silhouettes cheer under a pink-purple sky, the first star appears", short: 'hillside court at dusk with string lights', clearHero: 'string lights flash brighter all at once as the ball lands in', clearCrowd: 'the crowd waves glowing phone lights under a pink sky', failHero: 'the ball rests in the corner under the string lights', failMood: 'the first evening star twinkles, lights glow softly on the court' },
  { n: 6, theme: 'indoor', venue: 'a modern indoor tennis hall with tall windows and skylights', surface: 'blue urethane court (#2F6FAE) with warm wooden surround (#B9874F)', lighting: 'clean even ceiling lights mixed with soft daylight from the skylights', crowd: 'sparse spectators in dark seats', detail: 'polished floor reflections, hanging acoustic panels', opening: 'tracking shot through a glass entrance into the bright indoor tennis hall', beat: 'skylight beams shift across the blue court, a ball machine rolls a ball to the baseline', short: 'modern indoor hall with skylights, blue court', clearHero: 'the ball skids on the blue court and sprays tiny white sparks', clearCrowd: 'scattered spectators rise and applaud, skylight beams brighten', failHero: 'the ball machine stops, one ball rolls along the baseline', failMood: 'skylight beams move slowly across the empty court' },
  { n: 7, theme: 'indoor', venue: 'a professional indoor arena at night with a curved roof truss', surface: 'blue urethane court (#2F6FAE) with wooden surround (#B9874F)', lighting: 'bright LED arena lighting, cool white tone, subtle haze', crowd: 'packed dark stands with a watercolor crowd', detail: 'camera rigs on the side, glossy court reflections', opening: 'fast dolly under the curved roof truss as the arena LED lights snap on', beat: 'the packed stands roar, glossy reflections slide across the blue court', short: 'professional indoor arena with LED lights', clearHero: 'the arena LEDs pulse in a wave as the ball lands in', clearCrowd: 'the packed stands roar, camera flashes sparkle', failHero: 'the ball hits the net and the LED lights dim slightly', failMood: 'quiet arena hum, glossy reflections on the blue court' },
  { n: 8, theme: 'night', venue: 'an outdoor professional night stadium', surface: 'navy blue hard court (#24578F)', lighting: 'powerful floodlights from four towers, deep navy night sky (#070B1E)', crowd: 'half-filled stands with excited fans', detail: 'light beams cutting through faint mist, moths near the lights', opening: 'aerial approach to the night stadium as the four floodlight towers ignite', beat: 'light beams cut through faint mist, the crowd waves scarves', short: 'night stadium under floodlights', clearHero: 'the ball streaks under the floodlights with a long glowing trail', clearCrowd: 'fans wave scarves, floodlight beams sweep the sky', failHero: 'the ball bounces wide into the dark beyond the lines', failMood: "mist drifts through the floodlight beams, the crowd's murmur fades" },
  { n: 9, theme: 'night', venue: 'the same night stadium for a semi-final, larger and more dramatic', surface: 'navy blue hard court (#24578F)', lighting: 'floodlights plus warm accent spotlights on the court', crowd: 'fully packed stands, thousands of tiny phone lights twinkling', detail: 'waving plain color flags without text, energetic atmosphere', opening: 'orbiting shot around the packed stadium as thousands of phone lights twinkle', beat: 'warm spotlights sweep across the navy court, flags wave in unison', short: 'packed semi-final night stadium', clearHero: 'a burst of white sparks as the ball lands on the line', clearCrowd: 'thousands of phone lights wave like a sea of stars', failHero: 'the ball rolls to a stop at the net under a single spotlight', failMood: 'the phone lights slowly sway, the stadium hushes' },
  { n: 10, theme: 'night', venue: 'a grand championship final stadium with a towering bowl of stands', surface: 'navy blue hard court (#24578F)', lighting: 'dramatic spotlights converging on center court, light haze, golden accents', crowd: 'a roaring sold-out crowd, glittering phone lights everywhere', detail: 'confetti cannons standing ready at the corners, an empty trophy pedestal beside the net post', opening: 'dramatic rising crane revealing the giant championship bowl, spotlights converging on center court', beat: 'a burst of golden sparks from the corner cannons, the roaring crowd stands, the empty trophy pedestal gleams', short: 'grand championship final stadium', clearHero: 'confetti cannons blast golden confetti as the ball lands in', clearCrowd: 'fireworks burst above the bowl, the trophy pedestal shines in a spotlight', failHero: 'the trophy pedestal stands empty under a fading spotlight', failMood: 'golden confetti drifts unused in the haze, the crowd applauds respectfully' },
];

const nn = (n: number) => String(n).padStart(2, '0');
const imgNeg = `Avoid: ${NEG}.`;

// ------------------------------------------------------------------ output helpers

const out: string[] = [];
const toc: { id: string; title: string; save: string }[] = [];
let imgNo = 0;
let vidNo = 0;
let motNo = 0;

interface Entry {
  id: string;
  title: string;
  save: string;
  mode: string;
  extra?: string[];
  prompt: string;
  /** Heading level; motion entries sit one level below their character / view group. */
  level?: number;
}

const INBOX = 'raw_assets/images_src/';

/** Inbox path the user drops the Flow download into, and the game file `npm run images` produces from it. */
function routes(save: string): { inbox: string; game: string } {
  if (save.startsWith('public/assets/')) {
    const rel = save.slice('public/assets/'.length);
    return { inbox: INBOX + (rel.endsWith('.mp4') ? rel : rel.replace(/\.(webp|png)$/, '.jpg')), game: `\`${save}\`` };
  }
  const motion = /^raw_assets\/images_src\/motion\/([^/]+)\/([^/]+)\/(.+)\.\w+$/.exec(save);
  if (motion) {
    const [, charId, view, name] = motion;
    return {
      inbox: save,
      game: name.startsWith('_') ? '없음 (Flow Start / End Frame 전용)' : `\`public/assets/motion/${charId}/${view}/${name}.webp\` + \`manifest.json\` (Sprite Atlas)`,
    };
  }
  return { inbox: save, game: '없음 (Flow Reference 전용)' };
}

function entry(e: Entry): void {
  const r = routes(e.save);
  toc.push({ id: e.id, title: e.title, save: r.inbox });
  out.push(`${'#'.repeat(e.level ?? 3)} ${e.id} · ${e.title}`, '');
  out.push(`* **넣을 곳**: \`${r.inbox}\``);
  out.push(`* **게임 파일**: ${r.game}`);
  out.push(`* **Flow 설정**: ${e.mode}`);
  for (const x of e.extra ?? []) out.push(`* ${x}`);
  const body = e.prompt
    .replace(/\s+\n/g, '\n')
    .trim()
    .split('\n')
    .map((line) => (line.startsWith('Avoid: ') ? dedupeAvoid(line) : line))
    .join('\n');
  out.push('', '```text', body, '```', '');
}

const img = (title: string, save: string, mode: string, prompt: string, extra?: string[]) =>
  entry({ id: `I-${nn(++imgNo)}`, title, save, mode, prompt, extra });
const vid = (title: string, save: string, mode: string, prompt: string, extra?: string[]) =>
  entry({ id: `V-${nn(++vidNo)}`, title, save, mode, prompt, extra });

// ------------------------------------------------------------------ document

out.push(
  '# 🎬 09. Flow Prompt Full Set for each object — Real Court Tennis',
  '',
  '> `08_AI Prompt Master Set.md`의 모든 Prompt를 **Object 하나당 완성된 Prompt 1개**로 펼친 복붙 전용 모음집이다. 공통 Style, Character 설명, View, Action, Tempo, Negative가 각 Prompt 안에 모두 들어 있으므로 **Code Block 하나를 그대로 Google Flow Prompt 창에 붙여넣으면** 된다.',
  '> 이 문서는 `npm run prompts` (`tools/prompts/build-flow-prompts.ts`)로 자동 생성된다. 문구를 바꾸려면 Script의 표를 고친 뒤 다시 생성한다.',
  '',
  '---',
  '',
  '## 0. Google Flow 작업 규칙',
  '',
  '| 항목 | 설정 |',
  '| --- | --- |',
  '| Image Model | Flow 기본 Image Model (Nano Banana Pro). Character가 나오는 Image는 **Reference Image로 해당 Character의 Turnaround(I-01~03)** 를 첨부 |',
  '| Video Model | **Veo 3.1 (Quality 권장, Fast 가능)** |',
  '| Video 길이 | **4 s** (Frames to Video는 4 / 6 / 8 s 지원). Intro만 **6 s** |',
  '| Aspect Ratio | 기본 **16:9 Landscape**. Portrait 표시가 있는 항목만 9:16 |',
  '| Motion Video 모드 | **Video Frames (Frames to Video)** — `+ Add start frame`에 Pose Start Frame(I-04~09). **End Frame 표시가 있는 Clip은 같은 이미지를 `+ Add end frame`에도** 넣는다 → Loop가 끊김 없이 이어지고 Swing 후 Ready 자세로 정확히 복귀. **Backhand 계열(bh_*, reach_bh)은 Start Frame = Key Pose(_bh_key / _slice_key), End Frame = _start.jpg** (Ready 자세에서 시작하면 Video Model이 Forehand로 바꿔버림) |',
  '| Stage Video 모드 | Video Frames — Start Frame = 해당 Stage Key Art |',
  '| Negative | Flow에는 별도 Negative 칸이 없으므로 각 Prompt 끝의 `Avoid:` 문장으로 포함되어 있다 |',
  '| 출력 수 | 동작 Video는 **2–4개 생성 후 Timing·Key 품질이 가장 좋은 것**을 고른다 |',
  '| Audio | Motion Video의 Audio는 게임에서 쓰지 않는다(무시해도 됨) |',
  '',
  '### 0.1 생성 순서',
  '',
  '1. **I-01 ~ I-03** Character Turnaround (모든 Character 작업의 Reference)',
  '2. **I-04 ~ I-09** Pose Start Frame (Character × Back / Front)',
  '2-1. **I-10 ~ I-21** Backhand / Slice Key Pose (Backhand Motion의 Start Frame — 라켓이 Backhand 쪽에 있는지 꼭 확인)',
  '3. **M-xxx Tier 1** Motion (Character마다 Back 10개 → Front 10개, A/B안 포함)',
  '4. Title / Portrait / Stage Key Art (I-22 이후)',
  '5. Intro / Stage Video (V-xx)',
  '6. Tier 2 · Extra Motion, 추가 Image',
  '',
  `### 0.2 받은 파일 처리${UPDATED}`,
  '',
  'Flow에서 받은 원본(jpg / png / mp4)은 **각 항목의 `넣을 곳` 이름으로 바꿔서 Inbox 폴더(raw_assets/images_src/)에만** 넣는다. `public/assets/`에는 직접 넣지 않는다.',
  '',
  '| Inbox 하위 폴더 | 넣는 것 | 변환 결과 |',
  '| --- | --- | --- |',
  '| `images/{title, stages, characters, concept, ui, howto, vfx, crowd}/` | 게임 Image (jpg / png) | `public/assets/images/…/*.webp` (가로 최대 1920 px 등, `tools/assets/assets.config.json`) |',
  '| `icons/` | App Icon | `public/assets/icons/*.png` (1024×1024 중앙 Crop) |',
  '| `video/{intro, stages, crowd}/` | 연출 Video (mp4) | `public/assets/video/…/*.mp4` (H.264, Web 재생 최적화, 이름 끝 `_4s` / `_6s` 길이로 자동 Trim) |',
  '| `motion/{char_0N}/{back, front}/` | Motion Video (mp4) + `_start.jpg` | `public/assets/motion/…` Sprite Atlas (`npm run motion` 자동 실행) |',
  '| `references/` | Turnaround 등 Flow Reference 전용 | 변환 안 함 (게임 미사용) |',
  '',
  '```powershell',
  'npm run images                 # 새로 넣거나 바뀐 파일만 변환 + 바뀐 Motion Set 재빌드',
  'npm run images -- --missing    # 아직 안 넣은 파일 목록까지 출력',
  'npm run images -- --force      # 전부 다시 변환',
  'npm run motion -- --preview    # Motion Timing 확인용 Contact Sheet (raw_assets/_preview/motion)',
  'npm run motion:audit -- char_01/back --grid   # Clip별 동작 구간 측정 + 0.1 s 검토 Grid (raw_assets/_preview/motion_audit)',
  'npm run motion:audit -- --write               # 검토 결과를 motion.config.json overrides에 반영',
  '```',
  '',
  '---',
  '',
);

// ---------------- Part A: images
out.push('## A. Character 기준 Image (Turnaround · Pose Start Frame)', '');

for (const c of CHARS) {
  img(`${c.name} (${c.ko}) Turnaround Sheet`, `raw_assets/images_src/references/${c.id}_turnaround.jpg`, 'Image · 16:9 · Reference 없음 (최초 기준 Image)',
    `Character turnaround reference sheet showing the same character four times side by side: front view, side view, back view, and three-quarter view, full body, neutral A-pose holding a carbon tennis racket in the right hand, plain light gray background, even studio lighting, no shadows on the character, 7.5 heads tall athletic proportions, ${STYLE}.
Character: ${c.desc}.
Every view shows exactly the same face, hairstyle, outfit colors and racket.
${imgNeg}`);
}

for (const c of CHARS) {
  for (const v of ['back', 'front'] as View[]) {
    img(`${c.name} Pose Start Frame — ${VIEW_KO[v]}`, `raw_assets/images_src/motion/${c.id}/${v}/_start.jpg`, `Image · 16:9 · Reference = ${c.id}_turnaround.jpg`,
      `Full body ${VIEW_TEXT[v]}, the character stands in a tennis ready stance, knees slightly bent, carbon racket held in front with both hands, centered, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: ${c.desc}.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.
Avoid: green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, ${NEG}.`,
      ['**사용처**: Motion Video의 Start Frame (End Frame 겸용)']);
  }
}

const KEY_POSE_TAIL = (c: (typeof CHARS)[number]) => `centered, the whole body and the whole racket inside the frame, the character occupies 80% of the frame height with clear space above the head and below the feet, uniform pure chroma green background (#00FF00) including the floor, no floor shadow, no reflections, eye-level telephoto 85mm, even soft studio lighting, 16:9, realistic cel-shaded 3D, 70% realistic 30% anime, clean two-tone ramp shading, thin refined dark outlines.
Character: ${c.desc}.
Match the reference turnaround exactly: same face, hair, outfit colors, accessories and racket.`;

for (const c of CHARS) {
  for (const v of ['back', 'front'] as View[]) {
    const b = BH_IMG[v];
    img(`${c.name} Backhand Key Pose — ${VIEW_KO[v]}`, `raw_assets/images_src/motion/${c.id}/${v}/_bh_key.jpg`, `Image · 16:9 · Reference = ${c.id}_turnaround.jpg + 같은 View의 \`_start.jpg\``,
      `Full body ${VIEW_TEXT[v]}, the character is frozen at the peak of a two-handed tennis backswing on the non-racket side: BOTH hands hold the racket handle together (left hand above the right hand), both hands are next to the character's own left hip, the racket is on the ${b.racketSide} side of the image with the racket head pointing back and up at shoulder height, the right arm crosses in front of the chest, the shoulders are fully coiled so ${b.nearShoulder}, the head looks ${b.look}, knees bent, weight loaded on the left foot, ${KEY_POSE_TAIL(c)}
Avoid: one-handed grip, racket on the ${b.racketSide === 'LEFT' ? 'right' : 'left'} side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, ${NEG}.`,
      ['**사용처**: `bh_mid` / `bh_high` / `bh_low` Motion Video의 **Start Frame** (End Frame은 `_start.jpg`)', `**검수**: 라켓이 화면 **${b.racketSide === 'LEFT' ? '왼쪽' : '오른쪽'}**에 있고 두 손이 모두 손잡이를 잡고 있어야 한다. 아니면 다시 생성.`]);
    img(`${c.name} Slice Key Pose — ${VIEW_KO[v]}`, `raw_assets/images_src/motion/${c.id}/${v}/_slice_key.jpg`, `Image · 16:9 · Reference = ${c.id}_turnaround.jpg + 같은 View의 \`_start.jpg\``,
      `Full body ${VIEW_TEXT[v]}, the character is frozen at the peak of a one-handed slice backswing on the non-racket side in a wide stretching lunge toward the character's own left side: only the right hand holds the racket, the right arm crosses in front of the chest, the racket head is high behind the character's own left shoulder on the ${b.racketSide} side of the image with the racket face slightly open, the left hand lightly touches the throat of the racket, the shoulders are fully coiled so ${b.nearShoulder}, the head looks ${b.look}, deep knee bend on the left leg, ${KEY_POSE_TAIL(c)}
Avoid: two-handed grip, racket on the ${b.racketSide === 'LEFT' ? 'right' : 'left'} side of the image, open chest facing the camera, green clothing, green racket, floor shadow, gradient background, cropped feet, cropped racket, ${NEG}.`,
      ['**사용처**: `reach_bh` Motion Video의 **Start Frame** (End Frame은 `_start.jpg`)', `**검수**: 라켓 헤드가 화면 **${b.racketSide === 'LEFT' ? '왼쪽' : '오른쪽'}** 위(왼쪽 어깨 뒤)에 있어야 한다.`]);
  }
}

out.push('## B. 게임 화면 Image', '');

for (const c of CHARS) {
  img(`${c.name} Setup Card Portrait`, `public/assets/images/characters/${c.id}_portrait.webp`, `Image · **3:4 Portrait** · Reference = ${c.id}_turnaround.jpg`,
    `Character select portrait, vertical 3:4, waist-up, three-quarter front view, holding a carbon tennis racket resting on the shoulder, ${c.portraitPose}, soft gradient background in ${c.portraitColor} fading to white, subtle tennis court line shapes in the background, ${STYLE}.
Character: ${c.desc}.
${imgNeg}`);
}

img('Title Key Visual — Landscape', 'public/assets/images/title/title_key_visual_landscape.webp', 'Image · 16:9 · Reference = I-01, I-02, I-03',
  `Title screen key visual for a tennis game, 16:9, ${STYLE}.
Eye-level telephoto view from just behind the baseline of a beautiful green hard tennis court (#3E8E5E) at golden late afternoon, crisp white lines leading toward the net, the far court compressed by the long lens.
Three tennis players stand together on the near side, seen from behind and in three-quarter back view: in the center ${CHARS[0].desc}, holding the racket over his shoulder; on the left ${CHARS[1].desc}; on the right ${CHARS[2].desc}.
A fluorescent yellow ball floats mid-air above the net catching the sun, with a faint white trail.
White modern stands with a soft watercolor crowd in the distance, clear sky with gentle clouds in the upper third kept open and uncluttered for a logo, lower fifth kept simple for a button.
Hopeful, sunny, premium sports game mood.
${imgNeg}`);

img('Title Key Visual — Portrait', 'public/assets/images/title/title_key_visual_portrait.webp', 'Image · **9:16 Portrait** · Reference = I-01',
  `Title screen key visual for a tennis game, vertical 9:16, ${STYLE}.
Low eye-level telephoto view along the center service line of a green hard tennis court (#3E8E5E), the net crossing the middle of the frame.
In the lower middle, ${CHARS[0].desc}, seen from behind in a ready stance; far across the net a small opponent silhouette.
A fluorescent yellow ball glows above the net with a soft white trail.
Upper third: clean bright blue sky with soft watercolor clouds, open for a logo. Bottom fifth: plain court surface for a button.
Fresh, sunny, energetic.
${imgNeg}`);

for (const s of STAGES) {
  img(`Stage ${s.n} Key Art (${s.theme})`, `public/assets/images/stages/stage_${nn(s.n)}_key.webp`, 'Image · 16:9 · Reference 없음',
    `Tennis venue key art, 16:9, eye-level telephoto view from behind the near baseline looking across the net, an empty court with no players, ${s.venue}, ${s.surface}, ${s.lighting}, ${s.crowd}, ${s.detail}, ${STYLE}.
Crisp white court lines with correct tennis court proportions, the net centered, the main subject inside the central vertical third of the frame.
Avoid: people on the court, ${NEG}.`,
    ['**사용처**: Stage Tile 배경 + Stage Intro / Ending Video의 Start Frame']);
}

out.push('## C. 홍보 · Score · 추가 Image', '');

for (const c of CHARS) {
  img(`${c.name} Gameplay Back View (Store / 홍보)`, `public/assets/images/concept/${c.id}_gameplay_${c.promoTheme}.webp`, `Image · 16:9 · Reference = ${c.id}_turnaround.jpg`,
    `Eye-level telephoto view from behind the player at the baseline of a tennis court, the player in a ready stance seen from behind occupying the lower center of the frame, the tennis net crossing between chest and head height, a small opponent far across the court, a fluorescent yellow ball in flight with a soft white trail, ${THEME_LIGHT[c.promoTheme]}, ${STYLE}.
Player: ${c.desc}.
${imgNeg}`);
}

for (const c of CHARS) {
  img(`${c.name} Victory Still`, `public/assets/images/characters/${c.id}_victory.webp`, `Image · 3:4 Portrait · Reference = ${c.id}_turnaround.jpg`,
    `Full body victory pose on a tennis court, the character raising the racket high with a fist pump and a joyful shout, small white sparkles and colorful confetti in the air, ${THEME_LIGHT[c.promoTheme]}, ${STYLE}.
Character: ${c.desc}.
${imgNeg}`);
  img(`${c.name} Defeat Still`, `public/assets/images/characters/${c.id}_defeat.webp`, `Image · 3:4 Portrait · Reference = ${c.id}_turnaround.jpg`,
    `Full body defeat pose on a tennis court, the character crouching with hands on knees and head down, the racket resting on the ground, a gentle breeze, disappointed but hopeful mood, ${THEME_LIGHT[c.promoTheme]}, ${STYLE}.
Character: ${c.desc}.
${imgNeg}`);
}

img('App Icon', 'public/assets/icons/app_icon_1024.png', 'Image · **1:1** (Flow에 1:1이 없으면 16:9로 생성 후 중앙 1024×1024 Crop)',
  `Mobile game app icon, square 1:1, no rounded corners, a single fluorescent yellow tennis ball with a crisp white seam bursting forward from a deep navy (#0E1A33) background, a short white speed trail and a few white sparks, a thin arc of a white court line behind it, bold simple silhouette readable at 48 pixels, centered with safe margins, ${STYLE}.
${imgNeg}`);

img('Share Image (Open Graph)', 'public/assets/images/ui/og_share_1200x630.webp', 'Image · 16:9 (1200×630으로 Crop) · Reference = I-01~03',
  `Wide share image: eye-level telephoto view over a navy night stadium tennis court under floodlights (#24578F court), three players seen from behind on the near baseline: ${CHARS[0].desc}; ${CHARS[1].desc}; ${CHARS[2].desc}. A glowing fluorescent yellow ball above the net, the left 40% of the frame is calm dark sky for a title overlay, ${STYLE}.
${imgNeg}`);

img('Splash — Portrait', 'public/assets/images/ui/splash_portrait.webp', 'Image · **9:16 Portrait**',
  `Vertical splash screen: a fluorescent yellow tennis ball resting on a crisp white baseline of a green hard court (#3E8E5E), soft morning light, shallow depth of field, a large empty upper half of soft blue sky, ${STYLE}.
${imgNeg}`);

for (const [ratio, file, label] of [['16:9', 'bg_menu_landscape', 'Landscape'], ['9:16 vertical', 'bg_menu_portrait', 'Portrait']] as const) {
  img(`Menu Background — ${label}`, `public/assets/images/ui/${file}.webp`, `Image · ${ratio === '16:9' ? '16:9' : '**9:16 Portrait**'}`,
    `Soft background for a game menu, ${ratio}, a tennis court seen from a high angle with gentle depth of field, large calm areas, pastel sky blue and court green with white line accents, subtle watercolor texture, low contrast, slightly blurred so UI panels stay readable, ${STYLE}.
Avoid: people, ${NEG}.`);
}

img('Score Background — Win', 'public/assets/images/ui/bg_score_win.webp', 'Image · 16:9',
  `Celebratory background, golden confetti drifting over an empty tennis court at sunset, warm bokeh lights, the center kept calm and uncluttered for score numbers, ${STYLE}.
Avoid: people, ${NEG}.`);
img('Score Background — Lose', 'public/assets/images/ui/bg_score_lose.webp', 'Image · 16:9',
  `Calm hopeful background, an empty tennis court at blue hour with soft lights, a single tennis ball resting by the net, the center kept calm and uncluttered for score numbers, ${STYLE}.
Avoid: people, ${NEG}.`);

const HOWTO = [
  ['이동', 'a player seen from behind gliding sideways on a tennis court, soft motion lines showing movement left and right, a translucent trapezoid touch pad shape in the lower left corner'],
  ['스트로크 선택', 'a player seen from behind with three glowing ghost poses of the racket at high, middle and low heights on the forehand side and the backhand side'],
  ['떼는 순간 스윙', 'a close view of a racket meeting a fluorescent yellow ball at the exact moment of contact, a shrinking white timing ring around the ball turning yellow, white sparks'],
  ['서브', 'a player seen from behind tossing a ball high above the head in a trophy pose, a dotted arc showing the toss path, the service box across the net highlighted softly'],
];
HOWTO.forEach(([ko, scene], i) => {
  img(`How to Play ${i + 1} — ${ko}`, `public/assets/images/howto/howto_${nn(i + 1)}.webp`, 'Image · 4:3 (16:9로 생성 후 4:3 Crop 가능) · Reference = I-01',
    `Clean instructional illustration, 4:3, simple flat background in soft court green, ${scene}, large clear shapes readable on a phone, ${STYLE}.
Avoid: arrows with text, ${NEG}.`);
});

const VFX = [
  ['fx_hit_perfect', 'Perfect Hit Flash', 'a bright white and fluorescent yellow impact flash with radiating sharp sparks, expanding then fading'],
  ['fx_hit_great', 'Great Hit Ring', 'a white impact ring burst, smaller and softer'],
  ['fx_bounce_dust', 'Bounce Dust', 'a small puff of court dust kicked up by a bouncing ball, soft and quick'],
  ['fx_confetti', 'Confetti Burst', 'a burst of colorful confetti pieces in blue, pink, orange and yellow spreading and falling'],
  ['fx_net_shake', 'Net Hit Ripple', 'small white ripple shock lines indicating a net hit'],
];
for (const [file, label, effect] of VFX) {
  img(`VFX — ${label}`, `public/assets/images/vfx/${file}.webp`, 'Image · 16:9 (가로 1줄 8 Frame)',
    `Sprite sheet of ${effect}, exactly 8 frames in a single horizontal row on a pure black background, each frame centered in an equal-width cell, frames progress from start to end left to right, glowing clean cel-shaded effect style.
Avoid: background details, frame borders, ${NEG}.`);
}

const CROWD: [ThemeId, string][] = [
  ['day', 't-shirts, sun hats and sunglasses, bright daylight'],
  ['sunset', 'light jackets, warm orange rim light from the side'],
  ['indoor', 'casual sportswear, even indoor lighting'],
  ['night', 'team scarves and glowing phone lights in hand, cool blue rim light'],
];
for (const [theme, cloth] of CROWD) {
  img(`Crowd Sprite Sheet — ${theme}`, `public/assets/images/crowd/crowd_${theme}.webp`, 'Image · 16:9 (4열 × 2행)',
    `Sprite sheet of seated tennis spectators for a game crowd, exactly 4 columns by 2 rows on a pure chroma green background (#00FF00), each cell one person seen from the front sitting, varied outfits in bright summer colors, ${cloth}, cel-shaded 3D style with thin outlines, row 1 calm sitting poses, row 2 cheering poses with raised arms, equal cell sizes.
Avoid: green clothing, overlapping people, ${NEG}.`);
}

// ---------------- Part D: cinematic videos
out.push('## D. 연출 Video (Intro · Stage Intro · Stage Ending)', '');

vid('Intro 6 s', 'public/assets/video/intro/intro_6s.mp4', 'Video · Veo 3.1 · Text to Video · **6 s** · 16:9',
  `6-second cinematic game intro, 16:9, ${STYLE}.
Shot 1 (0-1.5s): extreme macro of a fluorescent yellow tennis ball with fuzzy felt texture and sparkling morning dew, slowly rotating in warm sunlight, shallow depth of field.
Shot 2 (1.5-3s): low eye-level slow-motion shot of carbon racket strings striking the ball, the strings flex, a few small white spark particles burst from the contact point.
Shot 3 (3-4.5s): telephoto follow shot, the ball flies over the tennis net leaving a soft white light trail while the sky behind transitions in a smooth time-lapse from clear blue day to orange sunset to deep navy night.
Shot 4 (4.5-6s): from eye level behind the baseline of an empty night stadium tennis court with a navy blue hard surface (#24578F) and crisp white lines, the camera cranes upward while floodlights switch on one by one, ending on a calm wide frame with open dark-blue sky in the upper third.
Smooth match cuts, energetic but clean, no people visible.
Audio: crisp tennis ball pop, airy whoosh, rising synth-pop swell, distant crowd roar on the final shot, ending on a soft cymbal tail.
Avoid: people, ${NEG}.`);

for (const s of STAGES) {
  vid(`Stage ${s.n} Intro 4 s`, `public/assets/video/stages/stage_${nn(s.n)}_intro_4s.mp4`, `Video · Veo 3.1 · **Frames to Video** · Start Frame = \`stage_${nn(s.n)}_key.webp\` · **4 s** · 16:9`,
    `4-second stage intro video of ${s.venue}, ${s.surface}, ${s.lighting}, ${STYLE}.
0-2s: ${s.opening}.
2-3.5s: ${s.beat}.
3.5-4s: the camera settles at eye level behind the near baseline, telephoto framing of the empty court across the net, matching a gameplay camera.
The center of the frame stays calm and uncluttered for an overlay card. No players on the court, smooth continuous camera motion.
Audio: ${s.n >= 8 ? 'a deep drum hit, crowd roar swelling, stadium echo' : 'a light upbeat synth-pop sting with natural ambience'}.
Avoid: players on the court, ${NEG}.`);
}

for (const s of STAGES) {
  vid(`Stage ${s.n} Clear 4 s`, `public/assets/video/stages/stage_${nn(s.n)}_clear_4s.mp4`, `Video · Veo 3.1 · **Frames to Video** · Start Frame = \`stage_${nn(s.n)}_key.webp\` · **4 s** · 16:9`,
    `4-second victory ending video at ${s.short}, ${s.surface}, ${s.lighting}, ${STYLE}.
0-1.5s: ${s.clearHero}.
1.5-3s: ${s.clearCrowd}.
3-4s: a slow pull back to a calm wide shot of the court, warm celebratory light, the center of the frame open for a victory banner.
No players on the court.
Audio: a bright victory jingle and crowd cheering.
Avoid: players on the court, ${NEG}.`);
  vid(`Stage ${s.n} Fail 4 s`, `public/assets/video/stages/stage_${nn(s.n)}_fail_4s.mp4`, `Video · Veo 3.1 · **Frames to Video** · Start Frame = \`stage_${nn(s.n)}_key.webp\` · **4 s** · 16:9`,
    `4-second defeat ending video at ${s.short}, ${s.surface}, ${s.lighting}, gentle and hopeful rather than sad, ${STYLE}.
0-1.5s: ${s.failHero}.
1.5-3s: ${s.failMood}.
3-4s: a slow push in toward the net with a soft glint of light suggesting another try, the center of the frame open for a banner.
No players on the court.
Audio: a soft descending piano phrase and gentle applause.
Avoid: players on the court, gloomy horror mood, ${NEG}.`);
}

vid('Crowd Cheer Loop (선택)', 'public/assets/video/crowd/crowd_cheer_loop.mp4', 'Video · Veo 3.1 · Text to Video · 4 s · 16:9',
  `4-second seamless loop of a single row of seated tennis spectators seen from the front on a uniform pure chroma green background (#00FF00), locked-off static camera, people clapping and cheering with raised arms in varied rhythms, bright summer outfits, cel-shaded 3D style with thin outlines, even lighting, the last frame matches the first frame.
Audio: crowd cheering.
Avoid: green clothing, camera movement, floor shadow, ${NEG}.`);

// ---------------- Part E: motion
out.push(
  `## E. Character Motion Video (Character × View × Motion)${UPDATED}`,
  '',
  '* **공통 Flow 설정**: Video · Veo 3.1 · **Frames to Video** · **4 s** · 16:9 · Start Frame = 해당 `_start.jpg` (End Frame 표시 시 같은 이미지를 End Frame에도).',
  '* **A/B안**: `victory` / `defeat`는 Character마다 두 가지 연출이 있다. 둘 다 생성해 보고 더 멋진 쪽을 같은 파일명으로 저장한다.',
  '* **Tier**: 1 = 최소 세트(게임 연결), 2 = 완성 세트(게임 연결), Extra = 추가 Motion(파일 준비 후 Code 연결 예정).',
  '* **사용 구간**: 기획 기준 구간과 Marker. 게임이 실제로 쓰는 구간은 `npm run motion:audit`가 Clip마다 측정해 `tools/motion/motion.config.json` → `overrides`에 기록한다(아래 E.0).',
  '',
  `### E.0 Motion 검토 결과 · 게임 반영 · 재생성 권장${UPDATED}`,
  '',
  '132개 Motion Clip(3 Character × Back / Front × 22)을 이 문서와 08 §6의 동작·Stroke 방향·Timing 기준으로 Frame 단위 검토했다. 상세: `docs/reports/motion_review.md`, 측정값: `docs/reports/motion_audit.md`.',
  '',
  '| 항목 | 검토 결과 | 게임 반영 |',
  '| --- | --- | --- |',
  '| Forehand / Backhand 방향 | `char_01/back/reach_bh` 1개를 빼고 모두 올바른 쪽 | — |',
  '| Swing Timing | Contact가 기준(Forehand 2.0 s / Backhand 0.9 s)보다 0.05–0.3 s 늦고, Backswing Peak가 1.8–2.1 s | 0.1 s 간격 Frame Grid로 Clip마다 실제 Backswing / Contact를 기록(`tools/motion/motion.review.json`) → Take-back부터 Follow-through까지 끊김 없이 재생 |',
  '| Serve / Smash | Toss 0.9–1.1 s, Contact 2.1–2.35 s (char_03 front Smash 1.85 s) | Clip별 Marker 보정 |',
  '| `char_01/back/reach_bh` | Forehand 쪽 Reach로 생성됨 | 제외 → `bh_mid`로 대체 |',
  '| Back `run_right` (3 Character) | 몸이 화면 왼쪽을 향한 채 달림 | **11/10 개정 Prompt로 다시 생성 완료** → 게임 연결 (좌우 반전 대체 해제) |',
  '| Back `run_left` (Susan), `run_back` (Wolfson) | 쓸 구간 0.7 s / 중간에 Swing | **11/10 다시 생성 완료** → 1.1–1.7 s 반복 주기로 Loop |',
  '| 달리기 Clip 대부분 | 반복 보폭 주기 없음, 끝에서 몸을 돌림, 발이 최대 키의 30 %까지 미끄러짐 | 깨끗한 구간(`range`)만 사용, 주기가 없으면 Pingpong, 작은 이음새는 0.2 s Crossfade, 발 위치 Frame별 고정(`dx`) |',
  '| `char_02/front/run_right`, `char_03/back·front/run_back` | Clip 중간에 라켓 Swing | 달리는 구간만 사용 |',
  '| Victory / Defeat / Point / Walk-in / Split | 동작 정상 | 동작 구간 자동 추출 |',
  '',
  '**다시 생성하면 더 좋아질 Clip (필수 아님)** — 지금도 게임에서 정상 동작하지만, 다시 만들면 대체·반전 없이 원본을 쓸 수 있다.',
  '',
  '1. ~~Back `run_right` 3개 (M-003, M-051, M-099), Susan Back `run_left` (M-050), Wolfson Back `run_back` (M-119)~~ → **11/10 다시 생성 완료**',
  '2. `char_01/back/reach_bh` (M-021) — 생성 전 I-11(Slice Key Pose)의 라켓이 화면 왼쪽에 있는지 확인',
  '3. Swing이 섞인 Front `char_02/front/run_right` (M-075), `char_03/front/run_back` (M-143) — NPC라 화면에 작아 생략 가능',
  '4. Back view 달리기(Player용)는 개정 Prompt(옆모습으로 돌아서기 / Net 쪽으로 전진, End Frame 없음)를 쓴다. Front view 달리기는 `Action` 다음 줄의 `Running cycle:` 문장을 쓴다.',
  '5. **Back view Backhand 9개 (권장)** — David M-005 · M-013 · M-014, Susan M-053 · M-061 · M-062, Wolfson M-101 · M-109 · M-110. 어깨 회전 없는 테이크백, 큰 원을 그리는 라켓, 머리 뒤로 감기는 팔로스루 → 11/10 개정 Prompt(Unit Turn → 0.3 s 짧은 스윙 → Contact 0.7 s → 오른쪽 귀 옆 피니시) 사용.',
  '',
  '새 mp4를 넣은 뒤: `npm run motion:audit -- char_0N/view --grid` → Grid에서 Marker 확인 후 `motion.review.json` 수정 → `npm run motion:audit -- --write` → `npm run motion -- char_0N/view`.',
  '',
);

for (const c of CHARS) {
  for (const v of ['back', 'front'] as View[]) {
    out.push(`### ▶ ${c.name} (${c.ko}) · ${c.id.toUpperCase()} — ${VIEW_KO[v]}`, '');
    for (const m of MOTIONS) {
      const id = `M-${String(++motNo).padStart(3, '0')}`;
      const usesCelebration = m.action.includes('{CELEBRATION}');
      const action = (usesCelebration ? m.action.replace('{CELEBRATION}', m.flavor[c.id]) : m.action)
        .replace('{FH_IMG}', SIDE_IMG[v].fh)
        .replace('{BH_IMG}', SIDE_IMG[v].bh)
        .replace('{NET}', NET_DIR[v])
        .replace('{BH_PATH}', BH_IMG[v].path);
      const style = usesCelebration ? '' : `Style of movement: ${m.flavor[c.id]}. `;
      const dir = `raw_assets/images_src/motion/${c.id}/${v}`;
      const startFile = `${dir}/${m.keyFrame ?? '_start'}.jpg`;
      const backRun = v === 'back' ? backRunPrompt(c, m.id) : null;
      const backBh = v === 'back' ? backBhPrompt(c, m) : null;
      const endNote = m.keyFrame
        ? `**End Frame = \`${dir}/_start.jpg\`**`
        : backRun ? '**End Frame 없음** (넣으면 정면 뒷모습으로 묶여 방향이 사라짐)'
        : m.endFrame ? 'End Frame = 같은 `_start.jpg`' : 'End Frame 없음';
      const startLine = m.keyFrame
        ? `Start frame: the provided key frame shows this exact character already coiled at the peak of the ${m.keyFrame === '_bh_key' ? 'two-handed' : 'one-handed slice'} backswing on the non-racket side; end frame: the same character in the neutral ready stance.`
        : `Start frame: the provided pose start frame of this exact character${m.endFrame ? '; the clip ends on the same pose as the start frame' : ''}.`;
      const stroke = m.stroke ? STROKE[m.stroke] : null;
      const check = stroke?.check.replace('{BH_PATH}', BH_IMG[v].path);
      const prompt = `4-second character motion clip${stroke ? ` of ${stroke.headline}` : ''}, 16:9, ${MOTION_STYLE}.
${startLine}
View: ${VIEW_TEXT[v]}. The view angle never changes.
Character: ${c.desc}.
Action (timed precisely): ${action}.
${m.cycle ? `${RUN_CYCLE}\n` : ''}${check ? `Stroke check: ${check}.\n` : ''}${style}Tempo and personality: ${c.tempo}.
The character performs the motion in place and stays at the center of the frame for the whole clip; the background remains perfectly uniform green with no shadow on the floor.
Audio: no music and no voice-over, only subtle sneaker squeaks${usesCelebration ? ' and a short natural vocal reaction' : ''}.
Avoid: ${stroke ? `${stroke.avoid}, ` : ''}${MOTION_NEG}, ${NEG}.`;
      const review = REVIEW_NOTES[`${c.id}/${v}/${m.id}`];
      const notes = [review, backRun ? BACK_RUN_NOTE : backBh ? BACK_BH_NOTE : m.cycle ? RUN_NOTE : undefined].filter((n): n is string => !!n);
      entry({
        id,
        title: `${c.name} · ${v} · \`${m.id}\` — ${m.ko}${notes.length ? UPDATED : ''}`,
        save: `raw_assets/images_src/motion/${c.id}/${v}/${m.file}.mp4`,
        mode: `Frames to Video · 4 s · 16:9 · ${m.keyFrame ? '**Start Frame' : 'Start Frame'} = \`${startFile}\`${m.keyFrame ? '**' : ''} · ${endNote}`,
        extra: [
          `**Tier**: ${m.tier} · **Loop**: ${m.loop} · **사용 구간**: ${m.segment}`,
          ...notes.map((n) => `**11/10 검토**: ${n}`),
        ],
        prompt: backRun ?? backBh ?? prompt,
        level: 4,
      });
    }
  }
}

// ---------------- index + checklist
const index: string[] = ['## 목차 · 진행 Checklist', '', '| ✓ | ID | Object | 저장 위치 |', '| --- | --- | --- | --- |'];
for (const t of toc) index.push(`| ☐ | ${t.id} | ${t.title.replace(/\|/g, '/')} | \`${t.save}\` |`);
index.push('', `총 **Image ${imgNo}개 · 연출 Video ${vidNo}개 · Motion Video ${motNo}개** (Motion A/B안 포함).`, '', '---', '');

const headerEnd = out.indexOf('## A. Character 기준 Image (Turnaround · Pose Start Frame)');
out.splice(headerEnd, 0, ...index);

writeFileSync(join(process.cwd(), '09_Flow Prompt Full Set for each object.md'), `${plainMarkdown(out.join('\n'))}\n`);
console.log(`09 written: ${imgNo} images, ${vidNo} videos, ${motNo} motions`);
