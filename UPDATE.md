# 更新マニュアル

サイトの「更新」を **4 種類 × 2 方法**（手動 / 他 AI 依頼）の表で整理したもの。
公開手順そのものは [`OPERATIONS.md`](./OPERATIONS.md)、ブランド仕様は [`CLAUDE.md`](./CLAUDE.md)。

---

## 0. 「更新」の 4 分類

| # | 種類 | 主な対象 |
|---|---|---|
| 1 | テキスト修正 | LP のコピー、ブログ本文、FAQ、料金、ボタン文言 |
| 2 | 図版変更 | OGP 画像、ロゴ、本文中の画像、favicon |
| 3 | 構造化 | JSON-LD（Organization/Service/FAQPage 等）、ページ追加、ナビ項目、サイトマップ |
| 4 | メタディスクリプション変更 | `<title>` / `<meta description>` / OGP の title・description |

---

## 共通：すべての更新で踏む 3 ステップ

```bash
# 1. ローカル編集
cd /Users/JAG/meandle-site
npm run dev                 # http://localhost:4321 で目視確認

# 2. ビルド検証
npm run build               # エラーなく Complete! になればOK

# 3. 本番反映 + git
export CLOUDFLARE_API_TOKEN='<トークン>'
export CLOUDFLARE_ACCOUNT_ID='defdc076fe8ea8bf80a3003db8b8a38d'
npx wrangler pages deploy dist --project-name=meandle --branch=main --commit-dirty=true
git add -A && git commit -m "<種別>: <内容>" && git push origin main
```

コミットメッセージの種別接頭辞: `update:` テキスト系 / `feat:` 新規追加 / `fix:` 不具合修正 / `docs:` ドキュメント / `style:` 見た目 / `chore:` 雑務。

---

## 1. テキスト修正

### 1-A. 手動の手順

#### 該当ファイルを特定する

```bash
cd /Users/JAG/meandle-site
# 例: 「資料請求」を含む文言を探す
grep -rn "資料請求" src/
```

| 文言 | 主な編集箇所 |
|---|---|
| LP の見出し・本文・料金・FAQ | `src/pages/index.astro` |
| ヘッダー・フッターのナビラベル | `src/data/navigation.json`（`primary` / `footer`） |
| ブログ各記事の本文・タイトル・公開日 | `src/pages/blog/0X-*.astro` |
| ブログ一覧カードの要約 | `src/data/navigation.json` の `blog` 配列 |
| お問い合わせフォームの説明・項目ラベル | `src/pages/contact.astro` |
| 送信完了ページ | `src/pages/contact/thanks.astro` |
| 404 文言 | `src/pages/404.astro` |
| ロゴ脇の説明 | `src/components/Footer.astro` |

#### 編集の決まりごと（必ず守る）

1. **禁止語を入れない** — `CLAUDE.md §1-1` の表に列挙：「CTAを配置」「プロンプト」「指示書」「必ず成果が出ます」「Web制作します」「SEO記事を書きます」「無料相談」「今すぐ」
2. **推奨語を使う** — 「売るべき意味を定義する」「事業を拓く」「勝ち筋を増幅する補助線」「まずは30分、状況を聞かせてください」
3. **価格を本文と JSON-LD で同時に揃える** — `index.astro` 内の料金セクションと `serviceLd.offers` を同時更新
4. **末尾スラッシュ付き URL** — リンクは `/blog/` のように書く（`trailingSlash: 'always'` 設定）

#### 編集後の自己チェック

```bash
# 禁止語チェック
grep -rn -E "CTAを配置|プロンプト|指示書|必ず成果が出ます|Web制作します|SEO記事を書きます|無料相談|今すぐ" src/

# ローカル確認
npm run dev

# ビルド検証
npm run build
```

---

### 1-B. 他 AI に依頼する場合

#### プロンプト雛形（Codex / Cursor / Devin / Claude Code 等に貼る）

```
# 依頼: テキスト修正

リポジトリ: github.com/jagyamamoto/meandle-site のローカル clone を編集してください。

## 必読
作業開始前に必ず以下を読み、規約を遵守すること:
- CLAUDE.md（特に §1-1 禁止語、§1-2 推奨語、§6 価格表）
- OPERATIONS.md §1（デプロイ手順）

## 変更内容
<対象ファイル または 場所>: <現在の文言>
→ <変更後の文言>

## 守ること
- 禁止語ゼロ（grep で確認すること）
- 推奨語の語彙レンジから外れない
- 末尾スラッシュ付きURL
- 価格を変更する場合は index.astro の本文と serviceLd の offers を必ず同時更新

## 確認手順（あなた側で実施）
1. grep -rn -E "CTAを配置|プロンプト|指示書|必ず成果が出ます|Web制作します|SEO記事を書きます|無料相談|今すぐ" src/  → ヒットゼロ
2. npm run build → エラーなく Complete!
3. 上記2点が通ったら、変更点を簡潔に報告

## 禁止
- デプロイ・git push はしない（私が確認後に手動で行う）
- 規約を無視した「もっと売れそうな表現」への独自書き換え禁止
```

