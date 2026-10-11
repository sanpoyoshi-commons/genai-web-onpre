import type { RagKnowledgeDocument } from 'genai-web';
import { useState } from 'react';
import {
  CustomDialog,
  CustomDialogBody,
  CustomDialogHeader,
  CustomDialogPanel,
} from '@/components/ui/CustomDialog';
import { Button } from '@/components/ui/dads/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useKnowledgeApi } from '../hooks/useKnowledgeApi';
import { knowledgeErrorMessage } from '../hooks/useKnowledgeError';

type Props = {
  isOpen: boolean;
  document?: RagKnowledgeDocument;
  onDeleted: () => void;
  onClose: () => void;
};

/** 文書の削除の確認（原本・取り出したテキスト・検索用のデータをそろえて消す）。 */
export const DialogDeleteDocument = (props: Props) => {
  const { isOpen, document, onDeleted, onClose } = props;
  const api = useKnowledgeApi();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!document || deleting) {
      return;
    }
    setDeleting(true);
    setError('');
    try {
      await api.deleteDocument(document.documentId);
      onDeleted();
    } catch (err) {
      setError(knowledgeErrorMessage(err, '文書を削除できませんでした。'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <CustomDialog isOpen={isOpen} onClose={onClose}>
      <CustomDialogPanel>
        <CustomDialogHeader>文書の削除</CustomDialogHeader>
        <CustomDialogBody>
          <p>文書「{document?.title}」を削除しますか？</p>
          <p className='mt-2'>
            原本・取り出したテキスト・検索用のデータのすべてが消えます。元に戻せません。
          </p>

          {error && (
            <div className='mt-4 rounded-6 bg-red-50 p-4 text-error-1'>
              <p>{error}</p>
            </div>
          )}

          <div className='mt-6 flex justify-between gap-2'>
            <Button data-autofocus variant='text' size='md' onClick={onClose}>
              キャンセル
            </Button>
            <LoadingButton
              variant='solid-fill'
              size='md'
              className='min-w-32 items-center justify-center bg-error-1!'
              loading={deleting}
              onClick={() => handleDelete()}
            >
              {deleting ? '削除中' : '削除'}
            </LoadingButton>
          </div>
        </CustomDialogBody>
      </CustomDialogPanel>
    </CustomDialog>
  );
};
