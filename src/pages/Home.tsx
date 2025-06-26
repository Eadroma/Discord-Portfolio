// src/pages/Home.tsx
import React from 'react';
import { ExperienceCard, GithubRepo, PersonalCard } from '@/components'; // Adjust the import path as necessary

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-start justify-start gap-4 md:gap-8 lg:gap-16 mx-[2%] sm:mx-[3%] md:mx-[4%] overflow-y-auto mt-2 py-4">
      <div className="flex flex-col lg:flex-row gap-4 w-full lg:h-[60%]">
        <PersonalCard />
        <GithubRepo />
      </div>
      <div className="flex flex-col w-full justify-start">
        <ExperienceCard />
      </div>
    </div>
  );
};

export default Home;
