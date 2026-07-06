import type { CodeInterpreterInputFile, CodeInterpreterRequest } from 'genai-web';
import { convertFileToBase64 } from '@/features/exapp/utils/convertFileToBase64';
import { isApiError } from '@/lib/fetcher';
import { useCodeInterpreterStore } from '../stores/useCodeInterpreterStore';
import { useCodeInterpreterApi } from './useCodeInterpreterApi';

// api のエラーレスポンスは { error: string }（createApiHandler の errorHandler が整形）。
const errorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    const data = error.data as { error?: string } | undefined;
    return data?.error ?? 'コード実行サービスでエラーが発生しました。';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '予期しないエラーが発生しました。';
};

export const useCodeInterpreter = () => {
  const api = useCodeInterpreterApi();
  const { response, loading, error, setResponse, setLoading, setError, clear } =
    useCodeInterpreterStore();

  const analyze = async (inputText: string, files: File[]) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const inputFiles: CodeInterpreterInputFile[] = await Promise.all(
        files.map(async (file) => ({
          filename: file.name,
          content: await convertFileToBase64(file),
        })),
      );

      const req: CodeInterpreterRequest = {
        inputs: {
          input_text: inputText,
          // 源内標準 IF 互換のため単一グループにまとめる（key は api では破棄される）。
          files: inputFiles.length > 0 ? [{ key: 'file_input', files: inputFiles }] : [],
        },
      };

      const res = await api.responses(req);
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
    analyze,
    clear,
  };
};
