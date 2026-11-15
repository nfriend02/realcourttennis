import { AuthError, PHONE_RE } from '../backend/types';

/** Digits only from a country / phone fragment (spaces and dashes ignored). */
export function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, '');
}

/**
 * Phone login ID = country digits + national digits (no SMS).
 * Leading zeros on the national number are stripped (e.g. 010 → 10).
 */
export function composePhoneId(countryCode: string, nationalNumber: string): string {
  const cc = digitsOnly(countryCode);
  const national = digitsOnly(nationalNumber).replace(/^0+/, '');
  if (!cc || cc.length < 1 || cc.length > 4) throw new AuthError('invalidId');
  const full = `${cc}${national}`;
  if (!PHONE_RE.test(full)) throw new AuthError('invalidId');
  return full;
}

export const DEFAULT_COUNTRY_CODE = '+82';
