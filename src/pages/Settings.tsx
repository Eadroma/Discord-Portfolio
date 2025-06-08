// src/pages/Settings.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components';
import { DiscordUser } from '@/types/user.ts';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<DiscordUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('discordUser');

    if (!storedUser) {
      navigate('/unauthorized');
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  return (
    <div className="min-h-[130vh] flex justify-center">
      <div className="text-center p-8 w-[130%]">
        {user === null && <h2 className="text-4xl font-bold mb-6">Authenticating...</h2>}
        {user && (
          <div className="flex flex-col items-center">
            <div className="w-[50%] flex flex-col items-center mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden self-center">
              {user.banner && (
                <div className="w-full h-48">
                  <img
                    src={`https://cdn.discordapp.com/banners/${user.id}/${user.banner}?size=480`}
                    alt="Discord Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-start justify-start gap-8 p-8 w-full">
                <div className="relative">
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=80`}
                    alt="Discord Avatar"
                    className="rounded-full w-48 h-48 border-[8px] border-white dark:border-gray-900"
                  />
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-green-500 rounded-full border-4 border-white dark:border-gray-900"></div>
                </div>
                <div className="flex flex-col items-start">
                  <h2 className="text-4xl font-bold">{user.globalName}</h2>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-500 dark:text-gray-400">{user.username}</div>
                    <Badge variant="outline" className="mt-2">
                      <img
                        src={`https://cdn.discordapp.com/clan-badges/${user.badge.guildId}/${user.badge.id}?size=16`}
                        alt="Badge icon"
                        className="w-4 h-4 mr-1 inline-block"
                      />
                      {user.badge.tag}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              You have successfully logged in with Discord.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
