import type { CodeInterpreterResponse } from 'genai-web';
import { createWithEqualityFn as create } from 'zustand/traditional';

type CodeInterpreterState = {
  response: CodeInterpreterResponse | null;
  loading: boolean;
  error: string | null;
};

type CodeInterpreterActions = {
  setResponse: (response: CodeInterpreterResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
};

type CodeInterpreterStore = CodeInterpreterState & CodeInterpreterActions;

const initialState: CodeInterpreterState = {
  response: null,
  loading: false,
  error: null,
};

export const useCodeInterpreterStore = create<CodeInterpreterStore>((set) => ({
  ...initialState,
  setResponse: (response) => set({ response }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clear: () => set(initialState),
}));
