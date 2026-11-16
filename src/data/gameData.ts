import physicsJson from './physics.json';
import charactersJson from './characters.json';
import aiJson from './aiDifficulty.json';
import stagesJson from './stages.json';
import hitQualityJson from './hitQuality.json';
import rulesJson from './rules.json';
import visualJson from './visual.json';

export type SpinType = 'topspin' | 'flat' | 'slice';
export type QualityTierId = 'perfect' | 'great' | 'good' | 'weak';
export type TargetStyle = 'center' | 'safe_deep' | 'cross' | 'corners' | 'corners_smash';
export type ThemeId = 'day' | 'sunset' | 'indoor' | 'night';

export type PhysicsConfig = typeof physicsJson;
export type RulesConfig = typeof rulesJson;
export type VisualConfig = typeof visualJson;

export interface CharacterPassives {
  /** Expands Perfect timing window only (David). */
  perfectWindowMul: number;
  /** Multiplies auto/manual move speed (Susan). */
  moveSpeedMul: number;
  /** Multiplies outbound shot horizontal speed (Wolfson). */
  shotSpeedMul: number;
}

export interface CharacterDef {
  id: string;
  name: string;
  gender: string;
  typeKey: string;
  speed: number;
  power: number;
  reach: number;
  control: number;
  heightM: number;
  reachM: number;
  color: string;
  skin: string;
  hair: string;
  bottom: string;
  passives: CharacterPassives;
}

export interface AiLevelDef {
  level: number;
  returnChance: number;
  speed: number;
  hitAccuracy: number;
  reactionDelaySec: number;
  targetStyle: TargetStyle;
  smash: boolean;
  spinWeights: Record<SpinType, number>;
}

export interface StageDef {
  stageId: number;
  npcLevel: number;
  ballSpeedMul: number;
  courtTheme: ThemeId;
  npcSlot: 'a' | 'b';
  strokeHint: boolean;
  bgm: string;
}

export interface QualityTierDef {
  quality: QualityTierId;
  timingMaxSec: number;
  offsetMax: number;
  inChance: number;
  speedMul: number;
  npcReturnMul: number;
  scatterM: number;
  scoreBonus: number;
}

export interface HitQualityConfig {
  tiers: QualityTierDef[];
  zones: Record<'A' | 'B' | 'C', { spin: SpinType; apexMul: number }>;
}

export const PHYSICS: PhysicsConfig = physicsJson;
export const CHARACTERS: CharacterDef[] = charactersJson;
export const AI_LEVELS: AiLevelDef[] = aiJson as AiLevelDef[];
export const STAGES: StageDef[] = stagesJson as StageDef[];
export const HIT_QUALITY: HitQualityConfig = hitQualityJson as HitQualityConfig;
export const RULES: RulesConfig = rulesJson;
export const VISUAL: VisualConfig = visualJson;

export const MAX_STAGE = STAGES.length;

export function characterById(id: string): CharacterDef {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}

export function aiLevel(level: number): AiLevelDef {
  return AI_LEVELS[Math.min(Math.max(level, 1), AI_LEVELS.length) - 1];
}

export function stageById(stageId: number): StageDef {
  return STAGES[Math.min(Math.max(stageId, 1), STAGES.length) - 1];
}

/** NPC character for a stage: the two characters the player did not pick, alternating by stage slot. */
export function npcCharacterFor(playerCharacterId: string, slot: 'a' | 'b'): CharacterDef {
  const others = CHARACTERS.filter((c) => c.id !== playerCharacterId);
  return slot === 'a' ? others[0] : others[1] ?? others[0];
}
