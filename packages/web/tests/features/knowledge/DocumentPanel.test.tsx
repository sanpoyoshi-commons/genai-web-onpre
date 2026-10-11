import { render } from '@testing-library/react';
import type { ListRagCollectionsResponse } from 'genai-web';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentPanel } from '../../../src/features/knowledge/components/DocumentPanel';
import { useKnowledgeStore } from '../../../src/features/knowledge/stores/useKnowledgeStore';

const clearOutcomes = vi.fn();
let uploadProps: { disabled: boolean; collectionName?: string } | undefined;

const listed: ListRagCollectionsResponse = {
  collections: [
    {
      collectionId: 'a',
      name: 'テストA',
      description: null,
      mcpEnabled: false,
      documentCount: 0,
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-10T00:00:00Z',
    },
    {
      collectionId: 'b',
      name: 'テストB',
      description: null,
      mcpEnabled: false,
      documentCount: 0,
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-10T00:00:00Z',
    },
  ],
};

vi.mock('../../../src/features/knowledge/hooks/useCollections', () => ({
  useCollections: () => ({ data: listed, error: undefined, isLoading: false, mutate: vi.fn() }),
}));
vi.mock('../../../src/features/knowledge/hooks/useDocuments', () => ({
  useDocuments: () => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn() }),
}));
vi.mock('../../../src/features/knowledge/hooks/useIngestDocuments', () => ({
  useIngestDocuments: () => ({
    ingesting: false,
    progress: null,
    outcomes: [],
    ingestFiles: vi.fn(),
    ingestText: vi.fn(),
    clearOutcomes,
  }),
}));
vi.mock('../../../src/features/knowledge/components/DocumentUploadForm', () => ({
  DocumentUploadForm: (props: { disabled: boolean; collectionName?: string }) => {
    uploadProps = props;
    return <div data-testid='upload-form' />;
  },
}));
vi.mock('../../../src/features/knowledge/components/DocumentList', () => ({
  DocumentList: () => null,
}));

describe('DocumentPanel', () => {
  beforeEach(() => {
    clearOutcomes.mockReset();
    uploadProps = undefined;
    useKnowledgeStore.getState().selectCollection('a');
  });

  it('取り込み先のナレッジ集の名前を投入の form へ渡す', () => {
    render(<DocumentPanel />);
    expect(uploadProps?.collectionName).toBe('テストA');
    expect(uploadProps?.disabled).toBe(false);
  });

  it('ナレッジ集を切り替えたら前回の取り込みの結果を捨てる', () => {
    const view = render(<DocumentPanel />);
    clearOutcomes.mockReset();

    useKnowledgeStore.getState().selectCollection('b');
    view.rerender(<DocumentPanel />);

    expect(clearOutcomes).toHaveBeenCalled();
    expect(uploadProps?.collectionName).toBe('テストB');
  });

  it('ナレッジ集を切り替えたら投入の form を作り直す（選んだファイルの並びを持ち越さない）', () => {
    const view = render(<DocumentPanel />);
    const before = view.getByTestId('upload-form');

    useKnowledgeStore.getState().selectCollection('b');
    view.rerender(<DocumentPanel />);
    const after = view.getByTestId('upload-form');

    // key を変えているので別の要素になる＝form の中の状態（選んだファイル）も消える。
    expect(after).not.toBe(before);
  });

  it('未選択なら投入を止める', () => {
    useKnowledgeStore.getState().selectCollection(null);
    render(<DocumentPanel />);
    expect(uploadProps?.disabled).toBe(true);
    expect(uploadProps?.collectionName).toBeUndefined();
  });
});
