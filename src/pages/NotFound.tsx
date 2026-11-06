import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold tracking-widest text-primary">404</p>
      <h1 className="text-2xl font-bold">{t('notFound.title')}</h1>
      <p className="max-w-sm text-body text-muted-foreground">{t('notFound.text')}</p>
      <Link
        to="/"
        className="rounded-md bg-primary px-4 py-2 text-body font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        {t('notFound.back')}
      </Link>
    </div>
  );
};

export default NotFound;
