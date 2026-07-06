import type { RouteObject } from 'react-router';
import { ChatPage } from '@/features/chat/ChatPage';
import { ChatHistoryPage } from '@/features/chat-history/ChatHistoryPage';
import { CodeInterpreterPage } from '@/features/code-interpreter/CodeInterpreterPage';
import { ExAppPage } from '@/features/exapp/ExAppPage';
import { ExAppsPage } from '@/features/exapps/ExAppsPage';
import { GenerateDiagramPage } from '@/features/generate-diagram/GenerateDiagramPage';
import { GenerateImagePage } from '@/features/generate-image/GenerateImagePage';
import { GenerateTextPage } from '@/features/generate-text/GenerateTextPage';
import { LandingPage } from '@/features/landing/LandingPage';
import { LawRagPage } from '@/features/law-rag/LawRagPage';
import { TeamAppCopyPage } from '@/features/team-apps/copy/TeamAppCopyPage';
import { TeamAppCreatePage } from '@/features/team-apps/create/TeamAppCreatePage';
import { TeamAppEditPage } from '@/features/team-apps/edit/TeamAppEditPage';
import { TeamAppsPage } from '@/features/team-apps/TeamAppsPage';
import { TeamMemberCreatePage } from '@/features/team-members/create/TeamMemberCreatePage';
import { TeamMemberEditPage } from '@/features/team-members/edit/TeamMemberEditPage';
import { TeamMembersPage } from '@/features/team-members/TeamMembersPage';
import { TeamCreatePage } from '@/features/teams/create/TeamCreatePage';
import { TeamEditPage } from '@/features/teams/edit/TeamEditPage';
import { TeamsPage } from '@/features/teams/TeamsPage';
import { TranscribePage } from '@/features/transcribe/TranscribePage';
import { TranslatePage } from '@/features/translate/TranslatePage';
import { NotFound } from '@/NotFound';
import { ApiRequestDataFormatPage } from '@/pages/ApiRequestDataFormat';
import { isUseCaseEnabled } from '@/utils/isUseCaseEnabled';
import { Layout } from './layout/Layout';
import { AuthErrorPage } from './pages/AuthErrorPage';
import { DietAnswerDraftingAiSkillsPage } from './pages/DietAnswerDraftingAiSkillsPage';
import { SignedOutPage } from './pages/SignedOutPage';

export const createRoutes = (): RouteObject[] => {
  return [
    {
      path: '/signed-out',
      element: <SignedOutPage />,
    },
    {
      path: '/auth-error',
      element: <AuthErrorPage />,
    },
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <LandingPage /> },
        {
          path: 'apps',
          element: <ExAppsPage />,
        },
        { path: 'apps/:teamId/:exAppId', element: <ExAppPage /> },
        {
          path: 'chat',
          element: <ChatPage />,
        },
        {
          path: 'chat/:chatId',
          element: <ChatPage />,
        },
        { path: 'history', element: <ChatHistoryPage /> },
        isUseCaseEnabled('generate') ? { path: 'generate', element: <GenerateTextPage /> } : null,
        isUseCaseEnabled('translate') ? { path: 'translate', element: <TranslatePage /> } : null,
        isUseCaseEnabled('image') ? { path: 'image', element: <GenerateImagePage /> } : null,
        isUseCaseEnabled('diagram') ? { path: 'diagram', element: <GenerateDiagramPage /> } : null,
        // 音声認識は whisper（profile transcribe）依存。profile off 時は経路ごと無効化し、
        // 「メニュー非表示なのに経路だけ生きて壊れる」導線を防ぐ（不整合解消）。
        isUseCaseEnabled('transcribe')
          ? { path: 'transcribe', element: <TranscribePage /> }
          : null,
        // データ分析（Code Interpreter）は NsJail サンドボックス（profile sandbox）依存。
        // profile off 時は経路ごと無効化し、メニュー非表示と整合させる（api は 503）。
        isUseCaseEnabled('codeInterpreter')
          ? { path: 'code-interpreter', element: <CodeInterpreterPage /> }
          : null,
        // 法令調査（法令 RAG）は embedding profile（rag）依存＝汎用 RAG と同じ埋め込みスタックを使うため
        // 専用キーを設けず 'rag' で連動させる。profile off 時は api が 403/503。
        isUseCaseEnabled('rag') ? { path: 'law-rag', element: <LawRagPage /> } : null,
        { path: 'teams', element: <TeamsPage /> },
        { path: 'teams/create', element: <TeamCreatePage /> },
        {
          path: 'teams/:teamId/edit',
          element: <TeamEditPage />,
        },
        {
          path: 'teams/:teamId/members',
          element: <TeamMembersPage />,
        },
        {
          path: 'teams/:teamId/members/create',
          element: <TeamMemberCreatePage />,
        },
        {
          path: 'teams/:teamId/members/:userId/edit',
          element: <TeamMemberEditPage />,
        },
        {
          path: 'teams/:teamId/apps',
          element: <TeamAppsPage />,
        },
        {
          path: 'teams/:teamId/apps/create',
          element: <TeamAppCreatePage />,
        },
        {
          path: 'teams/:teamId/apps/:appId/edit',
          element: <TeamAppEditPage />,
        },
        {
          path: 'teams/:teamId/apps/:appId/copy',
          element: <TeamAppCopyPage />,
        },
        { path: 'docs/api-request-data-format', element: <ApiRequestDataFormatPage /> },
        {
          path: 'skillsets/diet-answer-drafting',
          element: <DietAnswerDraftingAiSkillsPage />,
        },
        { path: '*', element: <NotFound /> },
      ].flatMap((r) => (r ? [r] : [])),
    },
  ].flatMap((r) => (r ? [r] : []));
};
