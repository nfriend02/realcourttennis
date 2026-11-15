import { MAX_STAGE } from '../data/gameData';
import { normalizeAdminKey, phoneAliasAdminKey, SEED_ADMINS } from './adminIds';
import {
  type AccountType,
  type AdminEntry,
  type AdminKind,
  AuthError,
  type Backend,
  EMAIL_RE,
  type MatchResultInput,
  type MatchSubmitResult,
  NICKNAME_RE,
  PHONE_RE,
  type StageProgress,
  type UserProfile,
} from './types';

interface MockUser extends Omit<UserProfile, 'isAdmin'> {
  pwHash: string;
  stages: Record<number, StageProgress>;
  highScore: number;
  stageCleared: number;
  lastSeen: number;
  expireAt: number | null;
  /** Guest session ended — nickname reusable; row kept until expireAt. */
  discarded?: boolean;
}

const USERS_KEY = 'rct.mock.users';
const SESSION_KEY = 'rct.mock.session';
const ADMINS_KEY = 'rct.mock.admins';
const GUEST_TTL_MS = 100 * 24 * 3600 * 1000;
const PHONE_ALIAS_DOMAIN = 'realcourttennis.app';

async function sha256(text: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return `fnv${(h >>> 0).toString(16)}`;
}

function uid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `u-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

/** localStorage backend used when Firebase is not configured (X05). Same contract as the Firebase gateway. */
export class MockBackend implements Backend {
  readonly kind = 'mock' as const;
  private currentId: string | null = null;

  private load(): MockUser[] {
    try {
      const all = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as MockUser[];
      const now = Date.now();
      return all.filter((u) => u.expireAt === null || u.expireAt > now);
    } catch {
      return [];
    }
  }

  private save(users: MockUser[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private me(users = this.load()): MockUser {
    const u = users.find((x) => x.id === this.currentId);
    if (!u) throw new AuthError('recentLogin');
    return u;
  }

  private startSession(u: MockUser): UserProfile {
    this.currentId = u.id;
    localStorage.setItem(SESSION_KEY, u.id);
    return this.toProfile(u);
  }

  private loadAdmins(): AdminEntry[] {
    try {
      const raw = localStorage.getItem(ADMINS_KEY);
      if (!raw) {
        const seeded = seedMockAdmins();
        localStorage.setItem(ADMINS_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(raw) as AdminEntry[];
    } catch {
      return seedMockAdmins();
    }
  }

  private saveAdmins(list: AdminEntry[]): void {
    localStorage.setItem(ADMINS_KEY, JSON.stringify(list));
  }

  private isAdminLogin(loginId: string, accountType: AccountType): boolean {
    const admins = this.loadAdmins();
    const keys = new Set(admins.map((a) => a.id));
    if (loginId && keys.has(loginId.toLowerCase())) return true;
    if (accountType === 'phone' && loginId && keys.has(phoneAliasAdminKey(loginId, PHONE_ALIAS_DOMAIN))) return true;
    return false;
  }

  private toProfile(u: MockUser): UserProfile {
    return {
      id: u.id,
      username: u.username,
      accountType: u.accountType,
      loginId: u.loginId,
      handedness: u.handedness,
      preferredLanguage: u.preferredLanguage,
      selectedCharacter: u.selectedCharacter,
      mileage: u.mileage,
      freeBest: u.freeBest,
      isAdmin: this.isAdminLogin(u.loginId, u.accountType),
    };
  }

  private newUser(type: AccountType, username: string, loginId: string, pwHash: string): MockUser {
    return {
      id: uid(),
      username,
      accountType: type,
      loginId,
      handedness: 'right',
      preferredLanguage: 'ko',
      selectedCharacter: 'CHAR_01',
      mileage: 0,
      freeBest: 0,
      pwHash,
      stages: {},
      highScore: 0,
      stageCleared: 0,
      lastSeen: Date.now(),
      expireAt: type === 'guest' ? Date.now() + GUEST_TTL_MS : null,
    };
  }

  async restoreSession(): Promise<UserProfile | null> {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const users = this.load();
    const u = users.find((x) => x.id === id);
    if (!u || u.discarded) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    u.lastSeen = Date.now();
    if (u.accountType === 'guest') u.expireAt = Date.now() + GUEST_TTL_MS;
    this.save(users);
    this.currentId = u.id;
    return this.toProfile(u);
  }

  async loginGuest(nickname: string): Promise<UserProfile> {
    const name = nickname.trim();
    if (!NICKNAME_RE.test(name)) throw new AuthError('nicknameInvalid');
    const users = this.load();
    if (users.some((u) => u.accountType === 'guest' && !u.discarded && u.username.toLowerCase() === name.toLowerCase())) {
      throw new AuthError('nicknameTaken');
    }
    const u = this.newUser('guest', name, '', '');
    users.push(u);
    this.save(users);
    return this.startSession(u);
  }

  private normalizeId(kind: 'email' | 'phone', id: string): string {
    const v = id.trim().toLowerCase();
    if (kind === 'email' ? !EMAIL_RE.test(v) : !PHONE_RE.test(v.replace(/[-\s]/g, ''))) throw new AuthError('invalidId');
    return kind === 'phone' ? v.replace(/[-\s]/g, '') : v;
  }

  async loginWithId(kind: 'email' | 'phone', id: string, password: string): Promise<UserProfile> {
    const loginId = this.normalizeId(kind, id);
    const users = this.load();
    const u = users.find((x) => x.accountType === kind && x.loginId === loginId);
    if (!u || u.pwHash !== (await sha256(`${loginId}:${password}`))) throw new AuthError('invalidCredentials');
    return this.startSession(u);
  }

  async signupWithId(kind: 'email' | 'phone', id: string, password: string): Promise<UserProfile> {
    const loginId = this.normalizeId(kind, id);
    if (password.length < 6) throw new AuthError('weakPassword');
    const users = this.load();
    if (users.some((x) => x.accountType === kind && x.loginId === loginId)) throw new AuthError('emailInUse');
    const display = kind === 'email' ? loginId.split('@')[0].slice(0, 12) : `P${loginId.slice(-4)}`;
    const u = this.newUser(kind, display.length >= 2 ? display : `${display}__`, loginId, await sha256(`${loginId}:${password}`));
    users.push(u);
    this.save(users);
    return this.startSession(u);
  }

  async loginOAuth(): Promise<UserProfile> {
    throw new AuthError('unsupported');
  }

  async logout(): Promise<void> {
    const users = this.load();
    const u = users.find((x) => x.id === this.currentId);
    // Guest: keep mileage/nickname in storage until TTL, but mark discarded so the name is free again.
    if (u?.accountType === 'guest') {
      u.discarded = true;
      u.expireAt = Date.now() + GUEST_TTL_MS;
      this.save(users);
    }
    this.currentId = null;
    localStorage.removeItem(SESSION_KEY);
  }

  async updateProfile(patch: Partial<Pick<UserProfile, 'handedness' | 'preferredLanguage' | 'selectedCharacter'>>): Promise<UserProfile> {
    const users = this.load();
    const u = this.me(users);
    Object.assign(u, patch);
    this.save(users);
    return this.toProfile(u);
  }

  async changePassword(newPassword: string): Promise<void> {
    if (newPassword.length < 6) throw new AuthError('weakPassword');
    const users = this.load();
    const u = this.me(users);
    if (u.accountType !== 'email' && u.accountType !== 'phone') throw new AuthError('unsupported');
    u.pwHash = await sha256(`${u.loginId}:${newPassword}`);
    this.save(users);
  }

  async deleteAccount(): Promise<void> {
    const users = this.load();
    this.save(users.filter((x) => x.id !== this.currentId));
    this.currentId = null;
    localStorage.removeItem(SESSION_KEY);
  }

  async getProgress(): Promise<StageProgress[]> {
    const u = this.me();
    const list: StageProgress[] = [];
    for (let s = 1; s <= MAX_STAGE; s++) list.push(u.stages[s] ?? { stageId: s, cleared: false, bestScore: 0, clearCount: 0 });
    return list;
  }

  async submitMatch(r: MatchResultInput): Promise<MatchSubmitResult> {
    const users = this.load();
    const u = this.me(users);
    u.mileage += Math.max(0, r.score);
    let best = 0;
    let newBest = false;
    if (r.mode === 'stage' && r.stageId) {
      const p = u.stages[r.stageId] ?? { stageId: r.stageId, cleared: false, bestScore: 0, clearCount: 0 };
      newBest = r.score > p.bestScore;
      p.bestScore = Math.max(p.bestScore, r.score);
      if (r.won) {
        p.cleared = true;
        p.clearCount++;
      }
      u.stages[r.stageId] = p;
      best = p.bestScore;
      u.stageCleared = Object.values(u.stages).filter((x) => x.cleared).reduce((m, x) => Math.max(m, x.stageId), 0);
      u.highScore = Math.max(u.highScore, r.score);
    } else {
      newBest = r.score > u.freeBest;
      u.freeBest = Math.max(u.freeBest, r.score);
      best = u.freeBest;
    }
    this.save(users);
    let rank: number | null = null;
    if (r.mode === 'stage') {
      const sorted = [...users].sort((a, b) => b.stageCleared - a.stageCleared || b.highScore - a.highScore);
      rank = sorted.findIndex((x) => x.id === u.id) + 1;
    }
    return { best, newBest, rank, mileage: u.mileage };
  }

  async listAdmins(): Promise<AdminEntry[]> {
    const me = this.me();
    if (!this.toProfile(me).isAdmin) throw new AuthError('unsupported');
    return this.loadAdmins().filter((a) => !a.id.includes('@phone.'));
  }

  async addAdmin(kind: AdminKind, loginId: string, opts: { label?: string; personId?: string } = {}): Promise<AdminEntry> {
    const me = this.me();
    if (!this.toProfile(me).isAdmin) throw new AuthError('unsupported');
    const key = normalizeAdminKey(kind, loginId, PHONE_ALIAS_DOMAIN);
    const list = this.loadAdmins().filter((a) => a.id !== key && a.id !== phoneAliasAdminKey(key, PHONE_ALIAS_DOMAIN));
    const entry: AdminEntry = { id: key, loginId: key, kind, label: opts.label, personId: opts.personId };
    list.push(entry);
    if (kind === 'phone') {
      list.push({ ...entry, id: phoneAliasAdminKey(key, PHONE_ALIAS_DOMAIN) });
    }
    this.saveAdmins(list);
    return entry;
  }

  async removeAdmin(adminDocId: string): Promise<void> {
    const me = this.me();
    if (!this.toProfile(me).isAdmin) throw new AuthError('unsupported');
    const id = adminDocId.trim().toLowerCase();
    const list = this.loadAdmins().filter((a) => a.id !== id && a.loginId !== id && !a.id.startsWith(id + '@'));
    this.saveAdmins(list);
  }
}

function seedMockAdmins(): AdminEntry[] {
  const out: AdminEntry[] = [];
  for (const s of SEED_ADMINS) {
    const key = normalizeAdminKey(s.kind, s.raw, PHONE_ALIAS_DOMAIN);
    out.push({ id: key, loginId: key, kind: s.kind, label: s.label, personId: s.personId });
    if (s.kind === 'phone') {
      out.push({ id: phoneAliasAdminKey(key, PHONE_ALIAS_DOMAIN), loginId: key, kind: 'phone', label: s.label, personId: s.personId });
    }
  }
  return out;
}
