import { describe, expect, it } from 'vitest';
import { validateContact } from './contact';

const ok = { name: 'Ada', email: 'ada@example.com', phone: '', message: 'Hello' };

describe('validateContact', () => {
  it('accepts a name, one way to reply and a message', () => {
    expect(validateContact(ok)).toBeNull();
    expect(validateContact({ ...ok, email: '', phone: '+33 6 00 00 00 00' })).toBeNull();
  });

  it('rejects a message with no way to reply', () => {
    expect(validateContact({ ...ok, email: '', phone: '  ' })).toBe('missingContact');
  });

  it('rejects blank name or message', () => {
    expect(validateContact({ ...ok, name: ' ' })).toBe('missingName');
    expect(validateContact({ ...ok, message: '' })).toBe('missingMessage');
  });

  it('rejects a malformed email and over-long fields', () => {
    expect(validateContact({ ...ok, email: 'ada@' })).toBe('invalidEmail');
    expect(validateContact({ ...ok, message: 'x'.repeat(1501) })).toBe('tooLong');
  });
});
