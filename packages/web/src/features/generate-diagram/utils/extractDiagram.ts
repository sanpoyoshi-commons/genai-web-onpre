// mermaid のダイアグラム種別を示す先頭キーワード（```mermaid フェンス省略時の検出用）。
// ローカル CPU モデル（ELYZA-8B 等）はプロンプトのフェンス指示を守らず生コードを返すことがあり、
// その場合でも図として描画できるよう、先頭行がこれらで始まれば本文を mermaid コードとみなす。
const MERMAID_LEADING_KEYWORDS = [
  'flowchart',
  'graph',
  'sequencediagram',
  'classdiagram',
  'statediagram',
  'erdiagram',
  'journey',
  'gantt',
  'pie',
  'gitgraph',
  'mindmap',
  'quadrantchart',
  'sankey',
  'block-beta',
  'xychart',
  'timeline',
  'requirementdiagram',
  'c4context',
];

const DESCRIPTION_BLOCK = /<description>[\s\S]*?<\/description>/i;

// 図の本文中に現れる mermaid の文キーワード（先頭種別以外）。末尾散文の切り分けに使う。
const MERMAID_STATEMENT_KEYWORDS = [
  'subgraph',
  'end',
  'classdef',
  'class',
  'style',
  'linkstyle',
  'direction',
  'click',
  'acctitle',
  'accdescr',
  'participant',
  'actor',
  'section',
  'state',
];

// mermaid のコネクタ/ノード構文トークン（インデントされない行でも本文と判定するため）。
const MERMAID_TOKEN = /-->|---|-\.-|==>|===|->>|--x|--o|@\{|:::|\[|\]|\{|\}|\(|\)|\|/;

// sequenceDiagram の正規 note 構文（`Note over A: x` 等）。裸の `Note:`（モデルが付ける散文）は含めない。
const MERMAID_NOTE = /^note\s+(left of|right of|over)\b/i;

/** 1 行が mermaid のダイアグラム種別キーワードで始まるか。 */
const isMermaidLeadingLine = (line: string): boolean => {
  const trimmed = line.trim().toLowerCase();
  return MERMAID_LEADING_KEYWORDS.some((kw) => trimmed.startsWith(kw));
};

/**
 * 1 行が mermaid の本文らしいか（末尾散文トリム用）。
 * インデント行・種別/文キーワード行・コネクタトークンを含む行を本文とみなす。
 * 空行やモデルが付ける説明文（例: `Note:` に続く箇条書き）は本文でないと判定される。
 */
const isMermaidishLine = (line: string): boolean => {
  if (line.trim() === '') return false;
  if (/^\s/.test(line)) return true; // インデント行は本文
  if (isMermaidLeadingLine(line)) return true;
  const trimmed = line.trim();
  if (MERMAID_NOTE.test(trimmed)) return true;
  const lower = trimmed.toLowerCase();
  if (MERMAID_STATEMENT_KEYWORDS.some((kw) => lower.startsWith(kw))) return true;
  return MERMAID_TOKEN.test(line);
};

/** 先頭行が mermaid のダイアグラム種別キーワードで始まるか（フェンス省略時の判定）。 */
const looksLikeMermaid = (text: string): boolean =>
  isMermaidLeadingLine(text.trim().split('\n', 1)[0] ?? '');

// mermaid コードブロック部分のみを抽出。
// 1) 正規の ```mermaid フェンスがあれば従来どおりその中身。
// 2) フェンスが無くても、<Description> を除いた本文が mermaid コードらしければ採用する
//    （モデルがフェンス指示を守らないケースのフォールバック）。
export const extractDiagramCode = (content: string): string => {
  if (content.toLowerCase().includes('```mermaid')) {
    return content.split('```mermaid')[1].split('```')[0].trim();
  }

  const body = content.replace(DESCRIPTION_BLOCK, '').trim();

  // 言語タグ無しの ``` フェンスで囲っているだけのケースは中身を取り出す。
  if (body.includes('```')) {
    const fenced = body.split('```')[1]?.split('```')[0]?.trim() ?? '';
    if (looksLikeMermaid(fenced)) {
      return fenced;
    }
  }

  // フェンスすら無い生コード。mermaid キーワードで始まる行以降をコードとみなす
  // （純粋な生コードはその行が先頭。前置きの文章が付く場合も以降を拾える）。
  const lines = body.split('\n');
  const startIdx = lines.findIndex((line) => isMermaidLeadingLine(line));
  if (startIdx >= 0) {
    // 末尾にモデルが付ける説明（例: `Note:` に続く箇条書き）を後方から削る。
    // 図の内部構造（node/edge 間の空行や classDef 等）は保持し、最初に mermaid 本文行が
    // 現れた所で停止するため、認識漏れによる有効図の切り詰めリスクを最小化する。
    const codeLines = lines.slice(startIdx);
    while (codeLines.length > 0 && !isMermaidishLine(codeLines[codeLines.length - 1])) {
      codeLines.pop();
    }
    return codeLines.join('\n').trim();
  }

  return '';
};

// 説明（description）部分のみを抽出。
// 1) 明示の <Description> があればその中身。
// 2) 混雑メッセージはそのまま。
// 3) どちらも無い場合、図コードを取り除いた残りの文章を説明とする。本文全体が生コードだった
//    場合（フェンス省略）は残りが空になり、図コードを説明欄に二重表示しない。
export const extractDiagramSentence = (content: string): string => {
  if (content.toLowerCase().includes('<description>')) {
    return content
      .split(/<description>/i)[1]
      .split(/<\/description>/i)[0]
      .trim();
  }

  if (content.includes('ただいまアクセスが集中しているため時間をおいて試してみてください。')) {
    return 'ただいまアクセスが集中しているため時間をおいて試してみてください。';
  }

  const code = extractDiagramCode(content);
  if (code.length > 0) {
    let rest = content.replace(/```mermaid[\s\S]*?```/i, '');
    if (rest === content) {
      // フェンス無しの生コードはコード文字列そのものを取り除く。
      rest = rest.replace(code, '');
    }
    // モデルが付ける宙ぶらりんのコードフェンス記号（```／```mermaid の断片）は説明に含めない。
    rest = rest.replace(/```[a-z]*/gi, '');
    return rest.trim();
  }

  return content;
};
