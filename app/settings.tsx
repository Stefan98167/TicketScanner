import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useTheme } from "../lib/theme/ThemeProvider";
import { useI18n } from "../lib/i18n/I18nProvider";
import { supabase } from "../supabase";

export default function SettingsScreen() {
  const { theme, setTheme, colors, isDark } = useTheme();
  const { lang, setLang, t } = useI18n();
  const goBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar style="dark" />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>{t('common.back')}</Text>
        </TouchableOpacity>
        
        <Text style={[styles.icon, { color: colors.text }]}>⚙️</Text>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.appearance')}</Text>
          <View style={styles.row}>
            <ThemeOption label={t('settings.theme.system')} active={theme === 'system'} onPress={() => setTheme('system')} colors={{ text: colors.text, border: colors.border, primary: colors.primary }} />
            <ThemeOption label={t('settings.theme.light')} active={theme === 'light'} onPress={() => setTheme('light')} colors={{ text: colors.text, border: colors.border, primary: colors.primary }} />
            <ThemeOption label={t('settings.theme.dark')} active={theme === 'dark'} onPress={() => setTheme('dark')} colors={{ text: colors.text, border: colors.border, primary: colors.primary }} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.language')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.langRow}
          >
            <LangOption flag="🇩🇪" label={t('settings.language.de')} active={lang === 'de'} onPress={() => setLang('de')} colors={{ text: colors.text, border: colors.border, primary: colors.primary }} />
            <LangOption flag="🇬🇧" label={t('settings.language.en')} active={lang === 'en'} onPress={() => setLang('en')} colors={{ text: colors.text, border: colors.border, primary: colors.primary }} />
            <LangOption flag="🇷🇸" label={t('settings.language.sr')} active={lang === 'sr'} onPress={() => setLang('sr')} colors={{ text: colors.text, border: colors.border, primary: colors.primary }} />
          </ScrollView>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.account') || 'Account'}</Text>
          <TouchableOpacity onPress={handleLogout} style={[styles.themeOption, { borderColor: colors.error, backgroundColor: 'transparent' }]}> 
            <Text style={{ color: colors.error, fontWeight: '700' }}>{t('auth.logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ThemeOption({ label, active, onPress, colors }: { label: string; active: boolean; onPress: () => void; colors: { text: string; border: string; primary: string } }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.themeOption, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? 'rgba(59,130,246,0.08)' : 'transparent' }]}> 
      <Text style={{ color: active ? colors.primary : colors.text, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}

function LangOption({ label, flag, active, onPress, colors }: { label: string; flag: string; active: boolean; onPress: () => void; colors: { text: string; border: string; primary: string } }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.langOption, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? 'rgba(59,130,246,0.08)' : 'transparent' }]}> 
      <Text style={{ fontSize: 18, marginRight: 8 }}>{flag}</Text>
      <Text style={{ color: active ? colors.primary : colors.text, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 0,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  langRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  themeOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  langOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
