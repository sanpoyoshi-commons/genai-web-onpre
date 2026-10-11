import { useEffect } from 'react';
import { useCollections } from '../hooks/useCollections';
import { useDocuments } from '../hooks/useDocuments';
import { useIngestDocuments } from '../hooks/useIngestDocuments';
import { useKnowledgeStore } from '../stores/useKnowledgeStore';
import { DocumentList } from './DocumentList';
import { DocumentUploadForm } from './DocumentUploadForm';

/**
 * 文書の投入と一覧（選んでいるナレッジ集に対して行う）。
 *
 * ナレッジ集を切り替えたら、選んだファイルの並びと前回の取り込みの結果を捨てる。残しておくと、
 * 切り替えた後に「取り込む」を押して意図しないナレッジ集へ入れてしまう（2026-10-10 の気づき）。
 * 並びは投入の form が持つので `key` で作り直し、結果はここで捨てる。
 */
export const DocumentPanel = () => {
  const { selectedCollectionId } = useKnowledgeStore();
  const { data: collectionData } = useCollections();
  const { data, error, isLoading, mutate } = useDocuments(selectedCollectionId);
  const { ingesting, progress, outcomes, ingestFiles, ingestText, clearOutcomes } =
    useIngestDocuments(selectedCollectionId);

  useEffect(() => {
    clearOutcomes();
  }, [selectedCollectionId, clearOutcomes]);

  const disabled = !selectedCollectionId;
  const collectionName = collectionData?.collections.find(
    (c) => c.collectionId === selectedCollectionId,
  )?.name;

  return (
    <section>
      <h2 className='text-std-18B-160'>文書</h2>

      <DocumentUploadForm
        // ナレッジ集を切り替えたら作り直す＝選んだファイルの並びを持ち越さない。
        key={selectedCollectionId ?? 'none'}
        disabled={disabled}
        collectionName={collectionName}
        ingesting={ingesting}
        progress={progress}
        outcomes={outcomes}
        onIngestFiles={async (files) => {
          await ingestFiles(files);
          await mutate();
        }}
        onIngestText={async (title, text) => {
          await ingestText(title, text);
          await mutate();
        }}
      />

      <DocumentList
        documents={data?.documents ?? []}
        isLoading={isLoading}
        error={error}
        onDeleted={() => {
          void mutate();
        }}
      />
    </section>
  );
};
