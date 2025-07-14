import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/targets/monthly/{id}:
 *   put:
 *     summary: 月間目標を更新するAPI
 *     description: 指定されたIDの月間目標を更新します
 *     tags: [Targets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 月間目標ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               annual_target_id:
 *                 type: integer
 *               month:
 *                 type: integer
 *               allocation_percentage:
 *                 type: number
 *               target_sales_amount:
 *                 type: number
 *               target_customer_count:
 *                 type: integer
 *               target_total_items_sold:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 月間目標の更新に成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonthlyTarget'
 *       404:
 *         description: 月間目標が見つかりません
 *       500:
 *         description: サーバーエラー
 *   delete:
 *     summary: 月間目標を削除するAPI
 *     description: 指定されたIDの月間目標を削除します
 *     tags: [Targets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 月間目標ID
 *     responses:
 *       200:
 *         description: 月間目標の削除に成功
 *       404:
 *         description: 月間目標が見つかりません
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
    const { 
      annual_target_id, 
      month, 
      allocation_percentage, 
      target_sales_amount, 
      target_customer_count, 
      target_total_items_sold 
    } = body;

    // 既存の月間目標を確認
    const existingTarget = await prisma.monthlyTarget.findUnique({
      where: { id: targetId }
    });

    if (!existingTarget) {
      return NextResponse.json(
        { error: '月間目標が見つかりません' },
        { status: 404 }
      );
    }

    // 月間目標を更新
    const updatedTarget = await prisma.monthlyTarget.update({
      where: { id: targetId },
      data: {
        annual_target_id,
        month,
        allocation_percentage,
        target_sales_amount,
        target_customer_count,
        target_total_items_sold,
      },
      include: {
        annual_target: {
          include: {
            store: {
              select: { name: true }
            }
          }
        },
        weekly_targets: true
      }
    });

    return NextResponse.json(updatedTarget);
  } catch (error) {
    console.error('月間目標の更新に失敗しました:', error);
    return NextResponse.json(
      { error: '月間目標の更新に失敗しました' },
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

    // 既存の月間目標を確認
    const existingTarget = await prisma.monthlyTarget.findUnique({
      where: { id: targetId },
      include: {
        weekly_targets: true
      }
    });

    if (!existingTarget) {
      return NextResponse.json(
        { error: '月間目標が見つかりません' },
        { status: 404 }
      );
    }

    // 関連する週間目標を先に削除
    if (existingTarget.weekly_targets.length > 0) {
      await prisma.weeklyTarget.deleteMany({
        where: { monthly_target_id: targetId }
      });
    }

    // 月間目標を削除
    await prisma.monthlyTarget.delete({
      where: { id: targetId }
    });

    return NextResponse.json({ message: '月間目標が正常に削除されました' });
  } catch (error) {
    console.error('月間目標の削除に失敗しました:', error);
    return NextResponse.json(
      { error: '月間目標の削除に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 