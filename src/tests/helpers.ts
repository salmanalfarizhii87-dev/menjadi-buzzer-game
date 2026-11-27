/**
 * Helper test: storage palsu, clock palsu, dan fixture save.
 */

import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import type { GameSave } from '@/state/types';

/** Implementasi minimal `localStorage` untuk lingkungan node. */
export class MemoryStorage implements Storage {
  private map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  /** Simulasi kuota penuh. */
  failNextWrite = false;

  setItemWithQuotaCheck(key: string, value: string): void {
    if (this.failNextWrite) {
      this.failNextWrite = false;
      const error = new Error('Quota exceeded');
      error.name = 'QuotaExceededError';
      throw error;
    }
    this.map.set(key, value);
  }
}

export function installMemoryStorage(): MemoryStorage {
  const storage = new MemoryStorage();
  // Simpan setItem asli, lalu ganti dengan versi yang bisa gagal.
  const originalSetItem = storage.setItem.bind(storage);
  storage.setItem = (key: string, value: string) => {
    if (storage.failNextWrite) {
      storage.failNextWrite = false;
      const error = new Error('Quota exceeded');
      error.name = 'QuotaExceededError';
      throw error;
    }
    originalSetItem(key, value);
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    writable: true,
    configurable: true,
  });
  return storage;
}

export function uninstallMemoryStorage(): void {
  Object.defineProperty(globalThis, 'localStorage', {
    value: undefined,
    writable: true,
    configurable: true,
  });
}

export function makeSave(overrides: Partial<GameSave> = {}): GameSave {
  const base = createInitialSave(BALANCE, 1_700_000_000_000);
  return { ...base, ...overrides };
}
