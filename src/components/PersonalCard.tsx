import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Code2, Link2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { localize, profile as user } from '@/content/profile';

const sectionTitle =
  'mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase';

const SkillsCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm">
      <h2 className={sectionTitle}>
        <Code2 className="size-4 text-primary" aria-hidden="true" />
        {t('bio.skills')}
      </h2>
      <ul className="flex flex-wrap gap-1.5">
        {user.skills.map((skill) => (
          <li
            key={skill.name}
            className="flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-sm font-medium"
          >
            {skill.icon && (
              // Most logos are dark: a light tile keeps them visible on the dark theme.
              <img
                src={skill.icon}
                alt=""
                className="size-4 shrink-0 dark:rounded-[3px] dark:bg-white/90 dark:p-px"
              />
            )}
            {skill.name}
          </li>
        ))}
      </ul>
    </section>
  );
};

const ContactCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm">
      <h2 className={sectionTitle}>
        <Send className="size-4 text-primary" aria-hidden="true" />
        {t('header.navigation.contact')}
      </h2>
      <Link
        to="/contact"
        className="block rounded-md bg-primary px-4 py-2.5 text-center text-body font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        {t('contact.title')}
      </Link>
    </section>
  );
};

const PersonalCard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage;

  return (
    <div className="flex w-full flex-col gap-3 lg:w-[40%]">
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Gradient from profile.json `theme`, like a Discord profile banner. */}
        <div className="h-24 bg-linear-to-br from-profile-primary to-profile-accent" />
        <div className="flex flex-col gap-4 px-4 pb-5 sm:px-5">
          <div className="relative -mt-10 w-fit">
            <img
              src="/icon.png"
              alt=""
              className="size-20 rounded-full border-[5px] border-card bg-card object-cover"
            />
            <span className="absolute right-0.5 bottom-0.5 size-5 rounded-full border-4 border-card bg-online" />
          </div>

          <div>
            <h1 className="text-2xl leading-tight font-extrabold">{user.name}</h1>
            <p className="text-body text-muted-foreground">{localize(user.jobTitle, language)}</p>
            {user.status && (
              <p className="mt-2 flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1.5 text-sm font-medium">
                <span className="size-2 shrink-0 rounded-full bg-online" aria-hidden="true" />
                {localize(user.status, language)}
              </p>
            )}
          </div>

          <ul className="flex flex-col gap-2 text-body text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {localize(user.location, language)}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <a
                href={`tel:${user.phone.replace(/\s/g, '')}`}
                className="transition-colors hover:text-foreground"
              >
                {user.phone}
              </a>
            </li>
            <li className="flex min-w-0 items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <a
                href={`mailto:${user.email}`}
                className="truncate transition-colors hover:text-foreground"
              >
                {user.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Link2 className="size-4 shrink-0" aria-hidden="true" />
              <a
                href={user.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {t('bio.linkedin')}
              </a>
            </li>
          </ul>

          <div className="h-px bg-border" />
          <p className="text-body">{localize(user.description, language)}</p>
        </div>
      </section>

      <SkillsCard />
      <ContactCard />
    </div>
  );
};

export default PersonalCard;
