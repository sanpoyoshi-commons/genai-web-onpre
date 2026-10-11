import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AskPanel } from '../../../src/features/knowledge/components/AskPanel';

vi.mock('../../../src/features/knowledge/hooks/useKnowledgeAsk', () => ({
  useKnowledgeAsk: () => ({
    answer: null,
    asking: false,
    askError: null,
    ask: vi.fn(),
  }),
}));
vi.mock('../../../src/hooks/useSelectedModel', () => ({
  useSelectedModel: () => ({ selectedModelId: '', setSelectedModelId: vi.fn() }),
}));

describe('AskPanel', () => {
  it('見出しは「汎用RAG質問」・ボタンは「質問する」', () => {
    render(<AskPanel disabled={false} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('汎用RAG質問');
    expect(screen.getByRole('button', { name: '質問する' })).toBeTruthy();
  });

  it('見出し直下の1行に、引用から根拠が開けることと CPU の待ちを書く', () => {
    const { container } = render(<AskPanel disabled={false} />);
    expect(container.textContent).toContain(
      '選んだナレッジ集を検索し、見つかった箇所をもとに生成AIが回答します。',
    );
    expect(container.textContent).toContain(
      'にカーソルを当てるか、キーボードで選ぶか、タップすると、根拠になった箇所の本文が出ます。',
    );
    expect(container.textContent).toContain('のみの環境では、回答に時間がかかります。');
  });
});
