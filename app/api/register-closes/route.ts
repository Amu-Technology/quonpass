import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

/**
 * @swagger
 * /api/register-closes:
 *   get:
 *     summary: レジクローズデータを取得するAPI
 *     description: 日付範囲と店舗IDでフィルタリングしてレジクローズデータを取得します
 *     tags: [RegisterCloses]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 開始日
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 終了日
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: integer
 *         description: 店舗ID
 *     responses:
 *       200:
 *         description: レジクローズデータの取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date
 *                   store_id:
 *                     type: integer
 *                   customer_count:
 *                     type: integer
 *                   total_sales:
 *                     type: number
 *                   store:
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
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const storeId = searchParams.get('storeId')

    const where: Prisma.RegisterCloseWhereInput = {}

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      }
    }

    if (storeId && storeId !== 'all') {
      where.store_id = parseInt(storeId)
    }

    const registerCloses = await prisma.registerClose.findMany({
      where,
      include: {
        store: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(registerCloses)
  } catch (error) {
    console.error('レジクローズデータの取得に失敗しました:', error)
    return NextResponse.json(
      { error: 'レジクローズデータの取得に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * レジクローズデータを作成するAPI
 * 
 * @param {Request} request - HTTPリクエスト
 * @param {string} request.json - レジクローズデータ
 * @param {string} request.json.date - 日付
 * @param {string} request.json.store_id - 店舗ID
 * @param {string} request.json.groups_count - グループ数
 * @param {string} request.json.customer_count - 顧客数
 * @param {string} request.json.male_count - 男性数
 * @param {string} request.json.female_count - 女性数
 * @param {string} request.json.unspecified_count - 不明数
 * @param {string} request.json.customer_unit_price - 顧客単価
 * @param {string} request.json.total_items_sold - 総売上点数
 * @param {string} request.json.total_sales - 総売上
 * @param {string} request.json.consumption_tax - 消費税
 * @param {string} request.json.sales_10_percent - 10%売上
 * @param {string} request.json.tax_10_percent - 10%税
 * @param {string} request.json.sales_8_percent - 8%売上
 * @param {string} request.json.tax_8_percent - 8%税
 * @param {string} request.json.sales_tax_free - 税抜売上
 * @param {string} request.json.sales_non_taxable - 非課税売上
 * @param {string} request.json.net_sales - 純売上
 * @param {string} request.json.duty_free_items_general - 一般免税商品数
 * @param {string} request.json.duty_free_items_consumables - 消耗品免税商品数
 * @param {string} request.json.duty_free_amount_general - 一般免税売上
 * @param {string} request.json.duty_free_amount_consumables - 消耗品免税売上
 * @param {string} request.json.service_charge_count - サービス料数
 * @param {string} request.json.service_charge - サービス料
 * @param {string} request.json.late_night_count - 深夜数
 * @param {string} request.json.late_night_charge - 深夜料
 * @param {string} request.json.discount_count - 割引数
 * @param {string} request.json.discount_amount - 割引額
 * @param {string} request.json.fraction_discount_count - フラクション割引数
 * @param {string} request.json.fraction_discount_amount - フラクション割引額
 * @param {string} request.json.excluded_count - 除外数
 * @param {string} request.json.excluded_amount - 除外額
 * @param {string} request.json.cash_count - 現金数
 * @param {string} request.json.cash_amount - 現金額
 * @param {string} request.json.credit_count - クレジット数
 * @param {string} request.json.credit_amount - クレジット額
 * @param {string} request.json.point_count - ポイント数
 * @param {string} request.json.point_amount - ポイント額
 * @param {string} request.json.electronic_money_count - 電子マネー数
 * @param {string} request.json.electronic_money_amount - 電子マネー額
 * @param {string} request.json.gift_card_no_change_count - ギフトカード（無変更）数
 * @param {string} request.json.gift_card_no_change_amount - ギフトカード（無変更）額
 * @param {string} request.json.gift_card_difference - ギフトカード（差額）
 * @param {string} request.json.gift_card_with_change_count - ギフトカード（変更）数
 * @param {string} request.json.gift_card_with_change_amount - ギフトカード（変更）額
 * @param {string} request.json.gift_card_cash_change - ギフトカード（現金）変更
 * @param {string} request.json.credit_sale_count - クレジットセール数
 * @param {string} request.json.credit_sale_amount - クレジットセール額
 * @param {string} request.json.cash_on_hand - 現金在庫
 * @param {string} request.json.change_amount - お釣り
 * @param {string} request.json.receipt_count - レシート数
 * @param {string} request.json.cancel_count - キャンセル数
 * @param {string} request.json.cancel_amount - キャンセル額
 * @param {string} request.json.correction_count - 修正数
 * @param {string} request.json.correction_amount - 修正額
 * @param {string} request.json.uncollected_count - 未収数
 * @param {string} request.json.uncollected_amount - 未収額
 * @param {string} request.json.cash_balance - 現金残高
 * @param {string} request.json.cash_at_open - 開始時点の現金
 * @param {string} request.json.deposit_count - 預金数
 * @param {string} request.json.deposit_amount - 預金額
 * @param {string} request.json.withdrawal_count - 引出数
 * @param {string} request.json.withdrawal_amount - 引出額
 * @param {string} request.json.input_cash - 入金現金
 * @param {string} request.json.input_credit - 入金クレジット
 * @param {string} request.json.input_point - 入金ポイント
 * @param {string} request.json.input_electronic_money - 入金電子マネー
 * @param {string} request.json.input_gift_card_no_change - 入金ギフトカード（無変更）
 * @param {string} request.json.input_gift_card_with_change - 入金ギフトカード（変更）
 * @param {string} request.json.input_credit_sale - 入金クレジットセール
 * @param {string} request.json.total_difference - 合計差額
 * 
 * @returns {Promise<NextResponse>} レジクローズデータのJSONレスポンス
 * 
 * @example
 * // レジクローズデータを作成
 * POST /api/register-closes
 * 
 * @throws {500} レジクローズデータの作成に失敗した場合
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
    const {
      date,
      store_id,
      groups_count,
      customer_count,
      male_count,
      female_count,
      unspecified_count,
      customer_unit_price,
      total_items_sold,
      total_sales,
      consumption_tax,
      sales_10_percent,
      tax_10_percent,
      sales_8_percent,
      tax_8_percent,
      sales_tax_free,
      sales_non_taxable,
      net_sales,
      duty_free_items_general,
      duty_free_items_consumables,
      duty_free_amount_general,
      duty_free_amount_consumables,
      service_charge_count,
      service_charge,
      late_night_count,
      late_night_charge,
      discount_count,
      discount_amount,
      fraction_discount_count,
      fraction_discount_amount,
      excluded_count,
      excluded_amount,
      cash_count,
      cash_amount,
      credit_count,
      credit_amount,
      point_count,
      point_amount,
      electronic_money_count,
      electronic_money_amount,
      gift_card_no_change_count,
      gift_card_no_change_amount,
      gift_card_difference,
      gift_card_with_change_count,
      gift_card_with_change_amount,
      gift_card_cash_change,
      credit_sale_count,
      credit_sale_amount,
      cash_on_hand,
      change_amount,
      receipt_count,
      cancel_count,
      cancel_amount,
      correction_count,
      correction_amount,
      uncollected_count,
      uncollected_amount,
      cash_balance,
      cash_at_open,
      deposit_count,
      deposit_amount,
      withdrawal_count,
      withdrawal_amount,
      input_cash,
      input_credit,
      input_point,
      input_electronic_money,
      input_gift_card_no_change,
      input_gift_card_with_change,
      input_credit_sale,
      total_difference,
      difference_reason,
      opening_fund,
      store_deposit,
      bank_transfer,
      safe_deposit,
      security_deposit,
    } = data

    const registerClose = await prisma.registerClose.create({
      data: {
        date: new Date(date),
        store_id,
        groups_count,
        customer_count,
        male_count,
        female_count,
        unspecified_count,
        customer_unit_price,
        total_items_sold,
        total_sales,
        consumption_tax,
        sales_10_percent,
        tax_10_percent,
        sales_8_percent,
        tax_8_percent,
        sales_tax_free,
        sales_non_taxable,
        net_sales,
        duty_free_items_general,
        duty_free_items_consumables,
        duty_free_amount_general,
        duty_free_amount_consumables,
        service_charge_count,
        service_charge,
        late_night_count,
        late_night_charge,
        discount_count,
        discount_amount,
        fraction_discount_count,
        fraction_discount_amount,
        excluded_count,
        excluded_amount,
        cash_count,
        cash_amount,
        credit_count,
        credit_amount,
        point_count,
        point_amount,
        electronic_money_count,
        electronic_money_amount,
        gift_card_no_change_count,
        gift_card_no_change_amount,
        gift_card_difference,
        gift_card_with_change_count,
        gift_card_with_change_amount,
        gift_card_cash_change,
        credit_sale_count,
        credit_sale_amount,
        cash_on_hand,
        change_amount,
        receipt_count,
        cancel_count,
        cancel_amount,
        correction_count,
        correction_amount,
        uncollected_count,
        uncollected_amount,
        cash_balance,
        cash_at_open,
        deposit_count,
        deposit_amount,
        withdrawal_count,
        withdrawal_amount,
        input_cash,
        input_credit,
        input_point,
        input_electronic_money,
        input_gift_card_no_change,
        input_gift_card_with_change,
        input_credit_sale,
        total_difference,
        difference_reason,
        opening_fund,
        store_deposit,
        bank_transfer,
        safe_deposit,
        security_deposit,
      },
    })

    return NextResponse.json(registerClose)
  } catch (error) {
    console.error('レジクローズデータの作成に失敗しました:', error)
    return NextResponse.json(
      { error: 'レジクローズデータの作成に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * レジクローズデータを更新するAPI
 * 
 * @param {Request} request - HTTPリクエスト
 * @param {string} request.json - レジクローズデータ
 * @param {string} request.json.id - レジクローズデータID
 * 
 * @returns {Promise<NextResponse>} レジクローズデータのJSONレスポンス
 * 
 * @example
 * // レジクローズデータを更新
 * PATCH /api/register-closes
 * 
 * @throws {500} レジクローズデータの更新に失敗した場合
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: 'レジクローズデータIDは必須です' },
        { status: 400 }
      )
    }

    const registerClose = await prisma.registerClose.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(registerClose)
  } catch (error) {
    console.error('レジクローズデータの更新に失敗しました:', error)
    return NextResponse.json(
      { error: 'レジクローズデータの更新に失敗しました' },
      { status: 500 }
    )
  }
} 