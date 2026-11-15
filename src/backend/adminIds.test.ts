import { describe, expect, it } from 'vitest';
import { normalizeAdminKey, phoneAliasAdminKey, SEED_ADMINS } from './adminIds';

describe('adminIds', () => {
  it('normalizes seed admins', () => {
    expect(normalizeAdminKey('email', SEED_ADMINS[0].raw)).toBe('nfriend02@naver.com');
    expect(normalizeAdminKey('phone', SEED_ADMINS[1].raw)).toBe('821052799244');
    expect(phoneAliasAdminKey('821052799244')).toBe('821052799244@phone.realcourttennis.app');
  });
});
