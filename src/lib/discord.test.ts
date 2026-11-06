import { describe, expect, it, vi } from 'vitest';
import { avatarUrl, parseDiscordCallback, readDiscordUser } from './discord';

describe('readDiscordUser', () => {
  it('returns a stored user and clears anything unreadable', () => {
    const removeItem = vi.fn();
    vi.stubGlobal('localStorage', { removeItem });
    const stored = { id: '80351110224678912', username: 'ada' };
    expect(readDiscordUser(JSON.stringify(stored))).toEqual(stored);
    expect(readDiscordUser(null)).toBeNull();
    expect(readDiscordUser('{oops')).toBeNull();
    expect(readDiscordUser('{"id":"not-a-number","username":"x"}')).toBeNull();
    expect(removeItem).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });
});

describe('avatarUrl', () => {
  it('uses the custom avatar, or a default one derived from the id', () => {
    expect(avatarUrl({ id: '1', avatar: 'abc' }, 128)).toBe(
      'https://cdn.discordapp.com/avatars/1/abc.png?size=128',
    );
    // (80351110224678912 >> 22) % 6 === 5
    expect(avatarUrl({ id: '80351110224678912', avatar: null })).toBe(
      'https://cdn.discordapp.com/embed/avatars/5.png',
    );
  });
});

describe('parseDiscordCallback', () => {
  it('returns the token when the state matches', () => {
    expect(parseDiscordCallback('#access_token=abc&token_type=Bearer&state=s1', 's1')).toEqual({
      ok: true,
      accessToken: 'abc',
      tokenType: 'Bearer',
    });
  });

  it('rejects a token from a login this tab did not start', () => {
    expect(parseDiscordCallback('#access_token=abc&token_type=Bearer&state=evil', 's1')).toEqual({
      ok: false,
      error: 'state_mismatch',
    });
    expect(parseDiscordCallback('#access_token=abc&token_type=Bearer', null)).toMatchObject({
      ok: false,
    });
  });

  it('passes Discord errors through and catches a missing token', () => {
    expect(parseDiscordCallback('#error=access_denied&state=s1', 's1')).toEqual({
      ok: false,
      error: 'access_denied',
    });
    expect(parseDiscordCallback('#state=s1', 's1')).toEqual({ ok: false, error: 'no_token' });
  });
});
