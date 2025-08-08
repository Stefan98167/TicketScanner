import * as React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../supabase";
import { logScanEvent } from "../lib/logging";
import { useTheme } from "../lib/theme/ThemeProvider";
import { useI18n } from "../lib/i18n/I18nProvider";

export default function TicketResultScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const params = useLocalSearchParams();
  const [message, setMessage] = React.useState("");
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
      }
    })();
  }, []);
  
  const ticketCode = params.ticketCode as string;
  const isValid = params.isValid === "true";
  const isDevalued = params.devalued === "true";
  const scannedAt = params.scannedAt as string;
  const errorMessage = params.message as string;
  const justDevalued = params.justDevalued === "true";

  const handleDevalue = async () => {
    if (!ticketCode || processing) return;
    setProcessing(true);
    setMessage(t('result.devaluing'));
    
    const timestamp = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ devalued: true, scanned_at: timestamp })
      .eq("id", ticketCode);
      
    setProcessing(false);
    if (updateError) {
      await logScanEvent({
        action: "devalue",
        ticketCode,
        isValid: true,
        wasDevalued: false,
        success: false,
        message: updateError.message,
      });
      setMessage(t('result.devalue_error'));
    } else {
      await logScanEvent({
        action: "devalue",
        ticketCode,
        isValid: true,
        wasDevalued: true,
        success: true,
      });
      setMessage(t('result.devalue_success'));
      // Update the URL params to reflect the new state
      router.replace({
        pathname: "./ticket-result" as any,
        params: { 
          ticketCode, 
          isValid: "true",
          devalued: "true",
          scannedAt: timestamp,
          justDevalued: "true",
        }
      });
    }
  };

  const scanAnother = () => {
    router.replace("./scan" as any);
  };

  const goHome = () => {
    router.replace("./" as any);
  };

  if (!isValid) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar style="light" />
        <View style={styles.content}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.title}>Ungültiges Ticket</Text>
          <Text style={styles.ticketCode}>Code: {ticketCode}</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={scanAnother}>
              <Text style={styles.buttonText}>Weiteres Scannen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={goHome}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Zur Startseite</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const containerStyle = justDevalued
    ? styles.devaluedNowContainer
    : isDevalued
    ? styles.usedContainer
    : styles.validContainer;

  return (
    <View style={[styles.container, containerStyle]}> 
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.statusIcon}>{justDevalued ? "✅" : isDevalued ? "🔒" : "✅"}</Text>
        <Text style={[styles.title, { color: '#fff' }]}>
          {justDevalued
            ? t('result.title_devalued_now')
            : isDevalued
            ? t('result.title_used')
            : t('result.title_valid')}
        </Text>
        <Text style={styles.ticketCode}>{t('result.code_label')} {ticketCode}</Text>
        
        {isDevalued ? (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {justDevalued ? t('result.devalued_now_at') : t('result.already_devalued_at')}
            </Text>
            <Text style={styles.timestampText}>
              {new Date(scannedAt).toLocaleString('de-DE')}
            </Text>
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>{t('result.valid_ready')}</Text>
          </View>
        )}

        {message ? (
          <Text style={[styles.message, processing ? styles.processingMessage : styles.successMessage]}>
            {message}
          </Text>
        ) : null}

        <View style={styles.buttonContainer}>
          {!isDevalued && !processing ? (
            <TouchableOpacity 
              style={[styles.primaryButton, styles.devalueButton]} 
              onPress={handleDevalue}
            >
              <Text style={styles.buttonText}>{t('result.devalue')}</Text>
            </TouchableOpacity>
          ) : null}
          
          <TouchableOpacity style={styles.primaryButton} onPress={scanAnother}>
            <Text style={styles.buttonText}>{t('result.scan_another')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={goHome}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>{t('result.home')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  validContainer: {
    backgroundColor: "#065f46",
  },
  devaluedNowContainer: {
    backgroundColor: "#065f46",
  },
  usedContainer: {
    backgroundColor: "#7c2d12",
  },
  errorContainer: {
    backgroundColor: "#991b1b",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  ticketCode: {
    fontSize: 18,
    color: "#d1d5db",
    fontFamily: "monospace",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 30,
  },
  infoContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: "100%",
  },
  infoText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
  },
  timestampText: {
    fontSize: 14,
    color: "#d1d5db",
    textAlign: "center",
    marginTop: 8,
    fontFamily: "monospace",
  },
  errorMessage: {
    fontSize: 16,
    color: "#fecaca",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  processingMessage: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    color: "#93c5fd",
  },
  successMessage: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    color: "#86efac",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  devalueButton: {
    backgroundColor: "#f59e0b",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  secondaryButtonText: {
    color: "#fff",
  },
});
