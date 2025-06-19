import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const storeId = searchParams.get('storeId')

    const where: any = {}

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