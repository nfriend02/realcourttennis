import { type FirebaseApp, initializeApp } from 'firebase/app';
import {
  type Auth,
  type User,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updatePassword,
} from 'firebase/auth';
import {
  type Firestore,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  increment,
  initializeFirestore,
  persistentLocalCache,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { MAX_STAGE } from '../data/gameData';
import {
  type AccountType,
  AuthError,
  type AuthErrorCode,
  type Backend,
  EMAIL_RE,
  type MatchResultInput,
  type MatchSubmitResult,
  NICKNAME_RE,
  PHONE_RE,
  type StageProgress,
  type UserProfile,
} from './types';

export interface FirebaseEnv {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  phoneAliasDomain: string;
}

interface ProfileDoc {
  username: string;
  accountType: AccountType;
  handedness: 'right' | 'left';
  preferredLanguage: 'ko' | 'en' | 'ja';
  selectedCharacter: string;
  mileage: number;
  freeBest: number;
  role: 'player';
}

interface ProgressDoc {
  cleared: boolean;
  bestScore: number;
  clearCount: number;
}

interface RankingDoc {
  username: string;
  stageCleared: number;
  highScore: number;
}

const PENDING_KEY = 'rct.fb.pendingResults';
const GUEST_TTL_MS = 100 * 24 * 3600 * 1000;
const MAX_SCORE = 40000;

/**
 * Firebase gateway: Auth (anonymous guest, email/password, phone alias email, Google/Apple) + Firestore.
 * Layout and validation rules: firestore.rules (ADR-002). Result writes are one transaction so the
 * rules can cross-check progress, ranking and mileage against the stored match result.
 */
export class FirebaseBackend implements Backend {
  readonly kind = 'firebase' as const;
  private readonly app: FirebaseApp;
  private readonly auth: Auth;
  private readonly db: Firestore;

  constructor(private readonly env: FirebaseEnv) {
    this.app = initializeApp({ apiKey: env.apiKey, authDomain: env.authDomain, projectId: env.projectId, appId: env.appId });
    this.auth = getAuth(this.app);
    this.db = initializeFirestore(this.app, { localCache: persistentLocalCache() });
  }

  // ------------------------------------------------------------ helpers

  private get uid(): string {
    const u = this.auth.currentUser;
    if (!u) throw new AuthError('recentLogin');
    return u.uid;
  }

  private profileRef(uid = this.uid) {
    return doc(this.db, 'profiles', uid);
  }

  private async readProfile(user: User): Promise<UserProfile | null> {
    const snap = await getDoc(this.profileRef(user.uid));
    return snap.exists() ? toProfile(user, snap.data() as ProfileDoc) : null;
  }

  private async ensureProfile(user: User, username: string, type: AccountType): Promise<UserProfile> {
    const existing = await this.readProfile(user);
    if (existing) return existing;
    const data: ProfileDoc & Record<string, unknown> = {
      username,
      usernameLower: username.toLowerCase(),
      accountType: type,
      handedness: 'right',
      preferredLanguage: 'ko',
      selectedCharacter: 'CHAR_01',
      mileage: 0,
      freeBest: 0,
      role: 'player',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (type === 'guest') data.expireAt = guestExpiry();
    const batch = writeBatch(this.db);
    batch.set(this.profileRef(user.uid), data);
    if (type === 'guest') batch.set(doc(this.db, 'guestNames', username.toLowerCase()), { uid: user.uid, expireAt: guestExpiry() });
    await batch.commit().catch((e: unknown) => {
      throw new AuthError(type === 'guest' && code(e) === 'permission-denied' ? 'nicknameTaken' : mapError(e));
    });
    return toProfile(user, data);
  }

  private aliasEmail(kind: 'email' | 'phone', id: string): string {
    const v = id.trim().toLowerCase().replace(kind === 'phone' ? /[-\s]/g : /$^/, '');
    if (kind === 'email' ? !EMAIL_RE.test(v) : !PHONE_RE.test(v)) throw new AuthError('invalidId');
    return kind === 'email' ? v : `${v}@phone.${this.env.phoneAliasDomain}`;
  }

  private firstAuthState(): Promise<User | null> {
    return new Promise((resolve) => {
      const off = onAuthStateChanged(this.auth, (u) => {
        off();
        resolve(u);
      });
    });
  }

  /** Deletes every Firestore document owned by the current user (profile last, as rules key off it). */
  private async purgeOwnData(user: User, profile: UserProfile | null): Promise<void> {
    const uid = user.uid;
    const results = await getDocs(collection(this.db, 'profiles', uid, 'results'));
    const progress = await getDocs(collection(this.db, 'profiles', uid, 'progress'));
    let batch = writeBatch(this.db);
    let n = 0;
    for (const d of [...results.docs, ...progress.docs]) {
      batch.delete(d.ref);
      if (++n % 400 === 0) {
        await batch.commit();
        batch = writeBatch(this.db);
      }
    }
    batch.delete(doc(this.db, 'rankings', uid));
    if (profile?.accountType === 'guest') batch.delete(doc(this.db, 'guestNames', profile.username.toLowerCase()));
    batch.delete(this.profileRef(uid));
    await batch.commit();
  }

  // ------------------------------------------------------------ Backend

  async restoreSession(): Promise<UserProfile | null> {
    try {
      const redirect = await getRedirectResult(this.auth);
      if (redirect) return await this.ensureProfile(redirect.user, oauthName(redirect.user), providerOf(redirect.user));
      const user = await this.firstAuthState();
      if (!user) return null;
      const p = await this.readProfile(user);
      if (p) void this.flushPending();
      return p;
    } catch {
      return null;
    }
  }

  async loginGuest(nickname: string): Promise<UserProfile> {
    const name = nickname.trim();
    if (!NICKNAME_RE.test(name)) throw new AuthError('nicknameInvalid');
    const taken = await getDoc(doc(this.db, 'guestNames', name.toLowerCase())).catch(() => null);
    if (taken?.exists()) throw new AuthError('nicknameTaken');
    const cred = await signInAnonymously(this.auth).catch((e: unknown) => {
      throw new AuthError(mapError(e));
    });
    try {
      return await this.ensureProfile(cred.user, name, 'guest');
    } catch (e) {
      await deleteUser(cred.user).catch(() => undefined);
      throw e;
    }
  }

  async loginWithId(kind: 'email' | 'phone', id: string, password: string): Promise<UserProfile> {
    const email = this.aliasEmail(kind, id);
    const cred = await signInWithEmailAndPassword(this.auth, email, password).catch((e: unknown) => {
      throw new AuthError(mapError(e));
    });
    return this.ensureProfile(cred.user, defaultName(kind, email), kind);
  }

  async signupWithId(kind: 'email' | 'phone', id: string, password: string): Promise<UserProfile> {
    const email = this.aliasEmail(kind, id);
    if (password.length < 6) throw new AuthError('weakPassword');
    const cred = await createUserWithEmailAndPassword(this.auth, email, password).catch((e: unknown) => {
      throw new AuthError(mapError(e));
    });
    return this.ensureProfile(cred.user, defaultName(kind, email), kind);
  }

  async loginOAuth(provider: 'google' | 'apple'): Promise<UserProfile> {
    const p = provider === 'google' ? new GoogleAuthProvider() : new OAuthProvider('apple.com');
    if (p instanceof OAuthProvider) p.addScope('email');
    try {
      const cred = await signInWithPopup(this.auth, p);
      return await this.ensureProfile(cred.user, oauthName(cred.user), provider);
    } catch (e) {
      const c = code(e);
      if (c === 'auth/popup-blocked' || c === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(this.auth, p);
        return new Promise<UserProfile>(() => undefined);
      }
      if (c === 'auth/operation-not-allowed' || c === 'auth/configuration-not-found') throw new AuthError('unsupported');
      throw e instanceof AuthError ? e : new AuthError(mapError(e));
    }
  }

  async logout(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;
    if (user.isAnonymous) {
      // Guest: free the nickname (searchable again) but keep profile/mileage in Firestore
      // until expireAt TTL (~100 days). Auth anonymous user is removed so the session cannot resume.
      const p = await this.readProfile(user).catch(() => null);
      if (p?.accountType === 'guest') {
        const batch = writeBatch(this.db);
        batch.delete(doc(this.db, 'guestNames', p.username.toLowerCase()));
        batch.delete(doc(this.db, 'rankings', user.uid));
        await batch.commit().catch(() => undefined);
      }
      await deleteUser(user).catch(() => undefined);
    }
    await signOut(this.auth).catch(() => undefined);
  }

  async updateProfile(patch: Partial<Pick<UserProfile, 'handedness' | 'preferredLanguage' | 'selectedCharacter'>>): Promise<UserProfile> {
    const user = this.auth.currentUser;
    if (!user) throw new AuthError('recentLogin');
    const body: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (patch.handedness) body.handedness = patch.handedness;
    if (patch.preferredLanguage) body.preferredLanguage = patch.preferredLanguage;
    if (patch.selectedCharacter) body.selectedCharacter = patch.selectedCharacter;
    const batch = writeBatch(this.db);
    batch.update(this.profileRef(user.uid), body);
    await batch.commit().catch((e: unknown) => {
      throw new AuthError(mapError(e));
    });
    const p = await this.readProfile(user);
    if (!p) throw new AuthError('network');
    return p;
  }

  async changePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new AuthError('recentLogin');
    if (newPassword.length < 6) throw new AuthError('weakPassword');
    await updatePassword(user, newPassword).catch((e: unknown) => {
      throw new AuthError(mapError(e));
    });
  }

  async deleteAccount(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;
    const p = await this.readProfile(user).catch(() => null);
    await this.purgeOwnData(user, p).catch((e: unknown) => {
      throw new AuthError(mapError(e));
    });
    await deleteUser(user).catch((e: unknown) => {
      throw new AuthError(mapError(e));
    });
  }

  async getProgress(): Promise<StageProgress[]> {
    const snap = await getDocs(collection(this.db, 'profiles', this.uid, 'progress'));
    const byId = new Map<number, ProgressDoc>();
    snap.forEach((d) => byId.set(Number(d.id), d.data() as ProgressDoc));
    const list: StageProgress[] = [];
    for (let s = 1; s <= MAX_STAGE; s++) {
      const r = byId.get(s);
      list.push({ stageId: s, cleared: r?.cleared ?? false, bestScore: r?.bestScore ?? 0, clearCount: r?.clearCount ?? 0 });
    }
    return list;
  }

  async submitMatch(r: MatchResultInput): Promise<MatchSubmitResult> {
    try {
      return await this.sendResult(r);
    } catch (e) {
      const err = e instanceof AuthError ? e : new AuthError(mapError(e));
      if (err.code === 'network') this.queue(r);
      throw err;
    }
  }

  private async sendResult(r: MatchResultInput): Promise<MatchSubmitResult> {
    validateResult(r);
    const uid = this.uid;
    const resultRef = doc(collection(this.db, 'profiles', uid, 'results'));
    const rankRef = doc(this.db, 'rankings', uid);
    const progRef = r.mode === 'stage' && r.stageId ? doc(this.db, 'profiles', uid, 'progress', String(r.stageId)) : null;

    const out = await runTransaction(this.db, async (tx) => {
      const profSnap = await tx.get(this.profileRef(uid));
      if (!profSnap.exists()) throw new AuthError('recentLogin');
      const prof = profSnap.data() as ProfileDoc;
      const progSnap = progRef ? await tx.get(progRef) : null;
      const rankSnap = progRef ? await tx.get(rankRef) : null;

      tx.set(resultRef, {
        mode: r.mode, stageId: r.stageId, npcLevel: r.npcLevel, characterId: r.characterId, won: r.won,
        pointsFor: r.pointsFor, pointsAgainst: r.pointsAgainst, perfect: r.perfect, great: r.great, good: r.good,
        miss: r.miss, maxRally: r.maxRally, durationSec: r.durationSec, score: r.score,
        clientVersion: '0.1.0', layout: r.layout, lang: r.lang, createdAt: serverTimestamp(),
      });

      let best: number;
      let newBest: boolean;
      if (progRef && progSnap && rankSnap) {
        const prev = progSnap.exists() ? (progSnap.data() as ProgressDoc) : null;
        newBest = !prev || r.score > prev.bestScore;
        best = Math.max(prev?.bestScore ?? 0, r.score);
        tx.set(progRef, { cleared: (prev?.cleared ?? false) || r.won, bestScore: best, clearCount: (prev?.clearCount ?? 0) + (r.won ? 1 : 0), lastResult: resultRef.id, updatedAt: serverTimestamp() });
        const rk = rankSnap.exists() ? (rankSnap.data() as RankingDoc) : null;
        tx.set(rankRef, {
          username: prof.username,
          stageCleared: Math.max(rk?.stageCleared ?? 0, r.won ? r.stageId! : 0),
          highScore: Math.max(rk?.highScore ?? 0, r.score),
          lastResult: resultRef.id,
          updatedAt: serverTimestamp(),
        });
      } else {
        newBest = r.score > prof.freeBest;
        best = Math.max(prof.freeBest, r.score);
      }
      const upd: Record<string, unknown> = { mileage: increment(r.score), freeBest: r.mode === 'free' ? best : prof.freeBest, lastResult: resultRef.id, updatedAt: serverTimestamp() };
      if (prof.accountType === 'guest') upd.expireAt = guestExpiry();
      tx.update(this.profileRef(uid), upd);
      return { best, newBest, mileage: prof.mileage + r.score };
    }).catch((e: unknown) => {
      throw e instanceof AuthError ? e : new AuthError(mapError(e));
    });

    const rank = r.mode === 'stage' ? await this.myRank(uid).catch(() => null) : null;
    return { ...out, rank };
  }

  /** Rank = players with more stages cleared + players tied on stages with a higher score + 1. */
  private async myRank(uid: string): Promise<number | null> {
    const mine = await getDoc(doc(this.db, 'rankings', uid));
    if (!mine.exists()) return null;
    const { stageCleared, highScore } = mine.data() as RankingDoc;
    const col = collection(this.db, 'rankings');
    const [above, tiedAbove] = await Promise.all([
      getCountFromServer(query(col, where('stageCleared', '>', stageCleared))),
      getCountFromServer(query(col, where('stageCleared', '==', stageCleared), where('highScore', '>', highScore))),
    ]);
    return above.data().count + tiedAbove.data().count + 1;
  }

  private queue(r: MatchResultInput): void {
    const list = JSON.parse(localStorage.getItem(PENDING_KEY) ?? '[]') as MatchResultInput[];
    list.push(r);
    localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20)));
  }

  private async flushPending(attempt = 0): Promise<void> {
    const list = JSON.parse(localStorage.getItem(PENDING_KEY) ?? '[]') as MatchResultInput[];
    if (!list.length || attempt >= 5) return;
    try {
      while (list.length) {
        await this.sendResult(list[0]);
        list.shift();
        localStorage.setItem(PENDING_KEY, JSON.stringify(list));
      }
    } catch {
      setTimeout(() => void this.flushPending(attempt + 1), 2000 * 2 ** attempt);
    }
  }
}

