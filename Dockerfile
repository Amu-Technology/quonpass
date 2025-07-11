# ベースイメージをDebianベースのnode:20-slimに指定
FROM node:20-slim

# 作業ディレクトリを設定
WORKDIR /app

# パッケージリストを更新し、必要なビルドツールをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# 依存関係のファイルを先にコピーしてキャッシュを有効活用
COPY package*.json ./
COPY prisma ./prisma

# publicディレクトリを作成（Prisma ERD生成用）
RUN mkdir -p public

# 依存関係をインストール（ERD生成をスキップ）
RUN npm install --ignore-scripts

# アプリケーションの全ファイルをコピー
COPY . .

# Prisma Clientを生成（ERD生成はスキップ）
RUN npx prisma generate --schema=./prisma/schema.prisma

# 開発サーバーを起動（ホットリロード有効）
CMD ["npm", "run", "dev"]