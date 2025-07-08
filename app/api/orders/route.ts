import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// バリデーションスキーマ
const orderItemSchema = z.object({
  item_id: z.number().positive("商品IDは正の数である必要があります"),
  quantity: z.number().positive("数量は正の数である必要があります"),
  unit_price: z.number().positive("単価は正の数である必要があります"),
});

const createOrderSchema = z.object({
  store_id: z.number().positive("店舗IDは正の数である必要があります"),
  user_id: z.string().optional(),
  other_delivery_address: z.string().optional(),
  holiday: z.enum(["月", "火", "水", "木", "金", "土", "日"]).optional(),
  request_message: z.string().optional(),
  total_amount: z.number().positive("合計金額は正の数である必要があります"),
  status: z.enum(["active", "inactive", "archived"]),
  order_items: z.array(orderItemSchema).min(1, "最低1つの商品が必要です"),
});

// updateOrderSchemaは個別のorder更新で使用

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: 発注一覧を取得するAPI
 *     description: 全発注の一覧を取得します
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: integer
 *         description: 店舗IDでフィルタリング
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, archived]
 *         description: ステータスでフィルタリング
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 開始日（YYYY-MM-DD形式）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 終了日（YYYY-MM-DD形式）
 *     responses:
 *       200:
 *         description: 発注一覧の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: 発注を作成するAPI
 *     description: 新しい発注を作成します（複数の商品を含む）
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: 発注作成に成功
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
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereClause: Prisma.ordersWhereInput = {};

    // 店舗IDでフィルタリング
    if (storeId) {
      whereClause.store_id = parseInt(storeId, 10);
    }

    // ステータスでフィルタリング
    if (status) {
      whereClause.status = status as Prisma.ordersWhereInput["status"];
    }

    // 日付範囲でフィルタリング
    if (startDate || endDate) {
      whereClause.order_at = {};
      if (startDate) {
        whereClause.order_at.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.order_at.lte = new Date(endDate);
      }
    }

    const orders = await prisma.orders.findMany({
      where: whereClause,
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
      orderBy: {
        order_at: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("発注一覧の取得に失敗しました:", error);
    return NextResponse.json(
      { error: "発注一覧の取得に失敗しました" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // バリデーション
    const validatedData = createOrderSchema.parse(body);

    // 店舗の存在確認
    const store = await prisma.stores.findUnique({
      where: { id: validatedData.store_id },
    });

    if (!store) {
      return NextResponse.json(
        { error: "指定された店舗が見つかりません" },
        { status: 400 },
      );
    }

    // ユーザーの存在確認（指定されている場合）
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

    // 商品の存在確認
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

    // トランザクションで発注と発注明細を作成
    const result = await prisma.$transaction(async (tx) => {
      // 発注を作成
      const order = await tx.orders.create({
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

      // 発注明細を作成
      const orderItems = await Promise.all(
        validatedData.order_items.map((item) =>
          tx.orderItem.create({
            data: {
              order_id: order.id,
              item_id: item.item_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              ordersId: order.id,
              itemId: item.item_id,
            },
          }),
        ),
      );

      return { order, orderItems };
    });

    // 作成された発注を詳細付きで取得
    const createdOrder = await prisma.orders.findUnique({
      where: { id: result.order.id },
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

    return NextResponse.json(createdOrder, { status: 201 });
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

    console.error("発注の作成に失敗しました:", error);
    return NextResponse.json(
      { error: "発注の作成に失敗しました" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
