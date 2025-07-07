import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 現在のユーザー情報を取得するAPI
 *     description: 認証されたユーザーの情報を取得します
 *     tags: [Users]
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
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 stores:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *       401:
 *         description: 認証エラー
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
export async function GET() {
  try {
    // TODO: 認証チェックを実装
    // const session = await auth()
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: '認証が必要です' },
    //     { status: 401 }
    //   )
    // }

    // 仮のユーザーID（実際の実装では認証から取得）
    const userId = '1'

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        stores: {
          select: { name: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 