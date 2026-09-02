import mermaid from 'mermaid';
import { describe, expect, it } from 'vitest';
import * as prompts from './index';

// 各図種のプロンプトが載せている mermaid の例が、実際に構文として通ることを守る。
// モデルは例を強く模倣するため、壊れた例はそのまま壊れた出力になる（実機 ELYZA-8B で
// xychart の実装例が描画不能だった事例あり）。
//
// 判定は mermaid.parse（構文のみ）に限定する。render は getBBox 等の実寸に依存し、
// jsdom では偽陽性を出すため使わない。裏返すと、描画時の見た目の崩れはここでは検出できない。
//
// 例の場所や扱いは、行番号ではなくプロンプト本文の構造から判定する。行番号で固定すると
// プロンプトに 1 行足しただけで無関係なテストが落ちる。行番号は失敗時に該当箇所を
// 見つけるための目印として、テスト名にだけ出す。

/** mermaid の図種キーワード。例の開始行を見つけるのに使う。 */
const DIAGRAM_KEYWORDS = [
  'flowchart',
  'graph',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram-v2',
  'stateDiagram',
  'erDiagram',
  'journey',
  'gantt',
  'pie',
  'gitGraph',
  'mindmap',
  'quadrantChart',
  'sankey-beta',
  'block-beta',
  'xychart-beta',
  'timeline',
  'requirementDiagram',
  'packet-beta',
  'architecture-beta',
  'C4Context',
];

/**
 * flowchart / graph はキーワード単独か方向指定が続く形しか取らない。これを課さないと
 * 説明文中の「graph definition」のような語句を例の開始行と誤認する。
 */
const FLOW_KEYWORDS = ['flowchart', 'graph'];
const FLOW_DIRECTIONS = ['TB', 'TD', 'BT', 'RL', 'LR'];

const startsExample = (line: string): boolean => {
  const trimmed = line.trim();
  return DIAGRAM_KEYWORDS.some((keyword) => {
    if (trimmed === keyword) return true;
    if (!trimmed.startsWith(`${keyword} `)) return false;
    if (!FLOW_KEYWORDS.includes(keyword)) return true;
    const rest = trimmed.slice(keyword.length).trim().replace(/[;:]$/, '');
    return FLOW_DIRECTIONS.includes(rest.split(/\s/)[0]);
  });
};

/** 構文の説明用テンプレート。省略記号を含み、そのままでは描画できない。 */
const isTemplate = (code: string): boolean => code.includes('...');

/**
 * 直後に "Correction:" が続く例は、プロンプトが「よくある誤り」として意図的に
 * 載せている記法（block-beta の Common Syntax Errors 節）。構文検査の対象から外す。
 * 誤りの種類は様々で、パーサが弾くとは限らない（不正な CSS 指定など）ため、
 * 「必ず失敗する」とは断定しない。
 */
const CORRECTION_MARKER = /^\s*Correction:/;

/** 箇条書き・番号見出しの行頭。 */
const LIST_MARKER = /^(\s*[-・*]\s|[A-Zａ-ｚ]\)\s|[0-9０-９]+[.)]\s|※|#|【)/;

/**
 * 単独で置かれたタグ行（`<Information>` `</Information>` `<Description>` など）。
 * プロンプトの節の区切りであって図の一部ではないので、例はここで終わる。
 */
const SECTION_TAG = /^\s*<\/?[^<>\s]+>\s*$/;

/** 英単語が 3 語以上並ぶだけの行。mermaid の記法には現れないので説明文とみなす。 */
const isEnglishProse = (line: string): boolean =>
  /^[A-Za-z][A-Za-z ]*$/.test(line.trim()) && line.trim().split(/\s+/).length >= 3;

/** どの図種でも説明文とみなせる行（空行・箇条書き・句点を含む文・英文）。 */
const isProseAlways = (line: string): boolean => {
  const trimmed = line.trim();
  return trimmed === '' || LIST_MARKER.test(line) || trimmed.includes('。') || isEnglishProse(line);
};

