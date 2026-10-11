import { render, screen } from '@testing-library/react';
import type { RagSearchResult } from 'genai-web';
import { describe, expect, it, vi } from 'vitest';
import { SearchPanel } from '../../../src/features/knowledge/components/SearchPanel';

const searchMock = vi.fn();
let results: RagSearchResult[] | null = null;

vi.mock('../../../src/features/knowledge/hooks/useKnowledgeSearch', () => ({
  useKnowledgeSearch: () => ({
    searchResults: results,
    searching: false,
    searchError: null,
    search: searchMock,
  }),
}));

const result = (overrides: Partial<RagSearchResult> = {}): RagSearchResult => ({
  documentId: 'd1',
  title: '社内規程',
  collectionId: 'col1',
  chunkIndex: 3,
  headerPath: '第1章',
  text: '本文です。',
  score: 0.0328,
  ...overrides,
});

describe('SearchPanel', () => {
  it('見出しは「チャンク検索確認」', () => {
    results = null;
    const { container } = render(<SearchPanel disabled={false} />);
    expect(container.textContent).toContain('チャンク検索確認');
    // 生成AIを使わないこと・質問の前に確かめる段であることが読める説明になっている。
    expect(container.textContent).toContain(
      '生成AIを使わず、検索で選ばれたチャンク（文書を切り分けた断片）とスコアをそのまま表示します。',
    );
    expect(container.textContent).toContain(
      '質問する前に、狙った箇所が拾えているかを目で確かめるための段です。',
    );
  });

  it('チャンク・スコア・文書名を並べる', () => {
    results = [result()];
    const { container } = render(<SearchPanel disabled={false} />);
    expect(screen.getByText(/社内規程/)).toBeTruthy();
    expect(screen.getByText(/本文です。/)).toBeTruthy();
    expect(container.textContent).toContain('0.0328');
    expect(container.textContent).toContain('3 番目のチャンク');
  });

  it('0 件は「0 件でした。」と出す（文章の突き合わせをさせない）', () => {
    results = [];
    render(<SearchPanel disabled={false} />);
    expect(screen.getByText('0 件でした。')).toBeTruthy();
  });

  it('チャンク本文を HTML として解釈しない（取り込んだ文書は信用できない入力）', () => {
    results = [
      result({
        text: '<img src=x onerror="alert(1)"><script>alert(2)</script>**太字にしない**',
        title: '<b>タイトル</b>',
      }),
    ];
    const { container } = render(<SearchPanel disabled={false} />);
    // タグは要素にならず、文字としてそのまま出る。
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror="alert(1)">');
    expect(container.textContent).toContain('<b>タイトル</b>');
    // Markdown としても解釈しない（検索で選ばれた本文そのものを見せる画面）。
    expect(container.querySelector('strong')).toBeNull();
    expect(container.textContent).toContain('**太字にしない**');
  });

  it('リランカが効いたときだけ並べ替えのスコアを出す', () => {
    results = [result({ rerankScore: 0.9871 })];
    const { container } = render(<SearchPanel disabled={false} />);
    expect(container.textContent).toContain('並べ替え 0.9871');
  });
});
