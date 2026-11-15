import { describe, expect, it } from 'vitest';
import { AuthError } from '../backend/types';
import { composePhoneId, digitsOnly } from './phoneId';

describe('composePhoneId', () => {
  it('joins country + national and ignores spaces/dashes', () => {
    expect(composePhoneId('+82', '10 1234 5678')).toBe('821012345678');
    expect(composePhoneId('82', '010-1234-5678')).toBe('821012345678');
  });

  it('rejects empty national numbers', () => {
    expect(() => composePhoneId('+82', '')).toThrow(AuthError);
  });

  it('digitsOnly strips non-digits', () => {
    expect(digitsOnly('+82-10 1234')).toBe('82101234');
  });
});
