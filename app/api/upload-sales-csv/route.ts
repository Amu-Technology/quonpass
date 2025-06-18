// app/api/upload-sales-csv/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, status } from '@prisma/client';
import { parse } from 'csv-parse/sync'; // 同期版を使用
import { isValid, parseISO } from 'date-fns';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const fileContent = await file.text();
    const records: any[] = parse(fileContent, {
      columns: true, // ヘッダーを列名として使用
      skip_empty_lines: true,
    });

    let importedCount = 0;
    let errorCount = 0;
    let errors: { row: any, message: string }[] = [];

    for (const record of records) {
      try {
        const row: {
          '日付': string;
          '店舗': string;
          '商品名': string;
          '数量': string;
          '単価': string;
          '売上': string;
          '顧客属性': string;
        } = record;

        // 1. 店舗IDの取得または作成
        let store = await prisma.stores.findFirst({
          where: { name: row['店舗'] },
        });

        if (!store) {
          console.warn(`店舗 '${row['店舗']}' が見つかりません。新しい店舗を作成します。`);
          store = await prisma.stores.create({
            data: {
              name: row['店舗'],
              address: '不明',
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
            store_id: store.id, // 店舗に紐づく商品を検索（必要であれば）
          },
        });

        if (!product) {
          console.warn(`商品 '${row['商品名']}' (店舗: ${row['店舗']}) が見つかりません。新しい商品を作成します。`);
          product = await prisma.products.create({
            data: {
              store_id: store.id,
              image_url: 'no-image.jpg',
              name: row['商品名'],
              description: `CSVインポートされた商品: ${row['商品名']}`,
              status: status.active,
              price: parseFloat(row['単価']) || 0, // 仮の価格
              stock: 9999,
              available_at: new Date(),
            },
          });
        }

        const recordDate = parseISO(row['日付']); // date-fns でパース
        const quantity = parseInt(row['数量'], 10);
        const unitPrice = parseFloat(row['単価']);
        const salesAmount = parseFloat(row['売上']);

        if (!isValid(recordDate) || isNaN(quantity) || isNaN(unitPrice) || isNaN(salesAmount)) {
            throw new Error(`無効なデータ形式です: 日付 '${row['日付']}', 数量 '${row['数量']}', 単価 '${row['単価']}', 売上 '${row['売上']}'`);
        }

        await prisma.SalesRecord.create({
          data: {
            date: recordDate,
            store_id: store!.id,
            product_id: product!.id,
            quantity: quantity,
            unit_price: unitPrice,
            sales_amount: salesAmount,
            customer_attribute: row['顧客属性'],
          },
        });
        importedCount++;

      } catch (innerError: any) {
        errorCount++;
        errors.push({ row: record, message: innerError.message || '不明なエラー' });
        console.error(`Error processing row: ${JSON.stringify(record)} - ${innerError.message}`);
      }
    }

    if (errorCount > 0) {
      return NextResponse.json(
        {
          message: `${importedCount} 件のレコードをインポートしました。${errorCount} 件のエラーがありました。`,
          errors: errors,
        },
        { status: 200 } // 一部成功でも200を返す
      );
    } else {
      return NextResponse.json({ message: `${importedCount} 件のレコードが正常にインポートされました。` });
    }

  } catch (error: any) {
    console.error('Failed to upload CSV:', error);
    return NextResponse.json({ error: 'CSVのアップロードと処理に失敗しました。', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}