// POST /api/contact — 導入適合性確認フォームの受け口（Cloudflare Pages Function）。
//
// panam.travelsim-japan.com の /api/support/contact で実運用している方式の移植。
// 送信は Resend REST（https://api.resend.com/emails）。宛先は CONTACT_TO（既定 danke@jagproject.com）。
//
// スパム対策（Turnstile不要の多層防御。panam実装と同じ考え方）:
//   1) ハニーポット（honeypot欄が埋まっていたら、成功を装って破棄）
//   2) タイムトラップ（フォーム描画から2.5秒未満の即送信はボット。JS無効時は t 欠落＝素通し）
//   3) 入力バリデーション（メール形式・各項目の長さ上限）
//   4) リンクスパム判定（自由記述にURL過多・BBコードは破棄）
//   5) IPレート制限（KVがバインドされている場合のみ。1時間に5件まで）
//
// 必要な環境変数（Pagesダッシュボード → Settings → Environment variables）:
//   RESEND_API_KEY … Resend のAPIキー（secret）。未設定時は 500 を返し、画面に案内を出す
//   EMAIL_FROM     … 送信元。Resend でDKIM認証済みドメインのアドレス。未設定時は meandle@panam.travelsim-japan.com（認証済み）
//   CONTACT_TO     … 届け先。未設定時は danke@jagproject.com

interface Env {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  CONTACT_TO?: string;
  KV?: KVNamespace;
}

const RATE_MAX = 5;
const RATE_WINDOW_SEC = 60 * 60;
const okEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s) && s.length <= 254;
const countUrls = (s: string) => (s.match(/https?:\/\/|www\./gi) ?? []).length;
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  let form: FormData;
  try {
    form = await ctx.request.formData();
  } catch {
    return fail('送信データを読み取れませんでした。もう一度お試しください。', 400);
  }
  const f = (k: string) => String(form.get(k) ?? '').trim();

  // 1) ハニーポット。ボットには成功に見せて破棄する
  if (f('honeypot')) return thanks(ctx.request.url);

  // 2) タイムトラップ
  const t = Number(f('t'));
  if (Number.isFinite(t) && t > 0 && Date.now() - t < 2500) return thanks(ctx.request.url);

  const email = f('メールアドレス');
  const company = f('会社名').slice(0, 200);
  const name = f('氏名').slice(0, 100);

  // 3) バリデーション（必須3点。他の欄はフォーム側のrequiredに任せ、長さだけ制限）
  if (!company || !name) return fail('会社名と氏名を入力してください。', 400);
  if (!okEmail(email)) return fail('メールアドレスの形式を確認してください。', 400);

  const fields: [string, string][] = [
    ['会社名', company],
    ['氏名', name],
    ['メールアドレス', email],
    ['役割', f('役割').slice(0, 100)],
    ['対象URL', f('対象URL').slice(0, 500)],
    ['対象商材の平均契約額', f('対象商材の平均契約額').slice(0, 100)],
    ['本来来てほしい顧客', f('本来来てほしい顧客').slice(0, 2000)],
    ['対象外にしたい顧客または用途', f('対象外にしたい顧客または用途').slice(0, 2000)],
    ['今起きている説明や問い合わせのズレ', f('ズレ').slice(0, 2000)],
    ['希望時期', f('希望時期').slice(0, 100)],
    ['検討できる段階', f('検討できる段階').slice(0, 100)],
    ['事実確認を担う責任者', f('事実確認責任者').slice(0, 200)],
    ['補足', f('補足').slice(0, 3000)],
  ];

  // 4) リンクスパム判定（自由記述の合計で判定）
  const freeText = fields.map(([, v]) => v).join('\n');
  if (countUrls(freeText) >= 6 || /\[url[=\]]|\[\/url\]|\[link[=\]]/i.test(freeText)) {
    return thanks(ctx.request.url);
  }

  // 5) IPレート制限（KV未バインドなら素通り。超過は成功を装って破棄）
  if (ctx.env.KV) {
    const ip = ctx.request.headers.get('CF-Connecting-IP') || 'unknown';
    const rkey = `contact:rate:${ip}`;
    const n = Number((await ctx.env.KV.get(rkey)) ?? '0');
    if (n >= RATE_MAX) return thanks(ctx.request.url);
    await ctx.env.KV.put(rkey, String(n + 1), { expirationTtl: RATE_WINDOW_SEC });
  }

  if (!ctx.env.RESEND_API_KEY) {
    return fail(
      '送信システムが未設定です（RESEND_API_KEY）。お手数ですが、時間をおいて再度お試しください。',
      500,
    );
  }

  const lines = fields
    .filter(([, v]) => v)
    .map(([k, v]) => `<p style="margin:0 0 2px"><b>${esc(k)}</b></p><p style="margin:0 0 14px; white-space:pre-wrap">${esc(v)}</p>`)
    .join('');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ctx.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // panam.travelsim-japan.com はこのResendアカウントでDKIM認証済み（実送信で確認 2026-08-15）。
      // jagproject.com のDKIMは別アカウントのため使えない。meandle.jp を認証したら
      // EMAIL_FROM 環境変数で contact@meandle.jp 等へ差し替える。
      from: ctx.env.EMAIL_FROM || 'Meandle <meandle@panam.travelsim-japan.com>',
      to: [ctx.env.CONTACT_TO || 'danke@jagproject.com'],
      reply_to: email,
      subject: `[meandle][適合確認] ${company} ${name}`,
      html: `<div style="font-family:sans-serif; font-size:14px; line-height:1.7">${lines}</div>`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('resend error', res.status, detail.slice(0, 300));
    return fail('送信に失敗しました。時間をおいて再度お試しいただくか、直接ご連絡ください。', 502);
  }

  return thanks(ctx.request.url);
};

/** 完了ページへ 303 リダイレクト（通常のフォームPOSTで動く。JS不要） */
const thanks = (base: string) =>
  Response.redirect(new URL('/contact/thanks/', base).toString(), 303);

/** 入力エラー等。シンプルなHTMLで理由と戻り先を示す */
const fail = (msg: string, status: number) =>
  new Response(
    `<!doctype html><html lang="ja"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>送信できませんでした｜Meandle</title>
<body style="font-family:sans-serif; max-width:560px; margin:80px auto; padding:0 20px; line-height:1.8">
<h1 style="font-size:20px">送信できませんでした</h1>
<p>${esc(msg)}</p>
<p><a href="/contact/">フォームへ戻る</a></p>
</body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
