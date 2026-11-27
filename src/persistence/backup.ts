/**
 * Backup & arsip save mentah. Dipanggil sebelum migrasi yang mengubah struktur
 * dan saat save tidak dapat diparse — jangan pernah menimpa data valid.
 */

import { STORAGE_KEYS, listArchiveKeys, readRaw, writeRawArchive } from './storage-adapter';

export function backupBeforeMigration(raw: string, now: number): void {
  writeRawArchive(STORAGE_KEYS.backupPrefix, raw, now);
}

export function archiveCorruptSave(raw: string, now: number): void {
  writeRawArchive(STORAGE_KEYS.corruptPrefix, raw, now);
}

export interface ArchivedSave {
  key: string;
  raw: string;
}

export function listBackups(): ArchivedSave[] {
  return listArchiveKeys(STORAGE_KEYS.backupPrefix).flatMap((key) => {
    const result = readRaw(key);
    return result.ok ? [{ key, raw: result.value }] : [];
  });
}

export function listCorruptArchives(): ArchivedSave[] {
  return listArchiveKeys(STORAGE_KEYS.corruptPrefix).flatMap((key) => {
    const result = readRaw(key);
    return result.ok ? [{ key, raw: result.value }] : [];
  });
}
