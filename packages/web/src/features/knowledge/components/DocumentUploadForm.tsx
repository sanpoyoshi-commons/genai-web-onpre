import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/dads/Button';
import { ErrorText } from '@/components/ui/dads/ErrorText';
import {
  FileUpload,
  FileUploadDropArea,
  FileUploadFileInfo,
  FileUploadFileItem,
  FileUploadFileList,
  FileUploadFileMarker,
  FileUploadFileMeta,
  FileUploadFileName,
  FileUploadInput,
  fileUploadDefaultMessages,
  useFileUpload,
} from '@/components/ui/dads/FileUpload';
import { formatSize } from '@/components/ui/dads/FileUpload/utils';
import { Input } from '@/components/ui/dads/Input';
import { Label } from '@/components/ui/dads/Label';
import { SupportText } from '@/components/ui/dads/SupportText';
import { Textarea } from '@/components/ui/dads/Textarea';
import type { IngestOutcome } from '../hooks/useIngestDocuments';
import {
  KNOWLEDGE_ACCEPT,
  KNOWLEDGE_ALLOWED_EXT,
  type PasteTextFormSchema,
  pasteTextFormSchema,
} from '../schema';

const MAX_FILES = 5;

const customMessages = {
  ...fileUploadDefaultMessages,
  error: {
    ...fileUploadDefaultMessages.error,
    invalidType: `取り込めない形式です。${KNOWLEDGE_ALLOWED_EXT.join(' / ')} が利用できます。`,
  },
};

type Props = {
  disabled: boolean;
  /** 取り込み先のナレッジ集の名前（押す前に行き先が読めるようにする）。 */
  collectionName?: string;
  ingesting: boolean;
  progress: { done: number; total: number } | null;
  outcomes: IngestOutcome[];
  onIngestFiles: (files: File[]) => void;
  onIngestText: (title: string, text: string) => void;
};

/**
 * 文書の投入（ファイルを落とす／テキストを貼る）。取り込みは同期なので、終わるまで待つ。
 *
 * 取り込み先のナレッジ集の名前を、見出しと押すボタンの両方に出す（押す直前に行き先が読めるように）。
 */