function validateResult(r: MatchResultInput): void {
  const pointsOk = r.pointsFor >= 0 && r.pointsFor <= 3 && r.pointsAgainst >= 0 && r.pointsAgainst <= 3 && (!r.won || r.pointsFor === 3);
  if (!pointsOk || r.score < 0 || r.score > MAX_SCORE || r.durationSec < 20) throw new AuthError('invalidCredentials');
}

function guestExpiry(): Timestamp {
  return Timestamp.fromMillis(Date.now() + GUEST_TTL_MS);
}

function toProfile(user: User, d: ProfileDoc): UserProfile {
  const email = user.email ?? '';
  return {
    id: user.uid,
    username: d.username,
    accountType: d.accountType,
    loginId: d.accountType === 'phone' ? email.split('@')[0] : email,
    handedness: d.handedness,
    preferredLanguage: d.preferredLanguage,
    selectedCharacter: d.selectedCharacter,
    mileage: Number(d.mileage),
    freeBest: d.freeBest,
  };
}

function providerOf(user: User): 'google' | 'apple' {
  return user.providerData.some((p) => p.providerId === 'apple.com') ? 'apple' : 'google';
}

function oauthName(user: User): string {
  return sanitizeName(user.displayName ?? user.email?.split('@')[0] ?? 'Player');
}

function sanitizeName(s: string): string {
  const v = s.replace(/[^\p{L}\p{N}_]/gu, '').slice(0, 12);
  return v.length >= 2 ? v : `${v}Player`.slice(0, 12);
}

function defaultName(kind: 'email' | 'phone', email: string): string {
  const local = email.split('@')[0];
  return kind === 'email' ? sanitizeName(local) : `P${local.slice(-4)}`;
}

function code(e: unknown): string {
  return typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
}

function mapError(e: unknown): AuthErrorCode {
  switch (code(e)) {
    case 'auth/email-already-in-use':
      return 'emailInUse';
    case 'auth/weak-password':
      return 'weakPassword';
    case 'auth/invalid-email':
      return 'invalidId';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'invalidCredentials';
    case 'auth/requires-recent-login':
    case 'auth/user-token-expired':
    case 'unauthenticated':
      return 'recentLogin';
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'unsupported';
    case 'permission-denied':
      return 'invalidCredentials';
    default:
      return 'network';
  }
}
