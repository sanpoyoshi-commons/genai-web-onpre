import type { ListRagCollectionsResponse } from 'genai-web';
import useSWR from 'swr';
import { genUApiFetcher } from '@/lib/fetcher';

/** 自分のナレッジ集の一覧。作成・名前の変更・削除の後は mutate で引き直す。 */
export const useCollections = () => {
  return useSWR<ListRagCollectionsResponse>('rag/collections', genUApiFetcher);
};
