import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markdown } from '../../src/components/Markdown';
import { MarkdownImage } from '../../src/components/MarkdownImage';
import { ExAppUsageMarkdownRenderer } from '../../src/features/exapp/components/ExAppUsageMarkdownRenderer';
import { Markdown as DiagramMarkdown } from '../../src/features/generate-diagram/components/Markdown';
import { AnswerWithCitations } from '../../src/features/knowledge/components/AnswerWithCitations';

// 上流との意図的な乖離を守るテスト（UPSTREAM.md §6-5）。
// Markdown の中身はモデルの出力や利用者が貼り付けた文字なので、画像の宛先をこちらで
// 選べない。外部を指す画像を自動で読み込まない＝画面を開いただけで利用者の端末から
// 第三者へ要求が出ない。同じ配信元のものと手元にあるものは、これまでどおり描く。

const srcList = (container: HTMLElement) =>
  [...container.querySelectorAll('img')].map((image) => image.getAttribute('src'));

describe('Markdown の画像', () => {
  it('外部の http(s) の画像は img にならず、alt と宛先が文字で出る', () => {
    const { container } = render(<Markdown>{'![グラフ](https://example.test/a.png)'}</Markdown>);

    expect(srcList(container)).toEqual([]);
    expect(screen.getByText('グラフ')).toBeTruthy();
    expect(screen.getByText('［外部の画像は読み込みません］')).toBeTruthy();

    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('https://example.test/a.png');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noreferrer noopener');
  });

  it('プロトコル相対（//）の画像も img にならない', () => {
    const { container } = render(<Markdown>{'![x](//example.test/a.png)'}</Markdown>);

    expect(srcList(container)).toEqual([]);
  });

  it('同じ配信元の画像は img になる', () => {
    for (const src of ['/assets/a.png', 'a.png', `${window.location.origin}/a.png`]) {
      const { container } = render(<Markdown>{`![x](${src})`}</Markdown>);

      expect(srcList(container)).toEqual([src]);
    }
  });

  it('ダイアグラムの Markdown でも外部の画像は img にならない', () => {
    const external = render(
      <DiagramMarkdown>{'![x](https://example.test/a.png)'}</DiagramMarkdown>,
    );
    expect(srcList(external.container)).toEqual([]);

    const self = render(<DiagramMarkdown>{'![x](/assets/a.png)'}</DiagramMarkdown>);
    expect(srcList(self.container)).toEqual(['/assets/a.png']);
  });
});

describe('ほかの描画器の画像', () => {
  it('汎用 RAG の回答でも外部の画像は img にならない', () => {
    const external = render(
      <AnswerWithCitations answer='![x](https://example.test/a.png)' references={[]} />,
    );
    expect(srcList(external.container)).toEqual([]);

    const self = render(<AnswerWithCitations answer='![x](/assets/a.png)' references={[]} />);
    expect(srcList(self.container)).toEqual(['/assets/a.png']);
  });

  it('アプリの使い方の文でも外部の画像は img にならない', () => {
    const external = render(
      <ExAppUsageMarkdownRenderer content='![x](https://example.test/a.png)' />,
    );
    expect(srcList(external.container)).toEqual([]);

    const self = render(<ExAppUsageMarkdownRenderer content='![x](/assets/a.png)' />);
    expect(srcList(self.container)).toEqual(['/assets/a.png']);
  });
});

describe('MarkdownImage', () => {
  it('手元にある画像（data:・blob:）は img になる', () => {
    for (const src of [
      'data:image/png;base64,iVBORw0KGgo=',
      `blob:${window.location.origin}/0-1`,
    ]) {
      const { container } = render(<MarkdownImage src={src} alt='図' />);

      expect(srcList(container)).toEqual([src]);
    }
  });

  it('利用者が開ける宛先でない src は、img にもリンクにもしない', () => {
    const { container } = render(<MarkdownImage src='mailto:info@example.test' alt='図' />);

    expect(srcList(container)).toEqual([]);
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('図');
    expect(container.textContent).toContain('［画像を表示できません］');
  });

  it('src が無いときは img を作らない', () => {
    const { container } = render(<MarkdownImage alt='図' />);

    expect(srcList(container)).toEqual([]);
    expect(container.querySelector('a')).toBeNull();
  });
});
