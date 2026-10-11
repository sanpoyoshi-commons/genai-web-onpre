import { zodResolver } from '@hookform/resolvers/zod';
import type { RagCollection } from 'genai-web';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  CustomDialog,
  CustomDialogBody,
  CustomDialogHeader,
  CustomDialogPanel,
} from '@/components/ui/CustomDialog';
import { Button } from '@/components/ui/dads/Button';
import { ErrorText } from '@/components/ui/dads/ErrorText';
import { Input } from '@/components/ui/dads/Input';
import { Label } from '@/components/ui/dads/Label';
import { RequirementBadge } from '@/components/ui/dads/RequirementBadge';
import { SupportText } from '@/components/ui/dads/SupportText';
import { Textarea } from '@/components/ui/dads/Textarea';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useKnowledgeApi } from '../hooks/useKnowledgeApi';
import { knowledgeErrorMessage } from '../hooks/useKnowledgeError';
import { type CollectionFormSchema, collectionFormSchema } from '../schema';

type Props = {
  isOpen: boolean;
  /** 指定があれば名前の変更、無ければ作成。 */
  collection?: RagCollection;
  onSaved: (collection: RagCollection) => void;
  onClose: () => void;
};

/** ナレッジ集の作成と名前の変更（同じ入力なので 1 つのダイアログで兼ねる）。 */
export const DialogCollectionForm = (props: Props) => {
  const { isOpen, collection, onSaved, onClose } = props;
  const api = useKnowledgeApi();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CollectionFormSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: collection?.name ?? '',
      description: collection?.description ?? '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (saving) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = collection
        ? await api.updateCollection(collection.collectionId, {
            name: data.name,
            description: data.description ?? '',
          })
        : await api.createCollection({
            name: data.name,
            ...(data.description ? { description: data.description } : {}),
          });
      onSaved(saved);
    } catch (err) {
      setError(knowledgeErrorMessage(err, 'ナレッジ集を保存できませんでした。'));
    } finally {
      setSaving(false);
    }
  });

  return (
    <CustomDialog isOpen={isOpen} onClose={onClose}>
      <CustomDialogPanel>
        <CustomDialogHeader hasClose onClose={onClose}>
          {collection ? 'ナレッジ集の名前の変更' : 'ナレッジ集の作成'}
        </CustomDialogHeader>
        <CustomDialogBody>
          <form onSubmit={onSubmit}>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='knowledge-collection-name' size='md'>
                名前
                <RequirementBadge>※必須</RequirementBadge>
              </Label>
              <SupportText id='knowledge-collection-name-support'>
                同じ名前のナレッジ集は作れません。
              </SupportText>
              <Input
                id='knowledge-collection-name'
                isError={!!errors.name}
                aria-describedby='knowledge-collection-name-support'
                {...register('name')}
              />
              {errors.name && <ErrorText>＊{errors.name.message}</ErrorText>}
            </div>

            <div className='mt-4 flex flex-col gap-1.5'>
              <Label htmlFor='knowledge-collection-description' size='md'>
                説明
              </Label>
              <Textarea
                id='knowledge-collection-description'
                rows={3}
                isError={!!errors.description}
                {...register('description')}
              />
              {errors.description && <ErrorText>＊{errors.description.message}</ErrorText>}
            </div>

            {error && (
              <div className='mt-4 rounded-6 bg-red-50 p-4 text-error-1'>
                <p>{error}</p>
              </div>
            )}

            <div className='mt-6 flex justify-between gap-2'>
              <Button data-autofocus type='button' variant='text' size='md' onClick={onClose}>
                キャンセル
              </Button>
              <LoadingButton
                type='submit'
                variant='solid-fill'
                size='md'
                className='min-w-32 justify-center'
                loading={saving}
              >
                {collection ? '変更' : '作成'}
              </LoadingButton>
            </div>
          </form>
        </CustomDialogBody>
      </CustomDialogPanel>
    </CustomDialog>
  );
};
