# QuonPass

QuonPassは、店舗の売上管理と分析を行うWebアプリケーションです。Next.js、Prisma、PostgreSQLを使用して構築されています。

## 🚀 機能

- **売上分析**: 期間別、店舗別の売上データの分析と可視化
- **商品管理**: 商品の登録、編集、在庫管理
- **レジクローズ管理**: レジクローズデータの記録と分析
- **CSVインポート**: 売上、商品、レジクローズデータのCSV一括インポート
- **ユーザー管理**: 店舗スタッフのアカウント管理
- **API仕様書**: OpenAPI仕様に基づくAPIドキュメント
- **ER図**: データベース設計図の自動生成

## 📋 前提条件

- Node.js 18以上
- Docker & Docker Compose
- Git

## 🛠️ セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd quonpass
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# データベース
DATABASE_URL="postgresql://username:password@localhost:5432/quonpass"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth (オプション)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. 依存関係のインストール

```bash
npm install
```

## 🐳 Dockerでの起動

### PostgreSQLデータベースの起動

```bash
# PostgreSQLコンテナを起動
docker-compose up -d

# コンテナの状態確認
docker-compose ps
```

### データベースの停止

```bash
# コンテナを停止
docker-compose down

# データとコンテナを完全に削除（注意: データが失われます）
docker-compose down -v
```

## 🗄️ Prismaマイグレーション

### 初回セットアップ

```bash
# Prismaクライアントの生成
npx prisma generate

# データベースのマイグレーション実行
npx prisma migrate dev --name init

# データベースの状態確認
npx prisma studio
```

### スキーマ変更時のマイグレーション

```bash
# 新しいマイグレーションを作成
npx prisma migrate dev --name <migration-name>

# 本番環境でのマイグレーション
npx prisma migrate deploy
```

### マイグレーションのリセット（開発環境のみ）

```bash
# データベースをリセットしてマイグレーションを再実行
npx prisma migrate reset
```

## 🌱 シード値の適用

### 初期データの投入

```bash
# シードスクリプトの実行
npm run prisma:seed

# または直接実行
npx prisma db seed
```

### シードデータの内容

- サンプル店舗データ
- サンプル商品データ
- サンプルカテゴリデータ
- サンプル売上データ

## 📊 ER図の生成

### ER図の生成

```bash
# ER図を生成
npm run erd:generate

# または直接実行
npx prisma generate
```

### ER図の表示

```bash
# 生成されたER図をブラウザで開く
npm run erd:view
```

### ER図の確認

- ブラウザで `/erd` にアクセス
- リアルタイムでER図を確認
- SVG形式でダウンロード可能

## 📚 API仕様書

### API仕様書の生成

```bash
# API仕様書を生成
npm run docs:generate

# API仕様書をローカルでサーブ
npm run docs:serve
```

### API仕様書の確認

- ブラウザで `/api/docs` にアクセス
- Redocを使用した美しいAPIドキュメント
- インタラクティブなAPIテスト機能

### OpenAPI仕様の取得

```bash
# OpenAPI仕様をJSON形式で取得
curl http://localhost:3000/api/openapi
```

## 🚀 開発サーバーの起動

```bash
# 開発サーバーを起動
npm run dev

# または特定のホストで起動
npm run dev -- --hostname 0.0.0.0
```

アプリケーションは `http://localhost:3000` でアクセスできます。

## 📁 プロジェクト構造

```
quonpass/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   ├── dashboard/         # ダッシュボードページ
│   ├── erd/              # ER図表示ページ
│   └── docs/             # APIドキュメントページ
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ関数
├── prisma/               # Prismaスキーマとマイグレーション
│   ├── schema.prisma     # データベーススキーマ
│   ├── migrations/       # マイグレーションファイル
│   └── seed.ts          # シードデータ
├── public/               # 静的ファイル
│   └── erd.svg          # 生成されたER図
└── docker-compose.yml    # Docker設定
```

## 🔧 開発用コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start

# リンター実行
npm run lint

# Prismaクライアント生成
npm run postinstall

# ER図生成
npm run erd:generate

# API仕様書生成
npm run docs:generate
```

## 📊 データベース管理

### Prisma Studio

```bash
# データベースのGUI管理ツールを起動
npx prisma studio
```

### データベースのバックアップ

```bash
# PostgreSQLのダンプを作成
docker exec -t quonpass-postgres-1 pg_dumpall -c -U postgres > dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql
```

### データベースの復元

```bash
# PostgreSQLのダンプを復元
docker exec -i quonpass-postgres-1 psql -U postgres < dump_file.sql
```

## 🧪 テスト

```bash
# テストの実行（実装予定）
npm run test

# E2Eテストの実行（実装予定）
npm run test:e2e
```

## 🚀 デプロイ

### Vercelへのデプロイ

```bash
# Vercel CLIのインストール
npm i -g vercel

# デプロイ
vercel

# 本番環境へのデプロイ
vercel --prod
```

### 環境変数の設定

本番環境では以下の環境変数を設定してください：

- `DATABASE_URL`: 本番データベースのURL
- `NEXTAUTH_URL`: 本番環境のURL
- `NEXTAUTH_SECRET`: セキュアなシークレットキー

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 トラブルシューティング

### よくある問題

#### データベース接続エラー

```bash
# PostgreSQLコンテナの状態確認
docker-compose ps

# ログの確認
docker-compose logs postgres

# コンテナの再起動
docker-compose restart postgres
```

#### Prismaマイグレーションエラー

```bash
# マイグレーションのリセット
npx prisma migrate reset

# データベースの状態確認
npx prisma db push --preview-feature
```

#### ER図生成エラー

```bash
# Prismaクライアントの再生成
npx prisma generate

# ER図の再生成
npm run erd:generate
```

### ログの確認

```bash
# アプリケーションログ
npm run dev

# Dockerログ
docker-compose logs

# 特定のサービスのログ
docker-compose logs postgres
```

## 📞 サポート

問題が発生した場合は、以下の手順でサポートを受けてください：

1. このREADMEのトラブルシューティングセクションを確認
2. GitHubのIssuesで既存の問題を検索
3. 新しいIssueを作成して詳細を報告

---

**QuonPass** - 店舗売上管理システム
