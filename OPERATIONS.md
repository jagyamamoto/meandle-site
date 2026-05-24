# Meandle サイト 運用マニュアル

公開・更新・ドメイン管理・フォーム連携・トラブルシュートを 1 ファイルにまとめたもの。
詳しい仕様（カラー・禁止語など）は [`CLAUDE.md`](./CLAUDE.md) を参照。

---

## 0. 現在の構成（2026-05 時点）

| 項目 | 値 |
|---|---|
| 本番 URL | https://meandle.jp |
| GitHub リポジトリ | https://github.com/jagyamamoto/meandle-site （public, main = 本番） |
| Cloudflare アカウント | jagyamamoto@gmail.com |
| Cloudflare アカウント ID | `defdc076fe8ea8bf80a3003db8b8a38d` |
| Zone ID（meandle.jp） | `10d7755ad493210372ed0b30e5e86bac` |
| Cloudflare Pages プロジェクト（現行） | `meandle`（Direct Upload 型）→ `meandle.pages.dev` |
| Cloudflare Pages プロジェクト（将来用） | `meandle-site`（同一内容を保持／Git 連携待ち）→ `meandle-site.pages.dev` |
| DNS レコード | `meandle.jp CNAME meandle.pages.dev`（Proxied） |

**メモ**: 本来は `meandle-site` プロジェクト＋GitHub 連携で運用したいが、Cloudflare Pages の「Connect to Git」はダッシュボードの専用 UI でしか完了できず、API でも Chrome 拡張経由でも自動化できない仕様。**§4「Git 連携の有効化（任意・1 回だけ）」** を実施するとフル自動化になる。それまでは **§1 の Direct Upload** が公式手順。

---

## 1. 通常の公開手順（現行・Direct Upload）

ローカルで変更し、ビルドして wrangler で本番へ反映する。

```bash
# 環境変数（毎回 export しないなら ~/.zshrc に書く）
export CLOUDFLARE_API_TOKEN='<API TOKEN>'
export CLOUDFLARE_ACCOUNT_ID='defdc076fe8ea8bf80a3003db8b8a38d'

cd /Users/JAG/meandle-site
git pull                                    # 念のため最新化
# ... ファイル編集 ...
npm run build                               # dist/ を生成
npx wrangler pages deploy dist \
  --project-name=meandle \
  --branch=main \
  --commit-dirty=true
```

完了すると `✨ Deployment complete! Take a peek over at https://<hash>.meandle.pages.dev` と表示される。
1〜2 分で `https://meandle.jp` にも反映される。

**忘れずに**：本番反映後、必ず git に commit & push する（GitHub と本番のズレを残さない）。

```bash
git add -A
git commit -m "update: <変更内容を簡潔に>"
git push origin main
```

---

## 2. ローカル開発

```bash
cd /Users/JAG/meandle-site
npm install          # 初回のみ
npm run dev          # http://localhost:4321
```

ファイル編集 → 自動リロード。`Ctrl+C` で停止。

---

## 3. ロールバック

過去のデプロイに即時戻す手段。

```bash
# 直近のデプロイ一覧を表示
npx wrangler pages deployment list --project-name=meandle

# 戻したいデプロイの ID を指定（output の Deployment ID 列）
npx wrangler pages deployment rollback --project-name=meandle <DEPLOYMENT_ID>
```

---

## 4. Git 連携の有効化（任意・1 回だけ）

`git push origin main` だけで本番デプロイされる「完全自動」状態にする手順。実施しなくても §1 で運用可能。

### 4-1. 準備（済）

- GitHub リポジトリ `jagyamamoto/meandle-site` 作成済み
- GitHub App "Cloudflare Workers and Pages" インストール済み（jagyamamoto アカウント / All repositories）
- Pages プロジェクト `meandle-site` 作成済み

### 4-2. ダッシュボードで「Connect to Git」

> ⚠️ この手順は必ず **標準の Chrome（普段使い）** で。Chrome 拡張機能経由だと Cloudflare の SPA が描画されないため。

1. https://dash.cloudflare.com/defdc076fe8ea8bf80a3003db8b8a38d/pages/view/meandle-site/settings を開く
2. **Builds & deployments** タブ
3. **Connect to Git** をクリック
4. GitHub で OAuth 承認（緑の Authorize）
5. リポジトリ `jagyamamoto/meandle-site` を選択
6. **Production branch**: `main`
7. **Build command**: `npm run build`
8. **Build output directory**: `dist`
9. 保存

これで `git push origin main` するたびに自動ビルド・公開される。

