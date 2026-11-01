import { invoke, isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { emit, listen } from "@tauri-apps/api/event";
import type { DesktopPreferences } from "./domain";
export const native = isTauri();
export const call = <T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> => invoke<T>(command, args);
export async function windowAction(action: "minimise" | "maximise" | "close") {
  if (!native) return;
  const w = getCurrentWindow();
  if (action === "minimise") await w.minimize();
  else if (action === "maximise") await w.toggleMaximize();
  else await w.close();
}
export async function applyBackdrop(
  p: DesktopPreferences,
  enabled: boolean,
  opacity: number,
) {
  if (!native) return "Browser preview: page-content blur only";
  return call<string>("set_backdrop", {
    mode: enabled ? p.backdrop : "Opaque",
    tint: p.tint,
    opacity: Math.round(255 * (1 - opacity / 100)),
  });
}
export async function setStartup(enabled: boolean) {
  if (!native)
    throw Error("Startup is available in the Windows application only.");
  const api = await import("@tauri-apps/plugin-autostart");
  await (enabled ? api.enable() : api.disable());
}
export async function nativeNotify(title: string, body: string) {
  if (!native) return;
  const n = await import("@tauri-apps/plugin-notification");
  if (!(await n.isPermissionGranted())) {
    const granted = await n.requestPermission();
    if (granted !== "granted")
      throw Error("Windows notification permission was not granted.");
  }
  n.sendNotification({ title, body });
}
export const broadcast = () =>
  native ? emit("sentinel-state-updated") : Promise.resolve();
export const onStateChange = (fn: () => void) =>
  native ? listen("sentinel-state-updated", fn) : Promise.resolve(() => {});
