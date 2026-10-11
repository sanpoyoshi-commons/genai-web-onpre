import type {
  CreateRagCollectionRequest,
  RagAskRequest,
  RagAskResponse,
  IngestRagDocumentRequest,
  IngestRagDocumentResponse,
  ListRagCollectionsResponse,
  ListRagDocumentsResponse,
  RagCollection,
  RagQueryRequest,
  RagQueryResponse,
  RagSearchRequest,
  RagSearchResponse,
  UpdateRagCollectionRequest,
} from 'genai-web';
import { extractStorageKey } from '@/lib/fileApi';
import { genUApi, uploadToSignedUrl } from '@/lib/fetcher';

/**
 * ナレッジ集の API（-onpre 新規）。すべて embedding プロファイル（use case rag）の内側。
 *
 * ファイルの投入は、チャットの添付と同じ経路を使う＝api に署名付き URL を出させ、ブラウザから
 * ストレージへ直に上げ、そのキーを api へ渡す。**キーは URL から `extractStorageKey` で取り出す**
 * （path 形式の URL ではパスの先頭がバケット名になるため、pathname をそのままキーにすると
 * api の所有者の判定で弾かれる。2026-09-27 に直した扱いを崩さない）。
 */
export const useKnowledgeApi = () => {
  return {
    listCollections: async () => {
      const res = await genUApi.get<ListRagCollectionsResponse>('rag/collections');
      return res.data;
    },
    createCollection: async (req: CreateRagCollectionRequest) => {
      const res = await genUApi.post<RagCollection>('rag/collections', req);
      return res.data;
    },
    updateCollection: async (collectionId: string, req: UpdateRagCollectionRequest) => {
      const res = await genUApi.put<RagCollection>(
        `rag/collections/${encodeURIComponent(collectionId)}`,
        req,
      );
      return res.data;
    },
    deleteCollection: async (collectionId: string) => {
      await genUApi.delete<void>(`rag/collections/${encodeURIComponent(collectionId)}`);
    },
    listDocuments: async (collectionId: string) => {
      const res = await genUApi.get<ListRagDocumentsResponse>(
        `rag/collections/${encodeURIComponent(collectionId)}/documents`,
      );
      return res.data;
    },
    ingestDocument: async (collectionId: string, req: IngestRagDocumentRequest) => {
      const res = await genUApi.post<IngestRagDocumentResponse>(
        `rag/collections/${encodeURIComponent(collectionId)}/documents`,
        req,
      );
      return res.data;
    },
    deleteDocument: async (documentId: string) => {
      await genUApi.delete<void>(`rag/documents/${encodeURIComponent(documentId)}`);
    },
    /** 原本を上げて、api が読めるキーを返す。 */
    uploadOriginal: async (collectionId: string, file: File) => {
      const signed = await genUApi.post<string>(
        `rag/collections/${encodeURIComponent(collectionId)}/uploads`,
        { filename: file.name },
      );
      const signedUrl = signed.data;
      await uploadToSignedUrl(signedUrl, file, 'file/*');
      const bronzeKey = extractStorageKey(signedUrl);
      if (!bronzeKey) {
        throw new Error('アップロード先の場所を読み取れませんでした。');
      }
      return bronzeKey;
    },
    search: async (req: RagSearchRequest) => {
      const res = await genUApi.post<RagSearchResponse>('rag/search', req);
      return res.data;
    },
    query: async (req: RagQueryRequest) => {
      const res = await genUApi.post<RagQueryResponse>('rag/query', req);
      return res.data;
    },
    // 回答と参照を構造で受け取る（引用番号にチャンク本文を結び付けるため）。
    // 検索と生成は /rag/query と同じ処理を通り、違うのは返す形だけ。
    ask: async (req: RagAskRequest) => {
      const res = await genUApi.post<RagAskResponse>('rag/ask', req);
      return res.data;
    },
  };
};
