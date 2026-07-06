/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string;
  readonly VITE_APP_API_ENDPOINT: string;
  readonly VITE_APP_TEAM_ACCESS_CONTROL_API_ENDPOINT: string;
  // Keycloak OIDC (Authorization Code + PKCE S256). Cognito/Amplify から置換。
  readonly VITE_APP_OIDC_AUTHORITY: string;
  readonly VITE_APP_OIDC_CLIENT_ID: string;
  // 任意。未指定なら 'openid profile email'。aud=genai-api は Keycloak の
  // default client scope（genai-audience）で access token に付与される。
  readonly VITE_APP_OIDC_SCOPE?: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_MODEL_REGION: string;
  readonly VITE_APP_MODEL_IDS: string;
  readonly VITE_APP_IMAGE_MODEL_IDS: string;
  readonly VITE_APP_ENDPOINT_NAMES: string;
  readonly VITE_APP_USE_CASE_BUILDER_ENABLED: string;
  readonly VITE_APP_HIDDEN_USE_CASES: string;
  // トップページ直接チャット入力（LandingForm）のシステムプロンプト。空（既定）で当該フォームは非表示。
  readonly VITE_APP_TOP_CHAT_SYSTEM_PROMPT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// On-premise 実行時設定。nginx が /config.js で同期注入する（index.html 参照）。
// build 時焼き込み（import.meta.env.VITE_APP_*）より優先され、未注入時は env に
// フォールバックする。値は parse 済み配列（env は JSON 文字列なのと型が異なる）。
interface Window {
  __APP_CONFIG__?: {
    modelIds?: string[];
    imageGenModelIds?: string[];
    endpointNames?: string[];
    // 機能 ON/OFF（compose profile 連動）。nginx entrypoint が COMPOSE_PROFILES から
    // 算出して config.js に注入。isUseCaseEnabled がこれを最優先で読み、profile↔メニューを連動させる
    // （未注入時は build 時 VITE_APP_HIDDEN_USE_CASES へ fallback）。EnabledUseCases（@types/genai-web）と同形。
    enabledUseCases?: {
      chat?: boolean;
      generate?: boolean;
      translate?: boolean;
      diagram?: boolean;
      image?: boolean;
      transcribe?: boolean;
      rag?: boolean;
      apps?: boolean;
      codeInterpreter?: boolean;
    };
  };
}
