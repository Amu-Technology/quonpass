import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 商品一覧を取得するAPI
 *     description: 店舗IDとカテゴリIDでフィルタリングして商品一覧を取得します
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: integer
 *         description: 店舗ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: カテゴリID
 *     responses:
 *       200:
 *         description: 商品一覧の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   status:
 *                     type: string
 *                   category:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                   stores:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const categoryId = searchParams.get('categoryId')

    const whereClause: Prisma.productsWhereInput = {
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