const DEVICE_ID_KEY = "rf_client_device_id";
const DEVICE_ID_TTL_MS = 180 * 24 * 60 * 60 * 1000; // 180 days

interface StoredDeviceId {
  id: string;
  createdAt: number;
}

function createDeviceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rf-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getOrCreateClientDeviceId(): string {
  if (typeof window === "undefined") return "server";

  try {
    const raw = window.localStorage.getItem(DEVICE_ID_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredDeviceId;
        if (
          typeof parsed?.id === "string" &&
          parsed.id.length >= 8 &&
          typeof parsed?.createdAt === "number" &&
          Date.now() - parsed.createdAt <= DEVICE_ID_TTL_MS
        ) {
          return parsed.id;
        }
      } catch {
        // Backward compatibility with previous plain string format.
        if (raw.length >= 8) {
          const migrated: StoredDeviceId = {
            id: raw,
            createdAt: Date.now(),
          };
          window.localStorage.setItem(DEVICE_ID_KEY, JSON.stringify(migrated));
          return raw;
        }
      }
    }

    const next = createDeviceId();
    const value: StoredDeviceId = { id: next, createdAt: Date.now() };
    window.localStorage.setItem(DEVICE_ID_KEY, JSON.stringify(value));
    return next;
  } catch {
    return createDeviceId();
  }
}
