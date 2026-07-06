import { PageTitle } from '@/components/PageTitle';
import { Divider } from '@/components/ui/dads/Divider';
import { APP_TITLE } from '@/constants';
import { useLiveStatusMessage } from '@/hooks/useLiveStatusMessage';
import { LayoutBody } from '@/layout/LayoutBody';
import { LawRagForm } from './components/LawRagForm';
import { LawRagHeader } from './components/LawRagHeader';
import { LawRagResult } from './components/LawRagResult';
import { useLawRag } from './hooks/useLawRag';

export const LawRagPage = () => {
  const { loading } = useLawRag();

  const { liveStatusMessage } = useLiveStatusMessage({
    isAssistant: true,
    loading,
    content: '調査が完了しました。調査結果をご確認ください。',
  });

  return (
    <LayoutBody>
      <PageTitle title={`法令調査 | ${APP_TITLE}`} />
      <div className='mx-6 max-w-[calc(1024/16*1rem)] py-6 lg:mx-10 lg:pb-8'>
        <LawRagHeader />
        <Divider className='my-6' />
        <LawRagForm />

        <Divider className='my-3 lg:my-6' />

        <LawRagResult />
      </div>
      <div aria-live='assertive' aria-atomic='true' className='sr-only'>
        {liveStatusMessage}
      </div>
    </LayoutBody>
  );
};
