import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DocumentUploadForm } from '../../../src/features/knowledge/components/DocumentUploadForm';

const noop = vi.fn();

const renderForm = (collectionName?: string) =>
  render(
    <DocumentUploadForm
      disabled={false}
      collectionName={collectionName}
      ingesting={false}
      progress={null}
      outcomes={[]}
      onIngestFiles={noop}
      onIngestText={noop}
    />,
  );

describe('DocumentUploadForm', () => {
  it('取り込み先のナレッジ集の名前を見出しとボタンに出す', () => {
    const { container } = renderForm('テストA');
    expect(container.textContent).toContain('取り込み先：テストA');
    expect(screen.getByRole('button', { name: '「テストA」に取り込む' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '「テストA」にテキストを取り込む' })).toBeTruthy();
  });

  it('名前が取れないときは行き先を添えない（嘘の行き先を出さない）', () => {
    renderForm(undefined);
    expect(screen.getByRole('button', { name: '取り込む' })).toBeTruthy();
  });

  it('「5件まで」は一度に選べる数だと読める文言にする', () => {
    const { container } = renderForm('テストA');
    expect(container.textContent).toContain('一度に 5 件まで選べます');
    expect(container.textContent).toContain('ナレッジ集に入れられる総数の上限ではありません');
  });

  it('取り込める形式に画像を出さない', () => {
    const { container } = renderForm('テストA');
    expect(container.textContent).toContain(
      '.pdf / .docx / .xlsx / .txt / .md / .csv / .html / .htm',
    );
    expect(container.textContent).toContain('画像は文字が取れないため入れられません');
  });

  it('取り込みの結果を 1 件ずつ出す', () => {
    const { container } = render(
      <DocumentUploadForm
        disabled={false}
        collectionName='テストA'
        ingesting={false}
        progress={null}
        outcomes={[
          { name: 'a.pdf', state: 'ready', charCount: 1234, chunkCount: 5 },
          { name: 'b.pdf', state: 'failed', message: '文字を取り出せませんでした。' },
          { name: 'c.pptx', state: 'rejected', message: 'この形式は取り込めません。' },
        ]}
        onIngestFiles={noop}
        onIngestText={noop}
      />,
    );
    expect(container.textContent).toContain('1,234 文字・5 チャンク');
    expect(container.textContent).toContain('本文を取り出せませんでした');
    expect(container.textContent).toContain('取り込みませんでした');
  });
});
