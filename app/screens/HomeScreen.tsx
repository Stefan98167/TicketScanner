import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { useI18n } from "../../lib/i18n/I18nProvider";
import { supabase } from "../../supabase";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
      }
    })();
  }, []);

  const handleScanPress = () => {
    router.push("./scan" as any);
  };

  const handleAnalyticsPress = () => {
    router.push("./analytics" as any);
  };

  const handleSettingsPress = () => {
    router.push("./settings" as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <StatusBar style="dark" />
      <Text style={[styles.title, { color: colors.text }]}>{t('home.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>{t('home.subtitle')}</Text>
      
      <View style={styles.panelsContainer}>
        <TouchableOpacity style={[styles.panel, styles.scanPanel, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleScanPress}>
          <Text style={styles.panelIcon}>📱</Text>
          <Text style={[styles.panelTitle, { color: colors.text }]}>{t('home.scan_title')}</Text>
          <Text style={[styles.panelDescription, { color: colors.mutedText }]}>{t('home.scan_desc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.panel, styles.analyticsPanel, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleAnalyticsPress}>
          <Text style={styles.panelIcon}>📊</Text>
          <Text style={[styles.panelTitle, { color: colors.text }]}>{t('home.analytics_title')}</Text>
          <Text style={[styles.panelDescription, { color: colors.mutedText }]}>{t('home.analytics_desc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.panel, styles.settingsPanel, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleSettingsPress}>
          <Text style={styles.panelIcon}>⚙️</Text>
          <Text style={[styles.panelTitle, { color: colors.text }]}>{t('home.settings_title')}</Text>
          <Text style={[styles.panelDescription, { color: colors.mutedText }]}>{t('home.settings_desc')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  panelsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  panel: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    minHeight: 120,
  },
  scanPanel: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  analyticsPanel: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  settingsPanel: {
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  panelIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  panelDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
