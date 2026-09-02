import { describe, expect, it } from 'vitest';
import { correctDiagramCode } from './correctDiagramCode';

// 実機 ELYZA-8B が「XYチャート」で返した生出力（2026-09-02 観測）。そのままでは
// 3 行目が Lexical error、4 行目が Parse error になり図が出なかった。
const ELYZA_XYCHART = `xychart-beta
    title "Monthly Request Numbers"
    x-axis [1月, 2月, 3月, 4月, 5月]
    y-axis "Request Numbers" min --> max
    bar [320, 480, 610, 550, 900]`;

describe('correctDiagramCode', () => {
  describe('従来の補正', () => {
    it('空白の無い classDef に空白を補う', () => {
      expect(correctDiagramCode('flowchart LR\nclassDefa fill:#f00')).toBe(
        'flowchart LR\nclassDef a fill:#f00',
      );
    });

    it('全角中黒とコロンを半角に直す', () => {
      expect(correctDiagramCode('flowchart LR\n    A[あ・い] --> B[う：え]')).toBe(
        'flowchart LR\n    A[あ/い] --> B[う:え]',
      );
    });

    it('subgraph タイトルのカンマを除く', () => {
      expect(correctDiagramCode('flowchart LR\n    subgraph A, B\n    end')).toBe(
        'flowchart LR\n    subgraph A B\n    end',
      );
    });
  });

  describe('xychart の軸', () => {
    it('実機の失敗出力を描画できる形に直す', () => {
      expect(correctDiagramCode(ELYZA_XYCHART)).toBe(
        `xychart-beta
    title "Monthly Request Numbers"
    x-axis ["1月", "2月", "3月", "4月", "5月"]
    y-axis "Request Numbers"
    bar [320, 480, 610, 550, 900]`,
      );
    });

    it('数値の範囲は残す', () => {
      const code = 'xychart-beta\n    y-axis "件数" 0 --> 1000\n    bar [1]';
      expect(correctDiagramCode(code)).toBe(code);
    });

    it('小数と負値の範囲も数値として残す', () => {
      const code = 'xychart-beta\n    y-axis "気温" -12.5 --> 40.5\n    line [1]';
      expect(correctDiagramCode(code)).toBe(code);
    });

    it('引用符の無い日本語の軸タイトルを囲む', () => {
      expect(correctDiagramCode('xychart-beta\n    y-axis リクエスト数\n    bar [1]')).toBe(
        'xychart-beta\n    y-axis "リクエスト数"\n    bar [1]',
      );
    });

    it('既に引用符のあるラベルは二重に囲まない', () => {
      const code = 'xychart-beta\n    x-axis "月別" ["1月", "2月"]\n    bar [1, 2]';
      expect(correctDiagramCode(code)).toBe(code);
    });

    it('ASCII のラベルには引用符を足さない', () => {
      const code = 'xychart-beta\n    x-axis [Jan, Feb]\n    y-axis "R" 0 --> 10\n    bar [1, 2]';
      expect(correctDiagramCode(code)).toBe(code);
    });

    it('日本語タイトルとカテゴリーを同時に囲む', () => {
      expect(correctDiagramCode('xychart-beta\n    x-axis 月別 [1月, 2月]\n    bar [1, 2]')).toBe(
        'xychart-beta\n    x-axis "月別" ["1月", "2月"]\n    bar [1, 2]',
      );
    });
  });

  describe('gitGraph の方向指定', () => {
    // 実機 ELYZA-8B が「Gitグラフ」で返した生出力（2026-09-02 観測）。コロンが無く
    // "Expecting token of type 'EOF'" で描画できなかった。
    const ELYZA_GITGRAPH =
      'gitGraph LR\n   commit\n   branch develop\n   commit\n   checkout main\n   merge develop';

    it('コロンの無い方向指定にコロンを補う', () => {
      expect(correctDiagramCode(ELYZA_GITGRAPH)).toBe(
        'gitGraph LR:\n   commit\n   branch develop\n   commit\n   checkout main\n   merge develop',
      );
    });

    it('TB と BT も補う', () => {
      expect(correctDiagramCode('gitGraph TB\n   commit')).toBe('gitGraph TB:\n   commit');
      expect(correctDiagramCode('gitGraph BT\n   commit')).toBe('gitGraph BT:\n   commit');
    });

    it('既にコロンがあれば触らない', () => {
      const code = 'gitGraph LR:\n   commit';
      expect(correctDiagramCode(code)).toBe(code);
    });

    it('方向指定の無い gitGraph は触らない', () => {
      const code = 'gitGraph\n   commit\n   branch develop';
      expect(correctDiagramCode(code)).toBe(code);
    });

    it('flowchart の方向指定には干渉しない', () => {
      const code = 'flowchart LR\n    A --> B';
      expect(correctDiagramCode(code)).toBe(code);
    });
  });

  describe('quadrantChart は対象外', () => {
    // quadrantChart では `x-axis 低い --> 高い` が引用符無し・非数値のまま有効なので、
    // xychart 向けの補正を掛けてはいけない。
    it('日本語の軸範囲をそのまま残す', () => {
      const code =
        'quadrantChart\n    x-axis 低い --> 高い\n    y-axis 小さい --> 大きい\n    A: [0.3, 0.6]';
      expect(correctDiagramCode(code)).toBe(code);
    });
  });
});
