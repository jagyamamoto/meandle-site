# Meandle サイト 仕様書（AI 共通 / v2.0）

このリポジトリは [meandle.jp](https://meandle.jp) のサービスサイト（Astro 静的サイト / Cloudflare Pages 公開）。
**Claude / Codex 等、すべての AI がこのファイルの規約を必ず守ること。**

運用ドキュメント:
- 公開手順・トラブルシュート → [`OPERATIONS.md`](./OPERATIONS.md)
- 更新の 4 種 × 2 方法 → [`UPDATE.md`](./UPDATE.md)

---

## 1. ポジショニング（最重要）

Meandle は、**Jag Yamamoto / Jag Project が提唱する「意味へのハンドル付け」を B2B 事業に実装する高単価 B2B ソリューション** です。

伝えたい一文：
> **広告費を増やす前に、AIと見込み客が拾える「売る意味」を整える。**

**絶対に見せない姿：**
- AIO ツール
- SEO 支援会社
- Web 制作会社
- 記事代行
- 量で勝負するリードジェネ

---

## 2. v2.0 で扱うサービス体系（最重要）

旧 Meandle Package S/M/L、Be Meandling Basic/Full は **廃止**。
ターゲット別 6 サービスに再編：

| サービス | URL | 用途 | 料金（下限） |
|---|---|---|---|
| **do.meandle** | `/do-meandle/` | 既存ページ改善・汎用 | 単発 50 万円〜 / 伴走 月 120 万円〜 |
| **Meandle PR** | `/pr/` | PR専用（PR文＋LP＋記事化素材） | 1 PR セット 50 万円〜 |
| **Meandle get lead** | `/get-lead/` | リード獲得専用 | 1 ページ 200 万円前後 |
| **Meandle recruit** | `/recruit/` | 採用専用 | 1 求人項目 50 万円〜 |
| **Meandle OEM** | `/oem/` | 技術提供（API・SDK・ホワイトラベル） | 個別見積もり |
| **Meandle認定代理店制度** | `/partner/` | パートナー制度 | 個別見積もり |

料金は本文と JSON-LD（あれば）で **必ず一致させる**。下限のみ記載、上限は書かない。

---

## 3. URL 構造

| URL | ファイル | 役割 |
|---|---|---|
| `/` | `src/pages/index.astro` | トップ（9 セクション） |
| `/do-meandle/` | `src/pages/do-meandle.astro` | 既存ページ改善・汎用 |
| `/pr/` | `src/pages/pr.astro` | Meandle PR |
| `/get-lead/` | `src/pages/get-lead.astro` | Meandle get lead |
| `/recruit/` | `src/pages/recruit.astro` | Meandle recruit |
| `/oem/` | `src/pages/oem.astro` | Meandle OEM |
| `/partner/` | `src/pages/partner.astro` | 認定代理店制度 |
| `/contact/` | `src/pages/contact.astro` | SSGform 相談窓口 |
| `/contact/thanks/` | `src/pages/contact/thanks.astro` | 送信完了 |
| `/blog/` | `src/pages/blog/index.astro` | 検証ノート一覧（Self Do.meandle） |
| `/blog/temperature-sensing-ink/` | `src/pages/blog/temperature-sensing-ink.astro` | 第 1 記事 |
| `/404` | `src/pages/404.astro` | エラー |

`astro.config.mjs` の `trailingSlash: 'always'`。リンクは必ず末尾スラッシュ付き。

---

## 4. ファイル構成と一元管理

- **メニュー項目**：`src/data/navigation.json`（primary / services / footer.services / footer.more / blog の 5 配列）
- **共通レイアウト**：`src/layouts/BaseLayout.astro`（title / description / ogTitle / ogDescription / canonical / OGP）
- **ヘッダー**：`src/components/Header.astro`（**ロゴ画像 `/images/meandle-logo.png` 32px** ＋ナビ。背景 #fff）
- **フッター**：`src/components/Footer.astro`（必須表記：Meandleは Jag Yamamoto / Jag Project が開発・監修）
- **再利用コンポーネント**：`src/components/` 配下
  - `PriceCard.astro` — 料金カード
  - `ThreeStepFlow.astro` — URL診断 → みんどりIndex → ページ反映
  - `BeforeAfter.astro` — 改善前後比較
  - `MindoriMeter.astro` — みんどり値ゲージ（0〜100）
  - `CompareSimulator.astro` — 商談化シミュレーション（JS）
  - `FAQCard.astro` — FAQ アコーディオン
  - `CTAButton.astro` — ボタン変種

新しいページを追加するときは:
1. `src/pages/` 配下に配置
2. ヘッダーに出すなら `src/data/navigation.json` の `primary` を編集
3. フッターにも `footer.services` を編集

---

## 5. カラーパレット（v2.0 brief v3.0 準拠）

`src/styles/global.css` の `:root` で管理。コンポーネント内でハードコードしない。

| 用途 | 変数 | 値 |
|---|---|---|
| 本文・見出し | `--ink` | `#1b1f24` |
| 補助テキスト | `--muted` | `#5a6572` |
| 罫線 | `--line` | `#d7dde3` |
| 背景 | `--paper` | `#fbfcfd` |
| セクション交互背景 | `--paper-2` | `#f1f4f7` |
| **主要アクセント（ティールグリーン）** | `--accent` | `#168a6a` |
| アクセント（濃） | `--accent-deep` | `#0f6e54` |
| 警告／強調（オレンジ） | `--warn` | `#c77d31` |
| カード背景 | `--card` | `#ffffff` |
| CTA ブロック背景 | `--cta-dark` | `#102820` |

### 禁止
- 全面オレンジ
- 強い赤
- ネオンミント
- 青白い SaaS ブルー
- 金色多用
- 派手なグラデーション

ロゴはネイビー＋オレンジドット。**ヘッダー背景は白固定。** アクセントは teal、CTA ブロックは深い teal-dark。

---

## 6. メタ情報（全ページ共通デフォルト）

- **title**: 広告費を増やす前に、AIと見込み客が拾える「売る意味」を整える｜Meandle
- **meta description**: Meandleは、専門商材、PR、求人票の意味を、AIと見込み客に誤解されにくい形へ整えるサービスです。既存URLを診断し、みんどり値で改善点を可視化します。
- **meta robots**: `noindex,nofollow`（公開前提）
- **lang**: `ja`

ページ別の `title` `description` は各 `.astro` の `BaseLayout` props で個別指定。
OG だけ別文を出したい場合は `ogTitle` `ogDescription` props を使う。

---

## 7. コピーライティング厳守ルール

### 禁止表現

| 禁止語 | 置き換え |
|---|---|
| AIに選ばれる | AIに拾われやすい形へ整える／AIに誤解されにくくする |
| 検索順位が上がる | 検索や AI 応答で扱われやすい構造へ整える |
| 必ずリードが増える | 商談化しやすい問い合わせを狙う |
| 特許取得済み | 特許出願関連技術／特許出願中の技術 |
| 広告費ゼロで再現できます | 広告費ゼロの実績があります。ただし成果を保証するものではありません |
| 無料相談／今すぐ申し込む／CTAを配置／プロンプト／指示書 | （使わない） |
| **シュミレーション** | **シミュレーション**（必ず） |

### 推奨表現
- 売る意味を整える
- 既存URLで診断する
- みんどり値で見える化
- 商談になる理由を増やす
- AIに誤解されにくい形へ
- **「ます／です」調統一**

---

## 8. Preview モード（Basic 認証）

特許出願準備中のため、現在は全ページ **HTTP Basic 認証** で保護。

- **ユーザー名**：`meandle`
- **パスワード**：`1234`
- 実装：`functions/_middleware.ts`（Cloudflare Pages Functions）
- 全ページに `<meta name="robots" content="noindex,nofollow">`
- `public/robots.txt` は `User-agent: * / Disallow: /`

公開時は `functions/_middleware.ts` を削除 → `noindex` 行を `index, follow` に → `robots.txt` を Allow に → ビルド＆デプロイ。

---

## 9. デプロイ

- `main` ブランチ = 本番
- Cloudflare Pages プロジェクト名: **`meandle`**（旧名、現行）
- カスタムドメイン: `meandle.jp`
- 公開手順:

```bash
export CLOUDFLARE_API_TOKEN='<API TOKEN>'
export CLOUDFLARE_ACCOUNT_ID='defdc076fe8ea8bf80a3003db8b8a38d'

cd /Users/JAG/meandle-site
npm run build
npx wrangler pages deploy dist --project-name=meandle --branch=main \
  --commit-message="<ASCII で書く>" --commit-dirty=true
git add -A && git commit -m "..." && git push origin main
```

⚠️ wrangler は日本語コミットメッセージで `Invalid commit message` を返すことがある。`--commit-message` は ASCII で渡す（git commit は日本語で OK）。

---

## 10. レビュー観点（コミット前に必ず確認）

- [ ] 禁止語ゼロ（§7-1）
- [ ] 「シュミレーション」と書かれていない（「シミュレーション」に統一）
- [ ] AIO ツール／SEO 記事代行／Web 制作会社に見えていない
- [ ] 料金は下限のみ
- [ ] 特許表現は「特許出願中／特許出願関連技術」のみ
- [ ] 強い数字の近くに「保証するものではありません」注記がある
- [ ] Jag Project リンクは `https://jagproject.com/`（`www.` は廃止）
- [ ] Basic 認証が効いている（cookie ではなくブラウザ認証ダイアログ）
- [ ] `<meta name="robots" content="noindex,nofollow">` が全ページに入っている
- [ ] スマホ幅 320px で破綻していない

---

## 11. v2.0 改修ログ（2026-05-26）

- 旧 Meandle Package S/M/L、Be Meandling Basic/Full を **廃止**
- ターゲット別 6 サービスへピボット
- 中心意匠「八角ハンドル羅盤」「みんどり羅盤」を **撤去**（v1.x のデザイン語彙はリセット）
- カラーを **ティールグリーン＋ネイビー＋白基調** に全面入替
- ロゴ画像（`public/images/meandle-logo.png`）をヘッダーに採用、ヘッダー背景は **白固定**
- Basic 認証（`meandle / 1234`）に切替（旧 cookie 認証は撤去）
- `noindex, nofollow` 継続
- ブログ：旧 6 記事を全削除、新「検証ノート」1 記事のみ公開
- 新コンポーネント：MindoriMeter（みんどり値ゲージ）、CompareSimulator（JS 試算）、ThreeStepFlow、BeforeAfter、PriceCard、FAQCard、CTAButton
