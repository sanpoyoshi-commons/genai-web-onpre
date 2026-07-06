import { z } from 'zod';

// 法令 RAG（法令調査）フォーム。質問は必須。
// 最終検証は api 側（genai-ai-api-onpre の lawRag/schemas.ts＝question.min(1)）が担うが、UI でも早期に弾く。
export const lawRagFormSchema = z.object({
  question: z.string().trim().min(1, { message: '質問は必須です' }),
});

export type LawRagFormSchema = z.infer<typeof lawRagFormSchema>;
