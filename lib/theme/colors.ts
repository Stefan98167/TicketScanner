export type ThemeName = 'light' | 'dark' | 'system';

export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
};

export const lightColors: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1f2937',
  mutedText: '#64748b',
  border: '#e2e8f0',
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

export const darkColors: ThemeColors = {
  background: '#0b1220',
  surface: '#101826',
  text: '#e5e7eb',
  mutedText: '#94a3b8',
  border: '#1f2937',
  primary: '#60a5fa',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
};


