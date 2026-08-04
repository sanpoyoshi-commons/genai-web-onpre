import { useRef } from 'react';
import { Markdown } from '@/components/Markdown';
import { ButtonCopy } from '@/components/ui/ButtonCopy';
import { useLawRag } from '../hooks/useLawRag';
import { LawRagVersions } from './LawRagVersions';

export const LawRagResult = () => {
  const { response, loading, error } = useLawRag();
  const copyTextRef = useRef<HTMLDivElement>(null);

  const isInitial = !loading && !error && !response;

  return (
    <>
      <h2 className='sr-only'>調査結果</h2>
      <div
        className={`relative mt-5 rounded-8 border p-4 ${error ? 'border-error-2' : 'border-solid-gray-420'}`}
      >
        {isInitial && (
          <div className='leading-175 text-solid-gray-536'>調査結果は、ここに表示されます</div>
        )}

        {loading && (
          <div className='leading-175 text-solid-gray-536'>
            法令を検索し、レポートを生成しています。法令全文を対象とするため時間がかかる場合があります...
          </div>
        )}

        {error && <p className='text-error-2'>{error}</p>}

        {!loading && !error && response && (
          <>
            <div className='absolute right-2 top-2'>
              <ButtonCopy text={response.outputs} targetRef={copyTextRef} />
            </div>
            <div ref={copyTextRef}>
              <Markdown>{response.outputs}</Markdown>
            </div>
            {/* 版の一覧はコピー対象（copyTextRef）の外に置く＝コピーされるのはレポート本文のみ。 */}
            <LawRagVersions response={response} />
          </>
        )}
      </div>
    </>
  );
};
