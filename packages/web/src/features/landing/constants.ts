// トップページ直接チャット入力（LandingForm）のシステムプロンプト。
// 空文字（既定）の場合は LandingForm を表示しない（オプトイン機能）。
// 値は VITE_APP_TOP_CHAT_SYSTEM_PROMPT（ビルド時環境変数）で指定する。
export const TOP_CHAT_SYSTEM_PROMPT = import.meta.env.VITE_APP_TOP_CHAT_SYSTEM_PROMPT ?? '';
