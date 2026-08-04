import { z } from 'zod';
import { todayIso } from './utils/asOf';

// 法令 RAG（法令調査）フォーム。質問は必須。
// 最終検証は api 側（genai-ai-api-onpre の lawRag/schemas.ts＝question.min(1)）が担うが、UI でも早期に弾く。
//
// 参照時点（asOfDate）は任意。未入力＝今日時点で施行されている法令（現行）で回答する。
// 過去日は受け付けない：法令データは各条文の旧版を保持しないスナップショットなので、過去時点を
// 指定しても「その時点の版が見つからない」ことが多く、答えられない日付を選ばせないためのガード。
export const lawRagFormSchema = z.object({
  question: z.string().trim().min(1, { message: '質問は必須です' }),
  asOfDate: z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), {
      message: '参照時点は YYYY-MM-DD 形式で入力してください',
    })
    .refine((v) => v === '' || v >= todayIso(), {
      message: '参照時点は今日以降の日付を指定してください',
    })
    .optional(),
});

export type LawRagFormSchema = z.infer<typeof lawRagFormSchema>;
