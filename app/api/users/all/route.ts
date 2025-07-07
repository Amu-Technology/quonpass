import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * @swagger
 * /api/users/all:
 *   get:
 *     summary: 全ユーザー一覧を取得するAPI
 *     description: システムに登録されている全ユーザーの一覧を取得します
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: ユーザー一覧の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                   store_id:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
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
export async function GET() {
  try {
    const users = await prisma.users.findMany({
      include: {
        stores: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('ユーザー一覧の取得に失敗しました:', error)
    return NextResponse.json(
      { error: 'ユーザー一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
} 