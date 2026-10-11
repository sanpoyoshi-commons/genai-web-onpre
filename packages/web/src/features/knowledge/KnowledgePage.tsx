import { PageTitle } from '@/components/PageTitle';
import { Divider } from '@/components/ui/dads/Divider';
import { APP_TITLE } from '@/constants';
import { LayoutBody } from '@/layout/LayoutBody';
import { AskPanel } from './components/AskPanel';
import { CollectionPanel } from './components/CollectionPanel';
import { DocumentPanel } from './components/DocumentPanel';
import { KnowledgeHeader } from './components/KnowledgeHeader';
import { SearchPanel } from './components/SearchPanel';
import { useKnowledgeStore } from './stores/useKnowledgeStore';

/**
 * ナレッジ集（汎用 RAG の専用ページ・法令調査と同じ形）。
 * 上から：ナレッジ集を選ぶ → 文書を入れる・見る → 検索だけ → 問う。
 * 検索と生成を分けてあるので、画面も別の段にして「何が選ばれたか」を先に見せる。
 */
export const KnowledgePage = () => {
  const { selectedCollectionId } = useKnowledgeStore();
  const noCollection = !selectedCollectionId;

  return (
    <LayoutBody>
      <PageTitle title={`ナレッジ集 | ${APP_TITLE}`} />
      <div className='mx-6 max-w-[calc(1024/16*1rem)] py-6 lg:mx-10 lg:pb-8'>
        <KnowledgeHeader />
        <Divider className='my-6' />

        <CollectionPanel />
        <Divider className='my-6' />

        <DocumentPanel />
        <Divider className='my-6' />

        <SearchPanel disabled={noCollection} />
        <Divider className='my-6' />

        <AskPanel disabled={noCollection} />
      </div>
    </LayoutBody>
  );
};
