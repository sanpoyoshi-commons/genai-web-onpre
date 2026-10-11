import type { RagAskRequest } from 'genai-web';
import { useKnowledgeStore } from '../stores/useKnowledgeStore';
import { useKnowledgeApi } from './useKnowledgeApi';
import { knowledgeErrorMessage } from './useKnowledgeError';

/**
 * 汎用RAG質問（POST /rag/ask）。検索して、その抜粋を踏まえた答えを 1 回の生成で返す。
 * 回答と参照（引用番号・文書名・見出し・チャンク本文・スコア）を分けて受け取り、画面が引用番号に
 * チャンク本文を結び付けられるようにする。検索と生成そのものは /rag/query と同じ処理を通る。
 */
export const useKnowledgeAsk = () => {
  const api = useKnowledgeApi();
  const { selectedCollectionId, answer, asking, askError, setAnswer, setAsking, setAskError } =
    useKnowledgeStore();

  const ask = async (question: string, modelId?: string) => {
    setAsking(true);
    setAskError(null);
    setAnswer(null);
    try {
      const req: RagAskRequest = {
        question,
        ...(modelId ? { model: { modelId } } : {}),
        ...(selectedCollectionId ? { collectionIds: [selectedCollectionId] } : {}),
      };
      setAnswer(await api.ask(req));
    } catch (err) {
      setAskError(knowledgeErrorMessage(err, '回答の生成でエラーが発生しました。'));
    } finally {
      setAsking(false);
    }
  };

  return { answer, asking, askError, ask };
};
