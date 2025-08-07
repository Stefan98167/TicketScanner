import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoLocalization from 'expo-localization';
import { de, en, sr, Dictionary, LanguageCode } from './dictionary';

type I18nContextValue = {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (key: string) => string;
};

const STORAGE_KEY = 'app.language.v1';
const bundles: Record<LanguageCode, Dictionary> = { de, en, sr };

export const I18nContext = React.createContext<I18nContextValue | undefined>(
  undefined
);

function detectDefaultLanguage(): LanguageCode {
  const locales = ExpoLocalization.getLocales?.() as any;
  const first = locales && locales[0]?.languageCode?.toLowerCase();
  if (first === 'de') return 'de';
  if (first === 'sr') return 'sr';
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<LanguageCode>(detectDefaultLanguage());

  React.useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'de' || saved === 'en') setLangState(saved);
    })();
  }, []);

  const setLang = React.useCallback((l: LanguageCode) => {
    setLangState(l);
    void AsyncStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = React.useCallback(
    (key: string) => {
      const dict = bundles[lang];
      return dict[key] ?? key;
    },
    [lang]
  );

  const value = React.useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}


