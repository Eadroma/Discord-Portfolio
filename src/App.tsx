import React from 'react';
import './App.css';
import { Navbar, ThemeProvider } from '@/components';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home.tsx';
import DiscordAuthCallback from '@/pages/DiscordAuthCallback';
import Unauthorized from '@/pages/Unauthorized.tsx';
import Settings from '@/pages/Settings.tsx';
import Contact from '@/pages/Contact.tsx';
import { Toaster } from 'sonner';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <div className="min-h-screen bg-[#F5F5F5] text-black dark:bg-[#232528] dark:text-white">
          <Navbar className="bg-[#E5E7EB] dark:bg-[#1E1F22]" />
          <main className="pb-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/discord/callback" element={<DiscordAuthCallback />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/contact" element={<Contact />} />
              {/* Add more routes as needed */}
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
