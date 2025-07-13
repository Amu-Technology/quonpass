import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 店舗データの確認
    const stores = await prisma.stores.findMany({
      take: 5
    });

    // 売上記録データの確認
    const salesRecords = await prisma.salesRecord.findMany({
      take: 5,
      include: {
        store: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    // レジクローズデータの確認
    const registerCloses = await prisma.registerClose.findMany({
      take: 5,
      include: {
        store: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    // 2024年のデータ確認
    const sales2024 = await prisma.salesRecord.findMany({
      where: {
        date: {
          gte: new Date('2024-01-01'),
          lte: new Date('2024-12-31')
        }
      },
      take: 5,
      include: {
        store: true
      }
    });

    const registerClose2024 = await prisma.registerClose.findMany({
      where: {
        date: {
          gte: new Date('2024-01-01'),
          lte: new Date('2024-12-31')
        }
      },
      take: 5,
      include: {
        store: true
      }
    });

    return NextResponse.json({
      stores: {
        count: stores.length,
        data: stores
      },
      salesRecords: {
        count: salesRecords.length,
        data: salesRecords
      },
      registerCloses: {
        count: registerCloses.length,
        data: registerCloses
      },
      sales2024: {
        count: sales2024.length,
        data: sales2024
      },
      registerClose2024: {
        count: registerClose2024.length,
        data: registerClose2024
      }
    });
  } catch (error) {
    console.error('テストデータ取得エラー:', error);
    return NextResponse.json({ error: 'テストデータの取得に失敗しました' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 