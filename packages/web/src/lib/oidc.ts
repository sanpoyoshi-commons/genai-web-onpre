import { type User, UserManager, WebStorageStateStore } from 'oidc-client-ts';

/**
 * Keycloak OIDC クライアント（Authorization Code + PKCE S256）。
 *
 * 本プロジェクトのローカル化（Cognito/Amplify 置換）。public client `genai-web` で、ログイン UI は
 * Keycloak ホスト画面へリダイレクトする。aud=genai-api は Keycloak の default client scope
 * （genai-audience）で access token に付与されるため、API へは access token を Bearer で送る。
 *
 * - authority         : 例 `https://localhost/auth/realms/genai-realm`（nginx `/auth/` → keycloak）
 * - redirect_uri      : トップに戻し、AuthGuard が code を交換する
 * - token 保管        : sessionStorage（タブ単位・ブラウザ終了で消去）＋ refresh による自動更新
 */

const authority = import.meta.env.VITE_APP_OIDC_AUTHORITY;
const clientId = import.meta.env.VITE_APP_OIDC_CLIENT_ID;
const scope = import.meta.env.VITE_APP_OIDC_SCOPE ?? 'openid profile email';

export const userManager = new UserManager({
  authority,
  client_id: clientId,
  redirect_uri: `${window.location.origin}/`,
  post_logout_redirect_uri: `${window.location.origin}/signed-out`,
  response_type: 'code',
  scope,
  // PKCE S256 は code フローで oidc-client-ts が自動付与する。
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
  // refresh token による無音更新（hidden iframe ではなく refresh_token grant）。
  automaticSilentRenew: true,
  // OP の check-session iframe には依存しない（単一 OP・自己署名 TLS 環境の簡素化）。
  monitorSession: false,
});

/** 現在の認証ユーザー（未認証なら null）。 */
export const getUser = (): Promise<User | null> => userManager.getUser();

/**
 * API 送信用の access token。期限切れなら refresh で無音更新を試みる。
 * 取得できなければ undefined（呼び出し側は未認証として扱う）。
 */
export const getAccessToken = async (): Promise<string | undefined> => {
  const current = await userManager.getUser();
  if (current && !current.expired) {
    return current.access_token;
  }
  try {
    const renewed = await userManager.signinSilent();
    return renewed?.access_token;
  } catch {
    return undefined;
  }
};

/** Keycloak ログイン画面へリダイレクト。完了後は元のパスへ戻す。 */
export const login = (): Promise<void> =>
  userManager.signinRedirect({
    state: { returnTo: `${window.location.pathname}${window.location.search}` },
  });

/** Keycloak のログアウト（end-session）→ post_logout_redirect_uri（/signed-out）。 */
export const logout = (): Promise<void> => userManager.signoutRedirect();