/**
 * 字下げの無い日本語の行。本文が必ず字下げされる図種では説明文だが、mindmap では
 * 字下げの無い行も本文になりうるので適用しない。
 * （mindmap の字下げ漏れはまさに検出したい欠陥なので、ここで救ってはいけない。）
 */
const UNINDENTED_BODY_KEYWORDS = ['mindmap'];
const isJapaneseProse = (line: string): boolean =>
  /^\S/.test(line) && /[ぁ-んァ-ヶ一-龠]/.test(line) && !startsExample(line);

/**
 * 本文の途中に空行を挟む図種と、空行の先がまだ本文かを見分ける目印。
 * requirementDiagram は要素ブロック（`{` … `}`）と関係行（`->`）を空行で区切って並べる。
 * これが無いと最初の空行で例が 1 行に切り詰められ、逆に無条件に読み進めると
 * 図の後ろに続く説明文まで飲み込む。
 * （sankey-beta も空行を挟むが <実装例N> タグで囲まれているのでここには要らない。）
 */
const BLANK_LINE_BODY: Record<string, RegExp> = {
  requirementDiagram: /[{}]|->/,
};

const blankLineBodyMarker = (keywordLine: string): RegExp | undefined =>
  Object.entries(BLANK_LINE_BODY).find(([keyword]) => keywordLine.trim().startsWith(keyword))?.[1];

/** 例の直前にある %%{init}%% / --- frontmatter を取り込む。 */
const withFrontmatter = (lines: string[], keywordIndex: number): number => {
  let start = keywordIndex;
  while (start > 0 && lines[start - 1].trim().startsWith('%%{')) start--;
  if (start > 0 && lines[start - 1].trim() === '---') {
    let fence = start - 2;
    while (fence >= 0 && lines[fence].trim() !== '---') fence--;
    if (fence >= 0) start = fence;
  }
  return start;
};

type Example = { line: number; code: string; isKnownBadExample: boolean };

/** プロンプト本文から mermaid の例を切り出す。 */
const examplesOf = (text: string): Example[] => {
  const out: Example[] = [];
  const lines = text.split('\n');
  const consumed = new Set<number>();

  const push = (start: number, end: number) => {
    const body = lines.slice(start, end);
    const allowUnindentedBody = UNINDENTED_BODY_KEYWORDS.some((keyword) =>
      body[0]?.trim().startsWith(keyword),
    );
    // 例の末尾に続く説明文を削る。
    while (body.length > 1) {
      const last = body[body.length - 1];
      if (isProseAlways(last) || (!allowUnindentedBody && isJapaneseProse(last))) {
        body.pop();
        continue;
      }
      break;
    }
    if (body.length < 2) return;
    out.push({
      line: start + 1,
      code: body.join('\n').replace(/\s+$/, ''),
      // 例の直後に Correction が続くかで判定する。末尾を削った分は数に入れない。
      isKnownBadExample: lines
        .slice(start + body.length, end + 1)
        .some((line) => CORRECTION_MARKER.test(line)),
    });
  };

  // ① <例N> … </例N> / <実装例N> … </実装例N>。空行を挟む sankey 等はこの形式。
  for (let i = 0; i < lines.length; i++) {
    if (!/^<[^/>]*例[^>]*>$/.test(lines[i].trim())) continue;
    let close = i + 1;
    while (close < lines.length && !/^<\/[^>]*例[^>]*>$/.test(lines[close].trim())) close++;
    const keyword = lines.slice(i + 1, close).findIndex(startsExample);
    if (keyword >= 0) push(withFrontmatter(lines, i + 1 + keyword), close);
    for (let x = i; x <= close && x < lines.length; x++) consumed.add(x);
    i = close;
  }

  // ② それ以外はキーワード行から、空行／次の例／次の frontmatter までを本文とする。
  let i = 0;
  while (i < lines.length) {
    if (consumed.has(i) || !startsExample(lines[i])) {
      i++;
      continue;
    }
    const bodyMarker = blankLineBodyMarker(lines[i]);
    /** 空行で打ち切るか。本文に空行を挟む図種では、次の非空行が本文かどうかで決める。 */
    const stopsAtBlank = (at: number): boolean => {
      if (lines[at].trim() !== '') return false;
      if (!bodyMarker) return true;
      const next = lines.slice(at + 1).find((line) => line.trim() !== '');
      return next === undefined || !bodyMarker.test(next);
    };

    let end = i + 1;
    while (
      end < lines.length &&
      !stopsAtBlank(end) &&
      !startsExample(lines[end]) &&
      !CORRECTION_MARKER.test(lines[end]) &&
      !SECTION_TAG.test(lines[end]) &&
      !lines[end].trim().startsWith('%%{') &&
      lines[end].trim() !== '---'
    ) {
      end++;
    }
    push(withFrontmatter(lines, i), end);
    i = end;
  }

  return out;
};

