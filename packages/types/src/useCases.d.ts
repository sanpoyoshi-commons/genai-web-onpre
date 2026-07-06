export type HiddenUseCases = {
  generate?: boolean;
  translate?: boolean;
  image?: boolean;
  diagram?: boolean;
};

export type HiddenUseCasesKeys = keyof HiddenUseCases;

// 機能 ON/OFF（compose profile 連動）。nginx が config.js で注入する
// window.__APP_CONFIG__.enabledUseCases（COMPOSE_PROFILES 由来のホワイトリスト）の型。
// build 時の HiddenUseCases（反転ロジック）の後継で、chat/transcribe/rag を含む全機能キーを網羅する。
// isUseCaseEnabled は注入値を最優先し、未注入（dev）では HiddenUseCases へ後方互換 fallback する。
export type EnabledUseCases = {
  chat?: boolean;
  generate?: boolean;
  translate?: boolean;
  diagram?: boolean;
  image?: boolean;
  transcribe?: boolean;
  rag?: boolean;
  // AIアプリ（ExApps）の非同期実行（queue profile＝elasticmq+worker 依存）。閲覧・作成は常時可だが、
  // 実行は queue が無いと完了しないため `apps` キーでゲートする。
  apps?: boolean;
  // Code Interpreter（任意コード実行・sandbox profile＝NsJail サンドボックス依存）。off なら api が 503。
  // nginx config.js / api（resolveEnabledUseCases）は既に本キーを算出・出力しており、web 型を整合させる。
  // UI 表出（メニュー/ルート）は backend 先行のため後続で追加する。
  codeInterpreter?: boolean;
};

export type UseCaseKey = keyof EnabledUseCases;
