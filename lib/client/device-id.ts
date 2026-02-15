const DEVICE_ID_KEY = "rf_client_device_id";

function createDeviceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rf-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getOrCreateClientDeviceId(): string {
  if (typeof window === "undefined") return "server";

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY);
    if (existing && existing.length >= 8) {
      return existing;
    }

    const next = createDeviceId();
    window.localStorage.setItem(DEVICE_ID_KEY, next);
    return next;
  } catch {
    return createDeviceId();
  }
}
