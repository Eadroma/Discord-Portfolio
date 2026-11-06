import { describe, expect, it } from 'vitest';
import i18next from 'i18next';
import en from './en.json';
import fr from './fr.json';

const keys = (o: object, p = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v, `${p}${k}.`) : [p + k]));

describe('locales', () => {
  it('have the same keys in English and French', () => {
    expect(keys(fr).sort()).toEqual(keys(en).sort());
  });

  it('pluralize durations per language', async () => {
    const i18n = i18next.createInstance();
    await i18n.init({ resources: { en: { translation: en }, fr: { translation: fr } }, lng: 'en' });
    expect(i18n.t('experience.duration.years', { count: 1 })).toBe('1 year');
    expect(i18n.t('experience.duration.months', { count: 3 })).toBe('3 months');
    await i18n.changeLanguage('fr');
    expect(i18n.t('experience.duration.years', { count: 2 })).toBe('2 ans');
    expect(i18n.t('experience.duration.years', { count: 1 })).toBe('1 an');
  });
});