### 4-3. ドメイン付け替え（4-2 完了後）

`meandle.jp` を旧 `meandle` プロジェクトから新 `meandle-site` に移す。

```bash
export TOKEN='<API TOKEN>'
export ACCT='defdc076fe8ea8bf80a3003db8b8a38d'

# 旧から外す
curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/$ACCT/pages/projects/meandle/domains/meandle.jp" \
  -H "Authorization: Bearer $TOKEN"

# 新に付け直す
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCT/pages/projects/meandle-site/domains" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"meandle.jp"}'
```

そして **ダッシュボードで DNS の CNAME ターゲットを変更**：

- DNS Records: https://dash.cloudflare.com/defdc076fe8ea8bf80a3003db8b8a38d/meandle.jp/dns/records
- 既存 `meandle.jp CNAME meandle.pages.dev` を編集 → ターゲットを **`meandle-site.pages.dev`** に
- 数分で `meandle.jp` の validation が active になる

その後、旧 `meandle` プロジェクトを削除：

```bash
curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/$ACCT/pages/projects/meandle" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5. SSGform 送信先の設定

`src/pages/contact.astro` 内の `FORM_ENDPOINT` 定数を編集する。

```js
// 現在: プレースホルダ
const FORM_ENDPOINT = 'https://ssgform.com/s/REPLACE_WITH_YOUR_SSGFORM_ID';

// 例: 取得した実IDに差し替え
const FORM_ENDPOINT = 'https://ssgform.com/s/AbCdEfGh1234';
```

SSGform 管理画面側でも：
- 送信完了後のリダイレクト先 → `https://meandle.jp/contact/thanks/`
- 自動返信メールの本文（任意）

を設定する。差し替え後は §1 で再デプロイ。

---

## 6. アクセス解析タグの追加

`src/components/Analytics.astro` が **環境変数で出し分け** する仕組み。Cloudflare Pages のダッシュボードで設定する。

| 変数名 | 例 |
|---|---|
| `PUBLIC_GA4_ID` | `G-XXXXXXXXXX` |
| `PUBLIC_PLAUSIBLE_DOMAIN` | `meandle.jp` |
| `PUBLIC_MS_CLARITY_ID` | `XXXXXXXXXX` |

設定箇所：Pages プロジェクト → Settings → Variables and Secrets → **Production**。  
設定後、§1 で再デプロイすると有効化される。何も設定しなければタグは出力されない。

---

## 7. ブログ記事を追加する

1. `src/pages/blog/0X-<slug>.astro` を作成（既存 6 本のいずれかをコピー）
2. `src/data/navigation.json` の `blog` 配列に追加
3. `npm run dev` でローカル確認
4. §1 で本番反映

`src/pages/sitemap.xml.ts` は `navigation.json` から自動収集するので、変更不要。

---

## 8. ナビゲーション項目を変更する

`src/data/navigation.json` の `primary` 配列 または `footer.service / resources` を編集して再ビルド。
ヘッダー（PC/モバイル）とフッターの両方に反映される。

---

## 9. トラブルシュート

| 症状 | 確認・対処 |
|---|---|
| `wrangler pages deploy` で「Project not found」 | プロジェクト名は `meandle`（旧）か `meandle-site`（新）。`--project-name` を確認 |
| `wrangler` が認証エラー | `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` の export を確認 |
| 本番が古いまま | Cloudflare の CDN キャッシュ。Pages → Custom Domains → Purge cache、または最大 5 分待つ |
| ローカルで `meandle.jp` だけ繋がらない | 別ホストの古い DNS キャッシュ。`sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder` |
| `npm run build` で型エラー | `tsconfig.json` の `strict` 設定によるもの。コンソールに該当行が出るので個別対応 |
| 404 ページが標準のまま | `astro.config.mjs` の `trailingSlash: 'always'` の都合で、リンクは末尾スラッシュ付きで書く |
| Cloudflare ダッシュボードが Chrome 拡張で表示されない | 標準の Chrome で開く。拡張の sandbox と Cloudflare SPA は相性問題あり（既知） |

---

## 10. 緊急時の連絡先

- Cloudflare サポート: https://dash.cloudflare.com/?to=/:account/support
- GitHub Status: https://www.githubstatus.com/
- Cloudflare Status: https://www.cloudflarestatus.com/

---

## 11. このマニュアルの更新

実運用で気づいたコツや落とし穴は、このファイルに追記して GitHub に push する。
バージョン管理は git に任せる（別途バージョン番号は持たない）。
