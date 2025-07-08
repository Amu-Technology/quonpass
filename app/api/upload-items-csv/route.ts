import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { z } from "zod";

const prisma = new PrismaClient();

// バリデーションスキーマ
const itemCsvSchema = z.object({
  商品タイプ: z.enum(["食材", "商品", "資材", "特殊"]),
  商品名: z.string().min(1, "商品名は必須です"),
  単位: z.string().min(1, "単位は必須です"),
  最低ロット: z.string().min(1, "最低ロットは必須です"),
  単価: z.string().min(1, "単価は必須です"),
});

/**
 * @swagger
 * /api/upload-items-csv:
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
 *             required:
 *               - file
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

    if (!file) {
      return NextResponse.json(
        { error: "ファイルがアップロードされていません" },
        { status: 400 },
      );
    }

    const fileContent = await file.text();
    const records: Record<string, string>[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    let importedCount = 0;
    let errorCount = 0;
    const errors: { row: unknown; message: string }[] = [];

    for (const record of records) {
      try {
        // バリデーション
        const validatedData = itemCsvSchema.parse(record);

        // 価格の処理（カンマと円マークを除去）
        const priceStr = validatedData.単価.replace(/[¥,]/g, "");
        const price = parseFloat(priceStr);

        if (isNaN(price) || price < 0) {
          throw new Error(`無効な単価です: ${validatedData.単価}`);
        }

        // 最低ロットの処理
        const minQuantity = validatedData.最低ロット.trim();

        // 既存商品の確認
        const existingItem = await prisma.item.findFirst({
          where: {
            name: validatedData.商品名,
          },
        });

        const itemData = {
          type: validatedData.商品タイプ,
          name: validatedData.商品名,
          unit: validatedData.単位 as
            | "g"
            | "kg"
            | "袋"
            | "本"
            | "枚"
            | "巻"
            | "個"
            | "冊"
            | "式"
            | "束"
            | "台"
            | "箱"
            | "粒"
            | "ケース"
            | "セット"
            | "バルク"
            | "ロット",
          minimum_order_quantity: minQuantity,
          price: price,
        };

        if (existingItem) {
          // 既存商品の更新
          await prisma.item.update({
            where: { id: existingItem.id },
            data: itemData,
          });
        } else {
          // 新規商品の作成
          await prisma.item.create({
            data: itemData,
          });
        }

        importedCount++;
      } catch (innerError: unknown) {
        errorCount++;
        const errorMessage =
          innerError instanceof Error ? innerError.message : "不明なエラー";
        errors.push({
          row: record,
          message: errorMessage,
        });
        console.error(
          `Error processing row: ${JSON.stringify(record)} - ${errorMessage}`,
        );
      }
    }

    if (errorCount > 0) {
      return NextResponse.json(
        {
          message: `${importedCount} 件の商品をインポートしました。${errorCount} 件のエラーがありました。`,
          errors: errors,
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json({
        message: `${importedCount} 件の商品が正常にインポートされました。`,
      });
    }
  } catch (error: unknown) {
    console.error("Failed to upload items CSV:", error);
    return NextResponse.json(
      {
        error: "CSVのアップロードと処理に失敗しました。",
        details: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
