/**
 * Markdown の中の画像を、自動で読み込んでよいかどうかの判定。
 *
 * Markdown の中身はモデルの出力や利用者が貼り付けた文字なので、画像の宛先をこちらで
 * 選べない。外部を指す宛先をそのまま img に渡すと、画面を開いただけで利用者の端末から
 * 第三者へ要求が出る。同じ配信元のものと、すでに手元にあるもの（data:・blob:）だけを
 * 自動で描き、それ以外は読み込まずに文字で示す（UPSTREAM.md §6-5）。
 */

// すでに手元にあり、外へ要求が出ない scheme。
const INLINE_SCHEME = /^(data|blob):/i;

const resolve = (value: string): URL | undefined => {
  try {
    return new URL(value, window.location.href);
  } catch {
    return undefined;
  }
};

/** そのまま img で描いてよい src か（相対・同じ配信元・data:・blob: だけ true）。 */
export const isSelfServedImageSrc = (src: string | undefined): boolean => {
  const value = src?.trim();
  if (!value) {
    return false;
  }
  if (INLINE_SCHEME.test(value)) {
    return true;
  }
  return resolve(value)?.origin === window.location.origin;
};

/**
 * 自動では読み込まない src のうち、利用者が自分で開ける宛先（http・https）を返す。
 * 開ける宛先でなければ undefined を返し、呼び出し側は文字だけを出す。
 */
export const externalImageHref = (src: string | undefined): string | undefined => {
  const value = src?.trim();
  if (!value || INLINE_SCHEME.test(value)) {
    return undefined;
  }
  const resolved = resolve(value);
  if (!resolved || resolved.origin === window.location.origin) {
    return undefined;
  }
  return resolved.protocol === 'http:' || resolved.protocol === 'https:'
    ? resolved.href
    : undefined;
};
