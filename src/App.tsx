import React, { lazy, Suspense } from 'react';
import { Navbar, ThemeProvider } from '@/components';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home.tsx';
import DiscordAuthCallback from '@/pages/DiscordAuthCallback';
import Contact from '@/pages/Contact.tsx';
import NotFound from '@/pages/NotFound.tsx';
import { Toaster } from 'sonner';
import { useTheme } from '@/components/theme-context';

// Loaded on demand: visitors never download the admin code.
const Admin = lazy(() => import('@/pages/Admin.tsx'));

// Sonner keeps its own theme; this keeps its toasts in step with the site's.
const ThemedToaster: React.FC = () => {
  const { theme } = useTheme();
  return <Toaster richColors position="top-right" theme={theme} />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ThemedToaster />
      <BrowserRouter>
        <div className="min-h-dvh bg-background text-foreground">
          <Navbar />
          <main className="pb-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/discord/callback" element={<DiscordAuthCallback />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/admin"
                element={
                  <Suspense fallback={null}>
                    <Admin />
                  </Suspense>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
