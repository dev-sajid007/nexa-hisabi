import * as TauriCore from "@tauri-apps/api/core";

export function isTauri(): boolean {
  return typeof window !== "undefined" && (window as unknown as { __TAURI__?: unknown }).__TAURI__ !== undefined;
}

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) {
    throw new Error("Tauri-not-available");
  }
  try {
    // TauriCore.invoke internally reads window.__TAURI__.invoke — browser এ TypeError হতে পারে
    return await (TauriCore.invoke as (cmd: string, args?: Record<string, unknown>) => Promise<T>)(cmd, args);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    // TypeError: Cannot read properties of undefined (reading 'invoke') → Tauri not running
    if (msg.includes("invoke") || msg.includes("undefined") || msg.includes("Tauri-not-available")) {
      throw new Error("Tauri-not-available");
    }
    throw e;
  }
}
