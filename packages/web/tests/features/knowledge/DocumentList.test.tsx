import { render, screen } from '@testing-library/react';
import type { RagKnowledgeDocument } from 'genai-web';
import { describe, expect, it, vi } from 'vitest';
import { DocumentList } from '../../../src/features/knowledge/components/DocumentList';

vi.mock('../../../src/features/knowledge/components/DialogDeleteDocument', () => ({
  DialogDeleteDocument: () => null,
}));

const document = (overrides: Partial<RagKnowledgeDocument> = {}): RagKnowledgeDocument => ({
  documentId: 'd1',
  collectionId: 'col1',
  title: '社内規程.pdf',
  mime: 'application/pdf',
  originalFilename: '社内規程.pdf',
  byteSize: 1234,
  charCount: 5678,
  chunkCount: 9,
  extractor: 'pdfjs-dist',
  extractorVersion: '6.3.289',
  status: 'ready',
  error: null,
  hasBronze: true,
  createdAt: '2026-10-10T00:00:00Z',
  updatedAt: '2026-10-10T00:00:00Z',
  ...overrides,
});

describe('DocumentList', () => {
  it('文字数とチャンク数を出す', () => {
    const { container } = render(
      <DocumentList
        documents={[document()]}
        isLoading={false}
        error={undefined}
        onDeleted={vi.fn()}
      />,
    );
    expect(container.textContent).toContain('5,678');
    expect(container.textContent).toContain('9');
    expect(screen.getByText('社内規程.pdf')).toBeTruthy();
  });

  it('取得が失敗したら前の行を表示し続けない（消えたナレッジ集の文書を残さない）', () => {
    // 取得の仕組みは失敗しても前の値を持ち続けるので、error と documents が同時に来る。
    const { container } = render(
      <DocumentList
        documents={[document()]}
        isLoading={false}
        error={new Error('Request failed with status 404')}
        onDeleted={vi.fn()}
      />,
    );
    expect(container.querySelector('table')).toBeNull();
    expect(container.textContent).not.toContain('社内規程.pdf');
    expect(screen.getByText('文書の一覧を読み込めませんでした。')).toBeTruthy();
  });

  it('原本の無い文書には作り直しできないことを出す', () => {
    const { container } = render(
      <DocumentList
        documents={[document({ hasBronze: false })]}
        isLoading={false}
        error={undefined}
        onDeleted={vi.fn()}
      />,
    );
    expect(container.textContent).toContain('原本がないため作り直しできません');
  });

  it('本文を取り出せなかった文書は理由を出す', () => {
    const { container } = render(
      <DocumentList
        documents={[document({ status: 'failed', error: '文字を取り出せませんでした。' })]}
        isLoading={false}
        error={undefined}
        onDeleted={vi.fn()}
      />,
    );
    expect(container.textContent).toContain('本文を取り出せませんでした');
    expect(container.textContent).toContain('文字を取り出せませんでした。');
  });
});
