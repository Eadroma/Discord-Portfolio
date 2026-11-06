import type { Experience, Localized, Profile, Skill } from '../content/types.js';

// Checks a profile sent by the admin page before the server commits it, and the same rules
// run in the browser to show errors next to the fields. It rebuilds the object, so unknown keys
// never reach profile.json.

export type IssueCode =
  | 'required'
  | 'tooLong'
  | 'tooMany'
  | 'invalidEmail'
  | 'invalidUrl'
  | 'invalidDate'
  | 'dateOrder'
  | 'invalidColor'
  | 'invalidUsername'
  | 'duplicate'
  | 'invalidType';

/** `path` names the field, e.g. "experiences.1.endDate" or "jobTitle.fr". */
export interface Issue {
  path: string;
  code: IssueCode;
}

export type ProfileValidation = { ok: true; profile: Profile } | { ok: false; issues: Issue[] };

export const PROFILE_LIMITS = {
  short: 80,
  status: 120,
  text: 600,
  phone: 30,
  skillName: 40,
  skills: 60,
  experiences: 30,
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COLOR = /^#[0-9a-fA-F]{6}$/;
const GITHUB_USER = /^[A-Za-z0-9-]{1,39}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// A real calendar day: "2023-02-30" matches the pattern but is not one.
const isDate = (v: string) =>
  DATE.test(v) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v);

const isHttpsUrl = (v: string) => {
  try {
    return new URL(v).protocol === 'https:';
  } catch {
    return false;
  }
};

export function validateProfile(input: unknown): ProfileValidation {
  const issues: Issue[] = [];
  const fail = (path: string, code: IssueCode) => issues.push({ path, code });

  const text = (value: unknown, path: string, max: number, required = true): string => {
    if (typeof value !== 'string') {
      if (required || value !== undefined)
        fail(path, value === undefined ? 'required' : 'invalidType');
      return '';
    }
    const trimmed = value.trim();
    if (required && !trimmed) fail(path, 'required');
    else if (trimmed.length > max) fail(path, 'tooLong');
    return trimmed;
  };

  const localized = (value: unknown, path: string, max: number): Localized => {
    if (!isObject(value)) {
      fail(path, value === undefined ? 'required' : 'invalidType');
      return { en: '', fr: '' };
    }
    return { en: text(value.en, `${path}.en`, max), fr: text(value.fr, `${path}.fr`, max) };
  };

  // Optional bilingual text: absent, or both languages filled.
  const optionalLocalized = (value: unknown, path: string, max: number): Localized | undefined => {
    if (value === undefined) return undefined;
    const result = localized(value, path, max);
    return result.en || result.fr ? result : undefined;
  };

  if (!isObject(input)) return { ok: false, issues: [{ path: '', code: 'invalidType' }] };
  const p = input;

  const name = text(p.name, 'name', PROFILE_LIMITS.short);
  const jobTitle = localized(p.jobTitle, 'jobTitle', PROFILE_LIMITS.short);
  const description = localized(p.description, 'description', PROFILE_LIMITS.text);
  const location = localized(p.location, 'location', PROFILE_LIMITS.short);
  const status = optionalLocalized(p.status, 'status', PROFILE_LIMITS.status);

  const email = text(p.email, 'email', PROFILE_LIMITS.short);
  if (email && !EMAIL.test(email)) fail('email', 'invalidEmail');
  const phone = text(p.phone, 'phone', PROFILE_LIMITS.phone);

  const socials = isObject(p.socials) ? p.socials : {};
  const linkedin = text(socials.linkedin, 'socials.linkedin', 200);
  if (linkedin && !isHttpsUrl(linkedin)) fail('socials.linkedin', 'invalidUrl');
  const github = text(socials.github, 'socials.github', 39);
  if (github && !GITHUB_USER.test(github)) fail('socials.github', 'invalidUsername');

  const theme = isObject(p.theme) ? p.theme : {};
  const primary = text(theme.primary, 'theme.primary', 7);
  if (primary && !COLOR.test(primary)) fail('theme.primary', 'invalidColor');
  const accent = text(theme.accent, 'theme.accent', 7);
  if (accent && !COLOR.test(accent)) fail('theme.accent', 'invalidColor');

  const skills: Skill[] = [];
  if (!Array.isArray(p.skills)) fail('skills', 'invalidType');
  else {
    if (p.skills.length > PROFILE_LIMITS.skills) fail('skills', 'tooMany');
    const seen = new Set<string>();
    p.skills.forEach((raw: unknown, i) => {
      const skill = isObject(raw) ? raw : {};
      const skillName = text(skill.name, `skills.${i}.name`, PROFILE_LIMITS.skillName);
      if (skillName && seen.has(skillName.toLowerCase())) fail(`skills.${i}.name`, 'duplicate');
      seen.add(skillName.toLowerCase());
      const icon = text(skill.icon, `skills.${i}.icon`, 300, false);
      if (icon && !isHttpsUrl(icon)) fail(`skills.${i}.icon`, 'invalidUrl');
      skills.push(icon ? { name: skillName, icon } : { name: skillName });
    });
  }

  const experiences: Experience[] = [];
  if (!Array.isArray(p.experiences)) fail('experiences', 'invalidType');
  else {
    if (p.experiences.length > PROFILE_LIMITS.experiences) fail('experiences', 'tooMany');
    p.experiences.forEach((raw: unknown, i) => {
      const e = isObject(raw) ? raw : {};
      const at = `experiences.${i}`;
      const startDate = text(e.startDate, `${at}.startDate`, 10);
      if (startDate && !isDate(startDate)) fail(`${at}.startDate`, 'invalidDate');
      let endDate: string | null = null;
      if (e.endDate !== null && e.endDate !== '' && e.endDate !== undefined) {
        endDate = text(e.endDate, `${at}.endDate`, 10);
        if (!isDate(endDate)) fail(`${at}.endDate`, 'invalidDate');
        else if (isDate(startDate) && endDate < startDate) fail(`${at}.endDate`, 'dateOrder');
      }
      const experience: Experience = {
        company: text(e.company, `${at}.company`, PROFILE_LIMITS.short),
        position: localized(e.position, `${at}.position`, PROFILE_LIMITS.short),
        startDate,
        endDate,
      };
      const expDescription = optionalLocalized(
        e.description,
        `${at}.description`,
        PROFILE_LIMITS.text,
      );
      if (expDescription) experience.description = expDescription;
      experiences.push(experience);
    });
  }

  if (issues.length) return { ok: false, issues };

  // Key order matches profile.json, so a commit diff only shows what changed.
  const profile: Profile = {
    name,
    jobTitle,
    description,
    location,
    ...(status ? { status } : {}),
    email,
    phone,
    theme: { primary, accent },
    socials: { linkedin, github },
    skills,
    experiences,
  };
  return { ok: true, profile };
}
