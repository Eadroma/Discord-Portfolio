export interface ContactInput {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Discord rejects webhook content over 2000 chars; these keep the formatted message under it.
export const CONTACT_LIMITS = { name: 100, email: 200, phone: 40, message: 1500 } as const;

export type ContactError =
  | 'missingName'
  | 'missingContact'
  | 'missingMessage'
  | 'invalidEmail'
  | 'tooLong';

export function validateContact(input: ContactInput): ContactError | null {
  if (!input.name.trim()) return 'missingName';
  if (!input.email.trim() && !input.phone.trim()) return 'missingContact';
  if (!input.message.trim()) return 'missingMessage';
  if (input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
    return 'invalidEmail';
  for (const key of Object.keys(CONTACT_LIMITS) as (keyof ContactInput)[]) {
    if (input[key].length > CONTACT_LIMITS[key]) return 'tooLong';
  }
  return null;
}