#### 受け取った後の自分でやること

- 差分を `git diff` で目視
- ローカルでビルド & 表示確認
- 問題なければ `git commit` + デプロイ

---

## 2. 図版変更

### 2-A. 手動の手順

#### 画像の置き場所と命名規約

| 用途 | パス | 推奨サイズ | 形式 |
|---|---|---|---|
| OGP / Twitter Card | `public/images/ogp.png` | 1200×630px | PNG または JPG |
| ロゴ（JSON-LD用） | `public/images/logo.png` | 512×512px 程度 | PNG（透過可） |
| 本文中の画像 | `public/images/<目的>-<番号>.png` | 横幅 1200px 上限 | PNG / JPG / WebP |
| favicon | `public/favicon.svg`（メイン） / `public/favicon.ico`（補助） | SVG / 32×32 | SVG / ICO |

#### 画像差し替えの手順

1. 画像を上記の場所に保存（同名で上書き or 新規追加）
2. 参照箇所を更新（必要な場合）：
   - OGP 画像のパスを変えるなら `src/layouts/BaseLayout.astro` の `ogImage` デフォルト値
   - 本文中の新しい画像は該当ページに `<img src="/images/xxx.png" alt="意味のある説明" />` を追加
3. `alt` 属性は必ず内容を表す日本語で書く（空にしない）
4. ファイル容量は基本 200KB 以下に圧縮（ImageOptim / Squoosh 等）

#### よくある注意

- OGP 画像は **Cloudflare のキャッシュ** が効くので、URL を変えるか、ダッシュボードで Purge する必要あり（ファイル名にハッシュを付けて運用するのが楽: `ogp-v2.png` 等）
- favicon.svg を変える場合は、ブラウザのキャッシュが強烈に効く（DevTools で Empty Cache and Hard Reload）
- 写真の人物が写る場合は肖像権・媒体掲載許諾を必ず確認

---

### 2-B. 他 AI に依頼する場合

**画像そのものの生成・選定は AI に任せず、人が用意する。** AI に頼むのは「配置と参照箇所の更新」のみ。

#### プロンプト雛形

```
# 依頼: 図版差し替え

リポジトリ: github.com/jagyamamoto/meandle-site のローカル clone を編集してください。

## 必読
- CLAUDE.md
- OPERATIONS.md §1

## 用意した画像
私が以下のファイルを `public/images/` 配下に置きました:
- <ファイル名>（サイズ: <横>x<縦>px、容量: <KB>）

## やってほしいこと
1. 既存の <差し替え対象> を新しい画像に差し替え
   - 参照箇所: <ファイル名:行番号>
2. alt 属性を以下に更新: 「<意味のある説明>」
3. ブログ記事に新規追加なら適切な位置に挿入（記事の流れと整合する位置）

## 守ること
- ファイル名に空白・全角を入れない
- alt は空にしない
- ファイル容量 200KB を超える場合は警告だけ出す（圧縮は私が別途行う）

## 確認手順
- npm run build が成功する
- ローカルで /blog/<該当> や / を表示して、画像が壊れず出る

## 禁止
- 画像の生成・選定（私が選びます）
- デプロイ・git push（私が後で行います）
```

---

## 3. 構造化（JSON-LD・URL構造・ページ追加・ナビ）

ここが一番ミスが出やすい領域。Web 上に出る検索体験を直撃するので、ビルドが通っても **本番デプロイ前に必ず構造化データテストツールで検証** する。

### 3-A. 手動の手順

#### 3-A-1. 既存ページの JSON-LD を編集

各ページの `---`〜`---` フロントマター内に `<タイプ>Ld` という定数として書かれている。

| ページ | 含まれる JSON-LD タイプ | 編集箇所 |
|---|---|---|
| `/` | Organization / Service / FAQPage / BreadcrumbList | `src/pages/index.astro`（4 つの const） |
| `/contact/` | ContactPage / BreadcrumbList | `src/pages/contact.astro` |
| `/blog/` | BreadcrumbList | `src/pages/blog/index.astro` |
| `/blog/0X-*` | BlogPosting / BreadcrumbList | `src/pages/blog/0X-*.astro` |

