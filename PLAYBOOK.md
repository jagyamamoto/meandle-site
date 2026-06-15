# Astro × Cloudflare Pages 実践プレイブック

**他のWebプロジェクトでも、このプロジェクト（meandle.jp）と同じ手順で構築・運用するためのリファレンス。**

Meandle固有の規約は [`CLAUDE.md`](./CLAUDE.md) を参照。本ファイルは「**仕様ではなく、汎用の構築運用パターン**」をまとめたもの。新しいAstro案件を始めるときに、まずこれを読めば同じ失敗を踏まずに済む。

---

## 0. このプレイブックの使い方

新規プロジェクトを開始するときは、以下のいずれか：

```bash
# このファイルを新プロジェクトの直下にコピー
cp /Users/JAG/meandle-site/PLAYBOOK.md /Users/JAG/<新プロジェクト>/PLAYBOOK.md

# あるいは参考用に開いておく
open /Users/JAG/meandle-site/PLAYBOOK.md
```

このプレイブックは「**こうしておけば後で詰まらない**」を、**実際に詰まった経緯と一緒に**書いてある。経緯まで読むと「なぜそうするのか」がわかる。

---

## 1. 採用スタックと選定理由

| 役割 | 採用 | なぜ |
|---|---|---|
| 静的サイトジェネレータ | **Astro**（static mode） | MPAでSEO/AIOに強く、JSが薄い。コンポーネントはJSXライクで書きやすい。 |
| ホスティング | **Cloudflare Pages** | 無料枠が広い。日本からのレイテンシも良好。Functions（=Workers）で動的処理も差し込める。 |
| デプロイ | **wrangler によるDirect Upload** | GitHub連携は失敗事例あり（後述）。Direct Uploadは確実で速い。 |
| ソース管理 | **GitHub**（手動push） | 履歴管理だけに使う。Cloudflareとは連動させない。 |
| プレビュー保護 | **HTTP Basic Auth**（Pages Functions） | SSR化不要。`functions/_middleware.ts` で全ページゲート。 |
| フォーム | **SSGform** などの外部サービス | バックエンド不要。POST先のURLをactionに指定するだけ。 |
| フォント | **Google Fonts**（Noto Sans JP） | preconnect でロード最適化。 |

### 重要：`output: 'static'` で十分

> **過去の失敗**：仕様書に「`output: 'server'` + `@astrojs/cloudflare` を使う」と書かれていても、Basic認証や軽い動的処理だけが目的なら **static + Pages Functions** で十分。SSR化はビルド時間・デプロイ複雑度・デバッグ難度が跳ね上がる。
>
> **判断基準**：APIエンドポイントを多数生やす／DBに直接アクセスする／リクエストごとに動的HTMLを返す——これらが必要ない限り、**static + Functions** を選ぶ。

---

## 2. 初期セットアップ

### 2.1 プロジェクト scaffold

```bash
cd /Users/JAG
npm create astro@latest <project-name> -- --template minimal --typescript strict --no-install --no-git
cd <project-name>
npm install
```

### 2.2 `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://<your-domain>.com',
  output: 'static',
  trailingSlash: 'always',  // ← 重要：内部リンクは全部末尾スラッシュに統一する
});
```

> **`trailingSlash: 'always'` の意義**：Cloudflare Pagesは `/foo` と `/foo/` を別URLとして扱うことがある（特にFunctionsを挟むとき）。always に固定しておけば、リンクの揺れによる404や正規URLの重複問題が起きない。コードベース内のリンクも `href="/foo/"` で統一。

### 2.3 `package.json` scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

### 2.4 `.gitignore`

最低限：

```
node_modules/
dist/
.astro/
.env
.env.local
.DS_Store
```

---

## 3. 推奨ファイル構成

```
<project>/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── CLAUDE.md          ← プロジェクト固有のAI協業ルール（仕様・禁止語など）
├── OPERATIONS.md      ← 運用マニュアル（デプロイ手順・トラブル）
├── PLAYBOOK.md        ← このファイル（汎用パターン）
├── README.md
├── functions/
│   └── _middleware.ts ← Basic認証など
├── public/
│   ├── images/
│   │   ├── logo.png
│   │   └── blog/
│   │       └── <slug>/01.png  ← 記事ごとのフォルダで分ける
│   └── robots.txt
└── src/
    ├── components/
    │   ├── Header.astro
    │   ├── Footer.astro
    │   └── <ReusableComponent>.astro
    ├── data/
    │   └── navigation.json     ← ナビ項目を一元管理
    ├── layouts/
    │   └── BaseLayout.astro
    ├── pages/
    │   ├── index.astro
    │   ├── contact.astro
    │   └── blog/
    │       ├── index.astro
    │       └── <slug>.astro
    └── styles/
        └── global.css           ← CSS変数とユーティリティクラス
