import { describe, expect, it } from 'vitest';
import example from './profile.example.json';
import { localize, profile, type Profile } from './profile';

describe('profile', () => {
  it('ships an example that matches the Profile type', () => {
    // Fails `tsc -b` if the example drifts from the type forks copy it into.
    const typed: Profile = example;
    expect(typed.experiences.length).toBeGreaterThan(0);
    expect(profile.name).not.toBe(example.name);
  });

  it('picks French for any fr region and English otherwise', () => {
    const text = { en: 'Hello', fr: 'Bonjour' };
    expect(localize(text, 'fr')).toBe('Bonjour');
    expect(localize(text, 'fr-CA')).toBe('Bonjour');
    expect(localize(text, 'en-US')).toBe('Hello');
    expect(localize(text, undefined)).toBe('Hello');
  });
});
