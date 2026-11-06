import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-context';

export function ModeToggle() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const next = theme === 'light' ? 'dark' : 'light';

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={t(`header.CTA.theme.${next}`)}
      className="size-9"
    >
      {theme === 'light' ? <Moon /> : <Sun />}
    </Button>
  );
}
