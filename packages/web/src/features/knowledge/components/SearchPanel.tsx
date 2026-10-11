import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/dads/Button';
import { ErrorText } from '@/components/ui/dads/ErrorText';
import { Input } from '@/components/ui/dads/Input';
import { Label } from '@/components/ui/dads/Label';
import { RequirementBadge } from '@/components/ui/dads/RequirementBadge';
import { SupportText } from '@/components/ui/dads/SupportText';
import { useKnowledgeSearch } from '../hooks/useKnowledgeSearch';
import { type SearchFormSchema, searchFormSchema } from '../schema';

type Props = {
  disabled: boolean;
};

/**
 * チャンク検索確認（生成しない）。選ばれたチャンク・スコア・文書名を並べる。
 *
 * **チャンク本文は文字列としてそのまま描画する**（Markdown や HTML として解釈させない）。
 * 取り込んだ文書は信用できない入力であり、見せるのは「検索で何が選ばれたか」そのものだから。
 */
export const SearchPanel = (props: Props) => {
  const { disabled } = props;
  const { searchResults, searching, searchError, search } = useKnowledgeSearch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(searchFormSchema),
  });

  const onSubmit = handleSubmit((data) => {
    if (disabled || searching) {
      return;
    }
    search(data.query);
  });

  return (
    <section>
      <h2 className='text-std-18B-160'>チャンク検索確認</h2>
      <SupportText className='mt-1'>
        生成AIを使わず、検索で選ばれたチャンク（文書を切り分けた断片）とスコアをそのまま表示します。質問する前に、狙った箇所が拾えているかを目で確かめるための段です。
      </SupportText>

      <form className='mt-3 flex flex-col gap-1.5' onSubmit={onSubmit}>
        <Label htmlFor='knowledge-search-query' size='md'>
          検索する言葉
          <RequirementBadge>※必須</RequirementBadge>
        </Label>
        <Input id='knowledge-search-query' isError={!!errors.query} {...register('query')} />
        {errors.query && <ErrorText>＊{errors.query.message}</ErrorText>}
        <div>
          <Button
            type='submit'
            variant='solid-fill'
            size='md'
            aria-disabled={disabled || searching}
          >
            {searching ? '検索中...' : '検索'}
          </Button>
        </div>
      </form>

      {searchError && <p className='mt-3 text-error-2'>{searchError}</p>}

      {!searchError && searchResults !== null && searchResults.length === 0 && (
        <p className='mt-3'>0 件でした。</p>
      )}

      {!searchError && searchResults !== null && searchResults.length > 0 && (
        <ol className='mt-3 flex flex-col gap-3'>
          {searchResults.map((r, i) => (
            <li
              key={`${r.documentId}-${r.chunkIndex}`}
              className='rounded-8 border border-solid-gray-420 p-3'
            >
              <div className='flex flex-wrap items-baseline justify-between gap-2'>
                <p className='text-std-16B-150 wrap-anywhere'>
                  {i + 1}. {r.title}
                  {r.headerPath && (
                    <span className='font-normal text-solid-gray-600'> / {r.headerPath}</span>
                  )}
                </p>
                <p className='text-std-16N-170 text-solid-gray-600'>
                  スコア {r.score.toFixed(4)}
                  {r.rerankScore !== undefined && `（並べ替え ${r.rerankScore.toFixed(4)}）`}／{' '}
                  {r.chunkIndex} 番目のチャンク
                </p>
              </div>
              {/* 文字列として描画する（dangerouslySetInnerHTML も Markdown も使わない）。 */}
              <p className='mt-2 whitespace-pre-wrap wrap-anywhere text-std-16N-170'>{r.text}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};
