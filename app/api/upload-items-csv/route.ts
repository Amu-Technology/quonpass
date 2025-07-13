import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// バリデーションスキーマ（新しいヘッダー形式に対応）
const itemCsvSchema = z.object({
  種別: z.enum(["食材", "商品", "資材", "特殊"]),
  商品番号: z.string().optional(), // 商品番号はオプション
  食材名: z.string().min(1, "食材名は必須です"),
  単位: z.string().optional(), // 単位はオプション
  最低ロット: z.string().optional(), // 最低ロットはオプション
  "卸価格（税抜）": z.string().optional(), // 卸価格（税抜）はオプション
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
    // データベース接続の確認
    try {
      await prisma.$connect();
      console.log("Database connection established successfully");
    } catch (connectionError) {
      console.error("Database connection failed:", connectionError);
      return NextResponse.json(
        {
          error: "データベース接続に失敗しました",
          details: connectionError instanceof Error ? connectionError.message : "不明なエラー",
        },
        { status: 500 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルがアップロードされていません" },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const records: Record<string, string>[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Prismaクライアントの動作確認
    try {
      await prisma.item.findFirst();
      console.log("Prisma client is working correctly");
    } catch (testError) {
      console.error("Prisma client test failed:", testError);
      return NextResponse.json(
        {
          error: "データベースクライアントの初期化に失敗しました",
          details: testError instanceof Error ? testError.message : "不明なエラー",
        },
        { status: 500 }
      );
    }

    let importedCount = 0;
    let errorCount = 0;
    const errors: { row: unknown; message: string }[] = [];

    console.log(`Processing ${records.length} records from CSV...`);
    
    for (const record of records) {
      try {
        console.log(`Processing record:`, record);
        
        // バリデーション
        const validatedData = itemCsvSchema.parse(record);

        // 価格の処理（カンマと円マークを除去）
        const priceStr = validatedData["卸価格（税抜）"]?.replace(/[¥,]/g, "") || "0";
        
        let roundedPrice: number;
        
        // 「未定」の場合は0として処理
        if (priceStr === "未定" || priceStr.trim() === "") {
          roundedPrice = 0;
        } else {
          const price = parseFloat(priceStr);
          
          if (isNaN(price) || price < 0) {
            throw new Error(`無効な卸価格（税抜）です: ${validatedData["卸価格（税抜）"]}`);
          }
          
          // 小数点2桁に丸める
          roundedPrice = Math.round(price * 100) / 100;
        }

        // 最低ロットの処理
        const minQuantity = validatedData.最低ロット?.trim() || null;

        // 単位の正規化（㎏→kg、-→なし）
        let normalizedUnit = validatedData.単位 || "個"; // デフォルトは「個」
        if (normalizedUnit === "㎏") {
          normalizedUnit = "kg";
        }
        if (normalizedUnit === "-") {
          normalizedUnit = "なし";
        }

        // 単位のバリデーション
        const validUnits = [
          "g", "kg", "袋", "本", "枚", "巻", "個", "冊", "式", "束", "台", "箱", "粒", "ケース", "セット", "バルク", "ロット", "缶", "BT", "樽", "ｹｰｽ", "着", "なし"
        ] as const;
        
        if (!validUnits.includes(normalizedUnit as typeof validUnits[number])) {
          throw new Error(`無効な単位です: ${validatedData.単位}`);
        }

        // 商品番号の処理
        let itemId: number | undefined;
        if (validatedData.商品番号 && validatedData.商品番号.trim()) {
          const parsedId = parseInt(validatedData.商品番号.trim());
          if (isNaN(parsedId) || parsedId <= 0) {
            throw new Error(`無効な商品番号です: ${validatedData.商品番号}`);
          }
          itemId = parsedId;
        }

        const itemData = {
          type: validatedData.種別 as "食材" | "商品" | "資材" | "特殊",
          name: validatedData.食材名,
          unit: normalizedUnit as unknown as "g" | "kg" | "袋" | "本" | "枚" | "巻" | "個" | "冊" | "式" | "束" | "台" | "箱" | "粒" | "ケース" | "セット" | "バルク" | "ロット" | "缶" | "BT" | "樽" | "ｹｰｽ" | "着" | "なし",
          ...(minQuantity && { minimum_order_quantity: minQuantity }),
          price: roundedPrice,
        };

        // 商品番号が指定されている場合の処理
        if (itemId) {
          try {
            console.log(`Processing item with ID: ${itemId}`);
            
            // 指定されたIDで既存商品を確認
            const existingItemById = await prisma.item.findUnique({
              where: { id: itemId },
            });

            if (existingItemById) {
              console.log(`Updating existing item with ID: ${itemId}`);
              // 既存商品の更新
              await prisma.item.update({
                where: { id: itemId },
                data: itemData,
              });
            } else {
              console.log(`Creating new item (ID ${itemId} specified but will use auto-generated ID)`);
              // 新規商品の作成（IDは自動生成）
              await prisma.item.create({
                data: itemData,
              });
            }
          } catch (dbError) {
            console.error(`Database error for item ID ${itemId}:`, dbError);
            console.error(`Item data:`, itemData);
            throw new Error(`データベースエラー (ID: ${itemId}): ${dbError instanceof Error ? dbError.message : '不明なエラー'}`);
          }
        } else {
          try {
            console.log(`Processing item with name: ${validatedData.食材名}`);
            
            // 商品番号が指定されていない場合の処理
            const existingItem = await prisma.item.findFirst({
              where: {
                name: validatedData.食材名,
              },
            });

            if (existingItem) {
              console.log(`Updating existing item with name: ${validatedData.食材名}`);
              // 既存商品の更新
              await prisma.item.update({
                where: { id: existingItem.id },
                data: itemData,
              });
            } else {
              console.log(`Creating new item with name: ${validatedData.食材名}`);
              // 新規商品の作成
              await prisma.item.create({
                data: itemData,
              });
            }
          } catch (dbError) {
            console.error(`Database error for item name ${validatedData.食材名}:`, dbError);
            console.error(`Item data:`, itemData);
            throw new Error(`データベースエラー (商品名: ${validatedData.食材名}): ${dbError instanceof Error ? dbError.message : '不明なエラー'}`);
          }
        }

        importedCount++;
      } catch (innerError: unknown) {
        errorCount++;
        const errorMessage =
          innerError instanceof Error ? innerError.message : "不明なエラー";
        
        console.error(
          `Error processing row: ${JSON.stringify(record)} - ${errorMessage}`,
          innerError
        );
        
        errors.push({
          row: record,
          message: errorMessage,
        });
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
    console.error("Failed to upload items CSV:", error);
    return NextResponse.json(
      {
        error: "CSVのアップロードと処理に失敗しました。",
        details: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log("Database connection closed successfully");
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
  }
}
