import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/upload-recipes-csv:
 *   post:
 *     summary: レシピ関連CSVをアップロードするAPI
 *     description: レシピ関連CSVファイルをアップロードして商品と材料の関連付けを作成します
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
 *                 description: レシピ関連CSVファイル
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
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
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
        const row = record as {
          商品番号: string;
          商品名: string;
          検品基準: string;
          誤差枚数: string;
          "製造可能枚数/型": string;
          材料番号: string;
          材料: string;
          内容量: string;
        };

        // 商品の取得または作成
        let product = await prisma.item.findFirst({
          where: {
            name: row["商品名"],
            type: "商品",
          },
        });

        if (!product) {
          product = await prisma.item.create({
            data: {
              name: row["商品名"],
              type: "商品",
              unit: "個",
              minimum_order_quantity: null,
              price: 0,
            },
          });
        }

        // 材料の取得または作成
        let material = await prisma.item.findFirst({
          where: {
            name: row["材料"],
            type: "食材",
          },
        });

        if (!material) {
          material = await prisma.item.create({
            data: {
              name: row["材料"],
              type: "食材",
              unit: "g",
              minimum_order_quantity: null,
              price: 0,
            },
          });
        }

        // レシピの取得または作成
        let recipe = await prisma.recipe.findFirst({
          where: {
            item_id: product.id,
          },
        });

        if (!recipe) {
          recipe = await prisma.recipe.create({
            data: {
              item_id: product.id,
              inspection_standard: parseInt(row["検品基準"]) || 0,
              inspection_unit: "g",
              manufacturable_quantity: parseInt(row["製造可能枚数/型"]) || 0,
              manufacturable_unit: "個",
              manufacturing_cost_per_piece: null,
              packaging_cost_per_piece: null,
              product_cost_per_piece: null,
            },
          });
        }

        // レシピアイテムの作成または更新
        const existingRecipeItem = await prisma.recipeItem.findFirst({
          where: {
            recipe_id: recipe.id,
            item_id: material.id,
          },
        });

        if (!existingRecipeItem) {
          await prisma.recipeItem.create({
            data: {
              recipe_id: recipe.id,
              item_id: material.id,
              quantity: parseInt(row["内容量"]) || 0,
            },
          });
        } else {
          // 既存のレシピアイテムを更新
          await prisma.recipeItem.update({
            where: { id: existingRecipeItem.id },
            data: {
              quantity: parseInt(row["内容量"]) || 0,
            },
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
          message: `${importedCount} 件のレシピ関連付けをインポートしました。${errorCount} 件のエラーがありました。`,
          errors: errors,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({
        message: `${importedCount} 件のレシピ関連付けが正常にインポートされました。`,
      });
    }
  } catch (error: unknown) {
    console.error("Failed to upload recipes CSV:", error);
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