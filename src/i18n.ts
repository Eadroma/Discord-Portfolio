import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

// Screen readers pick their voice from <html lang>; languageChanged also fires on init.
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

// Resources are bundled, so there is nothing to wait for.
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, fr: { translation: fr } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    nonExplicitSupportedLngs: true,
    debug: import.meta.env.MODE === 'development',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
