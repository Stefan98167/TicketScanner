import { supabase } from "../supabase";
import { ensureDeviceRegistered } from "./device";

export type ScanAction = "check" | "devalue";

type LogParams = {
  action: ScanAction;
  ticketCode: string;
  isValid?: boolean | null;
  wasDevalued?: boolean | null;
  success: boolean;
  message?: string | null;
  extra?: Record<string, unknown> | null;
};

export async function logScanEvent(params: LogParams): Promise<void> {
  try {
    const deviceId = await ensureDeviceRegistered();
    const { error } = await supabase.from("scan_logs").insert({
      device_id: deviceId,
      action: params.action,
      ticket_code: params.ticketCode,
      is_valid: params.isValid ?? null,
      was_devalued: params.wasDevalued ?? null,
      success: params.success,
      message: params.message ?? null,
      meta: params.extra ?? null,
    });
    if (error) {
      // Non-fatal: silently ignore to avoid blocking UI
      // You could add a fallback local log if desired
    }
  } catch {
    // Best-effort; ignore errors
  }
}


