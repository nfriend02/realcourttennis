/**
 * Smoke test: Auth (anonymous) + Firestore CRUD + Storage upload/download/delete
 * against the named Seoul database. Run: npx tsx tools/firebase-smoke.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, deleteUser, signOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

function loadEnvLocal(): Record<string, string> {
  const out: Record<string, string> = {};
  const path = resolve(process.cwd(), '.env.local');
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

async function main(): Promise<void> {
  const env = loadEnvLocal();
  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  const auth = getAuth(app);
  const dbId = env.VITE_FIRESTORE_DATABASE_ID || env.VITE_FIREBASE_PROJECT_ID;
  const db = getFirestore(app, dbId);
  const storage = getStorage(app);

  console.log('region/db:', env.VITE_FIREBASE_REGION, dbId);
  const cred = await signInAnonymously(auth);
  const uid = cred.user.uid;
  console.log('auth anonymous ok:', uid);

  const profileRef = doc(db, 'profiles', uid);
  await setDoc(profileRef, {
    username: 'SmokeBot',
    usernameLower: 'smokebot',
    accountType: 'guest',
    handedness: 'right',
    preferredLanguage: 'ko',
    selectedCharacter: 'CHAR_01',
    mileage: 0,
    freeBest: 0,
    role: 'player',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log('firestore create ok');

  const snap = await getDoc(profileRef);
  if (!snap.exists() || snap.data()?.username !== 'SmokeBot') throw new Error('firestore read failed');
  console.log('firestore read ok');

  await updateDoc(profileRef, { selectedCharacter: 'CHAR_02', updatedAt: serverTimestamp() });
  const snap2 = await getDoc(profileRef);
  if (snap2.data()?.selectedCharacter !== 'CHAR_02') throw new Error('firestore update failed');
  console.log('firestore update ok');

  const objectRef = ref(storage, `users/${uid}/smoke.txt`);
  await uploadString(objectRef, 'realcourttennis smoke', 'raw', { contentType: 'text/plain' });
  const url = await getDownloadURL(objectRef);
  if (!url.includes('firebasestorage')) throw new Error('storage download url unexpected');
  console.log('storage upload+url ok');
  await deleteObject(objectRef);
  console.log('storage delete ok');

  await deleteDoc(profileRef);
  console.log('firestore delete ok');

  await deleteUser(cred.user).catch(async () => {
    await signOut(auth);
  });
  console.log('SMOKE PASS');
}

main().catch((e) => {
  console.error('SMOKE FAIL', e);
  process.exit(1);
});
