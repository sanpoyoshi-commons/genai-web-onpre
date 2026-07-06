import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router';
import { FILE_LIMIT } from '@/features/chat/constants';
import { useChat } from '@/hooks/useChat';
import { MODELS } from '@/models';

export const useFileUploadable = () => {
  const { chatId } = useParams();
  const { pathname } = useLocation();

  const { getModelId } = useChat(pathname, chatId);

  const modelId = getModelId();

  const accept = useMemo(() => {
    if (!modelId) {
      return [];
    }

    // ローカルモデル（Ollama 等）は modelMetadata に未登録のことがあるため防御的に参照する。
    // 未登録時は feature=undefined → アップロード非対応として accept=[] を返す（crash させない）。
    const feature = MODELS.modelMetadata[modelId]?.flags;
    return [
      ...(feature?.doc ? FILE_LIMIT.accept.doc : []),
      ...(feature?.image ? FILE_LIMIT.accept.image : []),
      ...(feature?.video ? FILE_LIMIT.accept.video : []),
    ];
  }, [modelId]);

  const fileUploadable = accept.length > 0;

  return {
    accept,
    fileUploadable,
  };
};
