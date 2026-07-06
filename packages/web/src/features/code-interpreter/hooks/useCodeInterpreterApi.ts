import type { CodeInterpreterRequest, CodeInterpreterResponse } from 'genai-web';
import { genUApi } from '@/lib/fetcher';

export const useCodeInterpreterApi = () => {
  return {
    // 源内独自 IF：POST /code-interpreter/responses。実行は NsJail サンドボックス（profile sandbox）へ委譲。
    // profile off 時は api が 503 を返す。
    responses: async (req: CodeInterpreterRequest) => {
      const res = await genUApi.post<CodeInterpreterResponse>('code-interpreter/responses', req);
      return res.data;
    },
  };
};
