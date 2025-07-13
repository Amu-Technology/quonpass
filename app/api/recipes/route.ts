import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: レシピ一覧を取得するAPI
 *     description: レシピ一覧を取得します
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: レシピ一覧の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        item: true,
        recipeItems: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('レシピ一覧の取得に失敗しました:', error);
    return NextResponse.json(
      { error: 'レシピ一覧の取得に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: レシピを作成するAPI
 *     description: 新しいレシピを作成します
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item_id:
 *                 type: integer
 *                 description: 発注用アイテムID
 *               inspection_standard:
 *                 type: integer
 *                 description: 検査基準値
 *               inspection_unit:
 *                 type: string
 *                 description: 検査単位
 *               manufacturable_quantity:
 *                 type: integer
 *                 description: 製造可能数量
 *               manufacturable_unit:
 *                 type: string
 *                 description: 製造可能単位
 *               manufacturing_cost_per_piece:
 *                 type: number
 *                 description: 製造原価/枚
 *               packaging_cost_per_piece:
 *                 type: number
 *                 description: 個包装単価/枚
 *               product_cost_per_piece:
 *                 type: number
 *                 description: 商品原価/枚
 *               recipe_items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     item_id:
 *                       type: integer
 *                       description: 材料アイテムID
 *                     quantity:
 *                       type: integer
 *                       description: 使用量
 *             required:
 *               - item_id
 *               - inspection_standard
 *               - inspection_unit
 *               - manufacturable_quantity
 *               - manufacturable_unit
 *     responses:
 *       201:
 *         description: レシピの作成に成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
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
    const body = await request.json();
    const {
      item_id,
      inspection_standard,
      inspection_unit,
      manufacturable_quantity,
      manufacturable_unit,
      manufacturing_cost_per_piece,
      packaging_cost_per_piece,
      product_cost_per_piece,
      recipe_items,
    } = body;

    // バリデーション
    if (!item_id || !inspection_standard || !inspection_unit || !manufacturable_quantity || !manufacturable_unit) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    // アイテムの存在確認
    const item = await prisma.item.findUnique({
      where: { id: item_id },
    });

    if (!item) {
      return NextResponse.json(
        { error: '指定されたアイテムが見つかりません' },
        { status: 400 }
      );
    }

    // レシピの作成
    const recipe = await prisma.recipe.create({
      data: {
        item_id,
        inspection_standard,
        inspection_unit,
        manufacturable_quantity,
        manufacturable_unit,
        manufacturing_cost_per_piece: manufacturing_cost_per_piece ? parseFloat(manufacturing_cost_per_piece) : null,
        packaging_cost_per_piece: packaging_cost_per_piece ? parseFloat(packaging_cost_per_piece) : null,
        product_cost_per_piece: product_cost_per_piece ? parseFloat(product_cost_per_piece) : null,
      },
    });

    // レシピアイテムの作成
    if (recipe_items && recipe_items.length > 0) {
      for (const recipeItem of recipe_items) {
        const { item_id: material_item_id, quantity } = recipeItem;
        
        // 材料アイテムの存在確認
        const materialItem = await prisma.item.findUnique({
          where: { id: material_item_id },
        });

        if (!materialItem) {
          return NextResponse.json(
            { error: `材料アイテムID ${material_item_id} が見つかりません` },
            { status: 400 }
          );
        }

        await prisma.recipeItem.create({
          data: {
            recipe_id: recipe.id,
            item_id: material_item_id,
            quantity,
          },
        });
      }
    }

    // 作成されたレシピを取得
    const createdRecipe = await prisma.recipe.findUnique({
      where: { id: recipe.id },
      include: {
        item: {
          select: {
            name: true,
            type: true,
          },
        },
        recipeItems: {
          include: {
            item: {
              select: {
                name: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(createdRecipe, { status: 201 });
  } catch (error) {
    console.error('レシピの作成に失敗しました:', error);
    return NextResponse.json(
      { error: 'レシピの作成に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 