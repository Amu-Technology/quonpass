import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// アイテム管理用CSVのバリデーションスキーマ
const itemCsvSchema = z.object({
  種別: z.enum(["食材", "商品", "資材", "特殊"]),
  商品番号: z.string().optional(),
  食材名: z.string().min(1, "食材名は必須です"),
  単位: z.string().optional(),
  最低ロット: z.string().optional(),
  "卸価格（税抜）": z.string().optional(),
});

// レシピ関連CSVのバリデーションスキーマ
const recipeCsvSchema = z.object({
  商品番号: z.string().min(1, "商品番号は必須です"),
  商品名: z.string().min(1, "商品名は必須です"),
  検品基準: z.string().optional(),
  誤差枚数: z.string().optional(),
  "製造可能枚数/型": z.string().optional(),
  材料番号: z.string().min(1, "材料番号は必須です"),
  材料: z.string().min(1, "材料は必須です"),
  内容量: z.string().optional(),
});

/**
 * @swagger
 * /api/upload-items-csv:
 *   post:
 *     summary: 商品CSVをアップロードするAPI
 *     description: 商品CSVファイルをアップロードして商品データをインポートします。アイテム管理用とレシピ関連の両方のCSV形式に対応します。
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
    console.log("=== CSVアップロードAPI開始 ===");
    console.log("リクエストURL:", request.url);
    console.log("リクエストメソッド:", request.method);
    
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

    if (records.length === 0) {
      return NextResponse.json(
        { error: "CSVファイルにデータが含まれていません" },
        { status: 400 }
      );
    }

    // CSVファイルの形式を自動検出
    const firstRecord = records[0];
    const isRecipeFormat = "材料番号" in firstRecord && "材料" in firstRecord;
    const isItemFormat = "種別" in firstRecord && "食材名" in firstRecord;

    console.log("CSV format detection:", { isRecipeFormat, isItemFormat, headers: Object.keys(firstRecord) });

    if (!isRecipeFormat && !isItemFormat) {
      return NextResponse.json(
        { 
          error: "サポートされていないCSV形式です。アイテム管理用（種別、食材名、単位など）またはレシピ関連（商品番号、商品名、材料番号、材料など）の形式を使用してください。" 
        },
        { status: 400 }
      );
    }

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

    console.log(`Processing ${records.length} records from CSV (format: ${isRecipeFormat ? 'recipe' : 'item'})...`);
    
    for (const record of records) {
      try {
        console.log(`Processing record:`, record);
        console.log(`CSV format: ${isRecipeFormat ? 'recipe' : 'item'}`);
        
        if (isRecipeFormat) {
          // レシピ関連CSVの処理
          console.log(`Processing as recipe format`);
          await processRecipeRecord(record);
        } else {
          // アイテム管理用CSVの処理
          console.log(`Processing as item format`);
          await processItemRecord(record);
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
        
        // エラーの詳細をログに出力
        console.error(`Error details:`, {
          isRecipeFormat,
          recordKeys: Object.keys(record),
          errorMessage,
          stack: innerError instanceof Error ? innerError.stack : undefined
        });
        
        errors.push({
          row: record,
          message: errorMessage,
        });
      }
    }

    console.log("=== CSVアップロード処理完了 ===");
    console.log(`インポート件数: ${importedCount}, エラー件数: ${errorCount}`);
    
    if (errorCount > 0) {
      const response = NextResponse.json(
        {
          message: `${importedCount} 件の商品をインポートしました。${errorCount} 件のエラーがありました。`,
          errors: errors,
        },
        { status: 200 }
      );
      console.log("エラーありレスポンス:", response);
      return response;
    } else {
      const response = NextResponse.json({
        message: `${importedCount} 件の商品が正常にインポートされました。`,
      });
      console.log("成功レスポンス:", response);
      return response;
    }
  } catch (error: unknown) {
    console.error("=== CSVアップロードAPIエラー ===");
    console.error("Failed to upload items CSV:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const response = NextResponse.json(
      {
        error: "CSVのアップロードと処理に失敗しました。",
        details: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
    console.log("エラーレスポンス:", response);
    return response;
  } finally {
    try {
      await prisma.$disconnect();
      console.log("Database connection closed successfully");
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
    console.log("=== CSVアップロードAPI終了 ===");
  }
}

// レシピ関連CSVレコードの処理
async function processRecipeRecord(record: Record<string, string>) {
  // バリデーション
  const validatedData = recipeCsvSchema.parse(record);

  // 材料番号の処理
  const materialId = parseInt(validatedData.材料番号.trim());
  if (isNaN(materialId) || materialId <= 0) {
    throw new Error(`無効な材料番号です: ${validatedData.材料番号}`);
  }

  // 商品番号の処理
  const productId = parseInt(validatedData.商品番号.trim());
  if (isNaN(productId) || productId <= 0) {
    throw new Error(`無効な商品番号です: ${validatedData.商品番号}`);
  }

  // 材料アイテムの取得または作成
  let materialItem = await prisma.item.findFirst({
    where: {
      name: validatedData.材料,
    },
  });

  if (!materialItem) {
    console.log(`Creating new material item: ${validatedData.材料}`);
    materialItem = await prisma.item.create({
      data: {
        type: "食材",
        name: validatedData.材料,
        unit: "g", // デフォルト単位
        price: 0, // デフォルト価格
      },
    });
  }

  // 商品アイテムの取得または作成
  let productItem = await prisma.item.findFirst({
    where: {
      name: validatedData.商品名,
    },
  });

  if (!productItem) {
    console.log(`Creating new product item: ${validatedData.商品名}`);
    productItem = await prisma.item.create({
      data: {
        type: "商品",
        name: validatedData.商品名,
        unit: "個", // デフォルト単位
        price: 0, // デフォルト価格
      },
    });
  }

  // ProductItem関連付けの作成または更新
  const existingProductItem = await prisma.productItem.findFirst({
    where: {
      product_id: productItem.id,
      item_id: materialItem.id,
    },
  });

  if (existingProductItem) {
    console.log(`Updating existing ProductItem relationship`);
    // ProductItemは単純な関連付けテーブルのため、更新は不要
  } else {
    console.log(`Creating new ProductItem relationship`);
    await prisma.productItem.create({
      data: {
        product_id: productItem.id,
        item_id: materialItem.id,
      },
    });
  }
}

// アイテム管理用CSVレコードの処理
async function processItemRecord(record: Record<string, string>) {
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
}
