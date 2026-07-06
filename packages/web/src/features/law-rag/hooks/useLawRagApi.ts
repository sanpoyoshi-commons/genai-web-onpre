import type { LawRagQueryRequest, LawRagQueryResponse } from 'genai-web';
import { genUApi } from '@/lib/fetcher';

export const useLawRagApi = () => {
  return {
    // 法令名ベース忠実ポート：POST /law-rag/query（推定→特定→選別→レポート→出典結合）。
    // embedding profile（rag）依存で、profile off 時は api が 403/503 を返す。
    // レポート生成は法令全文を扱うためレイテンシが大きい（数十秒〜）。fetch にタイムアウトは設けず、
    // nginx /api/ の proxy_read_timeout（Code Interpreter と共用の長尺許容）に委ねる。
    query: async (req: LawRagQueryRequest) => {
      const res = await genUApi.post<LawRagQueryResponse>('law-rag/query', req);
      return res.data;
    },
  };
};
