import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Calendar } from 'lucide-react';
import user from '@/config/user.json';

// Define interface for Experience object that matches the structure in user.json
interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description?: {
    en: string;
    fr: string;
  };
}

const ExperienceCard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = React.useMemo(() => i18n.language, [i18n.language]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Format date based on locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  // Calculate duration between dates
  const calculateDuration = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return remainingMonths + " " + (remainingMonths > 1 ? 'months' : 'month');
    } else if (remainingMonths === 0) {
      return years + " " + (years > 1 ? 'years' : 'year');
    } else {
      return years + " " + (years > 1 ? 'years' : 'year') + ", " + remainingMonths + " " + (remainingMonths > 1 ? 'months' : 'month');
    }
  };

  // Sort experiences by date (most recent first)
  const sortedExperiences = [...user.experiences].sort((a, b) => {
    const dateA = a.endDate === null ? new Date() : new Date(a.endDate);
    const dateB = b.endDate === null ? new Date() : new Date(b.endDate);
    return dateB.getTime() - dateA.getTime();
  }) as Experience[];

  return (
    <div className="h-fit bg-white dark:bg-[#2B2D31] border border-gray-200 dark:border-[#1E1F22]/50 shadow-xl rounded-xl animate__animated animate__fadeInUp w-full">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="text-[#5865F2]" size={16} />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('Experience')}
          </h2>
        </div>

        <div className="relative mt-4">
          {/* Horizontal timeline layout */}
          <div className="flex flex-col max-h-[10lvh]">
            {/* Timeline line with adjusted dot positioning */}
            <div className="relative flex w-full mb-4">
              {/* The timeline line */}
              <div className="h-0.5 bg-gray-200 dark:bg-[#404249] absolute top-3 left-0 right-0 z-0"></div>

              {/* Timeline dots with company labels */}
              <div className="flex justify-between relative z-10 w-full">
                {sortedExperiences.map((experience, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center relative"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* The dot - adjusted to be centered on line */}
                    <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-[#2B2D31] transition-all duration-200 ${experience.endDate === null
                      ? 'bg-[#23A559]' // Current position (green dot)
                      : 'bg-[#5865F2]' // Past position (blue dot)
                      } ${hoveredIndex === index ? 'transform scale-125' : ''} relative`}
                      style={{ marginTop: '6px' }}>

                      {/* Hover tooltip positioned over the dot */}
                      {hoveredIndex === index && (
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#313338] p-2 rounded-md shadow-lg border border-gray-200 dark:border-[#1E1F22] z-50 w-48 transition-all duration-200">
                          <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white dark:bg-[#313338] border-b border-r border-gray-200 dark:border-[#1E1F22]"></div>

                          <h3 className="font-semibold text-gray-900 dark:text-white text-xs mb-0.5">{experience.position}</h3>
                          <p className="text-[#5865F2] text-xs font-medium">{experience.company}</p>
                          <div className="h-px bg-gray-200 dark:bg-[#1E1F22] my-1" />
                          {experience.description && (
                            <p className="text-gray-600 dark:text-[#B5BAC1] text-[10px] mt-1">
                              {experience.description[currentLanguage as keyof typeof experience.description]}
                            </p>
                          )}
                          <div className="h-px bg-gray-200 dark:bg-[#1E1F22] my-1" />
                          <div className="mt-1.5 flex justify-center items-center gap-1 text-center text-gray-600 dark:text-[#B5BAC1] text-[10px]">
                            <Calendar size={10} className="flex-shrink-0" />
                            <span>
                              {formatDate(experience.startDate)} — {experience.endDate ? formatDate(experience.endDate) : currentLanguage === 'fr' ? 'Aujourd\'hui' : 'Present'}
                            </span>
                          </div>

                          <p className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5">
                            {calculateDuration(experience.startDate, experience.endDate)}
                          </p>

                        </div>
                      )}
                    </div>

                    {/* Company name and year label */}
                    <div className="flex flex-col items-center mt-1.5">
                      <span className="text-[10px] font-medium text-[#5865F2] whitespace-nowrap truncate max-w-[80px] text-center">
                        {experience.company}
                      </span>
                      <span className="text-[9px] text-gray-600 dark:text-[#B5BAC1] whitespace-nowrap">
                        {new Date(experience.startDate).getFullYear()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;