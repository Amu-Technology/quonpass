// app/api/sales-records/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { parseISO, isValid } from 'date-fns';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/sales-records:
 *   get:
 *     summary: 売上記録を取得するAPI
 *     description: 店舗の売上記録を日付範囲と店舗IDでフィルタリングして取得します
 *     tags: [Sales]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 開始日（YYYY-MM-DD形式）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 終了日（YYYY-MM-DD形式）
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: integer
 *         description: 店舗ID
 *     responses:
 *       200:
 *         description: 売上記録の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SalesRecord'
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
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const storeIdParam = searchParams.get('storeId'); // 店舗IDでのフィルタリングも考慮

    const whereClause: Prisma.SalesRecordWhereInput = {};

    if (startDateParam && isValid(parseISO(startDateParam))) {
      whereClause.date = { gte: parseISO(startDateParam) };
    }
    if (endDateParam && isValid(parseISO(endDateParam))) {
      whereClause.date = { ...(whereClause.date as object), lte: parseISO(endDateParam) };
    }
    if (storeIdParam) {
      const storeId = parseInt(storeIdParam, 10);
      if (!isNaN(storeId)) {
        whereClause.store_id = storeId;
      }
    }

    const salesRecords = await prisma.salesRecord.findMany({
      where: whereClause,
      include: {
        store: {
          select: { name: true } // 店舗名を取得
        },
        product: {
          select: { name: true } // 商品名を取得
        },
      },
      orderBy: {
        date: 'desc' // 日付で降順にソート
      }
      // TODO: ページネーション (skip, take) も実装すると良いでしょう
    });

    return NextResponse.json(salesRecords);
  } catch (error) {
    console.error('Failed to fetch sales records:', error);
    return NextResponse.json({ error: 'Failed to fetch sales records' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}