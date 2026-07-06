import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/dads/Button';
import { Checkbox } from '@/components/ui/dads/Checkbox';
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
  FileUploadViewportOverlay,
  FileUploadViewportOverlayMessage,
  fileUploadDefaultMessages,
  useFileUpload,
} from '@/components/ui/dads/FileUpload';
import { formatSize } from '@/components/ui/dads/FileUpload/utils';
import { Label } from '@/components/ui/dads/Label';
import { RequirementBadge } from '@/components/ui/dads/RequirementBadge';
import { SupportText } from '@/components/ui/dads/SupportText';
import { Textarea } from '@/components/ui/dads/Textarea';
import { useCodeInterpreter } from '../hooks/useCodeInterpreter';
import {
  CODE_INTERPRETER_ACCEPT,
  type CodeInterpreterFormSchema,
  codeInterpreterFormSchema,
} from '../schema';

const MAX_FILES = 5;

const customMessages = {
  ...fileUploadDefaultMessages,
  error: {
    ...fileUploadDefaultMessages.error,
    invalidType: '対応していないファイル形式です。CSV / Excel（.csv / .xlsx / .xls）が利用可能です。',
  },
};

export const CodeInterpreterForm = () => {
  const { loading, analyze } = useCodeInterpreter();

  const formId = useId();
  const labelId = `${formId}-label`;
  const buttonId = `${formId}-button`;
  const inputId = `${formId}-input`;
  const supportTextId = `${formId}-support-text`;
  const errorMessagesId = `${formId}-error-text`;
  const selectedFilesId = `${formId}-selected-files`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CodeInterpreterFormSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(codeInterpreterFormSchema),
  });

  const {
    files,
    inputRef,
    selectButtonRef,
    removeFile,
    handleSelectButtonClick,
    handleInputChange,
    isDragOver,
    isExpandedDropArea,
    showViewportOverlay,
    announcerText,
    announcerAssertiveText,
    handleExpandedDropAreaChange,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleViewportDragEnter,
    handleViewportDragOver,
    handleViewportDragLeave,
    handleViewportDrop,
  } = useFileUpload({
    maxFiles: MAX_FILES,
    accept: CODE_INTERPRETER_ACCEPT,
    droppable: true,
    dropAreaExpandable: true,
    messages: customMessages,
  });

  const hasFileItemError = files.some((f) => f.errors && f.errors.length > 0);
  const hasNoFile = files.length === 0;

  const onSubmit = handleSubmit((data) => {
    if (loading) {
      return;
    }
    // FileInfo.file（生 File）を集める。エラー付きファイルがある場合は実行しない。
    if (hasNoFile || hasFileItemError) {
      selectButtonRef.current?.focus();
      return;
    }
    const rawFiles = files.map((f) => f.file).filter((f): f is File => f instanceof File);
    if (rawFiles.length === 0) {
      selectButtonRef.current?.focus();
      return;
    }
    analyze(data.inputText, rawFiles);
  });

  return (
    <>
      <h2 className='sr-only'>データ分析フォーム</h2>
      <form onSubmit={onSubmit}>
        <div className='my-6 flex flex-col gap-2'>
          <Label id={labelId} htmlFor={inputId} size='lg'>
            データファイル
            <RequirementBadge>※必須</RequirementBadge>
          </Label>
          <SupportText id={supportTextId}>
            対応ファイル：CSV / Excel（.csv / .xlsx / .xls）
            <br />
            {MAX_FILES}ファイルまで、合計25MBまで選択可能。
          </SupportText>
          <FileUpload className='mt-2' maxFiles={MAX_FILES} hasError={hasFileItemError} droppable>
            <FileUploadInput
              id={inputId}
              name='data-file'
              accept={CODE_INTERPRETER_ACCEPT}
              multiple
              ref={inputRef}
              onChange={handleInputChange}
              aria-required={true}
            />

            <div className='sr-only' aria-live='polite'>
              {announcerText}
            </div>
            <div className='sr-only' aria-live='assertive'>
              {announcerAssertiveText}
            </div>

            <div>
              <FileUploadDropArea
                isDragOver={isDragOver}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className='flex flex-wrap items-center gap-y-2 gap-x-4'>
                  <Button
                    id={buttonId}
                    type='button'
                    variant='outline'
                    size='md'
                    className={`
                      shrink-0
                      group-data-[dragover=true]/drop-area:bg-blue-300 group-data-[dragover=true]/drop-area:text-blue-1200 group-data-[dragover=true]/drop-area:underline
                      group-data-[has-error=true]/file-upload:border-error-1
                    `}
                    onClick={handleSelectButtonClick}
                    ref={selectButtonRef}
                    aria-labelledby={`${labelId} ${buttonId}`}
                    aria-describedby={`${selectedFilesId} ${errorMessagesId} ${supportTextId}`}
                  >
                    ファイルを選択
                  </Button>
                  <p className='w-0 grow min-w-[12em]'>
                    または、このエリア内にドラッグ＆ドロップ
                  </p>
                </div>
                {files.length > 0 && (
                  <p id={selectedFilesId} className='mt-2'>
                    選択中：{files.length}個
                  </p>
                )}
                <p className='mt-12 -mb-4 -ml-1'>
                  <Checkbox
                    size='md'
                    checked={isExpandedDropArea}
                    onChange={(e) => handleExpandedDropAreaChange(e.target.checked)}
                  >
                    ドラッグ＆ドロップの範囲をこのブラウザウィンドウ全体に広げる
                  </Checkbox>
                </p>
              </FileUploadDropArea>

              {files.length === 0 && <p className='mt-4'>ファイルが選択されていません</p>}
              {files.length > 0 && (
                <FileUploadFileList>
                  {files.map((file, index) => {
                    const hasItemError = file.errors && file.errors.length > 0;
                    return (
                      <FileUploadFileItem key={file.id} data-id={file.id} hasError={hasItemError}>
                        <FileUploadFileMarker />
                        <FileUploadFileInfo>
                          <p>
                            <FileUploadFileName id={`${file.id}-name`}>
                              {file.name}
                            </FileUploadFileName>
                            <FileUploadFileMeta>
                              <span>{formatSize(file.size)}</span>（
                              <span>{file.size.toLocaleString()}</span>バイト）
                            </FileUploadFileMeta>
                          </p>
                          {hasItemError &&
                            file.errors?.map((error) => <p key={error}>＊{error}</p>)}
                        </FileUploadFileInfo>
                        <Button
                          id={`${file.id}-remove`}
                          type='button'
                          variant='text'
                          size='xs'
                          className='-order-1 shrink-0 min-w-12 min-h-[calc(30/16*1rem)] text-oln-16B-100'
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
            </div>

            {showViewportOverlay && (
              <FileUploadViewportOverlay
                onDragEnter={handleViewportDragEnter}
                onDragOver={handleViewportDragOver}
                onDragLeave={handleViewportDragLeave}
                onDrop={handleViewportDrop}
              >
                <FileUploadViewportOverlayMessage>
                  <span className='inline-block'>このエリア内にファイルを</span>
                  <span className='inline-block'>ドラッグ＆ドロップ</span>
                </FileUploadViewportOverlayMessage>
              </FileUploadViewportOverlay>
            )}
          </FileUpload>
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='code-interpreter-input-text' size='lg'>
            分析の指示
            <RequirementBadge>※必須</RequirementBadge>
          </Label>
          <SupportText id='code-interpreter-input-text-support'>
            どのような分析をしたいか、自然な文章で入力してください。
          </SupportText>
          <Textarea
            id='code-interpreter-input-text'
            rows={4}
            isError={!!errors.inputText}
            aria-describedby={
              errors.inputText
                ? 'code-interpreter-input-text-support code-interpreter-input-text-error'
                : 'code-interpreter-input-text-support'
            }
            {...register('inputText')}
          />
          {errors.inputText && (
            <ErrorText id='code-interpreter-input-text-error'>＊{errors.inputText.message}</ErrorText>
          )}
        </div>

        <div className='mt-4 flex justify-center'>
          <Button
            type='submit'
            variant='solid-fill'
            size='lg'
            className='w-60'
            aria-disabled={loading}
          >
            {loading ? '分析中...' : '実行'}
          </Button>
        </div>
      </form>
    </>
  );
};