// 各プロンプトが要求すべき先頭キーワード。ローカルの 8B 級モデルは制約リストに
// 書かれていない事柄を守らず、実機 ELYZA-8B は Gitグラフ の依頼に `graph LR` を
// 返した（当時 git-graph.ts に先頭行の指示が無かった）。図種を取り違えると
// 記法ごと別物になり描画できないため、全プロンプトで明示させる。
const REQUIRED_FIRST_LINE: Record<string, string> = {
  ArchitecturePrompt: 'graph TB',
  BlockPrompt: 'block-beta',
  ClassPrompt: 'classDiagram',
  ErPrompt: 'erDiagram',
  FlowchartPrompt: 'flowchart',
  GanttChartPrompt: 'gantt',
  GitgraphPrompt: 'gitGraph',
  MindmapPrompt: 'mindmap',
  NetworkpacketPrompt: 'packet-beta',
  PiechartPrompt: 'pie',
  QuadrantchartPrompt: 'quadrantChart',
  RequirementPrompt: 'requirementDiagram',
  SankeychartPrompt: 'sankey-beta',
  SequencePrompt: 'sequenceDiagram',
  StatePrompt: 'stateDiagram-v2',
  TimelinePrompt: 'timeline',
  UserJourneyPrompt: 'journey',
  XychartPrompt: 'xychart-beta',
};

const allPrompts = Object.entries(prompts).filter(([, value]) => typeof value === 'string') as [
  string,
  string,
][];

mermaid.initialize({ suppressErrorRendering: true, securityLevel: 'antiscript' });

describe('ダイアグラム生成プロンプトの制約', () => {
  it('対応表が全プロンプトを網羅している', () => {
    expect(allPrompts.map(([name]) => name).sort()).toEqual(
      Object.keys(REQUIRED_FIRST_LINE).sort(),
    );
  });

  for (const [name, keyword] of Object.entries(REQUIRED_FIRST_LINE)) {
    it(`${name} が先頭行に「${keyword}」を要求している`, () => {
      const text = (prompts as Record<string, string>)[name];
      expect(text).toContain(`必ず最初の行に「${keyword}」を記述してください`);
    });
  }
});

describe('ダイアグラム生成プロンプトの mermaid 例', () => {
  for (const [name, text] of allPrompts) {
    const examples = examplesOf(text);

    describe(name, () => {
      it('例を抽出できている', () => {
        // 切り出しが壊れて 0 件になっても緑にならないようにする。
        expect(examples.length).toBeGreaterThan(0);
      });

      for (const example of examples) {
        const label = `${example.code.split('\n')[0].trim()}（${example.line} 行目）`;

        if (example.isKnownBadExample) {
          it.skip(`${label} は「よくある誤り」の例なので構文検査しない`, () => {});
          continue;
        }
        if (isTemplate(example.code)) {
          it.skip(`${label} は省略記号を含むテンプレートなので構文検査しない`, () => {});
          continue;
        }

        it(`${label} が構文として通る`, async () => {
          await expect(mermaid.parse(example.code)).resolves.toBeTruthy();
        });
      }
    });
  }
});
