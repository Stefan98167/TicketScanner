import { Stack } from "expo-router";
import 'react-native-url-polyfill/auto';
import { ThemeProvider } from "../lib/theme/ThemeProvider";
import { I18nProvider } from "../lib/i18n/I18nProvider";

export default function RootLayout() {
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
