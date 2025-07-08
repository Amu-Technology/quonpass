import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// バリデーションスキーマ
const orderItemSchema = z.object({
  item_id: z.number().positive("商品IDは正の数である必要があります"),
  quantity: z.number().positive("数量は正の数である必要があります"),
  unit_price: z.number().positive("単価は正の数である必要があります"),
});

const updateOrderSchema = z.object({
  store_id: z
    .number()
    .positive("店舗IDは正の数である必要があります")
    .optional(),
  user_id: z.string().optional(),
  other_delivery_address: z.string().optional(),
  holiday: z.enum(["月", "火", "水", "木", "金", "土", "日"]).optional(),
  request_message: z.string().optional(),
  total_amount: z
    .number()
    .positive("合計金額は正の数である必要があります")
    .optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  order_items: z.array(orderItemSchema).optional(),
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: 発注詳細を取得するAPI
 *     description: 指定されたIDの発注詳細を取得します
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 発注ID
 *     responses:
 *       200:
 *         description: 発注詳細の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: 発注が見つかりません
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
 *   put:
 *     summary: 発注を更新するAPI
 *     description: 指定されたIDの発注を更新します
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 発注ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderRequest'
 *     responses:
 *       200:
 *         description: 発注更新に成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: リクエストエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 発注が見つかりません
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
 *   delete:
 *     summary: 発注を削除するAPI
 *     description: 指定されたIDの発注を削除します
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 発注ID
 *     responses:
 *       200:
 *         description: 発注削除に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: 発注が見つかりません
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
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "無効な発注IDです" }, { status: 400 });
    }

    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        stores: {
          select: {
            name: true,
          },
        },
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItem: {
          include: {
            item: {
              select: {
                name: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "発注が見つかりません" },
        { status: 404 },
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("発注詳細の取得に失敗しました:", error);
    return NextResponse.json(
      { error: "発注詳細の取得に失敗しました" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "無効な発注IDです" }, { status: 400 });
    }

    const body = await request.json();

    // バリデーション
    const validatedData = updateOrderSchema.parse(body);

    // 発注の存在確認
    const existingOrder = await prisma.orders.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "発注が見つかりません" },
        { status: 404 },
      );
    }

    // 店舗の存在確認（更新される場合）
    if (validatedData.store_id) {
      const store = await prisma.stores.findUnique({
        where: { id: validatedData.store_id },
      });

      if (!store) {
        return NextResponse.json(
          { error: "指定された店舗が見つかりません" },
          { status: 400 },
        );
      }
    }

    // ユーザーの存在確認（更新される場合）
    if (validatedData.user_id) {
      const user = await prisma.users.findUnique({
        where: { id: validatedData.user_id },
      });

      if (!user) {
        return NextResponse.json(
          { error: "指定されたユーザーが見つかりません" },
          { status: 400 },
        );
      }
    }

    // 商品の存在確認（発注明細が更新される場合）
    if (validatedData.order_items) {
      const itemIds = validatedData.order_items.map((item) => item.item_id);
      const items = await prisma.item.findMany({
        where: { id: { in: itemIds } },
      });

      if (items.length !== itemIds.length) {
        const foundIds = items.map((item) => item.id);
        const missingIds = itemIds.filter((id) => !foundIds.includes(id));
        return NextResponse.json(
          { error: `存在しない商品ID: ${missingIds.join(", ")}` },
          { status: 400 },
        );
      }
    }

    // トランザクションで発注と発注明細を更新
    await prisma.$transaction(async (tx) => {
      // 発注を更新
      await tx.orders.update({
        where: { id },
        data: {
          store_id: validatedData.store_id,
          user_id: validatedData.user_id,
          other_delivery_address: validatedData.other_delivery_address,
          holiday: validatedData.holiday,
          request_message: validatedData.request_message,
          total_amount: validatedData.total_amount,
          status: validatedData.status,
        },
      });

      // 発注明細が更新される場合
      if (validatedData.order_items) {
        // 既存の発注明細を削除
        await tx.orderItem.deleteMany({
          where: { order_id: id },
        });

        // 新しい発注明細を作成
        await Promise.all(
          validatedData.order_items.map((item) =>
            tx.orderItem.create({
              data: {
                order_id: id,
                item_id: item.item_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                ordersId: id,
                itemId: item.item_id,
              },
            }),
          ),
        );
      }

      // トランザクション完了
    });

    // 更新された発注を詳細付きで取得
    const result = await prisma.orders.findUnique({
      where: { id },
      include: {
        stores: {
          select: {
            name: true,
          },
        },
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItem: {
          include: {
            item: {
              select: {
                name: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("バリデーションエラー:", error.errors);
      return NextResponse.json(
        {
          error: "バリデーションエラー",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("発注の更新に失敗しました:", error);
    return NextResponse.json(
      { error: "発注の更新に失敗しました" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "無効な発注IDです" }, { status: 400 });
    }

    // 発注の存在確認
    const existingOrder = await prisma.orders.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "発注が見つかりません" },
        { status: 404 },
      );
    }

    // トランザクションで発注と発注明細を削除
    await prisma.$transaction(async (tx) => {
      // 発注明細を削除
      await tx.orderItem.deleteMany({
        where: { order_id: id },
      });

      // 発注を削除
      await tx.orders.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "発注が正常に削除されました" });
  } catch (error) {
    console.error("発注の削除に失敗しました:", error);
    return NextResponse.json(
      { error: "発注の削除に失敗しました" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