例：FAQ の Q を 1 つ増やす場合は `index.astro` の `faqLd.mainEntity` 配列に追加し、同時に下部の `<details>` ブロックも追加する（**JSON-LD と本文を必ず一致させる**）。

#### 3-A-2. 新規ページを追加

1. `src/pages/<path>/index.astro`（または `<name>.astro`）を作成。既存の `blog/01-meaning.astro` か `contact.astro` をコピペ起点に。
2. `BaseLayout` に渡す `jsonLd` プロパティを必ず実装（最低限 BreadcrumbList）
3. `src/pages/sitemap.xml.ts` の `pages` 配列に登録
4. ナビに出すなら `src/data/navigation.json` を編集
5. ローカル `npm run dev` で表示 + リンクの遷移確認
6. `npm run build` で 11 → 12 ページ等に増えていることを確認

#### 3-A-3. ナビ項目を変更

`src/data/navigation.json` のみ編集：
- `primary` — ヘッダー（モバイル含む）
- `footer.service` / `footer.resources` — フッター
- `blog` — ブログ一覧カード（記事数や順序）

#### 3-A-4. URL を変える

URL 変更は SEO 観点で要注意。古い URL から新しい URL への **301 リダイレクト** を `public/_redirects` ファイルで設定：

```
# public/_redirects
/old-path/    /new-path/    301
```

Cloudflare Pages が読む独自フォーマット。

#### 3-A-5. デプロイ前の必須チェック

```bash
npm run build
# dist/sitemap.xml が新ページを含むか確認
grep "<loc>" dist/sitemap.xml
```