```

### なぜこの構成か

- **`navigation.json` を分離**：ヘッダー／フッターで2回同じ配列を書かない。1ファイル書き換えで両方反映。
- **`public/images/blog/<slug>/`**：記事ごとに画像フォルダを切ると、削除や差し替え時に他記事を壊さない。
- **`functions/` は Cloudflare Pages の予約名**：static buildで `dist/` が出ても、Functions は別経路で動く。
- **`CLAUDE.md`／`OPERATIONS.md`／`PLAYBOOK.md` の3分割**：
  - CLAUDE.md：プロジェクト固有の「やってはいけないこと」（ブランド規約、禁止語、料金規則）
  - OPERATIONS.md：プロジェクト固有の「実際にデプロイする手順」
  - PLAYBOOK.md：このファイル。プロジェクトを横断する汎用パターン

---

## 4. ナビゲーション一元管理

`src/data/navigation.json`：

```json
{
  "primary": [
    { "label": "サービスA", "href": "/service-a/" },
    { "label": "サービスB", "href": "/service-b/" }
  ],
  "footer": {
    "services": [...],
    "more": [
      { "label": "Blog", "href": "/blog/" },
      { "label": "お問い合わせ", "href": "/contact/" }
    ]
  }
}
```

`src/components/Header.astro`：

```astro
---
import nav from '../data/navigation.json';
---
<header>
  <nav>
    {nav.primary.map((item) => (
      <a href={item.href}>{item.label}</a>
    ))}
  </nav>
