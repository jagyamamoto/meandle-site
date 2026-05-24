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

| 形式 | プラン | 価格 |
|---|---|---|
| パッケージ | Lite | 50万円〜 |
| パッケージ | Standard | 150万円〜 |
| パッケージ | Enterprise | 500万円〜 |
| 伴走 | Continuous | 月60万円〜 |
| 伴走 | Embedded | 月150万円〜 |

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