デプロイ後（本番反映後）：
- [Schema Markup Validator](https://validator.schema.org/) に主要ページの URL を入れて検証
- [Rich Results Test](https://search.google.com/test/rich-results) で FAQ / Article / Breadcrumb が認識されるか確認

---

### 3-B. 他 AI に依頼する場合

#### プロンプト雛形（既存ページの構造化変更）

```
# 依頼: JSON-LD の更新

リポジトリ: github.com/jagyamamoto/meandle-site のローカル clone を編集。

## 必読
- CLAUDE.md（§5 構造化データの方針）
- 該当ファイル: <path>

## 変更内容
<現在のJSON-LD部分>
→
<変更後>

## 守ること
1. JSON-LD と本文の整合を必ず取る
   - FAQPage を変えたら下部の <details> ブロックも対応
   - Service.offers を変えたら本文の料金表も対応
2. @context, @type, 必須プロパティ（headline, datePublished, author 等）を削らない
3. 末尾スラッシュ付きURL（item フィールド）

## 確認手順
1. npm run build が成功
2. dist/ の生成された HTML を直接見て、script[type="application/ld+json"] が壊れていないこと
3. 必要なら schema.org の Validator で確認できる JSON を抜き出して報告

## 禁止
- 上記の整合を取らずに片方だけ書き換える
- デプロイ・git push
```

#### プロンプト雛形（新規ページ追加）

```
# 依頼: 新規ページの追加

リポジトリ: github.com/jagyamamoto/meandle-site

## 必読
- CLAUDE.md（§3 URL構造、§4 ファイル構成、§5 JSON-LD）
- 参考にする既存ページ: <例: src/pages/blog/01-meaning.astro>

## 追加するページ
- URL: /<path>/
- ファイル: src/pages/<path>/index.astro（または <path>.astro）
- title: <タイトル>
- description: <120字程度>
- メインコンテンツ:
  <h1〜h3 と段落の構成を指示>

## JSON-LD
最低限 BreadcrumbList。必要に応じて以下を追加:
- 記事系なら BlogPosting
- 機能紹介なら Service
- お問い合わせ系なら ContactPage

## 必須更新
1. src/pages/sitemap.xml.ts の pages 配列に登録
2. ヘッダー/フッターに出す場合は src/data/navigation.json を編集

## 確認手順
1. npm run build → ページ数が +1 されている
2. npm run dev でローカル確認
3. リンクから到達できる、リンクから離脱できる、を両方確認

## 禁止
- 禁止語混入
- デプロイ・git push
```

---

## 4. メタディスクリプション変更

### 4-A. 手動の手順

#### 編集箇所

各ページの `---`〜`---` 内、`const title = ...` と `const description = ...` を編集する。

| ページ | ファイル |
|---|---|
| トップ | `src/pages/index.astro` |
| お問い合わせ | `src/pages/contact.astro` |
| 送信完了 | `src/pages/contact/thanks.astro` |
| ブログ一覧 | `src/pages/blog/index.astro` |
| 各ブログ記事 | `src/pages/blog/0X-*.astro` |
| 404 | `src/pages/404.astro`（`BaseLayout` の props で渡している） |

#### 書き方の指針

- **title**: `<内容を表すフレーズ>｜Meandle` の形（区切り字は `｜` 全角縦棒）
- **title 長さ**: 全角 28〜32 字目安（Google の表示切れ防止）
- **description**: 全角 70〜120 字。1〜2 文。検索結果のスニペットに出る前提で書く
- **description の冒頭**: 受動的な紹介ではなく、行動・効用を最初に置く
- **OGP title / description**: 自動的に `<title>` と `<meta description>` が再利用される（`BaseLayout` の実装）。SNS 用に別文を出したい場合は `BaseLayout` を拡張

#### 例

```diff
- const title = 'Meandle';
- const description = 'Meandle のサイト。';
+ const title = '資料請求は来る。でも、商談にならない｜Meandle';
+ const description = '売るべき意味を定義し、事業を拓くための補助線。8フィールド構造で B2B の意味設計と運用を支援します。';
```

#### 反映確認

デプロイ後、本番 URL を Twitter Card Validator や Facebook Debugger に入れて OGP が更新されているか確認（キャッシュが強い）：
- https://cards-dev.twitter.com/validator
- https://developers.facebook.com/tools/debug/

---

### 4-B. 他 AI に依頼する場合

#### プロンプト雛形

```
# 依頼: メタディスクリプション変更

リポジトリ: github.com/jagyamamoto/meandle-site

## 必読
- CLAUDE.md（特に §1-1 禁止語、§1-2 推奨語）
- UPDATE.md §4-A（title / description の書き方指針）

## 対象ページと新しい文言
- ファイル: <path>
- 現在の title: <...>
  → 新 title: <...>
- 現在の description: <...>
  → 新 description: <...>

## 守ること
- title 全角 28〜32 字目安、フォーマット 「<本文>｜Meandle」
- description 全角 70〜120 字
- 禁止語混入禁止
- 推奨語の語彙レンジ

## 確認手順
1. 文字数を全角換算でカウントし報告
2. 禁止語を grep でチェック
3. npm run build 成功

## 禁止
- 他のファイルへの波及修正（依頼範囲外）
- デプロイ・git push
```

---

## 他 AI 依頼の共通ルール（4 種に通底するチェックリスト）

依頼を出すとき・受け取った後の両方で必ず確認する。

### 依頼を出すとき（プロンプトに必ず含める）

- [ ] `CLAUDE.md` と `OPERATIONS.md` を読ませる指示
- [ ] 編集して良いファイルの明示
- [ ] 編集して **いけない** ファイル（基本: `node_modules/`、`dist/`、`package-lock.json`）
- [ ] 完了条件（ビルド成功・禁止語ゼロ・ローカル表示確認）
- [ ] **デプロイ・git push を禁止**（人間が必ず最終確認してから実行）
- [ ] 報告フォーマット（変更点の箇条書き＋影響範囲）

### 受け取った後（マージ・デプロイ前）

- [ ] `git diff` で目視（不要な空行・コメント追加等を含めて）
- [ ] `grep -rn -E "CTAを配置|プロンプト|指示書|必ず成果が出ます|Web制作します|SEO記事を書きます|無料相談|今すぐ" src/` がゼロ
- [ ] `npm run build` が成功する
- [ ] `npm run dev` で該当箇所を目視
- [ ] スマホ幅（DevTools で 375px）で破綻していない
- [ ] 価格や JSON-LD を触っていれば、対応する本文・別 LD と整合が取れている

問題なければ `git commit` → `wrangler pages deploy` → `git push`（OPERATIONS.md §1）。

---

## 早見表

| 種類 \ 方法 | A. 手動 | B. AI 依頼 |
|---|---|---|
| 1. テキスト修正 | §1-A：grep → 編集 → 禁止語チェック → build | §1-B：プロンプトに禁止語ルールと建物の整合を明示 |
| 2. 図版変更 | §2-A：画像を `public/images/` に置く → alt 更新 → キャッシュ注意 | §2-B：画像は人が用意。配置と参照更新だけ AI に |
| 3. 構造化 | §3-A：JSON-LD と本文の **整合**、sitemap & navigation 更新、Validator で検証 | §3-B：整合維持を強く指示。JSON-LD と本文を片方だけ書き換えさせない |
| 4. メタ変更 | §4-A：title/description を直接編集、OGP キャッシュ Purge | §4-B：文字数と禁止語をプロンプトで縛る |

---

## このマニュアルの更新

運用で気づいた改善点はこのファイルに追記して push する。
バージョン管理は git 履歴に任せる（このファイル先頭にバージョン番号は付けない）。
