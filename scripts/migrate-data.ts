import { PrismaClient } from '@prisma/client';

// ローカルデータベース接続（Dockerコンテナ内）
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:password@db:5432/qompass'
    }
  }
});

// 本番環境データベース接続
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrateData() {
  try {
    console.log('データ移行を開始します...');

    // 1. 店舗データの移行
    console.log('店舗データを移行中...');
    const stores = await localPrisma.stores.findMany();
    for (const store of stores) {
      await productionPrisma.stores.upsert({
        where: { id: store.id },
        update: store,
        create: store
      });
    }
    console.log(`${stores.length}件の店舗データを移行しました`);

    // 2. カテゴリデータの移行
    console.log('カテゴリデータを移行中...');
    const categories = await localPrisma.categories.findMany();
    for (const category of categories) {
      await productionPrisma.categories.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
    console.log(`${categories.length}件のカテゴリデータを移行しました`);

    // 3. 商品データの移行
    console.log('商品データを移行中...');
    const products = await localPrisma.products.findMany();
    for (const product of products) {
      await productionPrisma.products.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }
    console.log(`${products.length}件の商品データを移行しました`);

    // 4. 売上記録データの移行
    console.log('売上記録データを移行中...');
    const salesRecords = await localPrisma.salesRecord.findMany();
    for (const record of salesRecords) {
      await productionPrisma.salesRecord.upsert({
        where: { id: record.id },
        update: record,
        create: record
      });
    }
    console.log(`${salesRecords.length}件の売上記録データを移行しました`);

    // 5. レジクローズデータの移行
    console.log('レジクローズデータを移行中...');
    const registerCloses = await localPrisma.registerClose.findMany();
    for (const record of registerCloses) {
      await productionPrisma.registerClose.upsert({
        where: { id: record.id },
        update: record,
        create: record
      });
    }
    console.log(`${registerCloses.length}件のレジクローズデータを移行しました`);

    // 6. 年間目標データの移行
    console.log('年間目標データを移行中...');
    const annualTargets = await localPrisma.annualTarget.findMany();
    for (const target of annualTargets) {
      await productionPrisma.annualTarget.upsert({
        where: { id: target.id },
        update: target,
        create: target
      });
    }
    console.log(`${annualTargets.length}件の年間目標データを移行しました`);

    // 7. 月間目標データの移行
    console.log('月間目標データを移行中...');
    const monthlyTargets = await localPrisma.monthlyTarget.findMany();
    for (const target of monthlyTargets) {
      await productionPrisma.monthlyTarget.upsert({
        where: { id: target.id },
        update: target,
        create: target
      });
    }
    console.log(`${monthlyTargets.length}件の月間目標データを移行しました`);

    // 8. アイテムデータの移行
    console.log('アイテムデータを移行中...');
    const items = await localPrisma.item.findMany();
    for (const item of items) {
      await productionPrisma.item.upsert({
        where: { id: item.id },
        update: item,
        create: item
      });
    }
    console.log(`${items.length}件のアイテムデータを移行しました`);

    // 9. レシピデータの移行
    console.log('レシピデータを移行中...');
    const recipes = await localPrisma.recipe.findMany();
    for (const recipe of recipes) {
      await productionPrisma.recipe.upsert({
        where: { id: recipe.id },
        update: recipe,
        create: recipe
      });
    }
    console.log(`${recipes.length}件のレシピデータを移行しました`);

    // 10. レシピアイテムデータの移行
    console.log('レシピアイテムデータを移行中...');
    const recipeItems = await localPrisma.recipeItem.findMany();
    for (const item of recipeItems) {
      await productionPrisma.recipeItem.upsert({
        where: { id: item.id },
        update: item,
        create: item
      });
    }
    console.log(`${recipeItems.length}件のレシピアイテムデータを移行しました`);

    // 11. 商品アイテムデータの移行
    console.log('商品アイテムデータを移行中...');
    const productItems = await localPrisma.productItem.findMany();
    for (const item of productItems) {
      await productionPrisma.productItem.upsert({
        where: { id: item.id },
        update: item,
        create: item
      });
    }
    console.log(`${productItems.length}件の商品アイテムデータを移行しました`);

    // 12. バックログアイテムデータの移行
    console.log('バックログアイテムデータを移行中...');
    const backlogItems = await localPrisma.backlogItem.findMany();
    for (const item of backlogItems) {
      await productionPrisma.backlogItem.upsert({
        where: { id: item.id },
        update: item,
        create: item
      });
    }
    console.log(`${backlogItems.length}件のバックログアイテムデータを移行しました`);

    console.log('データ移行が完了しました！');

  } catch (error) {
    console.error('データ移行中にエラーが発生しました:', error);
  } finally {
    await localPrisma.$disconnect();
    await productionPrisma.$disconnect();
  }
}

migrateData(); 