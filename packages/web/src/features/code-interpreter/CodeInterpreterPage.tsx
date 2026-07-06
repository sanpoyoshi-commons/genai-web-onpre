import { PageTitle } from '@/components/PageTitle';
import { Divider } from '@/components/ui/dads/Divider';
import { APP_TITLE } from '@/constants';
import { useLiveStatusMessage } from '@/hooks/useLiveStatusMessage';
import { LayoutBody } from '@/layout/LayoutBody';
import { CodeInterpreterForm } from './components/CodeInterpreterForm';
import { CodeInterpreterHeader } from './components/CodeInterpreterHeader';
import { CodeInterpreterResult } from './components/CodeInterpreterResult';
import { useCodeInterpreter } from './hooks/useCodeInterpreter';

export const CodeInterpreterPage = () => {
  const { loading } = useCodeInterpreter();

  const { liveStatusMessage } = useLiveStatusMessage({
    isAssistant: true,
    loading,
    content: '分析が完了しました。分析結果をご確認ください。',
  });

  return (
    <LayoutBody>
      <PageTitle title={`データ分析 | ${APP_TITLE}`} />
      <div className='mx-6 max-w-[calc(1024/16*1rem)] py-6 lg:mx-10 lg:pb-8'>
        <CodeInterpreterHeader />
        <Divider className='my-6' />
        <CodeInterpreterForm />

        <Divider className='my-3 lg:my-6' />

        <CodeInterpreterResult />
      </div>
      <div aria-live='assertive' aria-atomic='true' className='sr-only'>
        {liveStatusMessage}
      </div>
    </LayoutBody>
  );
};
