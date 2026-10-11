import type { RagAskResponse, RagSearchResult } from 'genai-web';
import { createWithEqualityFn as create } from 'zustand/traditional';

/**
 * ナレッジ集の画面の状態（法令調査の store と同じ流儀）。
 * 選んでいるナレッジ集を中心に、検索だけの結果と、問うた答えを別々に持つ
 * （検索と生成を分けてあるので、画面でも別々に見せる）。
 */
type KnowledgeState = {
  selectedCollectionId: string | null;
  searchResults: RagSearchResult[] | null;
  searching: boolean;
  searchError: string | null;
  answer: RagAskResponse | null;
  asking: boolean;
  askError: string | null;
};

type KnowledgeActions = {
  selectCollection: (collectionId: string | null) => void;
  setSearchResults: (results: RagSearchResult[] | null) => void;
  setSearching: (searching: boolean) => void;
  setSearchError: (error: string | null) => void;
  setAnswer: (answer: RagAskResponse | null) => void;
  setAsking: (asking: boolean) => void;
  setAskError: (error: string | null) => void;
  clearResults: () => void;
};

const initialState: KnowledgeState = {
  selectedCollectionId: null,
  searchResults: null,
  searching: false,
  searchError: null,
  answer: null,
  asking: false,
  askError: null,
};

export const useKnowledgeStore = create<KnowledgeState & KnowledgeActions>((set) => ({
  ...initialState,
  // ナレッジ集を切り替えたら、前のナレッジ集の結果は消す（どの集の結果か分からなくなるため）。
  selectCollection: (selectedCollectionId) =>
    set({
      selectedCollectionId,
      searchResults: null,
      searchError: null,
      answer: null,
      askError: null,
    }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearching: (searching) => set({ searching }),
  setSearchError: (searchError) => set({ searchError }),
  setAnswer: (answer) => set({ answer }),
  setAsking: (asking) => set({ asking }),
  setAskError: (askError) => set({ askError }),
  clearResults: () => set({ searchResults: null, searchError: null, answer: null, askError: null }),
}));
