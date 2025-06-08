import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import user from '@/config/user.json';

// Skills card component
const SkillsCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-[#2B2D31] p-3 sm:p-4 rounded-xl shadow-xl w-full border border-gray-200 dark:border-[#1E1F22]/50 animate__animated animate__fadeInLeft mt-2 sm:mt-3">
      <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
        <span className="text-[#5865F2] text-sm sm:text-base">💻</span>
        <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
          {t('bio.skills')}
        </h3>
      </div>
      <div className="flex flex-wrap gap-1 sm:gap-1.5 max-h-[150px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-[#4E5058] [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-[#2E3035]">
        {user.skills.map((skill, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-[#2F3136] dark:hover:bg-[#36393F] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-gray-700 dark:text-[#B5BAC1] transition-colors cursor-default text-[10px] sm:text-xs"
            title={skill.name}
          >
            {skill.icon && (
              <img src={skill.icon} alt={skill.name} className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span className="truncate max-w-[80px] sm:max-w-full">{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Contact card component
const ContactCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-[#2B2D31] p-3 sm:p-4 rounded-xl shadow-xl w-full border border-gray-200 dark:border-[#1E1F22]/50 animate__animated animate__fadeInLeft mt-2 sm:mt-3">
      <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
        <span className="text-[#5865F2] text-sm sm:text-base">📩</span>
        <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
          {t('header.navigation.contact')}
        </h3>
      </div>
      <Link
        to="/contact"
        className="block w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-1.5 sm:py-2 px-2 sm:px-3 rounded-md text-center transition-colors text-[10px] sm:text-xs"
      >
        {t('header.navigation.contact')}
      </Link>
    </div>
  );
};

const PersonalCard: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = React.useMemo(() => i18n.language, [i18n.language]);

  return (
    <div className="flex flex-col justify-between gap-2 sm:gap-3 h-full w-[40%]">
      <div className="bg-white dark:bg-[#2B2D31] p-3 sm:p-4 rounded-xl shadow-xl w-full border border-gray-200 dark:border-[#1E1F22]/50 animate__animated animate__fadeInLeft overflow-y-auto min-h-[300px] sm:min-h-[200px] sm:min-w-32 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-[#4E5058] [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-[#2E3035]">
        <div className="flex gap-2 sm:gap-3 items-start mb-3 sm:mb-4">
          <div className="relative flex-shrink-0">
            <img
              src="/icon.png"
              alt="Profile"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-[#5865F2]"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-[#23A559] rounded-full border-2 sm:border-3 border-white dark:border-[#2B2D31]" />
          </div>
          <div className="flex flex-col items-start justify-center">
            <h2 className="text-left text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate max-w-[180px] sm:max-w-full">
              {user.name}
            </h2>
            <p className="text-gray-600 dark:text-[#B5BAC1] text-xs sm:text-sm truncate">
              {user.jobTitle[currentLanguage as keyof typeof user.jobTitle]}
            </p>
          </div>
        </div>
        <div className="space-y-1.5 sm:space-y-2 text-gray-600 dark:text-[#B5BAC1] text-[10px] sm:text-xs">
          <p className="flex items-center gap-1 sm:gap-1.5">
            <span className="opacity-70 flex-shrink-0">📍</span>
            <span className="truncate">
              {user.location[currentLanguage as keyof typeof user.location]}
            </span>
          </p>
          <p className="flex items-center gap-1 sm:gap-1.5">
            <span className="opacity-70 flex-shrink-0">📞</span>
            <span className="truncate">{user.phone}</span>
          </p>
          <p className="flex items-center gap-1 sm:gap-1.5">
            <span className="opacity-70 flex-shrink-0">📧</span>
            <span className="truncate">{user.email}</span>
          </p>
          <a className="flex items-center gap-1 sm:gap-1.5" href={user.socials.linkedin}>
            <span className="opacity-70 flex-shrink-0">🔗</span>
            <span className="truncate">LinkedIn</span>
          </a>
          <div className="h-px bg-gray-200 dark:bg-[#1E1F22] my-2 sm:my-3" />
          <p className="text-[10px] sm:text-xs text-left line-clamp-4 sm:line-clamp-none">
            {user.description[currentLanguage as keyof typeof user.description]}
          </p>
        </div>
      </div>

      <SkillsCard />
      <ContactCard />
    </div>
  );
};

export default PersonalCard;
