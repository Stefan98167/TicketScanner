import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Camera, CameraView } from "expo-camera";
import { router } from "expo-router";
import { supabase } from "../supabase";
import { useTheme } from "../lib/theme/ThemeProvider";
import { useI18n } from "../lib/i18n/I18nProvider";

export default function ScanScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [manualCode, setManualCode] = useState("");

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login" as any);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log("Camera permission status:", status);
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    console.log("Barcode scanned with data:", data);
    setScanning(false);
    await processTicketCode(data);
  };

  const processTicketCode = async (code: string) => {
    setMessage(t('scan.checking'));
    console.log("Fetching ticket for code:", code);

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("devalued, scanned_at")
      .eq("id", code)
      .maybeSingle();
    console.log("Fetch result:", { ticket, error });

    if (error || !ticket) {
      router.push({
        pathname: "./ticket-result" as any,
        params: { 
          ticketCode: code, 
          isValid: "false", 
          message: t('invalid_ticket') 
        }
      });
      return;
    }

    router.push({
      pathname: "./ticket-result" as any,
      params: { 
        ticketCode: code, 
        isValid: "true",
        devalued: ticket.devalued.toString(),
        scannedAt: ticket.scanned_at || ""
      }
    });
  };

  const startScanning = () => {
    console.log("Scan button pressed, starting scanning");
    setMessage("");
    setScanning(true);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      Alert.alert(t('scan.error_title'), t('scan.error_enter_code'));
      return;
    }
    await processTicketCode(manualCode.trim());
  };

  const goBack = () => {
    router.replace("./" as any);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('scan.request_permission')}</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('scan.no_camera_access_title')}</Text>
          <Text style={styles.message}>
            {t('scan.no_camera_access_message')}
          </Text>
          <TouchableOpacity style={styles.button} onPress={goBack}>
            <Text style={styles.buttonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {scanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            style={styles.camera}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanInstruction}>{t('scan.instruction')}</Text>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => setScanning(false)}
            >
              <Text style={styles.buttonText}>{t('scan.cancel_scanning')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>{t('scan.page_title')}</Text>
          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : (
            <Text style={styles.subtitle}>{t('scan.instruction')}</Text>
          )}
          
          <TouchableOpacity style={styles.scanButton} onPress={startScanning}>
            <Text style={styles.scanButtonIcon}>📷</Text>
            <Text style={styles.scanButtonText}>{t('scan.start_scanning')}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('common.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.manualInputSection}>
            <Text style={styles.manualInputLabel}>{t('scan.manual_label')}</Text>
            <TextInput
              style={styles.textInput}
              value={manualCode}
              onChangeText={setManualCode}
              placeholder={t('scan.placeholder')}
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]} 
              onPress={handleManualSubmit}
            >
              <Text style={styles.buttonText}>{t('scan.validate_code')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#1e293b" 
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 20, 
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    color: "#f59e0b",
    textAlign: "center",
  },
  scanButton: {
    backgroundColor: "#10b981",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  scanButtonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "700" 
  },
  button: {
    backgroundColor: "#475569",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600",
    textAlign: "center",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: { 
    flex: 1 
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#10b981",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  scanInstruction: {
    color: "#fff",
    fontSize: 16,
    marginTop: 30,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 8,
  },
  cancelButton: {
    marginTop: 30,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#475569",
  },
  dividerText: {
    color: "#cbd5e1",
    fontSize: 14,
    marginHorizontal: 15,
    fontWeight: "500",
  },
  manualInputSection: {
    width: "100%",
    alignItems: "center",
  },
  manualInputLabel: {
    color: "#cbd5e1",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#fff",
    width: "100%",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "monospace",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    minWidth: 150,
  },
});
