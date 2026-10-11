import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { ButtonCopy } from '@/components/ui/ButtonCopy';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/dads/Button';
import { ErrorText } from '@/components/ui/dads/ErrorText';
import { Label } from '@/components/ui/dads/Label';
import { RequirementBadge } from '@/components/ui/dads/RequirementBadge';
import { SupportText } from '@/components/ui/dads/SupportText';
import { Textarea } from '@/components/ui/dads/Textarea';
import { useSelectedModel } from '@/hooks/useSelectedModel';
import { findModelDisplayNameByModelId, MODELS } from '@/models';
import { useKnowledgeAsk } from '../hooks/useKnowledgeAsk';
import { type AskFormSchema, askFormSchema } from '../schema';
import { AnswerWithCitations } from './AnswerWithCitations';

type Props = {
  disabled: boolean;
};

/**
 * 汎用RAG質問。検索した抜粋を踏まえた回答を 1 回の生成で返し、回答の中の引用から
 * その根拠のチャンク本文を引けるようにする。
 */
export const AskPanel = (props: Props) => {
  const { disabled } = props;
  const { answer, asking, askError, ask } = useKnowledgeAsk();
  const { selectedModelId, setSelectedModelId } = useSelectedModel();
  const { modelIds: availableModels } = MODELS;
  const copyTextRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AskFormSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(askFormSchema),
  });

  const onSubmit = handleSubmit((data) => {
    if (disabled || asking) {
      return;
    }
    ask(data.question, selectedModelId);
  });

  return (
    <section>
      <h2 className='text-std-18B-160'>汎用RAG質問</h2>
      <SupportText className='mt-1'>
        選んだナレッジ集を検索し、見つかった箇所をもとに生成AIが回答します。回答の中の引用（[1]
        など）にカーソルを当てるか、キーボードで選ぶか、タップすると、根拠になった箇所の本文が出ます。CPU
        のみの環境では、回答に時間がかかります。
      </SupportText>

      <form className='mt-3 flex flex-col gap-1.5' onSubmit={onSubmit}>
        <Label htmlFor='knowledge-ask-question' size='md'>
          質問
          <RequirementBadge>※必須</RequirementBadge>
        </Label>
        <Textarea
          id='knowledge-ask-question'
          rows={3}
          isError={!!errors.question}
          {...register('question')}
        />
        {errors.question && <ErrorText>＊{errors.question.message}</ErrorText>}

        {availableModels.length > 0 && (
          <div className='mt-3'>
            <CustomSelect
              isVertical
              isFullWidth
              selectSize='md'
              label='使用するLLM'
              labelClassName='text-std-16B-150'
              value={selectedModelId}
              onChange={setSelectedModelId}
              options={availableModels.map((m) => ({
                value: m,
                label: findModelDisplayNameByModelId(m),
              }))}
            />
          </div>
        )}

        <div className='mt-3'>
          <Button type='submit' variant='solid-fill' size='md' aria-disabled={disabled || asking}>
            {asking ? '回答中...' : '質問する'}
          </Button>
        </div>
      </form>

      <div
        className={`relative mt-4 rounded-8 border p-4 ${askError ? 'border-error-2' : 'border-solid-gray-420'}`}
      >
        {!asking && !askError && !answer && (
          <p className='text-solid-gray-536'>回答は、ここに表示されます</p>
        )}
        {asking && <p className='text-solid-gray-536'>検索して回答を生成しています...</p>}
        {askError && <p className='text-error-2'>{askError}</p>}
        {!asking && !askError && answer && (
          <>
            <div className='absolute right-2 top-2'>
              <ButtonCopy text={answer.answer} targetRef={copyTextRef} />
            </div>
            <div ref={copyTextRef}>
              <AnswerWithCitations
                className='[&>*:first-child]:pr-28'
                answer={answer.answer}
                references={answer.references}
              />
            </div>
            {answer.references.length > 0 && (
              <div className='mt-4 border-t border-solid-gray-300 pt-3'>
                <h3 className='text-std-16B-150'>根拠にした箇所</h3>
                <ol className='mt-2 flex flex-col gap-1'>
                  {answer.references.map((r) => (
                    <li key={`${r.documentId}-${r.chunkIndex}`} className='wrap-anywhere'>
                      [{r.n}] {r.title}
                      {r.headerPath && (
                        <span className='text-solid-gray-600'> / {r.headerPath}</span>
                      )}
                      <span className='text-solid-gray-600'>
                        {' '}
                        （{r.chunkIndex} 番目のチャンク／スコア {r.score.toFixed(4)}）
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
