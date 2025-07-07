// app/api/sales-records/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { parseISO, isValid } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const storeIdParam = searchParams.get('storeId'); // 店舗IDでのフィルタリングも考慮

    const whereClause: any = {};

    if (startDateParam && isValid(parseISO(startDateParam))) {
      whereClause.date = { ...whereClause.date, gte: parseISO(startDateParam) };
    }
    if (endDateParam && isValid(parseISO(endDateParam))) {
      whereClause.date = { ...whereClause.date, lte: parseISO(endDateParam) };
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