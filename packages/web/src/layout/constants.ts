import { type MenuItemProps } from '@/components/ui/Drawer';
import { isUseCaseEnabled } from '@/utils/isUseCaseEnabled';

// 機能 ON/OFF（compose profile 連動）。サイドメニューも routes/LandingPage と同様に
// isUseCaseEnabled で絞り、profile off の機能リンクを出さない（以前は静的配列＝transcribe 等が常時表示で
// 不整合だった）。chat は常時 on（base+llm 前提）。config.js は bundle より前に同期ロードされるため、
// module 評価時の isUseCaseEnabled は注入済み enabledUseCases を読める。
export const GEN_U_MENU_ITEMS: MenuItemProps[] = [
  {
    label: 'チャット',
    to: '/chat',
  },
  ...(isUseCaseEnabled('generate')
    ? [{ label: '文章を生成', to: '/generate' }]
    : []),
  ...(isUseCaseEnabled('translate') ? [{ label: '翻訳', to: '/translate' }] : []),
  ...(isUseCaseEnabled('transcribe')
    ? [{ label: '音声ファイルから文字起こし', to: '/transcribe' }]
    : []),
  ...(isUseCaseEnabled('codeInterpreter')
    ? [{ label: 'データ分析', to: '/code-interpreter' }]
    : []),
  // 法令調査（法令 RAG）は embedding profile（rag）連動。
  ...(isUseCaseEnabled('rag') ? [{ label: '法令調査', to: '/law-rag' }] : []),
];
