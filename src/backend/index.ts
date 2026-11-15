import { MockBackend } from './mockBackend';
import type { Backend } from './types';
import type { FirebaseEnv } from './firebaseBackend';

/** Defers loading the Firebase SDK chunk until the first backend call (keeps the boot bundle small). */
class LazyFirebaseBackend implements Backend {
  readonly kind = 'firebase' as const;
  private impl: Promise<Backend> | null = null;

  constructor(private readonly env: FirebaseEnv) {}

  private get(): Promise<Backend> {
    this.impl ??= import('./firebaseBackend').then((m) => new m.FirebaseBackend(this.env));
    return this.impl;
  }

  restoreSession: Backend['restoreSession'] = async () => (await this.get()).restoreSession();
  loginGuest: Backend['loginGuest'] = async (n) => (await this.get()).loginGuest(n);
  loginWithId: Backend['loginWithId'] = async (k, i, p) => (await this.get()).loginWithId(k, i, p);
  signupWithId: Backend['signupWithId'] = async (k, i, p) => (await this.get()).signupWithId(k, i, p);
  loginOAuth: Backend['loginOAuth'] = async (p) => (await this.get()).loginOAuth(p);
  logout: Backend['logout'] = async () => (await this.get()).logout();
  updateProfile: Backend['updateProfile'] = async (p) => (await this.get()).updateProfile(p);
  changePassword: Backend['changePassword'] = async (p) => (await this.get()).changePassword(p);
  deleteAccount: Backend['deleteAccount'] = async () => (await this.get()).deleteAccount();
  getProgress: Backend['getProgress'] = async () => (await this.get()).getProgress();
  submitMatch: Backend['submitMatch'] = async (r) => (await this.get()).submitMatch(r);
  listAdmins: Backend['listAdmins'] = async () => (await this.get()).listAdmins();
  addAdmin: Backend['addAdmin'] = async (k, id, o) => (await this.get()).addAdmin(k, id, o);
  removeAdmin: Backend['removeAdmin'] = async (id) => (await this.get()).removeAdmin(id);
}

/** Firebase when configured via env, otherwise the localStorage MockBackend (X05, ADR-002). */
export function createBackend(): Backend {
  const env = import.meta.env;
  const apiKey = env.VITE_FIREBASE_API_KEY as string | undefined;
  const projectId = env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const appId = env.VITE_FIREBASE_APP_ID as string | undefined;
  if (apiKey && projectId && appId) {
    return new LazyFirebaseBackend({
      apiKey,
      projectId,
      appId,
      authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) || `${projectId}.firebaseapp.com`,
      firestoreDatabaseId: (env.VITE_FIRESTORE_DATABASE_ID as string | undefined) || projectId,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
      phoneAliasDomain: (env.VITE_PHONE_ALIAS_DOMAIN as string | undefined) || 'realcourttennis.app',
    });
  }
  return new MockBackend();
}

export const backend: Backend = createBackend();
