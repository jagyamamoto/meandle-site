# meandle.jp 公開手順

準備は 2026-08-15 時点で完了しています。**公開judgment（いつ世に出すか）だけが未確定**です。

公開すると、誰でも閲覧でき、検索エンジンにも載る状態になります。戻すことはできますが、
一度クロールされた内容は外部に残り得ます。

---

## 公開前の状態（現在）

| 項目 | 状態 |
|---|---|
| アクセス制御 | Basic 認証（`functions/_middleware.ts`／`meandle` / `1234`） |
| 検索エンジン | 全ページ `noindex,nofollow`（`src/layouts/BaseLayout.astro`） |
| robots.txt | `Disallow: /`（`public/robots.txt`） |
| AI クローラー | Cloudflare 側で GPTBot・ClaudeBot・Google-Extended 等を遮断中 |

## 済んでいる準備

- **問い合わせフォーム**：`/api/contact` → Resend → danke@jagproject.com（delivered 確認済み）
- **差出人**：`contact@meandle.jp`（DKIM＋SPF 認証済み）
- **受信**：`contact@meandle.jp` / `jag@meandle.jp` → danke@jagproject.com（Email Routing）
- **レート制限**：KV 名前空間 `meandle-contact-rate` を `KV` としてバインド済み（1時間 5 件／IP）。
  これが無いとフォームが公開された時にレート制限が効かないため、公開前に必須だった
- **公開前監査**：禁止語 0／論文・大学関連 0／鍵の混入 0／内部メモの露出 0／
  wizard プロトタイプ 13 ページは `noindex` 維持（機密なし・デモ名のみ）

---

## 公開の手順

### 1. コード側（Claude が実行できる）

```bash
cd ~/meandle-site

# ① Basic 認証を外す
git rm functions/_middleware.ts

# ② 検索エンジンに公開する（wizard プロトタイプ用レイアウトは触らない）
#    src/layouts/BaseLayout.astro の
#    <meta name="robots" content="noindex,nofollow">
#    を index,follow に変更

# ③ robots.txt を許可に変える（public/robots.txt を次の内容に）
#    User-agent: *
#    Allow: /
#    Disallow: /wizard/
#    Sitemap: https://meandle.jp/sitemap.xml

npm run build
export CLOUDFLARE_ACCOUNT_ID=defdc076fe8ea8bf80a3003db8b8a38d
npx wrangler pages deploy dist --project-name=meandle --branch=main \
  --commit-message="publish: remove basic auth, allow indexing" --commit-dirty=true
git add -A && git commit -m "publish: 公開" && git push origin main
```

### 2. Cloudflare ダッシュボード（Jag が実行）

**AI クローラーの遮断解除**（2026-08-15 に「全面解除」で方針決定）

1. https://dash.cloudflare.com → ゾーン **meandle.jp**
2. 左メニュー **Security（セキュリティ）→ Settings** または **Bots**
3. **「Block AI bots」／「AI Crawl Control」** の項目を探して **オフ**にする
   - 「Block AI bots」がオンだと、robots.txt に GPTBot・ClaudeBot・CCBot・
     Google-Extended などの `Disallow: /` が自動注入される
4. 解除後に `curl https://meandle.jp/robots.txt` で該当行が消えたことを確認

**なぜ解除するか**：「AI と見込み客が拾える形へ整える」ことを売る会社のサイトが、
自らを AI から遮断している状態は、事業の主張と矛盾する。
また `/ai-search-optimization/` で「OAI-SearchBot をブロックしないことが OpenAI の案内」
と解説している内容とも食い違う。

### 3. 公開後の確認（Claude が実行）

```bash
curl -sI https://meandle.jp/ | head -3                      # 200 が返るか（401 でないこと）
curl -s https://meandle.jp/robots.txt                        # Allow になっているか
curl -s https://meandle.jp/ | grep -o '<meta name="robots"[^>]*>'   # index,follow か
curl -s https://meandle.jp/wizard/ | grep -o '<meta name="robots"[^>]*>' # noindex 維持か
```

さらに：フォームから実送信して danke@ に届くこと（Basic 認証が外れた状態での疎通確認）。

### 4. 公開後にやること

- Google Search Console と Bing Webmaster Tools にサイト登録＋サイトマップ送信
- 診断書 `MEANDLE_WEB_OS_AUDIT_2026-08-14.md` の測定計画（4層）を開始

---

## 元に戻す場合

```bash
git revert <公開コミットのハッシュ>
npm run build && npx wrangler pages deploy dist --project-name=meandle --branch=main --commit-dirty=true
```

Cloudflare 側の AI ボット設定は、ダッシュボードで再度オンにする。
