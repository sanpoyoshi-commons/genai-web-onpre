import { useCallback, useState } from 'react';
import { useKnowledgeApi } from './useKnowledgeApi';
import { knowledgeErrorMessage } from './useKnowledgeError';

/** 1 件分の投入の結果（画面にそのまま並べる）。 */
export type IngestOutcome = {
  name: string;
  /** ready＝チャンクまで作れた／failed＝本文が取れなかった／rejected＝取り込まなかった。 */
  state: 'ready' | 'failed' | 'rejected';
  charCount?: number;
  chunkCount?: number;
  message?: string;
};

/**
 * 文書の投入。原本を上げてから api に読ませる（同期）。
 *
 * 複数のファイルを選んだときは**1 件ずつ順に**投入する。1 文書の取り込みで埋め込みに時間がかかるので、
 * 並列に投げると埋め込みの待ち行列が伸びて、どれも返ってこないように見える。
 * 1 件が断られても残りは続ける（結果は 1 件ずつ画面に出す）。
 */
export const useIngestDocuments = (collectionId: string | null) => {
  const api = useKnowledgeApi();
  const [ingesting, setIngesting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [outcomes, setOutcomes] = useState<IngestOutcome[]>([]);

  /**
   * 前回の結果を捨てる。
   *
   * **同じ関数を返し続け、すでに空なら状態を触らない。** ナレッジ集を切り替えたときにこれを呼ぶ副作用が
   * あるので、毎描画で別の関数を返すと副作用が毎描画で走り、空配列を入れ直すたびに状態の同一性が変わって
   * 描画が止まらなくなる（2026-10-10 に画面が操作を受け付けなくなった原因）。
   */
  const clearOutcomes = useCallback(() => {
    setOutcomes((prev) => (prev.length === 0 ? prev : []));
  }, []);

  const ingestFiles = async (files: File[]): Promise<void> => {
    if (!collectionId || files.length === 0) {
      return;
    }
    setIngesting(true);
    setOutcomes([]);
    setProgress({ done: 0, total: files.length });
    const results: IngestOutcome[] = [];
    for (const [index, file] of files.entries()) {
      try {
        const bronzeKey = await api.uploadOriginal(collectionId, file);
        const res = await api.ingestDocument(collectionId, { bronzeKey });
        results.push({
          name: file.name,
          state: res.status === 'failed' ? 'failed' : 'ready',
          charCount: res.charCount,
          chunkCount: res.chunkCount,
          message: res.error,
        });
      } catch (err) {
        results.push({
          name: file.name,
          state: 'rejected',
          message: knowledgeErrorMessage(err, '取り込めませんでした。'),
        });
      }
      setOutcomes([...results]);
      setProgress({ done: index + 1, total: files.length });
    }
    setIngesting(false);
    setProgress(null);
  };

  const ingestText = async (title: string, text: string): Promise<void> => {
    if (!collectionId) {
      return;
    }
    setIngesting(true);
    setOutcomes([]);
    try {
      const res = await api.ingestDocument(collectionId, { title, text });
      setOutcomes([
        {
          name: title,
          state: res.status === 'failed' ? 'failed' : 'ready',
          charCount: res.charCount,
          chunkCount: res.chunkCount,
          message: res.error,
        },
      ]);
    } catch (err) {
      setOutcomes([
        {
          name: title,
          state: 'rejected',
          message: knowledgeErrorMessage(err, '取り込めませんでした。'),
        },
      ]);
    } finally {
      setIngesting(false);
    }
  };

  return { ingesting, progress, outcomes, ingestFiles, ingestText, clearOutcomes };
};
