/**
 * Cloudflare Workers Static Assets 用のエッジ Fetch Handler。
 * 静的アセット(Astro SSG出力)の配信に先立ち、CSPやHSTS等のセキュリティヘッダーを付与する。
 */

/**
 * Worker環境バインディングのインターフェース。
 */
export interface Env {
  /** 静的アセット配信用の組み込みバインディング。 */
  ASSETS: {
    fetch: (_request: Request | string) => Promise<Response>;
  };
}

/**
 * セキュリティヘッダー定義マップ。
 */
const SECURITY_HEADERS: Record<string, string> = {
  // MIMEタイプのスニッフィングを防止。
  'X-Content-Type-Options': 'nosniff',

  // クリックジャッキング対策(iframe埋め込み禁止)。
  'X-Frame-Options': 'DENY',

  // リファラー情報の漏洩制御。
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // 不要なブラウザ機能・APIの無効化。
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',

  // HTTPS通信の強制(HSTS)。
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // コンテンツセキュリティポリシー(CSP)。
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

export default {
  /**
   * 受信したHTTPリクエストを処理し、セキュリティヘッダーを付与したレスポンスを返却する。
   *
   * @param request 受信したHTTPリクエストオブジェクト。
   * @param env Worker環境変数およびアセットバインディング。
   * @returns セキュリティヘッダーが付与されたResponseオブジェクト。
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    // 静的アセットからレスポンスを取得。
    const response = await env.ASSETS.fetch(request);

    // 既存のヘッダーを保持したまま新しいヘッダーオブジェクトを生成。
    const newHeaders = new Headers(response.headers);

    // 各種セキュリティヘッダーをセット。
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      newHeaders.set(key, value);
    }

    // 静的キャッシュ制御(不変なハッシュ付きファイル等の最適化)。
    const url = new URL(request.url);
    if (url.pathname.startsWith('/_astro/')) {
      newHeaders.set(
        'Cache-Control',
        'public, max-age=31536000, immutable'
      );
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
