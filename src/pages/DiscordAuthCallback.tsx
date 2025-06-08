import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DiscordAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

    if (!accessToken || !tokenType) {
      console.error('No access token or token type found in URL');
      navigate('/');
      return;
    }

    fetch('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${tokenType} ${accessToken}`,
      },
    })
      .then((result) => result.json())
      .then((response) => {
        const { id, avatar, global_name, banner, clan, username } = response;

        localStorage.setItem(
          'discordUser',
          JSON.stringify({
            id,
            avatar,
            globalName: global_name,
            username,
            banner,
            badge: clan && {
              tag: clan.tag,
              id: clan.badge,
              guildId: clan.identity_guild_id,
            },
          }),
        );

        // Dispatch a custom event to notify other components about the auth change
        window.dispatchEvent(new Event('discord-auth-change'));

        // Short delay to ensure event is processed before navigation
        setTimeout(() => {
          navigate('/');
        }, 10);
      })
      .catch((error) => {
        console.error('Authentication error:', error);
        navigate('/');
      });
  }, [navigate]);


  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white dark:bg-[#36393F] rounded-lg shadow-md p-6 max-w-md w-full border border-gray-200 dark:border-[#202225]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-slate-200 dark:bg-[#2F3136] h-16 w-16 mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-[#2F3136] rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-slate-200 dark:bg-[#2F3136] rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default DiscordAuthCallback;
