// Pure types, no JSON import: api/ (compiled for Node by Vercel) imports them too.

export interface Localized {
  en: string;
  fr: string;
}

export interface Experience {
  company: string;
  position: Localized;
  /** YYYY-MM-DD, read as UTC by src/lib/dates.ts */
  startDate: string;
  /** null while the job is current */
  endDate: string | null;
  description?: Localized;
}

export interface Skill {
  name: string;
  /** https URL of a small logo */
  icon?: string;
}

export interface Profile {
  name: string;
  jobTitle: Localized;
  description: Localized;
  location: Localized;
  /** Availability line under the name, like a Discord custom status. */
  status?: Localized;
  email: string;
  phone: string;
  /** `github` is a username, used for the repos panel. */
  socials: { linkedin: string; github: string };
  /** Profile banner gradient, as #RRGGBB colors. */
  theme: { primary: string; accent: string };
  skills: Skill[];
  experiences: Experience[];
}
