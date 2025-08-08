import { Stack } from "expo-router";
import 'react-native-url-polyfill/auto';
import { ThemeProvider } from "../lib/theme/ThemeProvider";
import { I18nProvider } from "../lib/i18n/I18nProvider";
import { useEffect } from 'react';
import { supabase } from '../supabase';
import { router } from 'expo-router';

export default function RootLayout() {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace('/login');
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <I18nProvider>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </ThemeProvider>
    </I18nProvider>
  );
}
