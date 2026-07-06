import { z } from 'zod';

// データ分析（Code Interpreter）フォーム。指示文は必須、ファイルは CSV/Excel 限定。
// 拡張子の最終検証は api 側（genai-ai-api-onpre の zod schema）が担うが、UI でも早期に弾く。
export const CODE_INTERPRETER_ALLOWED_EXT = ['.csv', '.xlsx', '.xls'] as const;

export const CODE_INTERPRETER_ACCEPT = CODE_INTERPRETER_ALLOWED_EXT.join(',');

export const hasAllowedExt = (filename: string): boolean => {
  const lower = filename.toLowerCase();
  return CODE_INTERPRETER_ALLOWED_EXT.some((ext) => lower.endsWith(ext));
};

export const codeInterpreterFormSchema = z.object({
  inputText: z.string().trim().min(1, { message: '分析の指示は必須です' }),
});

export type CodeInterpreterFormSchema = z.infer<typeof codeInterpreterFormSchema>;