export const DocumentUploadForm = (props: Props) => {
  const { disabled, collectionName, ingesting, progress, outcomes, onIngestFiles, onIngestText } =
    props;
  // 取り込み先を添える文（名前が取れないときは添えない）。
  const into = collectionName ? `「${collectionName}」に` : '';

  const formId = useId();
  const inputId = `${formId}-input`;
  const labelId = `${formId}-label`;
  const supportTextId = `${formId}-support`;

  const {
    files,
    inputRef,
    selectButtonRef,
    removeFile,
    handleSelectButtonClick,
    handleInputChange,
    isDragOver,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useFileUpload({
    maxFiles: MAX_FILES,
    accept: KNOWLEDGE_ACCEPT,
    droppable: true,
    messages: customMessages,
  });

  const hasFileItemError = files.some((f) => f.errors && f.errors.length > 0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasteTextFormSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(pasteTextFormSchema),
  });

  const submitText = handleSubmit((data) => {
    if (disabled || ingesting) {
      return;
    }
    onIngestText(data.title, data.text);
    reset();
  });

  return (
    <section className='mt-6'>
      <h3 className='text-std-16B-150'>
        文書を入れる{collectionName && `（取り込み先：${collectionName}）`}
      </h3>
      {disabled && <SupportText className='mt-2'>先にナレッジ集を選んでください。</SupportText>}

      <div className='mt-3 flex flex-col gap-2'>
        <Label id={labelId} htmlFor={inputId} size='md'>
          ファイル
        </Label>
        <SupportText id={supportTextId}>
          取り込める形式：{KNOWLEDGE_ALLOWED_EXT.join(' / ')}
          （画像は文字が取れないため入れられません）。 一度に {MAX_FILES}{' '}
          件まで選べます（ナレッジ集に入れられる総数の上限ではありません）。
          大きい文書は取り込みに数分かかります。
        </SupportText>
        <FileUpload className='mt-1' maxFiles={MAX_FILES} hasError={hasFileItemError} droppable>
          <FileUploadInput
            id={inputId}
            name='knowledge-file'
            accept={KNOWLEDGE_ACCEPT}
            multiple
            ref={inputRef}
            onChange={handleInputChange}
          />
          <FileUploadDropArea
            isDragOver={isDragOver}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className='flex flex-wrap items-center gap-y-2 gap-x-4'>
              <Button
                type='button'
                variant='outline'
                size='md'
                className='shrink-0'
                onClick={handleSelectButtonClick}
                ref={selectButtonRef}
                aria-describedby={supportTextId}
                aria-disabled={disabled || ingesting}
              >
                ファイルを選択
              </Button>
              <p className='w-0 grow min-w-[12em]'>または、このエリア内にドラッグ＆ドロップ</p>
            </div>
          </FileUploadDropArea>

          {files.length > 0 && (
            <FileUploadFileList>
              {files.map((file, index) => {
                const hasItemError = file.errors && file.errors.length > 0;
                return (
                  <FileUploadFileItem key={file.id} data-id={file.id} hasError={hasItemError}>
                    <FileUploadFileMarker />
                    <FileUploadFileInfo>
                      <p>
                        <FileUploadFileName id={`${file.id}-name`}>{file.name}</FileUploadFileName>
                        <FileUploadFileMeta>
                          <span>{formatSize(file.size)}</span>
                        </FileUploadFileMeta>
                      </p>
                      {hasItemError && file.errors?.map((e) => <p key={e}>＊{e}</p>)}
                    </FileUploadFileInfo>
                    <Button
                      id={`${file.id}-remove`}
                      type='button'
                      variant='text'
                      size='xs'
                      className='-order-1 shrink-0 min-w-12 text-oln-16B-100'
                      onClick={() => removeFile(file.id, index)}
                      aria-labelledby={`${file.id}-remove ${file.id}-name`}
                    >
                      解除
                    </Button>
                  </FileUploadFileItem>
                );
              })}
            </FileUploadFileList>
          )}
        </FileUpload>

        <div className='mt-2'>
          <Button
            type='button'
            variant='solid-fill'
            size='md'
            aria-disabled={disabled || ingesting || files.length === 0 || hasFileItemError}
            onClick={() => {
              if (disabled || ingesting || hasFileItemError) {
                return;
              }
              const raw = files.map((f) => f.file).filter((f): f is File => f instanceof File);
              if (raw.length > 0) {
                onIngestFiles(raw);
              }
            }}
          >
            {ingesting ? '取り込み中...' : `${into}取り込む`}
          </Button>
          {progress && (
            <span className='ml-3 text-std-16N-170'>
              {progress.done} / {progress.total} 件
            </span>
          )}
        </div>
      </div>

      <form className='mt-6 flex flex-col gap-1.5' onSubmit={submitText}>
        <Label htmlFor='knowledge-paste-title' size='md'>
          テキストを貼る
        </Label>
        <SupportText id='knowledge-paste-support'>
          貼った本文も、取り込みの元としてそのまま保存します（後で作り直せます）。
        </SupportText>
        <Input
          id='knowledge-paste-title'
          placeholder='タイトル'
          isError={!!errors.title}
          aria-describedby='knowledge-paste-support'
          aria-label='貼る文書のタイトル'
          {...register('title')}
        />
        {errors.title && <ErrorText>＊{errors.title.message}</ErrorText>}
        <Textarea
          id='knowledge-paste-text'
          rows={5}
          isError={!!errors.text}
          aria-label='貼る本文'
          {...register('text')}
        />
        {errors.text && <ErrorText>＊{errors.text.message}</ErrorText>}
        <div>
          <Button type='submit' variant='outline' size='md' aria-disabled={disabled || ingesting}>
            {ingesting ? '取り込み中...' : `${into}テキストを取り込む`}
          </Button>
        </div>
      </form>

      {outcomes.length > 0 && (
        <div className='mt-4 rounded-8 border border-solid-gray-420 p-4'>
          <h4 className='text-std-16B-150'>取り込みの結果</h4>
          <ul className='mt-2 flex flex-col gap-1'>
            {outcomes.map((o) => (
              <li key={o.name} className={o.state === 'ready' ? '' : 'text-error-2'}>
                {o.name}：
                {o.state === 'ready' &&
                  `取り込みました（${o.charCount?.toLocaleString()} 文字・${o.chunkCount} チャンク）`}
                {o.state === 'failed' && `本文を取り出せませんでした（${o.message}）`}
                {o.state === 'rejected' && `取り込みませんでした（${o.message}）`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
