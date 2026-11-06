import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import icon from '/icon.png';
import { ModeToggle } from '@/components/mode-toggle';
import DiscordLoginButton from '@/components/loginButton';
import LocaleSwitcher from '@/components/LocaleSwitcher.tsx';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { VITE_DISCORD_CLIENT_ID: clientId, VITE_DISCORD_REDIRECT_URI: redirectUri } = import.meta
    .env;

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 h-14 border-b bg-background px-3 sm:px-4">
        <div className="flex h-full items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center rounded-md">
              <img src={icon} alt={t('header.navigation.home')} className="h-7 w-auto" />
            </Link>
            <Link
              to="/contact"
              className="hidden rounded-md text-body font-semibold text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              {t('header.navigation.contact')}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <LocaleSwitcher />
            {/* Without a client id the login link only leads to a Discord error page. */}
            {clientId && <DiscordLoginButton clientId={clientId} redirectUri={redirectUri} />}
          </div>
        </div>
      </nav>
      <div className="h-14" />
    </>
  );
};

export default Navbar;
