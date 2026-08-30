import { invoke as tauriInvoke } from "@tauri-apps/api/core";

// Fallback for browser (vite dev without Tauri) — returns mock or throws gracefully
export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await tauriInvoke<T>(cmd, args);
  } catch (e) {
    // In browser without Tauri, tauriInvoke throws "not allowed" — rethrow for UI to handle
    throw e;
  }
}

export function isTauri(): boolean {
  return (window as unknown as { __TAURI__?: unknown }).__TAURI__ !== undefined;
}
