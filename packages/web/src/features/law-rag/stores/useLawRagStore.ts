import type { LawRagQueryResponse } from 'genai-web';
import { createWithEqualityFn as create } from 'zustand/traditional';

type LawRagState = {
  response: LawRagQueryResponse | null;
  loading: boolean;
  error: string | null;
};

type LawRagActions = {
  setResponse: (response: LawRagQueryResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
};

type LawRagStore = LawRagState & LawRagActions;

const initialState: LawRagState = {
  response: null,
  loading: false,
  error: null,
};

export const useLawRagStore = create<LawRagStore>((set) => ({
  ...initialState,
  setResponse: (response) => set({ response }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clear: () => set(initialState),
}));
