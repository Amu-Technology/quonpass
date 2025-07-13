import { NextResponse } from 'next/server';
import { PrismaClient, status } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/test-data:
 *   post:
 *     summary: テストデータを作成するAPI
 *     description: レシピテスト用の商品と材料データを作成します
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: テストデータの作成に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST() {
  try {
    // 店舗の取得または作成
    let store = await prisma.stores.findFirst({
      where: { name: 'テスト店舗' }
    });

    if (!store) {
      store = await prisma.stores.create({
        data: {
          name: 'テスト店舗',
          address: 'テスト住所',
          phone: '000-0000-0000',
          email: 'test@example.com',
          status: status.active
        }
      });
    }

    // テスト商品の作成
    const testProducts = [
      { id: 3038, name: '久遠テリーヌ　　ノアール（スイート）' },
      { id: 3039, name: '久遠テリーヌ　　レ（ミルク）' },
      { id: 3040, name: '久遠テリーヌ　ホワイト' },
      { id: 3042, name: '久遠テリーヌ　抹茶' }
    ];

    for (const productData of testProducts) {
      const existingProduct = await prisma.products.findUnique({
        where: { id: productData.id }
      });

      if (!existingProduct) {
        await prisma.products.create({
          data: {
            id: productData.id,
            store_id: store.id,
            image_url: 'no-image.jpg',
            name: productData.name,
            description: `テスト商品: ${productData.name}`,
            status: status.active,
            price: 1000,
            stock: 100,
            available_at: new Date()
          }
        });
      }
    }

    // テスト材料の作成
    const testItems = [
      { id: 1319, name: 'QUONオリジナルコロンビアブレンド54%', type: '食材' as const, unit: 'g' as const, price: 500 },
      { id: 1028, name: 'マロンロワイヤルオレンジキューブ（2.5キロ/袋入）', type: '食材' as const, unit: 'g' as const, price: 300 },
      { id: 1197, name: 'アーモンドスライス60ｇをキャラメリゼ', type: '食材' as const, unit: 'g' as const, price: 200 },
      { id: 1084, name: 'ロースト作業', type: '食材' as const, unit: 'g' as const, price: 100 },
      { id: 1320, name: 'QUONオリジナルコロンビアブレンド41%', type: '食材' as const, unit: 'g' as const, price: 450 },
      { id: 1195, name: 'アーモンドスリーバード', type: '食材' as const, unit: 'g' as const, price: 150 },
      { id: 1201, name: 'US産ピスタチオ　（ローストなし）(テリーヌ用）', type: '食材' as const, unit: 'g' as const, price: 250 },
      { id: 1048, name: 'ドライフルーツメロン(5mm角程度にカットしたもの)', type: '食材' as const, unit: 'g' as const, price: 180 },
      { id: 1044, name: 'カボブランコ　(ホワイトチョコレート）', type: '食材' as const, unit: 'g' as const, price: 400 },
      { id: 1192, name: 'フィアンティーヌ', type: '食材' as const, unit: 'g' as const, price: 120 },
      { id: 1198, name: 'ピーカンナッツ・ペカンナッツ（ローストなし）', type: '食材' as const, unit: 'g' as const, price: 220 },
      { id: 1199, name: 'ヘーゼルナッツ（ローストなし）', type: '食材' as const, unit: 'g' as const, price: 200 },
      { id: 1018, name: '加工用抹茶3号　（テリーヌ、フィアンフィアン製造用）', type: '食材' as const, unit: 'g' as const, price: 800 },
      { id: 1097, name: '黒豆　（ローストなし）', type: '食材' as const, unit: 'g' as const, price: 300 }
    ];

    for (const itemData of testItems) {
      const existingItem = await prisma.item.findUnique({
        where: { id: itemData.id }
      });

      if (!existingItem) {
        await prisma.item.create({
          data: {
            id: itemData.id,
            type: itemData.type,
            name: itemData.name,
            unit: itemData.unit,
            minimum_order_quantity: '100',
            price: itemData.price
          }
        });
      }
    }

    return NextResponse.json({
      message: 'テストデータが正常に作成されました'
    });
  } catch (error) {
    console.error('テストデータの作成に失敗しました:', error);
    return NextResponse.json(
      { error: 'テストデータの作成に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 