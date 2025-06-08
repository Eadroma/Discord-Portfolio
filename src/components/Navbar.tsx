import React from 'react';
import { cn } from '@/lib/utils';
import icon from '/icon.png';
import { ModeToggle } from '@/components/mode-toggle';
import DiscordLoginButton from '@/components/loginButton';
import { useTranslation } from 'react-i18next';
import LocaleSwitcher from '@/components/LocaleSwitcher.tsx';

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className, ...props }) => {
  const { t } = useTranslation();
  const { VITE_DISCORD_CLIENT_ID, VITE_DISCORD_REDIRECT_URI } = import.meta.env;

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 w-full bg-background border-b z-50',
          'px-4 h-12 flex items-center justify-between',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <a href="/" className="font-semibold text-sm text-foreground flex items-center gap-1.5">
            <img src={icon} alt="Logo" className="h-6 w-auto" />
          </a>
          <div className="hidden md:flex items-center gap-3">
            <a href="/" className="text-xs text-muted-foreground hover:text-foreground">
              {t('header.navigation.home')}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 pr-3">
          <ModeToggle />
          <LocaleSwitcher />
          <DiscordLoginButton
            clientId={VITE_DISCORD_CLIENT_ID}
            redirectUri={VITE_DISCORD_REDIRECT_URI}
          />
        </div>
      </nav>
      <div className="h-12" />
    </>
  );
};

export default Navbar;
