import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: カテゴリ一覧を取得するAPI
 *     description: アクティブなカテゴリの一覧を取得します
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: カテゴリ一覧の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   code:
 *                     type: string
 *                   name:
 *                     type: string
 *                   level:
 *                     type: integer
 *                   parent_id:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   parent:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                   children:
 *                     type: array
 *                     items:
 *                       type: object
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
  try {
    const categories = await prisma.categories.findMany({
      where: {
        status: 'active',
      },
      orderBy: [
        { level: 'asc' },
        { code: 'asc' },
      ],
      include: {
        parent: true,
        children: true,
      },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('カテゴリ一覧の取得に失敗しました:', error)
    return NextResponse.json(
      { error: 'カテゴリ一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: カテゴリを登録するAPI
 *     description: 新しいカテゴリを登録します
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: カテゴリコード
 *               name:
 *                 type: string
 *                 description: カテゴリ名
 *               level:
 *                 type: integer
 *                 description: カテゴリレベル
 *               parent_id:
 *                 type: integer
 *                 description: 親カテゴリID
 *             required:
 *               - code
 *               - name
 *     responses:
 *       200:
 *         description: カテゴリ登録に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 code:
 *                   type: string
 *                 name:
 *                   type: string
 *                 level:
 *                   type: integer
 *                 parent_id:
 *                   type: integer
 *                 status:
 *                   type: string
 *       401:
 *         description: 認証が必要
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: カテゴリコードが重複している
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
    const { code, name, level, parent_id } = data

    // カテゴリコードの重複チェック
    const existingCategory = await prisma.categories.findUnique({
      where: { code },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'このカテゴリコードは既に使用されています' },
        { status: 400 }
      )
    }

    const category = await prisma.categories.create({
      data: {
        code,
        name,
        level: level || 1,
        parent_id: parent_id || null,
        status: 'active',
      },
      include: {
        parent: true,
        children: true,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('カテゴリ登録に失敗しました:', error)
    return NextResponse.json(
      { error: 'カテゴリ登録に失敗しました' },
      { status: 500 }
    )
  }
} 