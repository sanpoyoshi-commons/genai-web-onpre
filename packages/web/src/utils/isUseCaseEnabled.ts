import { EnabledUseCases, HiddenUseCases, UseCaseKey } from 'genai-web';

// 機能 ON/OFF（compose profile 連動）。優先順位は防御的読み（models.ts の
// resolveModelIds と同方針）：
//   1) window.__APP_CONFIG__.enabledUseCases（nginx が config.js で注入・COMPOSE_PROFILES 由来）を
//      最優先（ホワイトリスト方式＝未定義キーは off）。profile を ON にすればメニューも自動 ON。
//   2) 未注入（dev／config.js 非配信）のときのみ、build 時 VITE_APP_HIDDEN_USE_CASES（反転ロジック）へ
//      後方互換 fallback。HiddenUseCases に無いキー（chat/transcribe/rag）は従来どおり常時 on 扱い。
const enabled: EnabledUseCases | undefined = window.__APP_CONFIG__?.enabledUseCases;

const parseHiddenUseCases = (): HiddenUseCases => {
  try {
    return JSON.parse(import.meta.env.VITE_APP_HIDDEN_USE_CASES ?? '{}') as HiddenUseCases;
  } catch {
    return {};
  }
};
const hiddenUseCases = parseHiddenUseCases();

export const isUseCaseEnabled = (...useCases: UseCaseKey[]): boolean =>
  useCases.every((useCase) =>
    enabled ? (enabled[useCase] ?? false) : !hiddenUseCases[useCase as keyof HiddenUseCases],
  );
