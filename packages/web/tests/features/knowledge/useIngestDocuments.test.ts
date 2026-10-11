import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useIngestDocuments } from '../../../src/features/knowledge/hooks/useIngestDocuments';

vi.mock('../../../src/features/knowledge/hooks/useKnowledgeApi', () => ({
  useKnowledgeApi: () => ({
    uploadOriginal: vi.fn(),
    ingestDocument: vi.fn(),
  }),
}));

describe('useIngestDocuments', () => {
  it('clearOutcomes は描画をまたいで同じ関数（副作用の依存に置ける）', () => {
    const { result, rerender } = renderHook(() => useIngestDocuments('a'));
    const first = result.current.clearOutcomes;
    rerender();
    rerender();
    expect(result.current.clearOutcomes).toBe(first);
  });

  it('すでに空なら clearOutcomes は状態を触らない（描画を呼び直さない）', () => {
    const { result } = renderHook(() => useIngestDocuments('a'));
    const before = result.current.outcomes;
    expect(before).toHaveLength(0);
    act(() => {
      result.current.clearOutcomes();
    });
    // 同じ配列のまま＝状態が変わらないので再描画が連鎖しない。
    expect(result.current.outcomes).toBe(before);
  });

  it('ナレッジ集が未選択なら投入しない', async () => {
    const { result } = renderHook(() => useIngestDocuments(null));
    await act(async () => {
      await result.current.ingestText('メモ', '本文');
    });
    expect(result.current.outcomes).toHaveLength(0);
    expect(result.current.ingesting).toBe(false);
  });
});
