import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe2 } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="language-switcher">
      {i18n.language === 'en' ? (
        <button
          onClick={() => changeLanguage('fr')}
          className="flex items-center gap-1.5 rounded-md bg-white hover:bg-gray-100 dark:bg-[#2B2D31] dark:hover:bg-[#36393F] text-gray-800 dark:text-[#B5BAC1] border border-gray-200 dark:border-[#1E1F22] transition-colors  h-7 px-2 py-1 text-[10px] sm:text-xs shadow-sm"
          aria-label="Switch to French"
        >
          <Globe2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#5865F2]" />
          <span>FR</span>
        </button>
      ) : (
        <button
          onClick={() => changeLanguage('en')}
          className="flex items-center gap-1.5 rounded-md bg-white hover:bg-gray-100 dark:bg-[#2B2D31] dark:hover:bg-[#36393F] text-gray-800 dark:text-[#B5BAC1] border border-gray-200 dark:border-[#1E1F22] transition-colors h-7 px-2 py-1 text-[10px] sm:text-xs shadow-sm"
          aria-label="Switch to English"
        >
          <Globe2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#5865F2]" />
          <span>EN</span>
        </button>
      )}
    </div>
  );
};

export default LanguageSwitcher;
