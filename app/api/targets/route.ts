import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// バリデーションスキーマ
const AnnualTargetSchema = z.object({
  year: z.number().min(2020).max(2030),
  store_id: z.number().positive(),
  target_sales_amount: z.number().positive(),
  target_customer_count: z.number().positive(),
  target_total_items_sold: z.number().positive().optional(),
});

/**
 * @swagger
 * /api/targets:
 *   get:
 *     summary: 年間目標一覧を取得するAPI
 *     description: 店舗IDでフィルタリングして年間目標一覧を取得します
 *     tags: [Targets]
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: integer
 *         description: 店舗ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: 年
 *     responses:
 *       200:
 *         description: 年間目標一覧の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnnualTarget'
 *       500:
 *         description: サーバーエラー
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const year = searchParams.get('year');

    const whereClause: Prisma.AnnualTargetWhereInput = {};
    
    if (storeId) {
      whereClause.store_id = parseInt(storeId);
    }
    
    if (year) {
      whereClause.year = parseInt(year);
    }

    const annualTargets = await prisma.annualTarget.findMany({
      where: whereClause,
      include: {
        store: {
          select: {
            name: true,
          },
        },
        monthly_targets: {
          include: {
            weekly_targets: {
              include: {
                daily_targets: true,
              },
            },
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { store_id: 'asc' },
      ],
    });

    return NextResponse.json(annualTargets);
  } catch (error) {
    console.error('年間目標の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '年間目標の取得に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * @swagger
 * /api/targets:
 *   post:
 *     summary: 年間目標を作成するAPI
 *     description: 新しい年間目標を作成します
 *     tags: [Targets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnnualTargetInput'
 *     responses:
 *       201:
 *         description: 年間目標の作成に成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnualTarget'
 *       400:
 *         description: バリデーションエラー
 *       500:
 *         description: サーバーエラー
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 年間目標のバリデーション
    const validatedData = AnnualTargetSchema.parse(body);
    
    // 既存の年間目標をチェック
    const existingTarget = await prisma.annualTarget.findUnique({
      where: {
        year_store_id: {
          year: validatedData.year,
          store_id: validatedData.store_id,
        },
      },
    });

    if (existingTarget) {
      return NextResponse.json(
        { error: '指定された年と店舗の組み合わせの目標は既に存在します' },
        { status: 400 }
      );
    }

    // 年間目標を作成
    const annualTarget = await prisma.annualTarget.create({
      data: {
        year: validatedData.year,
        store_id: validatedData.store_id,
        target_sales_amount: validatedData.target_sales_amount,
        target_customer_count: validatedData.target_customer_count,
        target_total_items_sold: validatedData.target_total_items_sold,
      },
      include: {
        store: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(annualTarget, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('年間目標の作成に失敗しました:', error);
    return NextResponse.json(
      { error: '年間目標の作成に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 