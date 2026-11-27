/**
 * Hasil operasi domain. Semua action mengembalikan bentuk ini agar UI punya
 * jalur error eksplisit tanpa melempar exception untuk kondisi bisnis normal.
 */

export type ActionErrorCode =
  | 'insufficient_funds'
  | 'max_level'
  | 'locked'
  | 'campaign_not_found'
  | 'campaign_ineligible'
  | 'campaign_already_accepted'
  | 'campaign_already_resolved'
  | 'invalid_transition'
  | 'strategy_missing'
  | 'minigame_already_completed'
  | 'minigame_unknown'
  | 'account_status_blocked'
  | 'invalid_amount'
  | 'save_corrupt'
  | 'save_newer'
  | 'persistence_failed'
  | 'unknown';

export type ActionOk<T> = { ok: true; value: T };
export type ActionErr = { ok: false; code: ActionErrorCode; messageKey: string; detail?: string };
export type ActionResult<T = void> = ActionOk<T> | ActionErr;

export function ok<T>(value: T): ActionOk<T> {
  return { ok: true, value };
}

export function okVoid(): ActionOk<void> {
  return { ok: true, value: undefined };
}

export function err(
  code: ActionErrorCode,
  messageKey: string,
  detail?: string,
): ActionErr {
  return detail === undefined
    ? { ok: false, code, messageKey }
    : { ok: false, code, messageKey, detail };
}

export function isOk<T>(result: ActionResult<T>): result is ActionOk<T> {
  return result.ok;
}

export function isErr<T>(result: ActionResult<T>): result is ActionErr {
  return !result.ok;
}

/** Ambil nilai atau lempar — hanya untuk jalur yang sudah dijamin valid. */
export function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) {
    throw new Error(`ActionResult gagal: ${result.code} (${result.messageKey})`);
  }
  return result.value;
}
