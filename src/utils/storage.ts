const STORAGE_PREFIX = 'taskflow_';

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    console.warn(`Failed to save "${key}" to localStorage`);
  }
}

export function removeStorageItem(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}