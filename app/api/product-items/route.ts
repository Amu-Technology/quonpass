import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/product-items:
 *   get:
 *     summary: productとitemの関連付け一覧を取得するAPI
 *     description: すべてのproductとitemの関連付けを取得します
 *     tags: [ProductItems]
 *     responses:
 *       200:
 *         description: 関連付け一覧の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   product_id:
 *                     type: integer
 *                   item_id:
 *                     type: integer
 *                   product:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       store:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                   item:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: productとitemの関連付けを作成するAPI
 *     description: 指定されたproductとitemを関連付けます
 *     tags: [ProductItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               item_id:
 *                 type: integer
 *             required:
 *               - product_id
 *               - item_id
 *     responses:
 *       200:
 *         description: 関連付けの作成に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *   delete:
 *     summary: productとitemの関連付けを削除するAPI
 *     description: 指定されたproductとitemの関連付けを削除します
 *     tags: [ProductItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               item_id:
 *                 type: integer
 *             required:
 *               - product_id
 *               - item_id
 *     responses:
 *       200:
 *         description: 関連付けの削除に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
export async function GET() {
  try {
    console.log('ProductItems API - GET リクエスト開始');
    
    const productItems = await prisma.productItem.findMany({
      include: {
        product: {
          include: {
            stores: {
              select: {
                name: true
              }
            }
          }
        },
        item: true
      },
      orderBy: [
        { product: { name: 'asc' } },
        { item: { name: 'asc' } }
      ]
    });

    console.log('ProductItems API - 取得件数:', productItems.length);
    return NextResponse.json(productItems);
  } catch (error) {
    console.error('関連付け一覧の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '関連付け一覧の取得に失敗しました', details: error instanceof Error ? error.message : '不明なエラー' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const { product_id, item_id } = await request.json();

    if (!product_id || !item_id) {
      return NextResponse.json(
        { error: 'product_idとitem_idが必要です' },
        { status: 400 }
      );
    }

    // 既存の関連付けをチェック
    const existingRelation = await prisma.productItem.findUnique({
      where: {
        product_id_item_id: {
          product_id: parseInt(product_id),
          item_id: parseInt(item_id)
        }
      }
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: 'この関連付けは既に存在します' },
        { status: 400 }
      );
    }

    // 関連付けを作成
    await prisma.productItem.create({
      data: {
        product_id: parseInt(product_id),
        item_id: parseInt(item_id)
      }
    });

    return NextResponse.json({ message: '関連付けが正常に作成されました' });
  } catch (error) {
    console.error('関連付けの作成に失敗しました:', error);
    return NextResponse.json(
      { error: '関連付けの作成に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  try {
    const { product_id, item_id } = await request.json();

    if (!product_id || !item_id) {
      return NextResponse.json(
        { error: 'product_idとitem_idが必要です' },
        { status: 400 }
      );
    }

    // 関連付けを削除
    await prisma.productItem.delete({
      where: {
        product_id_item_id: {
          product_id: parseInt(product_id),
          item_id: parseInt(item_id)
        }
      }
    });

    return NextResponse.json({ message: '関連付けが正常に削除されました' });
  } catch (error) {
    console.error('関連付けの削除に失敗しました:', error);
    return NextResponse.json(
      { error: '関連付けの削除に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 