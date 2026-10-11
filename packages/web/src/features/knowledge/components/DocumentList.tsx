import type { RagKnowledgeDocument } from 'genai-web';
import { useState } from 'react';
import { Button } from '@/components/ui/dads/Button';
import { SupportText } from '@/components/ui/dads/SupportText';
import { DialogDeleteDocument } from './DialogDeleteDocument';

type Props = {
  documents: RagKnowledgeDocument[];
  isLoading: boolean;
  error: unknown;
  onDeleted: () => void;
};

const formatBytes = (bytes: number | null): string =>
  bytes === null ? '-' : `${bytes.toLocaleString()} バイト`;

/**
 * 文書の一覧（タイトル・形式・文字数・チャンク数・状態・日時）と削除。
 *
 * **取得が失敗したときは行を 1 つも出さない。** 取得の仕組み（SWR）は失敗しても前の値を持ち続けるので、
 * そのまま渡すと、消えたナレッジ集の文書が「読み込めませんでした」と並んで残る（2026-10-10 に画面で
 * 出た不具合）。残った行の削除は 404 になり、利用者から見て嘘の一覧になる。
 */
export const DocumentList = (props: Props) => {
  const { isLoading, error, onDeleted } = props;
  const documents = error ? [] : props.documents;
  const [target, setTarget] = useState<RagKnowledgeDocument | undefined>(undefined);

  return (
    <section className='mt-6'>
      <h3 className='text-std-16B-150'>入っている文書</h3>

      {!!error && <p className='mt-2 text-error-2'>文書の一覧を読み込めませんでした。</p>}
      {isLoading && <SupportText className='mt-2'>読み込んでいます...</SupportText>}
      {!isLoading && !error && documents.length === 0 && (
        <SupportText className='mt-2'>まだ文書がありません。</SupportText>
      )}

      {documents.length > 0 && (
        <div className='mt-3 overflow-x-auto'>
          <table className='w-full min-w-[48rem] border-collapse text-std-16N-170'>
            <thead>
              <tr className='border-b border-solid-gray-420 text-left'>
                <th scope='col' className='py-2 pr-3'>
                  タイトル
                </th>
                <th scope='col' className='py-2 pr-3'>
                  形式
                </th>
                <th scope='col' className='py-2 pr-3 text-right'>
                  文字数
                </th>
                <th scope='col' className='py-2 pr-3 text-right'>
                  チャンク数
                </th>
                <th scope='col' className='py-2 pr-3'>
                  状態
                </th>
                <th scope='col' className='py-2 pr-3'>
                  取り込んだ日時
                </th>
                <th scope='col' className='py-2'>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.documentId} className='border-b border-solid-gray-300 align-top'>
                  <td className='py-2 pr-3 wrap-anywhere'>
                    {d.title}
                    {d.originalFilename && d.originalFilename !== d.title && (
                      <span className='block text-solid-gray-600'>{d.originalFilename}</span>
                    )}
                    <span className='block text-solid-gray-600'>{formatBytes(d.byteSize)}</span>
                  </td>
                  <td className='py-2 pr-3 wrap-anywhere'>{d.mime ?? '-'}</td>
                  <td className='py-2 pr-3 text-right'>{d.charCount?.toLocaleString() ?? '-'}</td>
                  <td className='py-2 pr-3 text-right'>{d.chunkCount.toLocaleString()}</td>
                  <td className='py-2 pr-3'>
                    {d.status === 'ready' ? (
                      <span>取り込み済み</span>
                    ) : (
                      <span className='text-error-2'>本文を取り出せませんでした</span>
                    )}
                    {d.status === 'failed' && d.error && (
                      <span className='block text-solid-gray-600'>{d.error}</span>
                    )}
                    {/* 原本の無い文書は、抽出もチャンクも作り直せない（画面が無かった時期に
                        API から入った文書）。消して入れ直すしかないことを伝える。 */}
                    {!d.hasBronze && (
                      <span className='block text-solid-gray-600'>
                        原本がないため作り直しできません
                      </span>
                    )}
                  </td>
                  <td className='py-2 pr-3'>{new Date(d.createdAt).toLocaleString('ja-JP')}</td>
                  <td className='py-2'>
                    <Button
                      type='button'
                      variant='text'
                      size='xs'
                      className='min-w-12 text-oln-16B-100'
                      onClick={() => setTarget(d)}
                    >
                      削除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DialogDeleteDocument
        key={target?.documentId}
        isOpen={target !== undefined}
        document={target}
        onDeleted={() => {
          setTarget(undefined);
          onDeleted();
        }}
        onClose={() => setTarget(undefined)}
      />
    </section>
  );
};
