import type { Hand } from '../game/physics/types';
import type { Lang } from '../i18n/i18n';

export type AccountType = 'guest' | 'email' | 'phone' | 'google' | 'apple';

export type AuthErrorCode =
  | 'invalidCredentials'
  | 'emailInUse'
  | 'weakPassword'
  | 'invalidId'
  | 'nicknameTaken'
  | 'nicknameInvalid'
  | 'network'
  | 'unsupported'
  | 'recentLogin'
  | 'passwordMismatch';

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
  }
}

export interface UserProfile {
  id: string;
  username: string;
  accountType: AccountType;
  loginId: string;
  handedness: Hand;
  preferredLanguage: Lang;
  selectedCharacter: string;
  mileage: number;
  freeBest: number;
  /** From Firestore `admins` allowlist (never client-writable role field). */
  isAdmin: boolean;
}

export type AdminKind = 'email' | 'phone';

export interface AdminEntry {
  id: string;
  loginId: string;
  kind: AdminKind;
  label?: string;
  personId?: string;
}

export interface StageProgress {
  stageId: number;
  cleared: boolean;
  bestScore: number;
  clearCount: number;
}

export interface MatchResultInput {
  mode: 'stage' | 'free';
  stageId: number | null;
  npcLevel: number;
  characterId: string;
  won: boolean;
  pointsFor: number;
  pointsAgainst: number;
  perfect: number;
  great: number;
  good: number;
  miss: number;
  maxRally: number;
  durationSec: number;
  score: number;
  layout: string;
  lang: Lang;
}

export interface MatchSubmitResult {
  best: number;
  newBest: boolean;
  rank: number | null;
  mileage: number;
}

export interface Backend {
  readonly kind: 'mock' | 'firebase';
  restoreSession(): Promise<UserProfile | null>;
  loginGuest(nickname: string): Promise<UserProfile>;
  loginWithId(kind: 'email' | 'phone', id: string, password: string): Promise<UserProfile>;
  signupWithId(kind: 'email' | 'phone', id: string, password: string): Promise<UserProfile>;
  loginOAuth(provider: 'google' | 'apple'): Promise<UserProfile>;
  logout(): Promise<void>;
  updateProfile(patch: Partial<Pick<UserProfile, 'handedness' | 'preferredLanguage' | 'selectedCharacter'>>): Promise<UserProfile>;
  changePassword(newPassword: string): Promise<void>;
  deleteAccount(): Promise<void>;
  getProgress(): Promise<StageProgress[]>;
  submitMatch(r: MatchResultInput): Promise<MatchSubmitResult>;
  /** Admin allowlist (Firestore `admins`). Only existing admins may mutate. */
  listAdmins(): Promise<AdminEntry[]>;
  addAdmin(kind: AdminKind, loginId: string, opts?: { label?: string; personId?: string }): Promise<AdminEntry>;
  removeAdmin(adminDocId: string): Promise<void>;
}

export const NICKNAME_RE = /^[\p{L}\p{N}_]{2,12}$/u;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^\d{8,15}$/;
