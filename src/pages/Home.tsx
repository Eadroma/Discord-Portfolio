import React from 'react';
import { ExperienceCard, GithubRepo, PersonalCard } from '@/components';

const Home: React.FC = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 md:gap-6">
      <div className="flex w-full flex-col gap-4 lg:flex-row">
        <PersonalCard />
        <GithubRepo />
      </div>
      <div className="w-full">
        <ExperienceCard />
      </div>
    </div>
  );
};

export default Home;
