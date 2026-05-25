/**
 * パスワードゲート（特許出願準備中の preview モード）
 *
 * - 全リクエストにログイン画面を挿入。HttpOnly Cookie 認証。
 * - 公開パス（robots.txt, favicon）だけは素通し（クローラに「不可」と伝える＋ログイン画面に favicon を出すため）。
 * - すべてのレスポンスに `X-Robots-Tag: noindex, nofollow` を付加（検索完全ブロック）。
 *
 * パスワードは Cloudflare Pages の環境変数 `PREVIEW_PASSWORD` に置く（リポジトリには書かない）。
 *
 * 解除手順は OPERATIONS.md §11 を参照。
 */

interface Env {
  PREVIEW_PASSWORD: string;
}

const COOKIE_NAME = 'meandle_preview';
const COOKIE_VALUE = 'v1';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 日
const PUBLIC_PATHS = new Set(['/robots.txt', '/favicon.svg', '/favicon.ico']);

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const password = env.PREVIEW_PASSWORD;

  // 環境変数未設定なら preview モードを実質オフ（ただし noindex は残す）
  if (!password) return passWithNoIndex(await next());

  // 公開パスは素通し
  if (PUBLIC_PATHS.has(url.pathname)) {
    return passWithNoIndex(await next());
  }

  // ログイン POST
  if (url.pathname === '/__login' && request.method === 'POST') {
    const form = await request.formData();
    const submitted = (form.get('password') || '').toString();
    const rawFrom = (form.get('from') || '/').toString();
    // open redirect 対策：必ず / で始まる相対パスのみ受け付ける
    const safeFrom = rawFrom.startsWith('/') && !rawFrom.startsWith('//') ? rawFrom : '/';

    if (submitted === password) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: safeFrom,
          'Set-Cookie': `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`,
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
    }
    return htmlResponse(loginHTML(safeFrom, 'パスワードが違います'), 401);
  }

  // Cookie 検証
  const cookieHeader = request.headers.get('Cookie') || '';
  const hasAuth = cookieHeader.split(/;\s*/).includes(`${COOKIE_NAME}=${COOKIE_VALUE}`);
  if (hasAuth) {
    return passWithNoIndex(await next());
  }

  // 未認証 → ログイン画面
  return htmlResponse(loginHTML(url.pathname + url.search), 401);
};

function passWithNoIndex(r: Response): Response {
  const headers = new Headers(r.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers });
}

function htmlResponse(html: string, status: number): Response {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    },
  });
}

function loginHTML(from: string, error?: string): string {
  const safeFrom = escapeHtml(from);
  const errorBlock = error ? `<p class="error">${escapeHtml(error)}</p>` : '';
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#F3F0E7">
<title>Meandle — Preview</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif; background: linear-gradient(180deg, #C9DEDC 0%, #F3F0E7 60%); color: #12242C; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 20px; font-feature-settings: "palt"; -webkit-font-smoothing: antialiased; }
  .card { background: #FFF9ED; padding: 44px 36px 32px; border-radius: 20px; max-width: 400px; width: 100%; border: 1px solid rgba(18,36,44,0.08); box-shadow: 0 4px 22px rgba(18,36,44,0.08); }
  .brand { font-size: 26px; font-weight: 800; margin: 0 0 4px; letter-spacing: .02em; }
  .brand .dot { color: #E98F22; }
  .eyebrow { display: inline-block; font-size: 11px; letter-spacing: .18em; color: #B66E15; text-transform: uppercase; font-weight: 700; margin: 4px 0 18px; }
  .lead { color: #2A3B43; font-size: 14.5px; line-height: 1.75; margin: 0 0 26px; }
  label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  input { width: 100%; padding: 12px 14px; border: 1px solid rgba(18,36,44,0.12); border-radius: 10px; font: inherit; font-size: 16px; background: #fff; }
  input:focus { outline: 2px solid #E98F22; outline-offset: 1px; border-color: #E98F22; }
  button { width: 100%; padding: 14px; margin-top: 18px; background: #E98F22; color: #fff; border: 0; border-radius: 999px; font: inherit; font-weight: 700; font-size: 15px; cursor: pointer; transition: background .15s ease; }
  button:hover { background: #B66E15; }
  .error { color: #B23A1C; font-size: 13px; margin: 14px 0 0; font-weight: 600; }
  .note { color: #6F7777; font-size: 11.5px; margin: 22px 0 0; text-align: center; letter-spacing: .04em; }
</style>
</head>
<body>
  <form class="card" method="POST" action="/__login">
    <h1 class="brand">Meandle<span class="dot">.</span></h1>
    <span class="eyebrow">Preview</span>
    <p class="lead">特許出願準備中のため、現在は招待制で公開しています。<br>パスワードを入力してください。</p>
    <label for="pw">パスワード</label>
    <input type="password" id="pw" name="password" required autocomplete="current-password" autofocus inputmode="numeric">
    <input type="hidden" name="from" value="${safeFrom}">
    <button type="submit">開く</button>
    ${errorBlock}
    <p class="note">© Meandle</p>
  </form>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]!));
}
