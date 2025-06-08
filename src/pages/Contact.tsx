import React, { useEffect, useState } from 'react';
import { DiscordUser } from '@/types/user.ts';
import { toast } from 'sonner';
import { Badge, Input } from '@/components';
import { Send, User, AtSign, Phone, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Discord Profile Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#36393F] rounded-xl shadow-xl mb-4 overflow-hidden border border-gray-200 dark:border-[#202225]">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-[#5865F2] to-[#7289DA]">
          {user?.banner && (
            <img
              src={`https://cdn.discordapp.com/banners/${user.id}/${user.banner}?size=480`}
              alt="Discord Banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Info - Using a different approach with relative/absolute positioning */}
        <div className="relative px-4 pb-4 pt-2">
          {/* Avatar */}
          <div className="absolute -top-12 left-4">
            {user?.avatar ? (
              <div className="relative">
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=80`}
                  alt="Discord Avatar"
                  className="rounded-full w-20 h-20 border-4 border-white dark:border-[#36393F] shadow-md"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#23A559] rounded-full border-2 border-white dark:border-[#36393F]"></div>
              </div>
            ) : (
              <div className="rounded-full w-20 h-20 bg-gray-200 dark:bg-[#2F3136] flex items-center justify-center border-4 border-white dark:border-[#36393F] shadow-md">
                <User className="w-10 h-10 text-gray-400 dark:text-[#B9BBBE]" />
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="ml-28">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">
                  {user?.globalName || user?.username}
                </h2>
                <div className="flex items-center gap-1.5">
                  {user?.username && user?.globalName && (
                    <p className="text-sm text-gray-500 dark:text-[#B9BBBE]">@{user.username}</p>
                  )}
                  {user?.badge?.tag && (
                    <span className="px-1.5 py-0.5 bg-[#5865F2]/10 text-[#5865F2] rounded text-[10px] font-medium">
                      {user.badge.tag}
                    </span>
                  )}
                </div>
              </div>

              {user?.badge?.id && user?.badge?.guildId && (
                <Badge variant="outline">
                  <img
                    src={`https://cdn.discordapp.com/clan-badges/${user.badge.guildId}/${user.badge.id}?size=16`}
                    alt="Badge icon"
                    className="w-4 h-4 mr-1"
                  />
                  {user.badge.tag}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="w-full max-w-md bg-white dark:bg-[#36393F] rounded-xl shadow-xl p-5 border border-gray-200 dark:border-[#202225]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          {t('contact.title')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-[#B9BBBE] block flex items-center gap-1.5">
              <User className="h-3 w-3 text-[#5865F2]" />
              {t('contact.form.name.label')}
            </label>
            <Input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder={t('contact.form.name.placeholder')}
              className={`w-full bg-gray-100 dark:bg-[#2F3136] text-gray-900 dark:text-white border border-gray-300 dark:border-[#202225] rounded-md text-sm focus:ring-[#5865F2] focus:border-[#5865F2] dark:focus:ring-[#5865F2] dark:focus:border-[#5865F2] ${user ? 'opacity-70' : ''}`}
              required
              readOnly={!!user}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-[#B9BBBE] block flex items-center gap-1.5">
              <AtSign className="h-3 w-3 text-[#5865F2]" />
              {t('contact.form.email.label')}
            </label>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder={t('contact.form.email.placeholder')}
              className="w-full bg-gray-100 dark:bg-[#2F3136] text-gray-900 dark:text-white border border-gray-300 dark:border-[#202225] rounded-md text-sm focus:ring-[#5865F2] focus:border-[#5865F2] dark:focus:ring-[#5865F2] dark:focus:border-[#5865F2]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-[#B9BBBE] block flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-[#5865F2]" />
              {t('contact.form.phone.label')}
            </label>
            <Input
              type="tel"
              name="phone"
              value={contactPhone}
              onChange={handleChange}
              placeholder={t('contact.form.phone.placeholder')}
              className="w-full bg-gray-100 dark:bg-[#2F3136] text-gray-900 dark:text-white border border-gray-300 dark:border-[#202225] rounded-md text-sm focus:ring-[#5865F2] focus:border-[#5865F2] dark:focus:ring-[#5865F2] dark:focus:border-[#5865F2]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-[#B9BBBE] block flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3 text-[#5865F2]" />
              {t('contact.form.message.label')}
            </label>
            <textarea
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('contact.form.message.placeholder')}
              className="w-full bg-gray-100 dark:bg-[#2F3136] text-gray-900 dark:text-white border border-gray-300 dark:border-[#202225] rounded-md text-sm focus:ring-[#5865F2] focus:border-[#5865F2] dark:focus:ring-[#5865F2] dark:focus:border-[#5865F2] p-2 min-h-[100px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-[#4E5058] [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-[#2E3035]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full flex justify-center items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 mt-6 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <Send className="h-4 w-4 animate-spin" />
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
  );
};

export default Contact;
