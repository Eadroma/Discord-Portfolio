// src/pages/Home.tsx
import React from 'react';
import { ExperienceCard, GithubRepo, PersonalCard } from '@/components'; // Adjust the import path as necessary

const Home: React.FC = () => {
  return (
    <div className="h-screen flex flex-col items-start justify-start gap-16 mx-[4%] max-h-[85%] overflow-y-auto mt-2">
      <div className="flex flex-row gap-4 w-full h-[60%]">
        <PersonalCard />
        <GithubRepo />
      </div>
      <div className="flex flex-row gap-4 w-full justify-start">
        <ExperienceCard />
      </div>
    </div>
  );
};

export default Home;
