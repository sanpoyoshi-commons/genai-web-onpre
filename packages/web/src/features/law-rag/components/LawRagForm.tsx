import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/dads/Button';
import { ErrorText } from '@/components/ui/dads/ErrorText';
import { Input } from '@/components/ui/dads/Input';
import { Label } from '@/components/ui/dads/Label';
import { RequirementBadge } from '@/components/ui/dads/RequirementBadge';
import { SupportText } from '@/components/ui/dads/SupportText';
import { Textarea } from '@/components/ui/dads/Textarea';
import { useSelectedModel } from '@/hooks/useSelectedModel';
import { findModelDisplayNameByModelId, MODELS } from '@/models';
import { useLawRag } from '../hooks/useLawRag';
import { type LawRagFormSchema, lawRagFormSchema } from '../schema';
import { todayIso } from '../utils/asOf';

export const LawRagForm = () => {
  const { loading, ask } = useLawRag();
  const { selectedModelId, setSelectedModelId } = useSelectedModel();
  const { modelIds: availableModels } = MODELS;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LawRagFormSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(lawRagFormSchema),
  });

  const onSubmit = handleSubmit((data) => {
    if (loading) {
      return;
    }
    ask(data.question, selectedModelId, data.asOfDate?.trim() || undefined);
  });

  return (
    <>
      <h2 className='sr-only'>法令調査フォーム</h2>
      <form onSubmit={onSubmit}>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='law-rag-question' size='lg'>
            質問
            <RequirementBadge>※必須</RequirementBadge>
          </Label>
          <SupportText id='law-rag-question-support'>
            調べたい法令の論点を、自然な文章で入力してください。
          </SupportText>
          <Textarea
            id='law-rag-question'
            rows={4}
            isError={!!errors.question}
            aria-describedby={
              errors.question
                ? 'law-rag-question-support law-rag-question-error'
                : 'law-rag-question-support'
            }
            {...register('question')}
          />
          {errors.question && (
            <ErrorText id='law-rag-question-error'>＊{errors.question.message}</ErrorText>
          )}
        </div>

        <div className='mt-6 flex flex-col gap-1.5'>
          <Label htmlFor='law-rag-as-of-date' size='lg'>
            参照時点
          </Label>
          <SupportText id='law-rag-as-of-date-support'>
            未入力の場合は、今日時点で施行されている法令（現行）で回答します。将来の日付を指定すると、その時点で施行されている版（未施行の改正後条文）で回答します。過去の日付は指定できません。
          </SupportText>
          <Input
            id='law-rag-as-of-date'
            type='date'
            className='w-56'
            min={todayIso()}
            isError={!!errors.asOfDate}
            aria-describedby={
              errors.asOfDate
                ? 'law-rag-as-of-date-support law-rag-as-of-date-error'
                : 'law-rag-as-of-date-support'
            }
            {...register('asOfDate')}
          />
          {errors.asOfDate && (
            <ErrorText id='law-rag-as-of-date-error'>＊{errors.asOfDate.message}</ErrorText>
          )}
        </div>

        {availableModels.length > 0 && (
          <div className='mt-6'>
            <CustomSelect
              isVertical
              isFullWidth
              selectSize='md'
              label='使用するLLM'
              labelClassName='text-std-16B-150'
              description='法令調査は出典付き回答を生成するためモデル性能の影響が大きいです。精度重視なら高性能モデル、速度優先なら小型モデルを選択してください。CPU のみの環境では応答に数分かかる場合があります。'
              value={selectedModelId}
              onChange={setSelectedModelId}
              options={availableModels.map((m) => ({
                value: m,
                label: findModelDisplayNameByModelId(m),
              }))}
            />
          </div>
        )}

        <div className='mt-6 flex justify-center'>
          <Button
            type='submit'
            variant='solid-fill'
            size='lg'
            className='w-60'
            aria-disabled={loading}
          >
            {loading ? '調査中...' : '実行'}
          </Button>
        </div>
      </form>
    </>
  );
};
