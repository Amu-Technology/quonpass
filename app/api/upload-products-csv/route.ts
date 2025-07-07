import { NextResponse } from "next/server";
import { PrismaClient, status } from "@prisma/client";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/upload-products-csv:
 *   post:
 *     summary: 商品CSVをアップロードするAPI
 *     description: 商品CSVファイルをアップロードして商品データをインポートします
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
 *                 description: 商品CSVファイル
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
    const file = formData.get("file") as File | null;
    const storeId = formData.get("storeId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!storeId) {
      return NextResponse.json(
        { error: "店舗IDが必要です。" },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const records: Record<string, string>[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // 店舗の存在確認
    const store = await prisma.stores.findUnique({
      where: { id: parseInt(storeId) },
    });

    if (!store) {
      return NextResponse.json(
        { error: "指定された店舗が見つかりません。" },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let errorCount = 0;
    const errors: { row: unknown; message: string }[] = [];

    for (const record of records) {
      try {
        const row = record as {
          商品コード: string;
          商品名: string;
          カテゴリ1コード: string;
          カテゴリ1: string;
          カテゴリ2コード: string;
          カテゴリ2: string;
          平均単価: string;
        };

        // 価格の処理（カンマと円マークを除去）
        const priceStr = row["平均単価"]?.replace(/[¥,]/g, '') || '0';
        const price = parseFloat(priceStr) || 0;
        
        console.log(`商品: ${row["商品名"]}, 価格文字列: ${row["平均単価"]}, 処理後価格: ${price}`);

        // カテゴリ1の取得または作成
        let category1 = await prisma.categories.findFirst({
          where: {
            code: row["カテゴリ1コード"],
            level: 1,
          },
        });

        if (!category1) {
          category1 = await prisma.categories.create({
            data: {
              code: row["カテゴリ1コード"],
              name: row["カテゴリ1"],
              level: 1,
              status: "active",
            },
          });
        }

        // カテゴリ2の取得または作成（カテゴリ2コードが存在する場合）
        let category2 = null;
        if (row["カテゴリ2コード"] && row["カテゴリ2コード"].trim()) {
          category2 = await prisma.categories.findFirst({
            where: {
              code: row["カテゴリ2コード"],
              level: 2,
            },
          });

          if (!category2) {
            // カテゴリ2が存在しない場合のみ作成
            try {
              category2 = await prisma.categories.create({
                data: {
                  code: row["カテゴリ2コード"],
                  name: row["カテゴリ2"],
                  level: 2,
                  parent_id: category1.id,
                  status: "active",
                },
              });
            } catch {
              // 作成に失敗した場合は既存のカテゴリ2を再取得
              console.log(`カテゴリ2作成エラー、既存のカテゴリ2を検索: ${row["カテゴリ2コード"]}`);
              category2 = await prisma.categories.findFirst({
                where: {
                  code: row["カテゴリ2コード"],
                  level: 2,
                },
              });
            }
          }
        }

        // 商品の取得または作成
        let product = await prisma.products.findFirst({
          where: {
            name: row["商品名"],
            store_id: store.id,
          },
        });

        const productData = {
          store_id: store.id,
          category_id: category2?.id || category1.id, // カテゴリ2があればそれを使用、なければカテゴリ1
          image_url: "no-image.jpg",
          name: row["商品名"],
          description: `CSVインポート: ${row["カテゴリ1"]}${
            row["カテゴリ2"] ? ` / ${row["カテゴリ2"]}` : ""
          }`,
          status: status.active,
          price: price,
          stock: 0, // 在庫を0に設定
          available_at: new Date(),
        };

        if (!product) {
          console.log(`商品 '${row["商品名"]}' を作成します。`);
          product = await prisma.products.create({
            data: productData,
          });
        } else {
          // 既存商品の更新
          console.log(`商品 '${row["商品名"]}' を更新します。`);
          product = await prisma.products.update({
            where: { id: product.id },
            data: productData,
          });
        }

        importedCount++;
      } catch (innerError: unknown) {
        errorCount++;
        const errorMessage = innerError instanceof Error ? innerError.message : "不明なエラー";
        errors.push({
          row: record,
          message: errorMessage,
        });
        console.error(
          `Error processing row: ${JSON.stringify(record)} - ${errorMessage}`
        );
      }
    }

    if (errorCount > 0) {
      return NextResponse.json(
        {
          message: `${importedCount} 件の商品をインポートしました。${errorCount} 件のエラーがありました。`,
          errors: errors,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({
        message: `${importedCount} 件の商品が正常にインポートされました。`,
      });
    }
        } catch (error: unknown) {
    console.error("Failed to upload products CSV:", error);
    return NextResponse.json(
      {
        error: "CSVのアップロードと処理に失敗しました。",
        details: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
