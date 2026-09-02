// LLM が返した mermaid コードを描画前に整える。ローカル CPU モデル（ELYZA-8B 等）は
// プロンプトの記法を完全には守らないため、機械的に直せる崩れはここで吸収する。
// 直せない崩れは Mermaid.tsx が catch してエラー表示にフォールバックする。

/** 半角英数記号以外（日本語等）を含むか。xychart のラベルはこれを含むと引用符が要る。 */
const NON_ASCII = /[^\x20-\x7E]/;

/** xychart の軸範囲は数値のみ有効（`0 --> 1000`）。`min --> max` 等は無効。 */
const isNumeric = (text: string): boolean => /^-?\d+(?:\.\d+)?$/.test(text.trim());

/**
 * 非 ASCII を含む裸のラベルを `"` で囲む。既に囲まれていれば触らない。
 * xychart の lexer は引用符無しの非 ASCII を受け付けず Lexical error になる。
 */
const quoteLabel = (label: string): string => {
  const trimmed = label.trim();
  if (trimmed === '' || /^".*"$/s.test(trimmed)) return trimmed;
  return NON_ASCII.test(trimmed) ? `"${trimmed}"` : trimmed;
};

/**
 * xychart-beta の x-axis / y-axis 行を直す。
 *
 * 1. 非数値の範囲（`y-axis "件数" min --> max`）を落とす。プロンプトのテンプレートが
 *    `min --> max` という見た目のため、モデルがプレースホルダをそのまま書いてくる。
 *    範囲を省いた `y-axis "件数"` は有効で、範囲はデータから自動生成される。
 * 2. 日本語のカテゴリーラベル（`x-axis [1月, 2月]`）と軸タイトルを引用符で囲む。
 *
 * quadrantChart は `x-axis 低い --> 高い` が引用符無し・非数値でも有効なため、
 * xychart で始まるコードにだけ適用する。
 */
const correctXyChartAxes = (code: string): string => {
  if (!/^xychart/i.test(code.trimStart())) return code;

  return code.replace(/^([ \t]*)(x-axis|y-axis)([ \t]+.*)?$/gm, (line, indent, axis, rest) => {
    const body = (rest ?? '').trim();
    if (body === '') return line;

    // 軸行は「タイトル」「カテゴリー配列」「数値範囲」の組み合わせ。範囲と配列は併存しない。
    let title = body;
    let categories = '';
    let range = '';

    const ranged = body.match(/^(.*?)[ \t]*(\S+)[ \t]*-->[ \t]*(\S+)$/);
    if (ranged) {
      const [, head, low, high] = ranged;
      title = head.trim();
      // 数値範囲だけが有効。`min --> max` 等のプレースホルダは落とす（範囲は自動生成される）。
      if (isNumeric(low) && isNumeric(high)) {
        range = `${low} --> ${high}`;
      }
    } else {
      const bracket = body.indexOf('[');
      if (bracket >= 0) {
        title = body.slice(0, bracket).trim();
        categories = body
          .slice(bracket)
          .replace(/^\[([^\]]*)\]/, (_match: string, inner: string) =>
            inner.trim() === '' ? '[]' : `[${inner.split(',').map(quoteLabel).join(', ')}]`,
          );
      }
    }

    const parts = [quoteLabel(title), categories, range].filter((part) => part !== '');
    return parts.length > 0 ? `${indent}${axis} ${parts.join(' ')}` : `${indent}${axis}`;
  });
};

/**
 * gitGraph の方向指定にはコロンが要る（`gitGraph LR:`）。実機 ELYZA-8B は
 * `gitGraph LR` とコロンを落とし、"Expecting token of type 'EOF'" で描画できなかった。
 * コロンの無い方向指定はそもそも無効な記法なので、補っても有効な図を壊さない。
 */
const correctGitGraphDirection = (code: string): string =>
  code.replace(/^([ \t]*gitGraph[ \t]+(?:LR|TB|BT))[ \t]*$/m, '$1:');

/** 描画前の補正をまとめて適用する。 */
export const correctDiagramCode = (code: string): string => {
  const base = code
    .replace(/(^|\s)classDef(?!\s)/gm, '$1classDef ')
    .replace(/・/g, '/')
    .replace(/：/g, ':')
    .replace(
      /subgraph\s+(.*)/gm,
      (_match: string, title: string) => `subgraph ${title.replace(/,/g, '')}`,
    );

  return correctGitGraphDirection(correctXyChartAxes(base));
};
