import React, { useEffect, useState } from 'react';
import { DiscordUser } from '@/types/user.ts';
import { toast } from 'sonner';
import { Badge, Input } from '@/components';
import { Send, User, AtSign, Phone, MessageSquare, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import userConfig from '@/config/user.config.json';

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = React.useState<DiscordUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') setName(value);
    else if (name === 'email') setEmail(value);
    else if (name === 'phone') setContactPhone(value);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('discordUser');

    if (!storedUser) {
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Pre-populate name field with Discord username
    if (parsedUser?.globalName) {
      setName(parsedUser.globalName);
    } else if (parsedUser?.username) {
      setName(parsedUser.username);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name && (!email || !contactPhone)) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
      if (!webhookUrl) {
        toast.error('Discord webhook URL not configured');
        return;
      }

      const messageContent = `Name: ${name}\nEmail: ${email}\nPhone: ${contactPhone}\nMessage: ${message}`;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent,
          username: user?.globalName || user?.username || name,
          avatar_url: user?.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
            : undefined,
        }),
      });

      if (!response.ok) {
        toast.error(t('notification.contact.error'));
        return;
      }

      toast.success(t('notification.contact.success'));
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-gray-50 dark:bg-[#313338]">
      <div className="w-full max-w-md mx-auto space-y-6">
        {' '}
        {/* Discord Profile Card */}
        <div className="bg-white dark:bg-[#2B2D31] rounded-lg shadow-lg border border-gray-200 dark:border-[#1E1F22] overflow-hidden">
          {/* Banner */}
          <div className="h-20 bg-gradient-to-r from-[#5865F2] to-[#7289DA] relative">
            {user?.banner && (
              <img
                src={`https://cdn.discordapp.com/banners/${user.id}/${user.banner}?size=480`}
                alt="Discord Banner"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Content */}
          <div className="relative px-4 pb-4">
            {/* Avatar and Name Section - Same line */}
            <div className="flex items-center gap-4 pt-2 mb-3">
              {/* Avatar */}
              <div className="relative -mt-14 flex-shrink-0">
                {user?.avatar ? (
                  <div className="relative">
                    <img
                      src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=128`}
                      alt="Discord Avatar"
                      className="w-20 h-20 rounded-full border-4 border-white dark:border-[#2B2D31] shadow-lg"
                    />
                    {/* Online Status */}
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#23A559] rounded-full border-4 border-white dark:border-[#2B2D31]">
                      <div className="w-full h-full rounded-full bg-[#23A559]"></div>
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-[#36393F] border-4 border-white dark:border-[#2B2D31] shadow-lg flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400 dark:text-[#B5BAC1]" />
                  </div>
                )}
              </div>

              {/* Global Name aligned with avatar */}
              <div className="flex-1 flex min-w-0 flex-col items-start">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">
                  {user?.globalName || userConfig.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600 dark:text-[#B5BAC1]">
                    {user?.username ? `@${user.username}` : '@me'}
                  </p>
                  {user?.badge?.tag && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20 hover:bg-[#5865F2]/20"
                    >
                      {user.badge.id && user.badge.guildId && (
                        <img
                          src={`https://cdn.discordapp.com/clan-badges/${user.badge.guildId}/${user.badge.id}?size=16`}
                          alt="Badge icon"
                          className="w-3 h-3 mr-1"
                        />
                      )}
                      {user.badge.tag}
                    </Badge>
                  )}

                  {/* Default badges for non-Discord users */}
                  {!user && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-[#5865F2] text-white border-[#5865F2] px-2 py-1 rounded"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      フリーマ
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3"></div>
          </div>
        </div>
        {/* Contact Form */}
        <div className="bg-white dark:bg-[#2B2D31] rounded-lg shadow-lg p-6 border border-gray-200 dark:border-[#1E1F22]">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('contact.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-[#B5BAC1]">
              Send me a message and I'll get back to you!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#B5BAC1] mb-2">
                <User className="h-4 w-4 text-[#5865F2]" />
                {t('contact.form.name.label')}
              </label>
              <Input
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder={t('contact.form.name.placeholder')}
                className={`w-full bg-gray-50 dark:bg-[#1E1F22] border-gray-300 dark:border-[#3C3F44] text-gray-900 dark:text-white focus:ring-[#5865F2] focus:border-[#5865F2] ${user ? 'opacity-75' : ''}`}
                required
                readOnly={!!user}
              />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#B5BAC1] mb-2">
                  <AtSign className="h-4 w-4 text-[#5865F2]" />
                  {t('contact.form.email.label')}
                </label>
                <Input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder={t('contact.form.email.placeholder')}
                  className="w-full bg-gray-50 dark:bg-[#1E1F22] border-gray-300 dark:border-[#3C3F44] text-gray-900 dark:text-white focus:ring-[#5865F2] focus:border-[#5865F2]"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#B5BAC1] mb-2">
                  <Phone className="h-4 w-4 text-[#5865F2]" />
                  {t('contact.form.phone.label')}
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={contactPhone}
                  onChange={handleChange}
                  placeholder={t('contact.form.phone.placeholder')}
                  className="w-full bg-gray-50 dark:bg-[#1E1F22] border-gray-300 dark:border-[#3C3F44] text-gray-900 dark:text-white focus:ring-[#5865F2] focus:border-[#5865F2]"
                />
              </div>
            </div>

            {/* Message Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#B5BAC1] mb-2">
                <MessageSquare className="h-4 w-4 text-[#5865F2]" />
                {t('contact.form.message.label')}
              </label>
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('contact.form.message.placeholder')}
                rows={4}
                className="w-full bg-gray-50 dark:bg-[#1E1F22] border border-gray-300 dark:border-[#3C3F44] text-gray-900 dark:text-white rounded-md focus:ring-[#5865F2] focus:border-[#5865F2] p-3 resize-none text-sm placeholder-gray-500 dark:placeholder-[#87898C]"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('contact.form.sending')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t('contact.form.submit')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
