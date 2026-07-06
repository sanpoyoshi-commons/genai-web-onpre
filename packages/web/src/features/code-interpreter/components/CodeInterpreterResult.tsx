import { useRef } from 'react';
import { Markdown } from '@/components/Markdown';
import { ButtonCopy } from '@/components/ui/ButtonCopy';
import { ProgressIndicator } from '@/components/ui/dads/ProgressIndicator';
import { getFileExtension } from '@/features/exapp/utils/getFileExtension';
import { useCodeInterpreter } from '../hooks/useCodeInterpreter';

export const CodeInterpreterResult = () => {
  const { response, loading, error } = useCodeInterpreter();
  const copyTextRef = useRef<HTMLDivElement>(null);

  const hasArtifacts = response !== null && response.artifacts.length > 0;
  const isInitial = !loading && !error && !response;
  const showResult = !loading && !error && response !== null;

  return (
    <>
      <h2 className='sr-only'>分析結果</h2>
      <div
        className={`relative mt-5 rounded-8 border p-4 ${error ? 'border-error-2' : 'border-solid-gray-420'}`}
      >
        {isInitial && (
          <div className='leading-175 text-solid-gray-536'>分析結果は、ここに表示されます</div>
        )}

        {error && <p className='text-error-2'>{error}</p>}

        {response && (
          <div ref={copyTextRef}>
            <Markdown>{response.outputs}</Markdown>
          </div>
        )}

        {hasArtifacts && (
          <div className='mt-4 space-y-4'>
            {response?.artifacts.map((artifact, index) => {
              if (!artifact.content) {
                return null;
              }
              return (
                <img
                  className='my-4 h-auto w-fit max-w-full object-contain'
                  src={`data:image/${getFileExtension(artifact.display_name)};base64,${artifact.content}`}
                  alt={artifact.display_name}
                  key={`${artifact.display_name}-${index}`}
                />
              );
            })}
          </div>
        )}

        {loading && <ProgressIndicator className='my-0.5' />}

        {showResult && (
          <div className='-mb-2 flex w-full justify-end'>
            <ButtonCopy text={response.outputs} targetRef={copyTextRef} />
          </div>
        )}
      </div>
    </>
  );
};
