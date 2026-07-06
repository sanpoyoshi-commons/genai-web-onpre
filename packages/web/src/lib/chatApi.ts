import {
  CreateChatResponse,
  CreateMessagesRequest,
  CreateMessagesResponse,
  PredictRequest,
  PredictResponse,
  PredictTitleRequest,
  PredictTitleResponse,
  UpdateTitleRequest,
  UpdateTitleResponse,
} from 'genai-web';
import { ApiError, genUApi } from '@/lib/fetcher';
import { getAccessToken } from '@/lib/oidc';
import { decomposeId } from '@/utils/decomposeId';

export const createChat = async () => {
  const res = await genUApi.post<CreateChatResponse>('chats', {});
  return res.data;
};

export const createMessages = async (_chatId: string, req: CreateMessagesRequest) => {
  const chatId = decomposeId(_chatId);
  const res = await genUApi.post<CreateMessagesResponse>(`chats/${chatId}/messages`, req);
  return res.data;
};

export const deleteChat = async (chatId: string) => {
  return genUApi.delete<void>(`chats/${chatId}`);
};

export const updateTitle = async (chatId: string, title: string) => {
  const req: UpdateTitleRequest = {
    title,
  };
  const res = await genUApi.put<UpdateTitleResponse>(`chats/${chatId}/title`, req);
  return res.data;
};

export const predict = async (req: PredictRequest): Promise<string> => {
  const res = await genUApi.post<PredictResponse>('predict', req);
  return res.data;
};

export async function* predictStream(req: PredictRequest) {
  // 本プロジェクトのローカル化：AWS Lambda 直叩き（InvokeWithResponseStream + Cognito Identity Pool）を
  // nginx 経由の `/api/predict/stream` fetch に置換。aud 厳格検証のため access token を送る。
  const token = await getAccessToken();
  if (!token) {
    throw new Error('認証されていません。');
  }

  const base = import.meta.env.VITE_APP_API_ENDPOINT;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const url = new URL(`${normalizedBase}/predict/stream`, window.location.origin);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(req),
  });

  if (!res.ok || !res.body) {
    const errorText = await res.text().catch(() => undefined);
    throw new ApiError(res.status, errorText);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      if (value) {
        // バックエンドの JSONL ストリームをそのまま yield する（行分割・JSON.parse は呼び出し側）。
        yield decoder.decode(value, { stream: true });
      }
    }
    const tail = decoder.decode();
    if (tail) {
      yield tail;
    }
  } finally {
    reader.releaseLock();
  }
}

export const predictTitle = async (req: PredictTitleRequest) => {
  const res = await genUApi.post<PredictTitleResponse>('predict/title', req);
  return res.data;
};
