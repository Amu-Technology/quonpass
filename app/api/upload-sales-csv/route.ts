// app/api/upload-sales-csv/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, status } from '@prisma/client';
import { parse } from 'csv-parse/sync'; // 同期版を使用
import { isValid, parseISO } from 'date-fns';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/upload-sales-csv:
 *   post:
 *     summary: 売上CSVをアップロードするAPI
 *     description: 売上CSVファイルをアップロードして売上データをインポートします
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 売上CSVファイル
 *               storeId:
 *                 type: string
 *                 description: 店舗ID
 *             required:
 *               - file
 *               - storeId
 *     responses:
 *       200:
 *         description: CSVアップロードに成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       row:
 *                         type: object
 *                       message:
 *                         type: string
 *       400:
 *         description: リクエストエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const storeId = formData.get('storeId') as string | null; // 店舗IDを取得

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!storeId) {
      return NextResponse.json({ error: '店舗IDが必要です。' }, { status: 400 });
    }

    const fileContent = await file.text();
    const records: Record<string, string>[] = parse(fileContent, {
      columns: true, // ヘッダーを列名として使用
      skip_empty_lines: true,
    });

    // 店舗の存在確認
    const store = await prisma.stores.findUnique({
      where: { id: parseInt(storeId) },
    });

    if (!store) {
      return NextResponse.json({ error: '指定された店舗が見つかりません。' }, { status: 400 });
    }

    let importedCount = 0;
    let errorCount = 0;
    const errors: { row: Record<string, string>, message: string }[] = [];

    for (const record of records) {
      try {
        const row = record as {
          '営業日': string;
          '商品コード': string;
          '商品名': string;
          'カテゴリ1コード': string;
          'カテゴリ1': string;
          '平均単価': string;
          '売上数量': string;
          '売上金額': string;
        };

        // 日付の処理（「2025/06/17(火)」形式をISO形式に変換）
        let dateStr = row['営業日'];
        if (dateStr && dateStr.includes('(')) {
          dateStr = dateStr.split('(')[0]; // 「(火)」部分を除去
        }
        
        // 日付文字列をISO形式に変換（YYYY/MM/DD → YYYY-MM-DD）
        if (dateStr && dateStr.includes('/')) {
          dateStr = dateStr.replace(/\//g, '-');
        }
        
        const recordDate = parseISO(dateStr);
        if (!isValid(recordDate)) {
          throw new Error(`無効な日付形式です: ${row['営業日']} (処理後: ${dateStr})`);
        }

        // 数値の処理（カンマと円マークを除去）
        const quantity = parseInt(row['売上数量'].replace(/,/g, ''), 10);
        const unitPriceStr = row['平均単価'].replace(/[¥,]/g, '');
        const unitPrice = parseFloat(unitPriceStr);
        const salesAmountStr = row['売上金額'].replace(/[¥,]/g, '');
        const salesAmount = parseFloat(salesAmountStr);

        if (isNaN(quantity) || isNaN(unitPrice) || isNaN(salesAmount)) {
          throw new Error(`無効な数値形式です: 数量 '${row['売上数量']}', 単価 '${row['平均単価']}', 売上 '${row['売上金額']}'`);
        }

        // 商品の取得または作成
        let product = await prisma.products.findFirst({
          where: {
            name: row['商品名'],
            store_id: store.id,
          },
        });

        const productData = {
          store_id: store.id,
          image_url: 'no-image.jpg',
          name: row['商品名'],
          description: `CSVインポート: ${row['カテゴリ1'] || '未分類'}`,
          status: status.active,
          price: unitPrice,
          stock: 0, // 在庫を0に設定
          available_at: new Date(),
        };

        if (!product) {
          console.log(`商品 '${row['商品名']}' を作成します。`);
          product = await prisma.products.create({
            data: productData,
          });
        } else {
          // 既存商品の更新
          console.log(`商品 '${row['商品名']}' を更新します。`);
          product = await prisma.products.update({
            where: { id: product.id },
            data: productData,
          });
        }

        // 売上記録の作成または更新
        const existingSalesRecord = await prisma.salesRecord.findFirst({
          where: {
            date: recordDate,
            store_id: store.id,
            product_id: product.id,
          },
        });

        const salesRecordData = {
          date: recordDate,
          store_id: store.id,
          product_id: product.id,
          quantity: quantity,
          unit_price: unitPrice,
          sales_amount: salesAmount,
          customer_attribute: null, // CSVに顧客属性がない場合はnull
        };

        if (!existingSalesRecord) {
          await prisma.salesRecord.create({
            data: salesRecordData,
          });
        } else {
          // 既存の売上記録を更新
          await prisma.salesRecord.update({
            where: { id: existingSalesRecord.id },
            data: salesRecordData,
          });
        }
        
        importedCount++;

      } catch (innerError: unknown) {
        errorCount++;
        const errorMessage = innerError instanceof Error ? innerError.message : '不明なエラー';
        errors.push({ row: record, message: errorMessage });
        console.error(`Error processing row: ${JSON.stringify(record)} - ${errorMessage}`);
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

  } catch (error: unknown) {
    console.error('Failed to upload CSV:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json({ error: 'CSVのアップロードと処理に失敗しました。', details: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}