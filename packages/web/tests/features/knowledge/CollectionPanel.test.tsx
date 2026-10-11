import { render } from '@testing-library/react';
import type { ListRagCollectionsResponse, RagCollection } from 'genai-web';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollectionPanel } from '../../../src/features/knowledge/components/CollectionPanel';
import { useKnowledgeStore } from '../../../src/features/knowledge/stores/useKnowledgeStore';

let listed: ListRagCollectionsResponse | undefined;
const mutate = vi.fn();

vi.mock('../../../src/features/knowledge/hooks/useCollections', () => ({
  useCollections: () => ({ data: listed, error: undefined, isLoading: false, mutate }),
}));
vi.mock('../../../src/features/knowledge/components/DialogCollectionForm', () => ({
  DialogCollectionForm: () => null,
}));
vi.mock('../../../src/features/knowledge/components/DialogDeleteCollection', () => ({
  DialogDeleteCollection: () => null,
}));

const collection = (id: string, name: string): RagCollection => ({
  collectionId: id,
  name,
  description: null,
  mcpEnabled: false,
  documentCount: 0,
  createdAt: '2026-10-10T00:00:00Z',
  updatedAt: '2026-10-10T00:00:00Z',
});

describe('CollectionPanel の選択の噛み合わせ', () => {
  beforeEach(() => {
    useKnowledgeStore.getState().selectCollection(null);
    mutate.mockReset();
  });

  it('まだ何も選んでいなければ先頭を選ぶ', () => {
    listed = { collections: [collection('a', 'テストA'), collection('b', 'テストB')] };
    render(<CollectionPanel />);
    expect(useKnowledgeStore.getState().selectedCollectionId).toBe('a');
  });

  it('選んでいた id が一覧から消えたら、残っている先頭へ移す', () => {
    listed = { collections: [collection('a', 'テストA'), collection('b', 'テストB')] };
    const view = render(<CollectionPanel />);
    expect(useKnowledgeStore.getState().selectedCollectionId).toBe('a');

    // 「テストA」を削除した後の一覧。
    listed = { collections: [collection('b', 'テストB')] };
    view.rerender(<CollectionPanel />);
    expect(useKnowledgeStore.getState().selectedCollectionId).toBe('b');
  });

  it('最後のナレッジ集を消したら未選択に戻す（消えた id を選び続けない）', () => {
    listed = { collections: [collection('a', 'テストA')] };
    const view = render(<CollectionPanel />);
    expect(useKnowledgeStore.getState().selectedCollectionId).toBe('a');

    listed = { collections: [] };
    view.rerender(<CollectionPanel />);
    expect(useKnowledgeStore.getState().selectedCollectionId).toBeNull();
  });

  it('選択を移すときに検索結果と回答も捨てる', () => {
    listed = { collections: [collection('a', 'テストA')] };
    const view = render(<CollectionPanel />);
    useKnowledgeStore.getState().setSearchResults([]);
    useKnowledgeStore.getState().setAnswer({ answer: '前の回答', references: [] });

    listed = { collections: [] };
    view.rerender(<CollectionPanel />);
    expect(useKnowledgeStore.getState().searchResults).toBeNull();
    expect(useKnowledgeStore.getState().answer).toBeNull();
  });
});
