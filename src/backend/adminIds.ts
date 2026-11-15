import { composePhoneId, digitsOnly } from '../core/phoneId';
import { AuthError, EMAIL_RE, PHONE_RE, type AdminKind } from './types';

export interface AdminRecord {
  /** Firestore document id (= normalized login key). */
  id: string;
  loginId: string;
  kind: AdminKind;
  /** Optional label for Admin UI. */
  label?: string;
  /** Groups email + phone aliases for the same person. */
  personId?: string;
}

/** Normalize an admin login key for Firestore doc ids (email lower / phone digits). */
export function normalizeAdminKey(kind: AdminKind, raw: string, phoneAliasDomain = 'realcourttennis.app'): string {
  if (kind === 'email') {
    const v = raw.trim().toLowerCase();
    if (!EMAIL_RE.test(v)) throw new AuthError('invalidId');
    return v;
  }
  // Accept "+82 10 …", "8210…", or alias "8210…@phone.domain".
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.includes('@phone.') || trimmed.endsWith(`@phone.${phoneAliasDomain}`)) {
    const digits = digitsOnly(trimmed.split('@')[0]);
    if (!PHONE_RE.test(digits)) throw new AuthError('invalidId');
    return digits;
  }
  const withPlus = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);
  if (withPlus) return composePhoneId(withPlus[1], withPlus[2]);
  const digits = digitsOnly(trimmed);
  if (!PHONE_RE.test(digits)) throw new AuthError('invalidId');
  return digits;
}

/** Extra Auth-token email key so Firestore rules can match request.auth.token.email for phone alias users. */
export function phoneAliasAdminKey(phoneDigits: string, phoneAliasDomain = 'realcourttennis.app'): string {
  return `${phoneDigits}@phone.${phoneAliasDomain}`;
}

export const SEED_ADMINS: ReadonlyArray<{ kind: AdminKind; raw: string; personId: string; label: string }> = [
  { kind: 'email', raw: 'nfriend02@naver.com', personId: 'founder', label: 'Founder email' },
  { kind: 'phone', raw: '+82 10 5279 9244', personId: 'founder', label: 'Founder mobile' },
];
