import { z } from 'zod';

// ナレッジ集の画面の入力。最終の検証は api（genai-ai-api-onpre の routes/rag/schemas.ts）が担うが、
// UI でも同じ上限で早めに弾く（往復を減らす）。長さの上限は api の schema と同じ数にする。

export const COLLECTION_NAME_MAX = 100;
export const COLLECTION_DESCRIPTION_MAX = 1000;
export const DOCUMENT_TITLE_MAX = 200;
export const SEARCH_QUERY_MAX = 1000;

/** 取り込める形式（api の抽出器が読めるものだけ。画像は文字が取れないので入れない）。 */
export const KNOWLEDGE_ALLOWED_EXT = [
  '.pdf',
  '.docx',
  '.xlsx',
  '.txt',
  '.md',
  '.csv',
  '.html',
  '.htm',
] as const;

/** input[accept] と DADS の useFileUpload に渡す形（カンマ区切り）。 */
export const KNOWLEDGE_ACCEPT = KNOWLEDGE_ALLOWED_EXT.join(',');

export const collectionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: '名前は必須です' })
    .max(COLLECTION_NAME_MAX, {
      message: `名前は${COLLECTION_NAME_MAX}文字以内で入力してください`,
    }),
  description: z
    .string()
    .trim()
    .max(COLLECTION_DESCRIPTION_MAX, {
      message: `説明は${COLLECTION_DESCRIPTION_MAX}文字以内で入力してください`,
    })
    .optional(),
});

export type CollectionFormSchema = z.infer<typeof collectionFormSchema>;

export const pasteTextFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'タイトルは必須です' })
    .max(DOCUMENT_TITLE_MAX, {
      message: `タイトルは${DOCUMENT_TITLE_MAX}文字以内で入力してください`,
    }),
  text: z.string().trim().min(1, { message: '本文は必須です' }),
});

export type PasteTextFormSchema = z.infer<typeof pasteTextFormSchema>;

export const searchFormSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, { message: '検索する言葉は必須です' })
    .max(SEARCH_QUERY_MAX, {
      message: `検索する言葉は${SEARCH_QUERY_MAX}文字以内で入力してください`,
    }),
});

export type SearchFormSchema = z.infer<typeof searchFormSchema>;

export const askFormSchema = z.object({
  question: z.string().trim().min(1, { message: '質問は必須です' }),
});

export type AskFormSchema = z.infer<typeof askFormSchema>;
