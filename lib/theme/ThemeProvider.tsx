import * as React from 'react';
import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, ThemeColors, ThemeName } from './colors';

type ThemeContextValue = {
  theme: ThemeName; // 'light' | 'dark' | 'system'
  setTheme: (v: ThemeName) => void;
  colors: ThemeColors;
  isDark: boolean;
};

const STORAGE_KEY = 'app.theme.preference.v1';

export const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

function resolveColorScheme(preference: ThemeName, system: ColorSchemeName) {
  if (preference === 'system') return system ?? 'light';
  return preference;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [theme, setThemeState] = React.useState<ThemeName>('system');
  const colorScheme = resolveColorScheme(theme, system);
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeState(stored);
      }
    })();
  }, []);

  const setTheme = React.useCallback((v: ThemeName) => {
    setThemeState(v);
    void AsyncStorage.setItem(STORAGE_KEY, v);
  }, []);

  const value = React.useMemo(
    () => ({ theme, setTheme, colors, isDark }),
    [theme, setTheme, colors, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}


