import type { LawRagQueryRequest } from 'genai-web';
import { isApiError } from '@/lib/fetcher';
import { useLawRagStore } from '../stores/useLawRagStore';
import { useLawRagApi } from './useLawRagApi';

// api のエラーレスポンスは { error: string }（createApiHandler の errorHandler が整形）。
export const errorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    const data = error.data as { error?: string } | undefined;
    return data?.error ?? '法令調査サービスでエラーが発生しました。';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '予期しないエラーが発生しました。';
};

export const useLawRag = () => {
  const api = useLawRagApi();
  const { response, loading, error, setResponse, setLoading, setError, clear } = useLawRagStore();

  const ask = async (question: string, modelId?: string, asOfDate?: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const req: LawRagQueryRequest = {
        // 参照時点は未指定なら送らない（api 側の既定＝現行での回答になる）。
        inputs: { question, ...(asOfDate ? { as_of_date: asOfDate } : {}) },
        // 未指定なら api 既定モデルへ委譲。指定時は MODEL_IDS 許可リスト内のみ
        // （api 側 resolveTextModel が検証し、許可外は 400）。
        ...(modelId ? { model: { modelId } } : {}),
      };

      const res = await api.query(req);
      setResponse(res);
    } catch (err) {
      setResponse(null);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    response,
    loading,
    error,
    ask,
    clear,
  };
};
