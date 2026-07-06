/**
 * AI アプリ（ExApp）エンドポイント URL の検証。
 *
 * 公開運用では https を推奨（安全側）だが、ローカル運用（docker compose）では自作 ExApp が
 * http://localhost や http://host.docker.internal、内部コンテナ名（http://echo-app:3000）、
 * プライベート IP（192.168.x.x 等）で動くため、これらを許容する。実際の宛先制御（SSRF ガード）は
 * api 側の EXAPP_ALLOW_PRIVATE_ENDPOINTS / EXAPP_ENDPOINT_ALLOWLIST が担う（web はフォーム UX のみ）。
 */

// https は任意ホスト・任意パス/クエリを許可（従来どおり緩い・公開は https 推奨）。
const HTTPS_ANY = /^https:\/\/.+/i;

// http はローカル宛のみ許可：localhost / host.docker.internal / IPv4 / 単一ラベル内部ホスト。
const LOCAL_HTTP =
  /^http:\/\/(localhost|host\.docker\.internal|(?:\d{1,3}\.){3}\d{1,3}|[a-z0-9-]+)(:\d+)?(\/.*)?$/i;

/** ExApp エンドポイントとして妥当な URL か（https 任意 ＋ http ローカル宛）。 */
export const isValidExAppEndpoint = (value: string): boolean => {
  return HTTPS_ANY.test(value) || LOCAL_HTTP.test(value);
};
