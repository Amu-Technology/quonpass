import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

/**
 * @swagger
 * /api/register-closes:
 *   get:
 *     summary: レジクローズデータを取得するAPI
 *     description: 日付範囲と店舗IDでフィルタリングしてレジクローズデータを取得します
 *     tags: [RegisterCloses]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 開始日
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 終了日
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: integer
 *         description: 店舗ID
 *     responses:
 *       200:
 *         description: レジクローズデータの取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date
 *                   store_id:
 *                     type: integer
 *                   customer_count:
 *                     type: integer
 *                   total_sales:
 *                     type: number
 *                   store:
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const storeId = searchParams.get('storeId')

    const where: Prisma.RegisterCloseWhereInput = {}

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      }
    }

    if (storeId && storeId !== 'all') {
      where.store_id = parseInt(storeId)
    }

    const registerCloses = await prisma.registerClose.findMany({
      where,
      include: {
        store: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(registerCloses)
  } catch (error) {
    console.error('レジクローズデータの取得に失敗しました:', error)
    return NextResponse.json(
      { error: 'レジクローズデータの取得に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * レジクローズデータを作成するAPI
 * 
 * @param {Request} request - HTTPリクエスト
 * @param {string} request.json - レジクローズデータ
 * @param {string} request.json.date - 日付
 * @param {string} request.json.store_id - 店舗ID
 * @param {string} request.json.customer_count - 顧客数
 * @param {string} request.json.total_sales - 総売上
 * @param {string} request.json.male_count - 男性数
 * @param {string} request.json.female_count - 女性数
 * @param {string} request.json.unspecified_count - 不明数
 * @param {string} request.json.cash_amount - 現金金額
 * @param {string} request.json.credit_amount - クレジット金額
 * @param {string} request.json.point_amount - ポイント金額
 * @param {string} request.json.electronic_money_amount - 電子マネー金額
 * 
 * @returns {Promise<NextResponse>} レジクローズデータのJSONレスポンス
 * 
 * @example
 * // レジクローズデータを作成
 * POST /api/register-closes
 * 
 * @throws {500} レジクローズデータの作成に失敗した場合
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const {
      date,
      store_id,
      customer_count,
      total_sales,
      male_count,
      female_count,
      unspecified_count,
      cash_amount,
      credit_amount,
      point_amount,
      electronic_money_amount,
    } = data

    const registerClose = await prisma.registerClose.create({
      data: {
        date: new Date(date),
        store_id,
        customer_count,
        total_sales,
        male_count,
        female_count,
        unspecified_count,
        cash_amount,
        credit_amount,
        point_amount,
        electronic_money_amount,
      },
    })

    return NextResponse.json(registerClose)
  } catch (error) {
    console.error('レジクローズデータの作成に失敗しました:', error)
    return NextResponse.json(
      { error: 'レジクローズデータの作成に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * レジクローズデータを更新するAPI
 * 
 * @param {Request} request - HTTPリクエスト
 * @param {string} request.json - レジクローズデータ
 * @param {string} request.json.id - レジクローズデータID
 * 
 * @returns {Promise<NextResponse>} レジクローズデータのJSONレスポンス
 * 
 * @example
 * // レジクローズデータを更新
 * PATCH /api/register-closes
 * 
 * @throws {500} レジクローズデータの更新に失敗した場合
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: 'レジクローズデータIDは必須です' },
        { status: 400 }
      )
    }

    const registerClose = await prisma.registerClose.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(registerClose)
  } catch (error) {
    console.error('レジクローズデータの更新に失敗しました:', error)
    return NextResponse.json(
      { error: 'レジクローズデータの更新に失敗しました' },
      { status: 500 }
    )
  }
} 