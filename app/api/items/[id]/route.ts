import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// バリデーションスキーマ
const updateItemSchema = z.object({
  type: z.enum(['食材', '商品', '資材', '特殊']).optional(),
  name: z.string().min(1, '商品名は必須です').optional(),
  unit: z.enum(['g', 'kg', '袋', '本', '枚', '巻', '個', '冊', '式', '束', '台', '箱', '粒', 'ケース', 'セット', 'バルク', 'ロット']).optional(),
  minimum_order_quantity: z.string().optional().nullable(),
  price: z.number().positive('価格は正の数である必要があります').optional(),
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: 商品詳細を取得するAPI
 *     description: 指定されたIDの商品詳細を取得します
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 商品詳細の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: 商品が見つかりません
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
 *   put:
 *     summary: 商品を更新するAPI
 *     description: 指定されたIDの商品を更新します
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemRequest'
 *     responses:
 *       200:
 *         description: 商品更新に成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: リクエストエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 商品が見つかりません
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
 *     summary: 商品を削除するAPI
 *     description: 指定されたIDの商品を削除します
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 商品削除に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: 商品が見つかりません
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
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無効な商品IDです' },
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('商品詳細の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '商品詳細の取得に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無効な商品IDです' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // バリデーション
    const validatedData = updateItemSchema.parse(body);

    // 商品の存在確認
    const existingItem = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // 商品の更新
    const updatedItem = await prisma.item.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('バリデーションエラー:', error.errors);
      return NextResponse.json(
        { 
          error: 'バリデーションエラー',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('商品の更新に失敗しました:', error);
    return NextResponse.json(
      { error: '商品の更新に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無効な商品IDです' },
        { status: 400 }
      );
    }

    // 商品の存在確認
    const existingItem = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // 関連するorderItemの確認
    const relatedOrderItems = await prisma.orderItem.findMany({
      where: { itemId: id },
    });

    if (relatedOrderItems.length > 0) {
      return NextResponse.json(
        { 
          error: 'この商品は発注データに関連付けられているため削除できません',
          details: `関連する発注データ: ${relatedOrderItems.length}件`
        },
        { status: 400 }
      );
    }

    // 商品の削除
    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ message: '商品が正常に削除されました' });
  } catch (error) {
    console.error('商品の削除に失敗しました:', error);
    return NextResponse.json(
      { error: '商品の削除に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 