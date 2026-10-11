import { isApiError } from '@/lib/fetcher';

/**
 * api のエラーを画面の 1 行にする。api のエラー応答は `{ error: string }`
 * （genai-ai-api-onpre の createApiHandler の errorHandler が整形する）。
 */
export const knowledgeErrorMessage = (error: unknown, fallback: string): string => {
  if (isApiError(error)) {
    const data = error.data as { error?: string } | undefined;
    return data?.error ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};
