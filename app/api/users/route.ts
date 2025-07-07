import { NextResponse } from 'next/server'
import { UserProvider } from '@/lib/providers/user-provider'
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: ユーザー情報を取得するAPI
 *     description: メールアドレスでユーザー情報を検索します
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: 検索対象のメールアドレス
 *     responses:
 *       200:
 *         description: ユーザー情報の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 store_id:
 *                   type: integer
 *                 store:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *       400:
 *         description: メールアドレスが指定されていない
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: ユーザーが見つからない
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
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "メールアドレスが必要です" }, { status: 400 })
    }

    const user = await prismaClient.users.findUnique({
      where: {
        email,
      },
      include: {
        stores: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      store: user.stores,
    })
  } catch (error) {
    console.error("ユーザー情報の取得に失敗しました:", error)
    return NextResponse.json(
      { error: "ユーザー情報の取得に失敗しました" },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/users:
 *   patch:
 *     summary: ユーザー情報を更新するAPI
 *     description: 指定されたIDのユーザー情報を更新します
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 更新対象のユーザーID
 *               name:
 *                 type: string
 *                 description: ユーザー名
 *               role:
 *                 type: string
 *                 description: ユーザー権限
 *               store_id:
 *                 type: integer
 *                 description: 店舗ID
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: ユーザー情報の更新に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 store_id:
 *                   type: integer
 *       400:
 *         description: IDが指定されていない
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
    const { id, ...data } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'IDは必須です' }, { status: 400 })
    }

    const updatedUser = await UserProvider.updateUser(id, data)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('ユーザー情報の更新に失敗しました:', error)
    return NextResponse.json(
      { error: 'ユーザー情報の更新に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: ユーザーを登録するAPI
 *     description: 新しいユーザーを登録します
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: ユーザー名
 *               email:
 *                 type: string
 *                 format: email
 *                 description: メールアドレス
 *               role:
 *                 type: string
 *                 description: ユーザー権限（デフォルト: store_staff）
 *               store_id:
 *                 type: integer
 *                 description: 店舗ID
 *             required:
 *               - name
 *               - email
 *     responses:
 *       201:
 *         description: ユーザー登録に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 store_id:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *                   format: date-time
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
    const body = await request.json()
    const { name, email, role = 'store_staff', store_id } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: '名前とメールアドレスは必須です' },
        { status: 400 }
      )
    }

    const user = await prismaClient.users.create({
      data: {
        name,
        email,
        role,
        store_id: store_id ? parseInt(store_id) : null,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  } finally {
    await prismaClient.$disconnect()
  }
} 