</header>
```

新ページ追加時のチェック：
1. `src/pages/<slug>.astro` を作る
2. `src/data/navigation.json` の `primary` に追加（ヘッダーに出すなら）
3. `footer.services` または `footer.more` にも追加（フッターに出すなら）

---

## 5. デザインシステム（CSS変数の運用）

### 5.1 `src/styles/global.css` の冒頭にすべての色を集める

```css
:root {
  --hero-orange: #E98F22;
  --ink: #12242C;
  --muted: #6F7777;
  --paper: #F3F0E7;
  --paper-2: #ECE8DC;
  --card: #FFF9ED;
  --white: #FFFFFF;
  --dark: #071014;

  --font-main: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif;
  --radius: 6px;
  --shadow: 0 2px 12px rgba(18,36,44,0.08);
}
```

### 5.2 コンポーネント内では絶対にハードコードしない

```css
/* ❌ Bad */
.btn { background: #E98F22; }

/* ✅ Good */
.btn { background: var(--hero-orange); }
```

> **なぜ重要か**：途中で「色を全部変えたい」となったとき（実際にMeandleで3回起きた）、変数1ヶ所の変更で全コンポーネントが追従する。ハードコードが混ざっていると、後で grep して全部直すハメになる。

### 5.3 用意しておくと便利な汎用ユーティリティクラス

| クラス | 用途 |
|---|---|
| `.section` / `.section--alt` / `.section--dark` | セクションの上下padding + 背景色違い |
| `.container` / `.container--narrow` | 最大幅統一（1080px / 780px） |
| `.eyebrow` | セクション小見出し（大文字レター） |
| `.lead` | リード文（大きめ・行間広め） |
| `.badge` | 丸タグ（border + 文字） |
| `.btn` / `.btn--primary` / `.btn--secondary` / `.btn--dark` | ボタン3種 |
| `.card` | カード型ブロック |
| `.callout-note` | 注記・免責のための囲み |
| `.metric-grid` + `.metric-card` | 数字カードを並べる |
| `.compare-table` | 強調行が出せる比較表（`.highlight` 行） |
| `.flow` + `.flow-step` + `.flow-num` | ステップ番号付きの横並び |
| `.table-wrap` | 横スクロール可能なtable包み |
| `.grid` / `.grid--2` | レスポンシブグリッド |
| `.cta-block` | ページ末尾の濃色CTA |

これらが揃っていれば、新ページは「既存クラスの組み合わせ」だけで書ける。

---

## 6. ページの基本パターン

### 6.1 BaseLayout

```astro
---
// src/layouts/BaseLayout.astro
const { title, description, type = 'website' } = Astro.props;
---
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />  <!-- 公開前提 -->
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={type} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body>
    <Header />
    <main><slot /></main>
    <Footer />
  </body>
</html>
```

### 6.2 ページの典型構造

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="..." description="...">
  <!-- Hero -->
  <section class="hero">
    <div class="container">
      <span class="eyebrow hero__eyebrow">Service Name</span>
      <h1 class="hero-copy">大きな見出し（引用風）</h1>
      <p style="margin-top:24px">説明文</p>
    </div>
  </section>

  <!-- 通常セクション -->
  <section class="section">
    <div class="container">
      <span class="eyebrow">小見出し</span>
      <h2>セクション見出し</h2>
      <!-- 本文 -->
    </div>
  </section>

  <!-- 交互背景 -->
  <section class="section section--alt">...</section>

  <!-- 末尾CTA -->
  <section class="cta-block">
    <h2>...</h2>
    <p>...</p>
    <a href="/contact/" class="btn btn--primary">相談する</a>
  </section>
</BaseLayout>
```

---

## 7. ブログ記事の作り方

### 7.1 1記事 = 1 `.astro` ファイル

`src/pages/blog/<slug>.astro` を作る。それだけ。ルートは自動的に `/blog/<slug>/`。

### 7.2 ブログ記事のテンプレート

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';

const title = '記事タイトル｜サイト名';
const description = 'meta description文';
---
<BaseLayout title={title} description={description} type="article">
  <article class="section">
    <div class="article">
      <nav class="breadcrumb">
        <a href="/">ホーム</a>　/　<a href="/blog/">Blog</a>　/　記事名
      </nav>

      <div class="article-meta">
        <span class="badge">カテゴリ</span>
        <span style="margin-left:auto">2026-06-09</span>
      </div>

      <h1>記事タイトル</h1>
      <p class="lead">リード文。</p>

      <h2>見出し2</h2>
      <p>本文…</p>
    </div>
  </article>
</BaseLayout>
```

### 7.3 画像の置き方

```bash
# 記事ごとにフォルダを切る
mkdir -p public/images/blog/<slug>/
cp /path/to/source/*.png public/images/blog/<slug>/
```

参照は `/images/blog/<slug>/01.png`。`src/` の中ではなく `public/` の中。

### 7.4 グラフは Chart.js を使わない

> **過去の判断**：シンプルな棒グラフ程度なら **inline SVG** で十分。Chart.js を読み込むとビルドサイズが増え、CSS変数とも噛み合わない。
>
> Astroのテンプレート構文で `.map()` を回せば、データから自動でバーを生成できる。

```astro
<svg viewBox="0 0 720 240">
  {items.map((d, i) => (
    <g transform={`translate(0, ${i * 30})`}>
      <rect width={d.value * 4} height="9" fill="var(--hero-orange)" />
    </g>
  ))}
</svg>
```

### 7.5 漫画やスライドの「ページめくり」

縦に並べると長くなる画像群は、**CSS scroll-snap + 軽量JS** でカルーセル化できる。

ポイント：
- `display: flex; overflow-x: auto; scroll-snap-type: x mandatory;` で横スクロール+ピタ止まり
- `<button type="button">` で前後/番号ナビ
- `<script is:inline>` でJS。Astroにバンドルさせない
- リサイズ時の再アライン、キーボード ← → 対応も忘れずに

実装例は [`src/pages/blog/clo.astro`](./src/pages/blog/clo.astro) の `comic-reader` 周辺を参照。

---

## 8. 画像管理の落とし穴

### 8.1 ファイルサイズが同じ画像に注意

> **過去の事故**：`meandle-logo.png` と `highprofilm-ai-overview.png` が偶然どちらも 409,156 バイトだったとき、git の rename 検出に巻き込まれて、ファイルを削除するつもりで別ファイルが消えた。
>
> **回避策**：
> - サイズだけで判断しない。`md5 <file>` でハッシュを取って確認
> - 別記事の画像は必ず別フォルダ（`public/images/blog/<slug>/`）に置く
> - ロゴなど共通画像はトップディレクトリ、記事画像はサブディレクトリ、と層を分ける

### 8.2 拡張子と参照の不一致

> **過去の事故**：ユーザーが `.jpg` をアップロードしたのに、コード側は `.png` を参照していて「画像が出ない」「別の画像が出る」が頻発。
>
> **回避策**：
> - ファイル名は **コード側に合わせる**か **コード側を実ファイルに合わせる**。どちらでもいいが、両方を放置しない
> - 画像差し替え時は、必ず `grep -r 'image-name' src/` で参照箇所を確認してからファイル名を決める

### 8.3 画像配置後のチェック

```bash
# 配置後
ls -la public/images/<path>/
md5 public/images/<path>/*.png

# build後
ls -la dist/images/<path>/      # ← dist に入っているか

# デプロイ後
curl -sI -H "Authorization: Basic ..." https://<domain>/images/<path>/01.png | head -2
```

---

## 9. デプロイ運用

### 9.1 環境変数（API token）

```bash
export CLOUDFLARE_API_TOKEN='<your-token>'
export CLOUDFLARE_ACCOUNT_ID='<your-account-id>'
```

`~/.zshrc` に書いておくか、デプロイ直前に毎回 export。**`.env` には書かない**（git に入る事故が起きる）。

### 9.2 デプロイ手順

```bash
cd <project>
npm run build
npx wrangler pages deploy dist \
  --project-name=<project-name> \
  --branch=main \
  --commit-message="ASCII only" \
  --commit-dirty=true
```

> **過去の事故**：日本語コミットメッセージで `Invalid commit message` エラー。
>
> **回避策**：`--commit-message` は **ASCII限定**。git の commit message は日本語OK、wrangler だけ別。

### 9.3 GitHub に push

```bash
git add -A
git status --short  # ← ステージング状況を必ず目視確認

# 複数行コミットは -m を複数回
git commit -m "short summary line" \
           -m "- detail 1" \
           -m "- detail 2"

git push origin main
```

### 9.4 大きなバイナリのpush失敗

> **過去の事故**：6コマ漫画（合計 10MB）を含むコミットを push したら `error: RPC failed; HTTP 400`。
>
> **回避策**：

```bash
# レポジトリ単位で post buffer を 500MB に
git config http.postBuffer 524288000
git push origin main
```

`git config` で **`--global` を付けない**（このプロジェクトだけに適用）。

### 9.5 Cloudflare Pages × GitHub 連携は使わない

> **過去の事故**：dashboard から「Connect to Git」を押すと code 8000011 で失敗。Chrome MCP では SPA がレンダリングされない場面もあり、自動化が困難。
>
> **方針**：
> - GitHubは履歴管理だけ
> - Cloudflare Pages へは **wrangler の Direct Upload** で都度上げる
> - これが結局一番速くて確実

---

## 10. プレビュー保護（Basic 認証）

### 10.1 `functions/_middleware.ts`

```ts
export const onRequest: PagesFunction = async ({ request, next }) => {
  const auth = request.headers.get('Authorization');
  const expected = 'Basic ' + btoa('<user>:<pass>');
  if (auth !== expected) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Preview"',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
  return next();
};
```

### 10.2 補強：noindex と robots.txt

`BaseLayout.astro`：
```html
<meta name="robots" content="noindex,nofollow" />
```

`public/robots.txt`：
```
User-agent: *
Disallow: /
```

### 10.3 公開時の切替手順

1. `functions/_middleware.ts` を削除
2. `BaseLayout.astro` の `<meta name="robots">` を `index, follow` に変更
3. `public/robots.txt` を `Allow: /` ベースに修正
4. `npm run build && wrangler pages deploy dist ...`
5. `git commit -am "open to public" && git push`

> **過去の事故ではないが注意**：Basic 認証だけ外しても、metaが `noindex` のままだと検索エンジンに乗らない。3点セットで切り替える。

---

## 11. CLAUDE.md（AI協業ルール）の必須項目

新規プロジェクトでも `CLAUDE.md` を作る。最低限以下を書く：

1. **ポジショニング**：このサイトは何で、何ではないか。1文で。
2. **絶対に見せない姿**：誤認されたくないカテゴリ／競合（リスト）
3. **URL構造の表**：ルートとファイル対応
4. **カラーパレット**：CSS変数の一覧
5. **コピー規約**：
   - 禁止語の表（「シュミレーション」→「シミュレーション」など）
   - 推奨語
   - 「ます／です」調統一などのトーン規約
6. **料金記載ルール**：下限のみ／上限書かない、などの規約
7. **特許等の表現規約**：「特許出願中」のみ、など
8. **公開状態の管理**：noindex／robots.txt／Basic認証の現状
9. **デプロイ手順**：簡易コマンド
10. **コミット前チェックリスト**：禁止語ゼロ、料金一致、リンク末尾スラッシュ、など

> このプロジェクトの [`CLAUDE.md`](./CLAUDE.md) を雛形にして書き換えるのが早い。

---

## 12. 失敗しないためのチェックリスト

### 12.1 新ページ追加時

- [ ] `src/pages/<slug>.astro` を作った
- [ ] `BaseLayout` で `title` / `description` を渡した
- [ ] 内部リンクは末尾スラッシュ付き（`/foo/`）
- [ ] `src/data/navigation.json` に登録した（必要なら）
- [ ] `npm run build` が通る
- [ ] 禁止語チェック（プロジェクト規約のCLAUDE.md参照）

### 12.2 画像差し替え時

- [ ] 既存ファイルのMD5を控えた（同名で差し替えるとき）
- [ ] コード側の参照パスと拡張子が一致
- [ ] `dist/images/...` に入っている（build後）
- [ ] 本番でHTTP 200が返る（デプロイ後）

### 12.3 デプロイ前

- [ ] `npm run build` が通る（ゼロエラー）
- [ ] `--commit-message` は ASCII
- [ ] `CLOUDFLARE_API_TOKEN` が export されている
- [ ] Basic認証の有無を確認（公開前なら必須）
- [ ] noindex/robots.txtの状態を確認

### 12.4 git push 前

- [ ] `git status --short` で意図しないファイルが入っていないか確認
- [ ] `.env` / 秘密鍵 / 大きすぎる動画など除外
- [ ] 同一サイズの別ファイルが混ざっていないか確認（rename検出事故防止）

---

## 13. コマンド早見表

```bash
# ─────── 開発 ───────
npm run dev                              # 開発サーバー（http://localhost:4321）
npm run build                            # 静的ビルド → dist/

# ─────── デプロイ ───────
export CLOUDFLARE_API_TOKEN='...'
export CLOUDFLARE_ACCOUNT_ID='...'
npx wrangler pages deploy dist \
  --project-name=<name> \
  --branch=main \
  --commit-message="ASCII only" \
  --commit-dirty=true

# ─────── 検証 ───────
AUTH='Basic '$(printf '%s' 'user:pass' | base64)
curl -sI -H "Authorization: $AUTH" https://<domain>/ | head -2
curl -s  -H "Authorization: $AUTH" https://<domain>/<path>/ | grep -oE '...'

# ─────── git ───────
git config http.postBuffer 524288000   # 大きいバイナリ push 用（レポ単位）
git add -A && git status --short
git commit -m "summary" -m "- detail 1" -m "- detail 2"
git push origin main

# ─────── トラブル時 ───────
md5 public/images/<path>/*.png         # 画像のハッシュ確認
ls -la dist/                            # ビルド出力確認
npx wrangler pages deployment list \
  --project-name=<name>                 # 過去のデプロイ確認
```

---

## 14. プロジェクト内ドキュメントの分担（推奨）

| ファイル | 中身 | 更新タイミング |
|---|---|---|
| `PLAYBOOK.md`（このファイル） | 汎用パターン・失敗事例 | プロジェクト横断の知見が増えたとき |
| `CLAUDE.md` | プロジェクト固有の仕様・規約 | サービス内容・ブランドが変わったとき |
| `OPERATIONS.md` | デプロイ・ドメイン・トラブル対応の具体手順 | 運用手順を変えたとき |
| `UPDATE.md`（任意） | コンテンツ更新の方法を整理 | 非エンジニアと共有するとき |
| `README.md` | 開発者向け概要 | リポジトリの第一印象 |

---

## 15. 進化の経緯（このプロジェクトで学んだこと）

時系列順。新しい案件でも同じ罠に踏み込まないように。

| 時期 | 事象 | 学び |
|---|---|---|
| 初期 | SSR adapter を指定された設計だったが、Basic認証だけが目的だったので static + Pages Functions で十分だった | **SSRはやらなくていい場面が多い**。static + Functions で対応できないか先に検討する |
| 初期 | wrangler が日本語コミットメッセージで `Invalid commit message` | **`--commit-message` はASCII限定**。git commit は日本語OK |
| 初期 | Cloudflare Pages × GitHub 連携が code 8000011 で失敗 | **GitHub連携は使わず、wrangler Direct Upload に統一** |
| 中盤 | Chrome MCP の Cloudflare dashboard 操作が SPA レンダ不発 | **dashboardはネイティブ`open`で開く** |
| 中盤 | 八角形SVGが縦長になった | **多角形は cos/sin で座標計算**。手で並べない |
| 終盤 | ロゴが消えた（同サイズPNGの rename 検出に巻き込まれた） | **サイズだけで判断しない・MD5確認・記事画像は別フォルダ** |
| 終盤 | コード `.png` 参照 vs 実ファイル `.jpg` でズレ | **画像差し替え時は `grep` で参照箇所を確認** |
| 終盤 | 6コマ漫画push時に `RPC failed HTTP 400` | **`git config http.postBuffer 524288000`（レポ単位）** |
| 終盤 | 漫画グリッドの字が小さくて読めなかった | **「縦に並べたい」と「縦に長くしたくない」は両立できる**。CSS scroll-snap + JS で1段1枚のページめくり |

これらは全て **「言われた通りに実装したら詰まった」場面**。汎用パターンは「言われた通り」より一段引いて、**「目的に対して最小構成か」** を常に確認すること。

---

## 16. 参考リンク

- [Astro公式ドキュメント](https://docs.astro.build/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [SSGform](https://ssgform.com/)（フォーム）
- [Google Fonts: Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP)

---

*最終更新：2026-06-09*
*このプレイブックは meandle.jp の構築・運用経験から抽出された。新規プロジェクトでも、ここに書かれた事例と回避策を起点にして、プロジェクト固有の知見を積み上げていく。*
