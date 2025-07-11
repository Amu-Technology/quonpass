import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// バリデーションスキーマ
const MonthlyTargetSchema = z.object({
  annual_target_id: z.number().positive(),
  month: z.number().min(1).max(12),
  allocation_percentage: z.number().min(0).max(1),
  target_sales_amount: z.number().positive(),
  target_customer_count: z.number().positive(),
  target_total_items_sold: z.number().positive().optional(),
});

/**
 * @swagger
 * /api/targets/monthly:
 *   get:
 *     summary: 月間目標一覧を取得するAPI
 *     description: 年間目標IDでフィルタリングして月間目標一覧を取得します
 *     tags: [Targets]
 *     parameters:
 *       - in: query
 *         name: annualTargetId
 *         schema:
 *           type: integer
 *         description: 年間目標ID
 *     responses:
 *       200:
 *         description: 月間目標一覧の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MonthlyTarget'
 *       500:
 *         description: サーバーエラー
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const annualTargetId = searchParams.get('annualTargetId');

    const whereClause: Prisma.MonthlyTargetWhereInput = {};
    
    if (annualTargetId) {
      whereClause.annual_target_id = parseInt(annualTargetId);
    }

    const monthlyTargets = await prisma.monthlyTarget.findMany({
      where: whereClause,
      include: {
        annual_target: {
          include: {
            store: {
              select: {
                name: true,
              },
            },
          },
        },
        weekly_targets: {
          include: {
            daily_targets: true,
          },
        },
      },
      orderBy: [
        { month: 'asc' },
      ],
    });

    return NextResponse.json(monthlyTargets);
  } catch (error) {
    console.error('月間目標の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '月間目標の取得に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * @swagger
 * /api/targets/monthly:
 *   post:
 *     summary: 月間目標を作成するAPI
 *     description: 新しい月間目標を作成します
 *     tags: [Targets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MonthlyTargetInput'
 *     responses:
 *       201:
 *         description: 月間目標の作成に成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonthlyTarget'
 *       400:
 *         description: バリデーションエラー
 *       500:
 *         description: サーバーエラー
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 月間目標のバリデーション
    const validatedData = MonthlyTargetSchema.parse(body);
    
    // 既存の月間目標をチェック
    const existingTarget = await prisma.monthlyTarget.findUnique({
      where: {
        annual_target_id_month: {
          annual_target_id: validatedData.annual_target_id,
          month: validatedData.month,
        },
      },
    });

    if (existingTarget) {
      return NextResponse.json(
        { error: '指定された年間目標と月の組み合わせの目標は既に存在します' },
        { status: 400 }
      );
    }

    // 月間目標を作成
    const monthlyTarget = await prisma.monthlyTarget.create({
      data: {
        annual_target_id: validatedData.annual_target_id,
        month: validatedData.month,
        allocation_percentage: validatedData.allocation_percentage,
        target_sales_amount: validatedData.target_sales_amount,
        target_customer_count: validatedData.target_customer_count,
        target_total_items_sold: validatedData.target_total_items_sold,
      },
      include: {
        annual_target: {
          include: {
            store: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(monthlyTarget, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('月間目標の作成に失敗しました:', error);
    return NextResponse.json(
      { error: '月間目標の作成に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 