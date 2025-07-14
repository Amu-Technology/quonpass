import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/targets/{id}:
 *   put:
 *     summary: 年間目標を更新するAPI
 *     description: 指定されたIDの年間目標を更新します
 *     tags: [Targets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 年間目標ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *               store_id:
 *                 type: integer
 *               target_sales_amount:
 *                 type: number
 *               target_customer_count:
 *                 type: integer
 *               target_total_items_sold:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 年間目標の更新に成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnualTarget'
 *       404:
 *         description: 年間目標が見つかりません
 *       500:
 *         description: サーバーエラー
 *   delete:
 *     summary: 年間目標を削除するAPI
 *     description: 指定されたIDの年間目標と関連する月間目標を削除します
 *     tags: [Targets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 年間目標ID
 *     responses:
 *       200:
 *         description: 年間目標の削除に成功
 *       404:
 *         description: 年間目標が見つかりません
 *       500:
 *         description: サーバーエラー
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const targetId = parseInt(id);
    if (isNaN(targetId)) {
      return NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { year, store_id, target_sales_amount, target_customer_count, target_total_items_sold } = body;

    // 既存の年間目標を確認
    const existingTarget = await prisma.annualTarget.findUnique({
      where: { id: targetId }
    });

    if (!existingTarget) {
      return NextResponse.json(
        { error: '年間目標が見つかりません' },
        { status: 404 }
      );
    }

    // 年間目標を更新
    const updatedTarget = await prisma.annualTarget.update({
      where: { id: targetId },
      data: {
        year,
        store_id,
        target_sales_amount,
        target_customer_count,
        target_total_items_sold,
      },
      include: {
        store: {
          select: { name: true }
        },
        monthly_targets: true
      }
    });

    return NextResponse.json(updatedTarget);
  } catch (error) {
    console.error('年間目標の更新に失敗しました:', error);
    return NextResponse.json(
      { error: '年間目標の更新に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const targetId = parseInt(id);
    if (isNaN(targetId)) {
      return NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }

    // 既存の年間目標を確認
    const existingTarget = await prisma.annualTarget.findUnique({
      where: { id: targetId },
      include: {
        monthly_targets: true
      }
    });

    if (!existingTarget) {
      return NextResponse.json(
        { error: '年間目標が見つかりません' },
        { status: 404 }
      );
    }

    // 関連する月間目標を先に削除
    if (existingTarget.monthly_targets.length > 0) {
      await prisma.monthlyTarget.deleteMany({
        where: { annual_target_id: targetId }
      });
    }

    // 年間目標を削除
    await prisma.annualTarget.delete({
      where: { id: targetId }
    });

    return NextResponse.json({ message: '年間目標が正常に削除されました' });
  } catch (error) {
    console.error('年間目標の削除に失敗しました:', error);
    return NextResponse.json(
      { error: '年間目標の削除に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 