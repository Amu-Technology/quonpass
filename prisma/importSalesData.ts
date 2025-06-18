import { PrismaClient, status } from '@prisma/client';
import fs from 'fs';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

interface CsvRow {
  '日付': string;
  '店舗': string;
  '商品名': string;
  '数量': string;
  '単価': string;
  '売上': string;
  '顧客属性': string;
}

async function importSalesData() {
  const filePath = './data/過去3年間実績データ.csv'; // docker-compose.ymlでマウントしたパス
  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true }));

  const rows: CsvRow[] = []; // ★修正: let -> const
  for await (const record of parser) {
    rows.push(record as CsvRow);
  }

  console.log(`インポートするデータ件数: ${rows.length}`);

  for (const row of rows) {
    try {
      // 1. 店舗IDの取得または作成
      // ★修正: findUnique -> findFirst (nameで検索するため)
      let store = await prisma.stores.findFirst({
        where: { name: row['店舗'] },
      });

      if (!store) {
        console.warn(`店舗 '${row['店舗']}' が見つかりません。新しい店舗を作成します。`);
        store = await prisma.stores.create({
          data: {
            name: row['店舗'],
            address: '不明', // 必要に応じてデフォルト値または仮の値
            phone: '不明',
            email: `contact@${row['店舗'].replace(/\s/g, '').toLowerCase()}.com`,
            status: status.active,
          },
        });
      }

      // 2. 商品IDの取得または作成
      let product = await prisma.products.findFirst({
        where: {
          name: row['商品名'],
          store_id: store.id, // 店舗に紐づく商品を検索（任意、商品が全店舗共通なら不要）
        },
      });

      if (!product) {
        console.warn(`商品 '${row['商品名']}' (店舗: ${row['店舗']}) が見つかりません。新しい商品を作成します。`);
        // products.price は商品の標準価格。CSVの単価は販売時点の価格なので SalesRecord に格納。
        // products.price には、CSVで最初に見つかった単価を使うか、0などの仮の値を設定。
        product = await prisma.products.create({
          data: {
            store_id: store.id, // 特定の店舗に紐づけるか、共通の商品として扱うか検討
            image_url: 'no-image.jpg', // 仮の画像URL
            name: row['商品名'],
            description: `CSVインポートされた商品: ${row['商品名']}`,
            status: status.active,
            // ★修正: _dmmf の使用を削除し、直接 parseFloat
            price: parseFloat(row['単価']) || 0, // 無効な場合は0を設定
            stock: 9999, // 仮の在庫数
            available_at: new Date(), // 現在日時
          },
        });
      }

      const recordDate = new Date(row['日付']);
      const quantity = parseInt(row['数量'], 10); // ★修正: parseInt に基数を指定
      const unitPrice = parseFloat(row['単価']);
      const salesAmount = parseFloat(row['売上']);

      // 数値変換チェック (NaNになる可能性を考慮)
      if (isNaN(quantity) || isNaN(unitPrice) || isNaN(salesAmount)) {
          console.error(`Skipping row due to invalid numeric data: ${JSON.stringify(row)}`);
          continue; // この行の処理をスキップ
      }

      // 3. SalesRecord の挿入
      // ★修正: prisma.salesRecord を prisma.SalesRecord に変更
      await prisma.SalesRecord.create({
        data: {
          date: recordDate,
          store_id: store!.id,
          product_id: product!.id,
          quantity: quantity,
          unit_price: unitPrice,
          sales_amount: salesAmount,
          customer_attribute: row['顧客属性'],
          created_at: new Date(), // 現在日時
          updated_at: new Date(), // 現在日時
        },
      });
      console.log(`Successfully imported SalesRecord for Product: ${row['商品名']}, Store: ${row['店舗']}, Date: ${row['日付']}`);

    } catch (error) {
      console.error(`Failed to import row: ${JSON.stringify(row)}`, error);
    }
  }

  console.log('CSVデータのインポートが完了しました。');
}

importSalesData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });