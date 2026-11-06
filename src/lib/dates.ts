// Profile dates are "YYYY-MM-DD", which JS parses as UTC midnight. Every read here uses UTC,
// otherwise visitors west of UTC see the previous day (and "2020-01-01" shows as 2019).

export function monthsBetween(start: string, end: string | null, now = new Date()): number {
  const a = new Date(start);
  const b = end ? new Date(end) : now;
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
}

export const formatMonthYear = (date: string, locale: string) =>
  new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'short', timeZone: 'UTC' });
