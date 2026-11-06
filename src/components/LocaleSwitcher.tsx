import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const next = i18n.resolvedLanguage === 'fr' ? 'en' : 'fr';

  return (
    <Button
      variant="secondary"
      onClick={() => void i18n.changeLanguage(next)}
      aria-label={t('header.CTA.switchLanguage')}
      className="h-9 gap-1.5 px-3 text-sm font-semibold"
    >
      <Globe2 className="text-primary" aria-hidden="true" />
      <span>{next.toUpperCase()}</span>
    </Button>
  );
};

export default LanguageSwitcher;
