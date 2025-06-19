import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

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