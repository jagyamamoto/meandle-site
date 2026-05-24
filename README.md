# meandle-site

[meandle.jp](https://meandle.jp) のサービスサイト。Astro + Cloudflare Pages。

## 開発

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 静的ファイルを dist/ に出力
npm run preview  # ビルド結果のローカルプレビュー
```

## デプロイ

`main` ブランチに push すると Cloudflare Pages が自動ビルド・公開する。

詳しい仕様（カラー・禁止語・URL 構造・価格・デプロイ手順）は **[CLAUDE.md](./CLAUDE.md)** を参照。
