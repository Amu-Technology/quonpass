import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const categoryId = searchParams.get('categoryId')

    const whereClause: any = {
      status: 'active',
    }

    if (storeId) {
      whereClause.store_id = parseInt(storeId)
    }

    if (categoryId) {
      whereClause.category_id = parseInt(categoryId)
    }

    const products = await prisma.products.findMany({
      where: whereClause,
      include: {
        category: true,
        stores: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('商品一覧の取得に失敗しました:', error)
    return NextResponse.json(
      { error: '商品一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
} 