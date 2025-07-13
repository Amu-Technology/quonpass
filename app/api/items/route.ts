import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// バリデーションスキーマ
const createItemSchema = z.object({
  type: z.enum(['食材', '商品', '資材', '特殊']),
  name: z.string().min(1, '商品名は必須です'),
  unit: z.enum(['g', 'kg', '袋', '本', '枚', '巻', '個', '冊', '式', '束', '台', '箱', '粒', 'ケース', 'セット', 'バルク', 'ロット']),
  minimum_order_quantity: z.string().min(1, '最小発注数量は必須です'),
  price: z.number().positive('価格は正の数である必要があります'),
});


/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: 商品一覧を取得するAPI
 *     description: 全商品の一覧を取得します
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [食材, 商品, 資材, 特殊]
 *         description: 商品タイプでフィルタリング
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 商品名で検索
 *     responses:
 *       200:
 *         description: 商品一覧の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: 商品を作成するAPI
 *     description: 新しい商品を作成します
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *     responses:
 *       201:
 *         description: 商品作成に成功
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
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const whereClause: Prisma.itemWhereInput = {};

    // タイプでフィルタリング
    if (type) {
      whereClause.type = type as Prisma.itemWhereInput['type'];
    }

    // 商品名で検索
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive' as const,
      };
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('商品一覧の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '商品一覧の取得に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // バリデーション
    const validatedData = createItemSchema.parse(body);

    // 商品の作成
    const item = await prisma.item.create({
      data: {
        type: validatedData.type,
        name: validatedData.name,
        unit: validatedData.unit,
        minimum_order_quantity: validatedData.minimum_order_quantity,
        price: validatedData.price,
      },
    });

    return NextResponse.json(item, { status: 201 });
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

    console.error('商品の作成に失敗しました:', error);
    return NextResponse.json(
      { error: '商品の作成に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 

/**
 * @swagger
 * /api/items:
 *   delete:
 *     summary: 全アイテムを削除するAPI
 *     description: itemsテーブルの全レコードを削除します
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: 全件削除に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function DELETE() {
  try {
    await prisma.item.deleteMany({});
    return NextResponse.json({ message: '全アイテムを削除しました' });
  } catch (error) {
    console.error('全件削除に失敗:', error);
    return NextResponse.json({ error: '全件削除に失敗しました' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 