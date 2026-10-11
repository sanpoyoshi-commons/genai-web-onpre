import type { ListRagDocumentsResponse } from 'genai-web';
import useSWR from 'swr';
import { genUApiFetcher } from '@/lib/fetcher';

/** 選んでいるナレッジ集の文書の一覧。ナレッジ集が未選択なら引かない。 */
export const useDocuments = (collectionId: string | null) => {
  return useSWR<ListRagDocumentsResponse>(
    collectionId ? `rag/collections/${encodeURIComponent(collectionId)}/documents` : null,
    genUApiFetcher,
  );
};
