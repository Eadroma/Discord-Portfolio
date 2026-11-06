import { describe, expect, it } from 'vitest';
import real from '../content/profile.json';
import example from '../content/profile.example.json';
import { validateProfile, type Issue } from './profileSchema';

const clone = () => structuredClone(real) as Record<string, unknown> & typeof real;
const issuesOf = (input: unknown): Issue[] => {
  const result = validateProfile(input);
  return result.ok ? [] : result.issues;
};

describe('validateProfile', () => {
  it('accepts the shipped profile and the example, unchanged', () => {
    for (const profile of [real, example]) {
      const result = validateProfile(profile);
      expect(result).toEqual({ ok: true, profile });
    }
  });

  it('drops keys the Profile type does not have', () => {
    const result = validateProfile({ ...clone(), isAdmin: true });
    expect(result.ok && 'isAdmin' in result.profile).toBe(false);
  });

  it('requires both languages of a bilingual field', () => {
    const p = clone();
    p.jobTitle = { en: 'Dev', fr: '  ' };
    expect(issuesOf(p)).toEqual([{ path: 'jobTitle.fr', code: 'required' }]);
  });

  it('removes an availability status left empty in both languages', () => {
    const result = validateProfile({ ...clone(), status: { en: '', fr: '' } });
    expect(result.ok && 'status' in result.profile).toBe(false);
  });

  it('rejects impossible dates and an end before the start', () => {
    const p = clone();
    p.experiences[0] = { ...p.experiences[0], startDate: '2023-02-30' };
    p.experiences[1] = { ...p.experiences[1], startDate: '2022-05-01', endDate: '2021-01-01' };
    expect(issuesOf(p)).toEqual([
      { path: 'experiences.0.startDate', code: 'invalidDate' },
      { path: 'experiences.1.endDate', code: 'dateOrder' },
    ]);
  });

  it('treats an empty end date as a current job', () => {
    const p = clone();
    p.experiences[0] = { ...p.experiences[0], endDate: '' as unknown as null };
    const result = validateProfile(p);
    expect(result.ok && result.profile.experiences[0].endDate).toBeNull();
  });

  it('only accepts https links and #RRGGBB colors', () => {
    const p = clone();
    p.socials = { ...p.socials, linkedin: 'javascript:alert(1)' };
    p.theme = { ...p.theme, accent: 'red' };
    // Keep the name: the admin may reorder skills, and a renamed one could collide with another.
    p.skills[0] = { ...p.skills[0], icon: 'http://example.com/logo.svg' };
    expect(issuesOf(p)).toEqual([
      { path: 'socials.linkedin', code: 'invalidUrl' },
      { path: 'theme.accent', code: 'invalidColor' },
      { path: 'skills.0.icon', code: 'invalidUrl' },
    ]);
  });

  it('flags a skill listed twice, whatever the case', () => {
    const p = clone();
    p.skills.push({ name: p.skills[0].name.toUpperCase(), icon: undefined as unknown as string });
    expect(issuesOf(p)).toEqual([
      { path: `skills.${p.skills.length - 1}.name`, code: 'duplicate' },
    ]);
  });

  it('rejects something that is not a profile at all', () => {
    expect(issuesOf('nope')).toEqual([{ path: '', code: 'invalidType' }]);
    expect(issuesOf({})).toContainEqual({ path: 'name', code: 'required' });
  });
});
