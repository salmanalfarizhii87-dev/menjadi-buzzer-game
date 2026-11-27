/**
 * Repository save: load/save dengan envelope, validasi, migrasi, dan debounce.
 *
 * Kontrak:
 * - `load()` tidak pernah menimpa save yang gagal dibaca.
 * - `saveNow()` menulis segera (dipakai action ekonomi/campaign).
 * - `saveDebounced()` untuk perubahan non-kritis.
 */

import { APP_ID, APP_SCHEMA_VERSION, type GameSave } from '@/state/types';
import { STORAGE_KEYS, readRaw, removeRaw, writeRaw } from './storage-adapter';
import { parseEnvelope, validateSavePayload, type SaveEnvelope, type ValidationIssue } from './save-schema';
import { migratePayload } from './migrations';
import { archiveCorruptSave, backupBeforeMigration } from './backup';

export type LoadOutcome =
  | { ok: true; save: GameSave; migrated: boolean }
  | { ok: false; reason: 'empty' }
  | {
      ok: false;
      reason: 'corrupt' | 'newer' | 'migration_failed';
      issues: ValidationIssue[];
      rawArchived: boolean;
    };

export interface SaveRepositoryOptions {
  now: () => number;
  debounceMs?: number;
  /** Dipanggil saat write gagal (mis. quota penuh), tanpa menimpa save lama. */
  onWriteError?: (code: 'quota' | 'unavailable' | 'failed') => void;
}

export interface SaveRepository {
  load(): LoadOutcome;
  saveNow(save: GameSave): boolean;
  saveDebounced(save: GameSave): void;
  flush(): void;
  clear(): void;
  /** Tulis ulang raw mentah (dipakai pemulihan cadangan). */
  restoreRaw(raw: string): boolean;
  buildEnvelope(save: GameSave): SaveEnvelope;
}

export function createSaveRepository(options: SaveRepositoryOptions): SaveRepository {
  const { now, debounceMs = 300, onWriteError } = options;
  let pendingTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingSave: GameSave | null = null;

  const writeEnvelope = (save: GameSave): boolean => {
    const envelope = buildEnvelopeInternal(save, now());
    const serialized = JSON.stringify(envelope);
    const result = writeRaw(STORAGE_KEYS.save, serialized);
    if (!result.ok) {
      console.error('[menjadi-buzzer] gagal menyimpan save', result.code, result.detail);
      onWriteError?.(result.code === 'not_found' ? 'failed' : result.code);
      return false;
    }
    return true;
  };

  const buildEnvelopeInternal = (save: GameSave, savedAt: number): SaveEnvelope => ({
    appId: APP_ID,
    schemaVersion: APP_SCHEMA_VERSION,
    savedAt,
    payload: save,
  });

  return {
    load(): LoadOutcome {
      const raw = readRaw(STORAGE_KEYS.save);

      if (!raw.ok) {
        if (raw.code === 'not_found') return { ok: false, reason: 'empty' };
        return {
          ok: false,
          reason: 'corrupt',
          issues: [{ path: '$', message: `storage tidak dapat dibaca: ${raw.code}` }],
          rawArchived: false,
        };
      }

      const parsed = parseEnvelope(raw.value);
      if (!parsed.ok) {
        archiveCorruptSave(raw.value, now());
        return {
          ok: false,
          reason: 'corrupt',
          issues: parsed.issues,
          rawArchived: true,
        };
      }

      const { envelope } = parsed;

      if (envelope.schemaVersion > APP_SCHEMA_VERSION) {
        // Jangan menimpa save dari versi lebih baru.
        return {
          ok: false,
          reason: 'newer',
          issues: [
            {
              path: 'schemaVersion',
              message: `save versi ${envelope.schemaVersion} lebih baru dari aplikasi`,
            },
          ],
          rawArchived: false,
        };
      }

      let payload = envelope.payload;

      if (envelope.schemaVersion < APP_SCHEMA_VERSION) {
        backupBeforeMigration(raw.value, now());
        const migrated = migratePayload(payload, envelope.schemaVersion);
        if (!migrated.ok) {
          return {
            ok: false,
            reason: 'migration_failed',
            issues: migrated.issues,
            rawArchived: false,
          };
        }
        payload = migrated.payload;
      }

      const validated = validateSavePayload(payload);
      if (!validated.ok) {
        archiveCorruptSave(raw.value, now());
        return {
          ok: false,
          reason: 'corrupt',
          issues: validated.issues,
          rawArchived: true,
        };
      }

      return {
        ok: true,
        save: validated.save,
        migrated: envelope.schemaVersion < APP_SCHEMA_VERSION,
      };
    },

    saveNow(save: GameSave): boolean {
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
        pendingSave = null;
      }
      return writeEnvelope(save);
    },

    saveDebounced(save: GameSave): void {
      pendingSave = save;
      if (pendingTimer) clearTimeout(pendingTimer);
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        if (pendingSave) {
          writeEnvelope(pendingSave);
          pendingSave = null;
        }
      }, debounceMs);
    },

    flush(): void {
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
      }
      if (pendingSave) {
        writeEnvelope(pendingSave);
        pendingSave = null;
      }
    },

    clear(): void {
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
      }
      pendingSave = null;
      removeRaw(STORAGE_KEYS.save);
    },

    restoreRaw(raw: string): boolean {
      const result = writeRaw(STORAGE_KEYS.save, raw);
      return result.ok;
    },

    buildEnvelope(save: GameSave): SaveEnvelope {
      return buildEnvelopeInternal(save, now());
    },
  };
}
