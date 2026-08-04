import type { LawRagReference } from 'genai-web';

// 参照時点（as-of）まわりの表示ロジック。UI から切り出した純関数（単体テスト対象）。

/**
 * 施行日プレースホルダの判定しきい値。政令委任等で施行日が定まっていない版には
 * 2117-12-31 のような遠い将来日が入るため、年をそのまま出さずラベルへ置き換える。
 * api 側の出典表記（レポート本文）と同じ規則で、表示の食い違いを避ける。
 */
export const PLACEHOLDER_ENFORCE_YEAR = 2100;

export const ENFORCE_DATE_UNDECIDED = '施行日未定（政令委任等）';

/** ローカル日付を YYYY-MM-DD で返す（日付ピッカーの min と入力検証の基準）。 */
export const todayIso = (): string => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/** 施行日の表示文字列。プレースホルダ年は「施行日未定（政令委任等）」へ変換し、不明は null。 */
export const formatEnforceDate = (date: string | null | undefined): string | null => {
  if (!date) {
    return null;
  }
  const year = Number(date.slice(0, 4));
  if (Number.isFinite(year) && year >= PLACEHOLDER_ENFORCE_YEAR) {
    return ENFORCE_DATE_UNDECIDED;
  }
  return date;
};

/** 施行日バッジの分類。現行＝今日時点で効力を持つ版、施行予定＝まだ効力を持たない版。 */
export const badgeLabel = (ref: LawRagReference): '現行' | '施行予定' =>
  ref.isFuture ? '施行予定' : '現行';

/**
 * バッジ横に添える補足（施行日と改正予定）。
 * 例）現行「施行日 2026-07-23／改正予定 2026-08-12 施行」／施行予定「2028-12-23 施行」。
 */
export const enforceNote = (ref: LawRagReference): string => {
  const parts: string[] = [];
  const enforce = formatEnforceDate(ref.enforceDate);
  if (enforce === ENFORCE_DATE_UNDECIDED) {
    parts.push(enforce);
  } else if (enforce) {
    parts.push(ref.isFuture ? `${enforce} 施行` : `施行日 ${enforce}`);
  }
  const next = formatEnforceDate(ref.nextEnforceDate);
  if (next) {
    parts.push(next === ENFORCE_DATE_UNDECIDED ? `改正予定 ${next}` : `改正予定 ${next} 施行`);
  }
  return parts.join('／');
};
