export type HapticKind = "selection" | "impact" | "success";

export function isAppleTouchDevice() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  if (/iPhone|iPod|iPad/.test(ua)) return true;

  const nav = navigator as Navigator & { platform?: string };
  return nav.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export function haptic(kind: HapticKind = "selection") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }

  const pattern: number | number[] =
    kind === "success" ? [12, 36, 16] : kind === "impact" ? 15 : 8;

  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers expose vibrate and still reject the call.
  }
}
