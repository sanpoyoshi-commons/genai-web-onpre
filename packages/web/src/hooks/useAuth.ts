import useSWR from 'swr';
import { getUser } from '@/lib/oidc';

/**
 * JWT ペイロード（base64url・UTF-8 安全）をデコードする。
 * oidc-client-ts は id_token の claim のみ `user.profile` に展開するため、
 * access token の claim（cognito:groups 等）は本関数でデコードして読む。
 */
const decodeJwtPayload = (jwt?: string): Record<string, unknown> => {
  if (!jwt) return {};
  try {
    const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
};

/**
 * 認証セッション取得。本プロジェクトのローカル化で `fetchAuthSession`（Amplify/Cognito）を
 * Keycloak OIDC に置換。既存の consumer（Header / useTeamAuth / useFetchLoginUser）が
 * `data.tokens.idToken.payload.sub` / `data.tokens.accessToken.payload['cognito:groups']`
 * を参照するため、Cognito 互換 shape に写像して返す（claim 名は K-互換で同名）。
 */
export const useAuth = () => {
  return useSWR('user', async () => {
    const user = await getUser();
    if (!user) return null;
    return {
      tokens: {
        idToken: { payload: user.profile as Record<string, unknown> },
        accessToken: { payload: decodeJwtPayload(user.access_token) },
      },
    };
  });
};
