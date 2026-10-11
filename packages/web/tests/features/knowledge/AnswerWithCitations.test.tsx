import { fireEvent, render, screen } from '@testing-library/react';
import type { RagReference } from 'genai-web';
import { describe, expect, it } from 'vitest';
import { AnswerWithCitations } from '../../../src/features/knowledge/components/AnswerWithCitations';

const reference = (overrides: Partial<RagReference> = {}): RagReference => ({
  n: 1,
  documentId: 'd1',
  title: '社内規程',
  collectionId: 'col1',
  chunkIndex: 3,
  headerPath: '第1章',
  text: '休暇は年に20日付与する。',
  score: 0.0328,
  ...overrides,
});

describe('AnswerWithCitations', () => {
  it('引用はボタンになり、カーソルを当てるとチャンク本文が出る', () => {
    render(<AnswerWithCitations answer='回答本体 [1] です。' references={[reference()]} />);
    const marker = screen.getByRole('button', { name: '[1]' });
    expect(marker.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText(/休暇は年に20日付与する。/)).toBeNull();

    fireEvent.mouseEnter(marker);
    expect(marker.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/休暇は年に20日付与する。/)).toBeTruthy();
    expect(screen.getByText(/社内規程 \/ 第1章/)).toBeTruthy();

    fireEvent.mouseLeave(marker);
    expect(screen.queryByText(/休暇は年に20日付与する。/)).toBeNull();
  });

  it('キーボードでフォーカスしても出る', () => {
    render(<AnswerWithCitations answer='回答 [1]' references={[reference()]} />);
    const marker = screen.getByRole('button', { name: '[1]' });
    fireEvent.focus(marker);
    expect(screen.getByText(/休暇は年に20日付与する。/)).toBeTruthy();
    fireEvent.blur(marker);
    expect(screen.queryByText(/休暇は年に20日付与する。/)).toBeNull();
  });

  it('タップ（クリック）で開いて、もう一度押すと閉じる', () => {
    render(<AnswerWithCitations answer='回答 [1]' references={[reference()]} />);
    const marker = screen.getByRole('button', { name: '[1]' });
    fireEvent.click(marker);
    expect(screen.getByText(/休暇は年に20日付与する。/)).toBeTruthy();
    fireEvent.click(marker);
    expect(screen.queryByText(/休暇は年に20日付与する。/)).toBeNull();
  });

  it('回答に存在しない番号は文字のまま残り、落ちない', () => {
    const { container } = render(
      <AnswerWithCitations answer='根拠は [9] にある。' references={[reference()]} />,
    );
    expect(screen.queryByRole('button', { name: '[9]' })).toBeNull();
    expect(container.textContent).toContain('[9]');
  });

  it('参照が空でも落ちない', () => {
    const { container } = render(<AnswerWithCitations answer='回答 [1]' references={[]} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.textContent).toContain('[1]');
  });

  it('チャンク本文を HTML として解釈しない（取り込んだ文書は信用できない入力）', () => {
    render(
      <AnswerWithCitations
        answer='回答 [1]'
        references={[
          reference({
            text: '<img src=x onerror="alert(1)"><script>alert(2)</script>**太字にしない**',
            title: '<b>タイトル</b>',
          }),
        ]}
      />,
    );
    const marker = screen.getByRole('button', { name: '[1]' });
    fireEvent.click(marker);
    const panel = screen.getByRole('tooltip');
    expect(panel.querySelector('img')).toBeNull();
    expect(panel.querySelector('script')).toBeNull();
    expect(panel.querySelector('b')).toBeNull();
    expect(panel.querySelector('strong')).toBeNull();
    expect(panel.textContent).toContain('<img src=x onerror="alert(1)">');
    expect(panel.textContent).toContain('<b>タイトル</b>');
    expect(panel.textContent).toContain('**太字にしない**');
  });

  it('回答の Markdown は描画するが、回答に混じった HTML はタグとして解釈しない', () => {
    const { container } = render(
      <AnswerWithCitations
        answer={'**強調** と [1]\n\n<img src=x onerror="alert(1)">'}
        references={[reference()]}
      />,
    );
    expect(container.querySelector('strong')?.textContent).toBe('強調');
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror="alert(1)">');
  });

  it('同じ番号が本文に 2 回出ても両方が押せる', () => {
    render(<AnswerWithCitations answer='[1] と、もう一度 [1]' references={[reference()]} />);
    expect(screen.getAllByRole('button', { name: '[1]' })).toHaveLength(2);
  });
});
