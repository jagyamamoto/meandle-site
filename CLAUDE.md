# Meandle サイト 仕様書（AI 共通）

このリポジトリは [meandle.jp](https://meandle.jp) のサービスサイト（Astro 静的サイト / Cloudflare Pages 公開）。
**Claude／Codex 等、すべての AI がこのファイルの規約を必ず守ること。**

---

## 1. ブランド・トーン

Meandle は「売るべき意味を定義し、事業を拓くための補助線」を提供する B2B サービス。
分析的・静謐・実装可能な言葉で書く。煽らない。確言しない。

### 1-1. 禁止語（絶対に書かない）

| 禁止語 | 理由 |
|---|---|
| 「CTAを配置」 | マーケ用語の内側を露出させない |
| 「プロンプト」 | AIO の入口を誤認させる |
| 「指示書」 | サービスの本質ではない |
| 「必ず成果が出ます」 | 確言は禁止 |
| 「Web制作します」 | サービス領域外 |
| 「SEO記事を書きます」 | サービス領域外 |
| 「無料相談」 | 価値の安売り |
| 「今すぐ」 | 煽り語 |

### 1-2. 推奨語・推奨フレーズ

- 「売るべき意味を定義する」
- 「事業を拓く」
- 「勝ち筋を増幅する補助線」
- 「まずは30分、状況を聞かせてください」（CTA の標準コピー）

---

## 2. カラートークン

`src/styles/global.css` の `:root` で管理。コンポーネント内でハードコードしない。

| 用途 | 変数 | 値 |
|---|---|---|
| アクセント | `--brand` | `#E98F22` |
| アクセント（濃） | `--brand-deep` | `#B66E15` |
| 背景（生成り） | `--paper` | `#F3F0E7` |
| 補助色（淡ブルーグリーン） | `--mint` | `#C9DEDC` |
| 文字（墨色） | `--ink` | `#12242C` |
| カード背景 | `--card` | `#FFF9ED` |
| 補助文字 | `--muted` | `#6F7777` |

フォントは Noto Sans JP（Google Fonts、`BaseLayout.astro` で読み込み）。

---

## 3. URL 構造

| URL | ファイル | 役割 |
|---|---|---|
| `/` | `src/pages/index.astro` | LP 本編（14 セクション） |
| `/contact/` | `src/pages/contact.astro` | SSGform 相談窓口 |
| `/contact/thanks/` | `src/pages/contact/thanks.astro` | 送信完了 |
| `/blog/` | `src/pages/blog/index.astro` | 読み物一覧 |
| `/blog/01-meaning/` 〜 `/blog/06-growing/` | `src/pages/blog/0X-*.astro` | 個別記事（6 本） |
| `/sitemap.xml` | `src/pages/sitemap.xml.ts` | 自動生成 sitemap |
| `/robots.txt` | `public/robots.txt` | クロール設定 |
| `/404` | `src/pages/404.astro` | エラー |

`astro.config.mjs` で `trailingSlash: 'always'` を強制。リンクは必ず末尾スラッシュ付きで書く。

---

## 4. ファイル構成と一元管理

- **メニュー項目**: `src/data/navigation.json`（ヘッダ・フッタ・ブログ一覧の元データ）
- **共通レイアウト**: `src/layouts/BaseLayout.astro`（title/description/canonical/OGP/JSON-LD/Analytics）
- **ヘッダー**: `src/components/Header.astro`（モバイルメニュー含む）
- **フッター**: `src/components/Footer.astro`
- **計測タグ**: `src/components/Analytics.astro`（GA4/Plausible/Clarity を環境変数で出し分け）

新しいページを追加するときは:
1. `src/pages/` 配下に配置
2. `src/pages/sitemap.xml.ts` の `pages` 配列に登録
3. メニューに出すなら `src/data/navigation.json` を編集

---

## 5. JSON-LD 構造化データ

各ページで該当する型を `BaseLayout.astro` に `jsonLd` プロパティで渡す。

- `/` … Organization / Service / FAQPage / BreadcrumbList
- `/contact/` … ContactPage / BreadcrumbList
- `/blog/` … BreadcrumbList
- `/blog/0X-*` … BlogPosting / BreadcrumbList

---

## 6. サービス価格（公式）

| 形式 | プラン名 | 価格 |
|---|---|---|
| Meandle Package（パッケージ） | **Meandle Package S** | 50万円〜 |
| Meandle Package（パッケージ） | **Meandle Package M** | 150万円〜 |
| Meandle Package（パッケージ） | **Meandle Package L** | 500万円〜 |
| Be Meandling（伴走） | **Be Meandling Basic** | 月60万円〜 |
| Be Meandling（伴走） | **Be Meandling Full** | 月150万円〜 |

旧名（Lite / Standard / Enterprise / Continuous / Embedded）は廃止。`grep -rn -E "\\b(Lite|Standard|Enterprise|Continuous|Embedded)\\b" src/` がゼロであることを毎回コミット前に確認すること。

別途、方法論を組み込みたい法人向けの **License**（OEM／認定パートナー／監修アドバイザリー）あり。詳細は LP 第14セクション。

価格は本文と JSON-LD（Service）の両方に表記。変更時は両方を必ず同時更新。

---

## 7. 8 フィールド構造（コア概念）

意味を定義する 8 つの欄。LP の `#eightfields` セクションで表として展示される。

1. ジョブ
2. シーン
3. 代替案
4. 比較軸
5. 価値
6. 証拠
7. **must**（オレンジ強調）
8. **must_not**（オレンジ強調）

7・8 は他項目と同じ「重み」で並ぶ。記事や提案で「must」と「must_not」は必ずセットで提示すること。

---

## 8. デプロイ

- `main` ブランチ = 本番
- `git push origin main` → Cloudflare Pages が GitHub 連携で自動ビルド・公開
- Pages プロジェクト名: `meandle-site`
- カスタムドメイン: `meandle.jp`
- Pages のビルド設定:
  - ビルドコマンド: `npm run build`
  - 出力ディレクトリ: `dist`
  - Node バージョン: `22` 以上

ホットフィックス手順:
```bash
git checkout -b fix/...
# 修正
git commit -m "fix: ..."
git push origin HEAD
# main に PR を出してマージ → 自動デプロイ
```

緊急で main 直 push する場合は、コミットメッセージに `[hotfix]` を付ける。

---

## 9. フォーム（SSGform）

`src/pages/contact.astro` 内の `FORM_ENDPOINT` 定数を SSGform の実 URL に書き換える。
送信成功後の遷移先は `/contact/thanks/`（SSGform 管理画面でも併せて設定する）。

入力項目: 会社名 / お名前 / メールアドレス / 電話番号 / 相談内容

---

## 10. レビュー観点（コミット前に必ず確認）

- 禁止語が混入していないか（§1-1）
- リンクは末尾スラッシュ付きか
- 価格は §6 と一致しているか
- 新規ページは sitemap に登録したか
- 色は CSS 変数を経由しているか（ハードコード禁止）
- スマホ幅 320px で破綻していないか

---

## 11. v1.1 改修ログ（2026-05-25）

「最終公開版」化のための一括改修。今後の編集時はこの方向を踏襲する。

### 11-1. 公開モードへの切替
- `functions/_middleware.ts` を **削除**（パスワードゲート解除）
- `public/robots.txt` を `Disallow: /` → **`Allow: /`**（AIクローラ含めて巡回許可）
- `src/layouts/BaseLayout.astro` の meta robots を **`index, follow`** に変更（`noindex, nofollow` は絶対に書かない）
- Cloudflare Pages の `PREVIEW_PASSWORD` 環境変数も削除済み

### 11-2. ポジショニングの明確化
**Meandle は AIO ツール／SEO 支援／Web 制作／記事代行に絶対に見せない。** 「Jag Yamamoto / Jag Project が提唱する『意味へのハンドル付け』を B2B 事業に実装する高単価 B2B ソリューション」として書くこと。伝えたい一文：**「売るべき意味を定義し、事業を拓く。」**

### 11-3. LP（`src/pages/index.astro`）の確定構成（19 ブロック）
1 Hero / 2 Meandleとは（語源） / 3 must·must_not / 4 Self-check（記号なし） / 5 4 Domains / 6 KPI/KGI3段階 / 7 Evidence（みんどる接続） / 8 8 Fields（must/must_notオレンジ強調） / 9 Authority / 10 Story / 11 Compare / 12 Pricing（A./B.記号なし） / 13 Quick estimate / 14 Process / 15 FAQ / **16 CTA** / 17 License / 18 Reading / 19 Footer

**順序の原則**：相談 CTA は License・Reading より前。Reading はフッター直前。

### 11-4. メタ情報の確定
- **title**: 資料請求は来る。でも商談にならない理由を、意味から整える｜Meandle
- **meta description**: Meandleは、Jag Yamamoto / Jag Projectが開発・監修する意味設計ソリューションです。事業・プロダクト・マーケティング・コンテンツの4領域で、8フィールド構造により売るべき意味を定義し、商談化、営業導線、AI検索時代の文脈整合を支援します。
- **og:title**: 資料請求は来る。でも、商談にならない。｜Meandle
- **og:description**: 原因は流入でもデザインでもありません。売るべき意味が定義されていないからです。Meandleは、8フィールド構造で事業の意味を整えるB2B意味設計ソリューションです。
- BaseLayout に `ogTitle` `ogDescription` プロパティが追加された。OG だけ別文を出したいページはこれを使う。

### 11-5. コピーの確定文
- Hero eyebrow: **「Business Meaning Design / Meandle」**（旧「B2B 意味設計 × AIO」は廃止）
- Process H2: **「最初の4週間で、意味の輪郭を立ち上げる。」**
- Quick estimate H2: **「3問で、最初の入り口を見立てます。」**
- Evidence H2: **「意味を整えると、AIに引き当てられやすくなる。」**

### 11-6. 禁止表現（既存§1-1 に加えて）
- 「特許取得済み」「独占技術」「他社不可」は**書かない**（出願中までしか書けない）
- 「固定価格」「標準価格」「上限価格」「成功報酬保証」は使わない（料金は**下限のみ**表記）
- Self-check の「A.」「B.」「C.」、Pricing の「A. パッケージ」「B. 伴走」のような **指示書風の記号は可視テキストに出さない**

### 11-7. URL とリンク
- Jag Project の URL は **`https://jagproject.com/`** に統一（`www.` 付きは廃止）
- セクション ID 一覧：`#about` / `#mustnot` / `#diagnose` / `#domains` / `#kpi` / `#results` / `#eightfields` / `#authority` / `#story` / `#compare` / `#pricing` / `#estimate` / `#process` / `#faq` / `#cta` / `#license` / `#reading`

### 11-8. レスポンシブの追加ルール
- Hero リード2文目は `.lead--pc`（長文）と `.lead--sp`（短文）を出し分け
- Self-check の各項目の説明文（`.check__body span`）は **モバイル時に非表示**
- 8 Fields 表（`.fields-table`）は **モバイル時にカード化**
- Reading カードは **モバイル時に3件まで表示**＋常設「読み物一覧へ」リンク

### 11-9. 公開前チェックリスト（毎回確認）
- [ ] `<meta name="robots" content="noindex...">` がどこにも残っていない
- [ ] FAQPage 構造化データと可視 FAQ が **完全一致**
- [ ] Offer 構造化データと可視価格が一致
- [ ] AIO が主役になっていない
- [ ] Web 制作会社／SEO 記事代行に見えていない
- [ ] A./B./C. などの指示書風表現が可視テキストに残っていない
- [ ] 「無料相談」を使っていない
- [ ] 料金は下限のみ
- [ ] 特許表現が過剰でない（「特許出願中」のみ）
- [ ] Jag Project リンクは **`https://jagproject.com/`**
- [ ] 相談 CTA が License や Reading より前にある
- [ ] スマホで長文が畳まれている、CTA が見つけやすい
- [ ] セクション順序が §11-3 の通り
