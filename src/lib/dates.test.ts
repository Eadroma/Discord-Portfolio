import { describe, expect, it } from 'vitest';
import { formatMonthYear, monthsBetween } from './dates';

describe('dates', () => {
  it('counts whole months between two profile dates', () => {
    expect(monthsBetween('2020-03-01', '2021-02-01')).toBe(11);
    expect(monthsBetween('2021-04-01', '2022-04-01')).toBe(12);
  });

  it('counts up to now for a current job', () => {
    expect(monthsBetween('2022-11-01', null, new Date('2026-10-28'))).toBe(47);
  });

  it('reads dates in UTC so January 1st stays in its own year', () => {
    expect(formatMonthYear('2020-01-01', 'en-US')).toBe('Jan 2020');
  });
});
