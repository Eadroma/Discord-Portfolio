import React from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Calendar } from 'lucide-react';
import { localize, profile as user } from '@/content/profile';
import { formatMonthYear, monthsBetween } from '@/lib/dates';
import { cn } from '@/lib/utils';

// Most recent first. Dates are YYYY-MM-DD, so string order is date order.
const experiences = [...user.experiences].sort((a, b) => b.startDate.localeCompare(a.startDate));

const ExperienceCard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage;
  const formatDate = (date: string) =>
    formatMonthYear(date, language?.startsWith('fr') ? 'fr-FR' : 'en-US');

  const duration = (startDate: string, endDate: string | null) => {
    const months = monthsBetween(startDate, endDate);
    const years = t('experience.duration.years', { count: Math.floor(months / 12) });
    const rest = t('experience.duration.months', { count: months % 12 });
    if (months < 12) return rest;
    if (months % 12 === 0) return years;
    return t('experience.duration.yearsAndMonths', { years, months: rest });
  };

  return (
    <section className="w-full rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
        <Briefcase className="size-4 text-primary" aria-hidden="true" />
        {t('experience.title')}
      </h2>

      <ol>
        {experiences.map((experience, index) => (
          <li
            key={`${experience.company}-${experience.startDate}`}
            className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3"
          >
            <span className="flex flex-col items-center" aria-hidden="true">
              <span
                className={cn(
                  'mt-1.5 size-3 shrink-0 rounded-full',
                  experience.endDate === null ? 'bg-online' : 'bg-primary',
                )}
              />
              {index < experiences.length - 1 && <span className="w-0.5 flex-1 bg-border" />}
            </span>

            <div className="flex flex-col gap-1 pb-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h3 className="text-base font-bold">{experience.company}</h3>
                <span className="text-body text-muted-foreground">
                  {localize(experience.position, language)}
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground tabular-nums">
                <Calendar className="size-3.5" aria-hidden="true" />
                {formatDate(experience.startDate)} —{' '}
                {experience.endDate ? formatDate(experience.endDate) : t('experience.present')}
                <span aria-hidden="true">·</span>
                {duration(experience.startDate, experience.endDate)}
              </p>
              {experience.description && (
                <p className="max-w-prose text-body text-muted-foreground">
                  {localize(experience.description, language)}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default ExperienceCard;
