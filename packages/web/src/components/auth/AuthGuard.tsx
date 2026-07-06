import React, { useEffect, useState } from 'react';
import { getUser, login, userManager } from '@/lib/oidc';
import { Button } from '../ui/dads/Button';
import { ProgressIndicator } from '../ui/dads/ProgressIndicator';

const isAuthSkipPath = (): boolean => {
  const path = window.location.pathname;
  return path === '/signed-out' || path === '/auth-error';
};

const hasAuthCallbackInUrl = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  return params.has('code') && params.has('state');
};

const hasOAuthErrorInUrl = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  return params.has('error') || params.has('error_description');
};

type Props = {
  children: React.ReactNode;
};

/**
 * Keycloak OIDC（Authorization Code + PKCE）の認証ガード。
 * 本プロジェクトのローカル化で Amplify Authenticator（AuthWithUserpool / AuthWithSAML）を置換。
 * ログイン UI は Keycloak ホスト画面へリダイレクトする。
 */
export const AuthGuard = (props: Props) => {
  const { children } = props;

  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;

    const finish = (ok: boolean) => {
      if (!active) return;
      setAuthenticated(ok);
      setLoading(false);
    };

    const run = async () => {
      // サインアウト後・認証エラーページは認証不要
      if (isAuthSkipPath()) {
        finish(false);
        return;
      }

      // Keycloak からのエラーリダイレクト
      if (hasOAuthErrorInUrl()) {
        window.location.replace('/auth-error');
        return;
      }

      try {
        // 認可コードの戻り（callback）なら token 交換 → 元のパスへ戻す
        if (hasAuthCallbackInUrl()) {
          const user = await userManager.signinRedirectCallback();
          const returnTo = (user?.state as { returnTo?: string } | undefined)?.returnTo;
          window.history.replaceState({}, '', returnTo && returnTo !== '/' ? returnTo : '/');
          finish(true);
          return;
        }

        // 既存セッション確認
        const user = await getUser();
        if (user && !user.expired) {
          finish(true);
          return;
        }

        // 未認証 → Keycloak ログイン画面へリダイレクト
        await login();
      } catch (e) {
        if (active) {
          setLoading(false);
          setAuthError(e instanceof Error ? e.message : '認証に失敗しました');
        }
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  // サインアウト後・認証エラーページは認証不要でレンダリング
  if (isAuthSkipPath() && !authenticated) {
    return <>{children}</>;
  }

  if (authError) {
    return (
      <div className='fixed inset-0 m-auto grid h-screen w-screen place-content-center'>
        <div className='flex flex-col items-center gap-8' role='alert'>
          <p className='text-std-18B-160 text-error-1'>{authError}</p>
          <Button
            size='lg'
            variant='solid-fill'
            onClick={() => {
              setAuthError(undefined);
              window.location.reload();
            }}
          >
            再試行
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='fixed inset-0 m-auto grid h-screen w-screen place-content-center'>
        <ProgressIndicator isLarge={true} label='読み込み中...' />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className='fixed inset-0 m-auto grid h-screen w-screen place-content-center'>
        <ProgressIndicator label='ログインページにリダイレクトします' />
      </div>
    );
  }

  return <>{children}</>;
};
