import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: 店舗一覧を取得するAPI
 *     description: アクティブな店舗の一覧を取得します
 *     tags: [Stores]
 *     responses:
 *       200:
 *         description: 店舗一覧の取得に成功
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
 *                   address:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   status:
 *                     type: string
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
  try {
    const stores = await prisma.stores.findMany({
      where: {
        status: 'active',
      },
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(stores)
  } catch (error) {
    console.error('店舗一覧の取得に失敗しました:', error)
    return NextResponse.json(
      { error: '店舗一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/stores:
 *   post:
 *     summary: 店舗を登録するAPI
 *     description: 新しい店舗を登録します
 *     tags: [Stores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 店舗名
 *               address:
 *                 type: string
 *                 description: 住所
 *               phone:
 *                 type: string
 *                 description: 電話番号
 *               email:
 *                 type: string
 *                 format: email
 *                 description: メールアドレス
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: 店舗登録に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *                 status:
 *                   type: string
 *       401:
 *         description: 認証が必要
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
    const { name, address, phone, email } = data

    const store = await prisma.stores.create({
      data: {
        name,
        address,
        phone,
        email,
        status: 'active',
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('店舗登録に失敗しました:', error)
    return NextResponse.json(
      { error: '店舗登録に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/stores:
 *   patch:
 *     summary: 店舗を更新するAPI
 *     description: 既存の店舗情報を更新します
 *     tags: [Stores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 店舗ID
 *               name:
 *                 type: string
 *                 description: 店舗名
 *               address:
 *                 type: string
 *                 description: 住所
 *               phone:
 *                 type: string
 *                 description: 電話番号
 *               email:
 *                 type: string
 *                 format: email
 *                 description: メールアドレス
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: 店舗更新に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *                 status:
 *                   type: string
 *       401:
 *         description: 認証が必要
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
        { error: '店舗IDは必須です' },
        { status: 400 }
      )
    }

    const store = await prisma.stores.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('店舗更新に失敗しました:', error)
    return NextResponse.json(
      { error: '店舗更新に失敗しました' },
      { status: 500 }
    )
  }
} 