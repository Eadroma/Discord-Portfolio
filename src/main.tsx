import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import './i18n';
import { profile } from '@/content/profile';

// The profile's own colors (banner gradient), set from profile.json so forks change them without code.
document.documentElement.style.setProperty('--profile-primary', profile.theme.primary);
document.documentElement.style.setProperty('--profile-accent', profile.theme.accent);

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
