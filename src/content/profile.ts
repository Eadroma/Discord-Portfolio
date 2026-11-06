import data from './profile.json';
import type { Localized, Profile } from './types';

export type { Experience, Localized, Profile, Skill } from './types';

// Typing the import makes `tsc -b` fail the build when profile.json drifts from Profile.
export const profile: Profile = data;

// i18next can report a region code such as "fr-CA"; content only has en and fr.
export const localize = (text: Localized, language: string | undefined) =>
  language?.startsWith('fr') ? text.fr : text.en;
