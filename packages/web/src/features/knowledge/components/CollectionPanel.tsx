import type { RagCollection } from 'genai-web';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/dads/Button';
import { Select } from '@/components/ui/dads/Select';
import { Label } from '@/components/ui/dads/Label';
import { SupportText } from '@/components/ui/dads/SupportText';
import { useCollections } from '../hooks/useCollections';
import { useKnowledgeStore } from '../stores/useKnowledgeStore';
import { DialogCollectionForm } from './DialogCollectionForm';
import { DialogDeleteCollection } from './DialogDeleteCollection';

/** ナレッジ集を選び、作成・名前の変更・削除を行う段。 */
export const CollectionPanel = () => {
  const { data, error, isLoading, mutate } = useCollections();
  const { selectedCollectionId, selectCollection } = useKnowledgeStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RagCollection | undefined>(undefined);
  const [showDelete, setShowDelete] = useState(false);

  const collections = data?.collections;
  const selected = collections?.find((c) => c.collectionId === selectedCollectionId);

  /**
   * 選択を一覧と噛み合わせる（描画の中ではなく副作用で行う）。
   *
   * - まだ何も選んでいなければ先頭を選ぶ（毎回選び直させない）
   * - **選んでいた id が一覧から消えていたら、残っている先頭（無ければ未選択）へ移す**
   *
   * 2 つ目が無いと、ナレッジ集を消した直後に消えた id を選び続け、文書の一覧が 404 になるのに
   * 前の行を表示したまま残る（2026-10-10 に画面で出た不具合）。
   */
  useEffect(() => {
    if (isLoading || collections === undefined) {
      return;
    }
    const first = collections[0]?.collectionId ?? null;
    if (selectedCollectionId === null) {
      if (first !== null) {
        selectCollection(first);
      }
      return;
    }
    if (!collections.some((c) => c.collectionId === selectedCollectionId)) {
      selectCollection(first);
    }
    // 依存は SWR の data そのもの（中身が変わらなければ identity も変わらない）。描画ごとに作り直す
    // 配列を依存にすると、この副作用が毎描画で走る。
  }, [isLoading, data, selectedCollectionId, selectCollection]);

  return (
    <section>
      <h2 className='text-std-18B-160'>ナレッジ集</h2>

      {error && <p className='mt-2 text-error-2'>ナレッジ集の一覧を読み込めませんでした。</p>}

      {!error && collections !== undefined && collections.length === 0 && !isLoading && (
        <SupportText className='mt-2'>
          まだナレッジ集がありません。作成してから文書を入れてください。
        </SupportText>
      )}

      <div className='mt-3 flex flex-wrap items-end gap-3'>
        {(collections?.length ?? 0) > 0 && (
          <div className='flex min-w-64 flex-col gap-1.5'>
            <Label htmlFor='knowledge-collection-select' size='md'>
              使うナレッジ集
            </Label>
            <Select
              id='knowledge-collection-select'
              blockSize='md'
              value={selectedCollectionId ?? ''}
              onChange={(e) => selectCollection(e.target.value || null)}
            >
              {collections?.map((c) => (
                <option key={c.collectionId} value={c.collectionId}>
                  {c.name}（{c.documentCount} 件）
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className='flex flex-wrap gap-2'>
          <Button
            type='button'
            variant='solid-fill'
            size='md'
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
          >
            作成
          </Button>
          <Button
            type='button'
            variant='outline'
            size='md'
            aria-disabled={!selected}
            onClick={() => {
              if (!selected) {
                return;
              }
              setEditing(selected);
              setShowForm(true);
            }}
          >
            名前の変更
          </Button>
          <Button
            type='button'
            variant='outline'
            size='md'
            aria-disabled={!selected}
            onClick={() => {
              if (selected) {
                setShowDelete(true);
              }
            }}
          >
            削除
          </Button>
        </div>
      </div>

      {selected?.description && (
        <p className='mt-3 text-std-16N-170 text-solid-gray-700'>{selected.description}</p>
      )}

      {showForm && (
        <DialogCollectionForm
          key={editing?.collectionId ?? 'new'}
          isOpen={showForm}
          collection={editing}
          onSaved={async (saved) => {
            setShowForm(false);
            await mutate();
            selectCollection(saved.collectionId);
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      <DialogDeleteCollection
        key={selected?.collectionId}
        isOpen={showDelete}
        collection={selected}
        onDeleted={async () => {
          setShowDelete(false);
          // 一覧を取り直してから、残っているナレッジ集（無ければ未選択）へ移す。
          // selectCollection は検索結果と回答も捨てるので、消した集の結果が残らない。
          const refreshed = await mutate();
          selectCollection(refreshed?.collections?.[0]?.collectionId ?? null);
        }}
        onClose={() => setShowDelete(false)}
      />
    </section>
  );
};
