/**
 * Satu-satunya modul yang menyentuh `localStorage`.
 * Semua akses storage di aplikasi harus lewat sini.
 */

export const STORAGE_KEYS = {
  save: 'menjadiBuzzer.save.v1',
  settings: 'menjadiBuzzer.settings.v1',
  backupPrefix: 'menjadiBuzzer.save.backup.',
  corruptPrefix: 'menjadiBuzzer.save.corrupt.',
} as const;

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: 'not_found' | 'unavailable' | 'quota' | 'failed'; detail?: string };

let probedStorage: Storage | null = null;

function getStorage(): Storage | null {
  const storage = globalThis.localStorage;
  if (!storage) return null;

  // Probe sekali per objek storage; probe per akses bisa memakan kuota
  // dan menyamarkan error quota sebagai "unavailable".
  if (probedStorage === storage) return storage;

  try {
    const probeKey = '__mb_probe__';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    probedStorage = storage;
    return storage;
  } catch {
    return null;
  }
}

export function isStorageAvailable(): boolean {
  return getStorage() !== null;
}

export function readRaw(key: string): StorageResult<string> {
  const storage = getStorage();
  if (!storage) return { ok: false, code: 'unavailable' };

  try {
    const value = storage.getItem(key);
    if (value === null) return { ok: false, code: 'not_found' };
    return { ok: true, value };
  } catch (error) {
    return { ok: false, code: 'failed', detail: String(error) };
  }
}

export function writeRaw(key: string, value: string): StorageResult<void> {
  const storage = getStorage();
  if (!storage) return { ok: false, code: 'unavailable' };

  try {
    storage.setItem(key, value);
    return { ok: true, value: undefined };
  } catch (error) {
    const name = error instanceof Error ? error.name : '';
    if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      return { ok: false, code: 'quota', detail: String(error) };
    }
    return { ok: false, code: 'failed', detail: String(error) };
  }
}

export function removeRaw(key: string): StorageResult<void> {
  const storage = getStorage();
  if (!storage) return { ok: false, code: 'unavailable' };

  try {
    storage.removeItem(key);
    return { ok: true, value: undefined };
  } catch (error) {
    return { ok: false, code: 'failed', detail: String(error) };
  }
}

/** Simpan salinan mentah (untuk backup sebelum migrasi atau arsip save rusak). */
export function writeRawArchive(prefix: string, raw: string, now: number): void {
  writeRaw(`${prefix}${now}`, raw);
}

export function listArchiveKeys(prefix: string): string[] {
  const storage = getStorage();
  if (!storage) return [];
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && key.startsWith(prefix)) keys.push(key);
  }
  return keys;
}
