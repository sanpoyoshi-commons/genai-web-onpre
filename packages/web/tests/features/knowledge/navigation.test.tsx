import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KnowledgePage } from '../../../src/features/knowledge/KnowledgePage';
import { useKnowledgeStore } from '../../../src/features/knowledge/stores/useKnowledgeStore';
import { Layout } from '../../../src/layout/Layout';

// Layout ごと描くために、画面の外の作り（認証・ログアウト）だけ差し替える。
vi.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({ user: { profile: { name: 'tester' } }, isAuthenticated: true }),
}));
vi.mock('../../../src/lib/oidc', () => ({
  logout: vi.fn(),
  getAccessToken: vi.fn().mockResolvedValue('token'),
}));

// 画面は api を呼ぶので、一覧の取得だけ差し替える（遷移の筋道だけを見る）。
vi.mock('../../../src/features/knowledge/hooks/useCollections', () => ({
  useCollections: () => ({
    data: {
      collections: [
        {
          collectionId: 'a',
          name: 'テストA',
          description: null,
          mcpEnabled: false,
          documentCount: 1,
          createdAt: '2026-10-10T00:00:00Z',
          updatedAt: '2026-10-10T00:00:00Z',
        },
      ],
    },
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
  }),
}));
vi.mock('../../../src/features/knowledge/hooks/useDocuments', () => ({
  useDocuments: () => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn() }),
}));
vi.mock('../../../src/hooks/useSelectedModel', () => ({
  useSelectedModel: () => ({ selectedModelId: '', setSelectedModelId: vi.fn() }),
}));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path='knowledge' element={<KnowledgePage />} />
          <Route path='chat' element={<p>チャットの画面</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('ナレッジ集の画面からの移動', () => {
  beforeEach(() => {
    useKnowledgeStore.getState().selectCollection(null);
  });

  it('ナレッジ集を開いた後、メニューのリンクでほかの画面へ移れる', async () => {
    renderAt('/knowledge');
    expect(screen.getByRole('heading', { level: 1, name: 'ナレッジ集' })).toBeTruthy();

    // サイドメニューと携帯用メニューの両方に同じリンクが出るので、先頭を押す。
    screen.getAllByRole('link', { name: 'チャット' })[0]?.click();

    expect(await screen.findByText('チャットの画面')).toBeTruthy();
  });

  it('ナレッジ集を開いただけでは、画面を覆う要素も inert も出ない', () => {
    const { container } = renderAt('/knowledge');
    // 閉じているダイアログの背景が残っていると、クリックが画面に届かない。
    expect(container.querySelectorAll('[class*="fixed inset-0"]')).toHaveLength(0);
    expect(document.querySelectorAll('[inert]')).toHaveLength(0);
    expect(document.querySelectorAll('[aria-hidden="true"][data-headlessui-portal]')).toHaveLength(
      0,
    );
  });
});
