import React, { useEffect, useState } from 'react';
import type { DiscordUser } from '@/types/user';
import { toast } from 'sonner';
import { Badge, Input } from '@/components';
import { Send, User, AtSign, Phone, MessageSquare, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { profile } from '@/content/profile';
import { avatarUrl, readDiscordUser } from '@/lib/discord';
import { validateContact } from '@/lib/contact';

const field =
  'w-full border-input bg-secondary text-body placeholder:text-muted-foreground focus-visible:border-ring';
const label = 'mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground';

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const stored = readDiscordUser();
    if (!stored) return;
    setUser(stored);
    setName(stored.globalName ?? stored.username);
  }, []);

  const send = async (form: HTMLFormElement) => {
    const input = { name, email, phone, message };
    const invalid = validateContact(input);
    if (invalid) {
      toast.error(t(`notification.contact.${invalid}`));
      return;
    }

    setSending(true);
    try {
      const website = new FormData(form).get('website');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, website }),
      });

      if (!response.ok) {
        toast.error(t('notification.contact.error'));
        return;
      }

      toast.success(t('notification.contact.success'));
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(t('notification.contact.error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-4 py-6">
      <div className="mx-auto w-full max-w-md space-y-6">
        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="relative h-20 bg-linear-to-br from-profile-primary to-profile-accent">
            {user?.banner && (
              <img
                src={`https://cdn.discordapp.com/banners/${user.id}/${user.banner}?size=480`}
                alt=""
                className="size-full object-cover"
              />
            )}
          </div>

          <div className="flex items-center gap-4 px-4 pt-2 pb-4">
            <div className="relative -mt-12 shrink-0">
              {user ? (
                <>
                  <img
                    src={avatarUrl(user, 128)}
                    alt=""
                    className="size-20 rounded-full border-4 border-card"
                  />
                  <span className="absolute right-1 bottom-1 size-5 rounded-full border-4 border-card bg-online" />
                </>
              ) : (
                <div className="flex size-20 items-center justify-center rounded-full border-4 border-card bg-secondary">
                  <User className="size-10 text-muted-foreground" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-start">
              <h1 className="w-full truncate text-xl leading-tight font-bold">
                {user?.globalName ?? user?.username ?? profile.name}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {user ? `@${user.username}` : '@me'}
                </p>
                {user?.badge?.tag && (
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    {user.badge.id && user.badge.guildId && (
                      <img
                        src={`https://cdn.discordapp.com/clan-badges/${user.badge.guildId}/${user.badge.id}?size=16`}
                        alt=""
                        className="mr-1 size-3"
                      />
                    )}
                    {user.badge.tag}
                  </Badge>
                )}
                {!user && (
                  <Badge className="bg-primary text-primary-foreground">
                    <Zap aria-hidden="true" />
                    フリーマ
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-xl font-bold">{t('contact.title')}</h2>
            <p className="text-body text-muted-foreground">{t('contact.subtitle')}</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(e.currentTarget);
            }}
            className="space-y-4"
          >
            {/* Honeypot: hidden from people and screen readers, bots fill it in */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            <div>
              <label htmlFor="contact-name" className={label}>
                <User className="size-4 text-primary" aria-hidden="true" />
                {t('contact.form.name.label')}
              </label>
              <Input
                id="contact-name"
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('contact.form.name.placeholder')}
                className={`${field} ${user ? 'opacity-75' : ''}`}
                required
                readOnly={!!user}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-email" className={label}>
                  <AtSign className="size-4 text-primary" aria-hidden="true" />
                  {t('contact.form.email.label')}
                </label>
                <Input
                  id="contact-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('contact.form.email.placeholder')}
                  className={field}
                />
              </div>

              <div>
                <label htmlFor="contact-phone" className={label}>
                  <Phone className="size-4 text-primary" aria-hidden="true" />
                  {t('contact.form.phone.label')}
                </label>
                <Input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('contact.form.phone.placeholder')}
                  className={field}
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className={label}>
                <MessageSquare className="size-4 text-primary" aria-hidden="true" />
                {t('contact.form.message.label')}
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('contact.form.message.placeholder')}
                rows={4}
                className={`${field} resize-none rounded-md border p-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-body font-semibold text-primary-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {sending ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t('contact.form.sending')}
                </>
              ) : (
                <>
                  <Send className="size-4" aria-hidden="true" />
                  {t('contact.form.submit')}
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Contact;
