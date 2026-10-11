import { useKnowledgeStore } from '../stores/useKnowledgeStore';
import { useKnowledgeApi } from './useKnowledgeApi';
import { knowledgeErrorMessage } from './useKnowledgeError';

/**
 * 検索だけ（生成しない）。選んでいるナレッジ集に絞って検索する。
 * 0 件は api が空の配列を返すので、画面は「0 件」とだけ出す（文章の突き合わせをしない）。
 */
export const useKnowledgeSearch = () => {
  const api = useKnowledgeApi();
  const {
    selectedCollectionId,
    searchResults,
    searching,
    searchError,
    setSearchResults,
    setSearching,
    setSearchError,
  } = useKnowledgeStore();

  const search = async (query: string, topK?: number) => {
    setSearching(true);
    setSearchError(null);
    setSearchResults(null);
    try {
      const res = await api.search({
        query,
        ...(selectedCollectionId ? { collectionIds: [selectedCollectionId] } : {}),
        ...(topK ? { topK } : {}),
      });
      setSearchResults(res.results);
    } catch (err) {
      setSearchError(knowledgeErrorMessage(err, '検索でエラーが発生しました。'));
    } finally {
      setSearching(false);
    }
  };

  return { searchResults, searching, searchError, search };
};
