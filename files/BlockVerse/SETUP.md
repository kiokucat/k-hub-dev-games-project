# BløckVerse release 1.10 — オンライン機能のセットアップ

## 中身
- `blockverse_1.10.html` … ゲーム本体 (静的ファイルとして置くだけ)
- `convex/` … サーバー側 (Convex)
- `package.json`

## 手順
1. `package.json` と `convex/` を同じ場所に置く
2. `npm install`
3. `npx convex dev` (初回はログインとプロジェクト作成。`convex/_generated` が自動で作られる)
4. 表示された URL (`https://○○.convex.cloud`) を、blockverse_1.10.html 内の `const CONVEX_URL=''` の '' の中に入れる (埋め込み型。画面に入力欄は無い)
5. 本番に出すときは `npx convex deploy`。出てきた本番URLに差し替える

## 機能
- 共有ワールド: ワールド選択 > オンライン共有 → 参加コード。ブロック・他プレイヤー・ワールド内チャットがリアルタイム
- マーケットプレイス: ワールドの出品/入手、いいね、通報(3件で非表示)
- スキンマーケット: 設定 > スキン > スキンを出品。マーケットプレイス画面の「スキンマーケット」で 着る / 保存 / PNG保存
- 全体チャット: タイトルの「全体チャット」。ゲーム中は `/g メッセージ`

## 補足
- 通報は自動で非表示にするだけです。公開の場に出すなら Convex ダッシュボードで `skins` / `listings` / `gchat` を時々確認してください
- ログインは無く、端末ごとの ID で本人判定します (localStorage の `bv-cvx`)
