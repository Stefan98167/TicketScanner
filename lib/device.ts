import * as SecureStore from 'expo-secure-store';
import { supabase } from '../supabase';

const DEVICE_ID_KEY = 'device_id';

function generateDeviceId(): string {
  const rand = Math.random().toString(36).slice(2);
  const ts = Date.now().toString(36);
  return `dev_${ts}_${rand}`;
}

export async function ensureDeviceRegistered(): Promise<string> {
  try {
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateDeviceId();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }

    // Best-effort upsert into devices table
    await supabase.from('devices').upsert({ id: deviceId });

    return deviceId;
  } catch {
    // Fallback: generate ephemeral id if secure storage fails
    return generateDeviceId();
  }
}
