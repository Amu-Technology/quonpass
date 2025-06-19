import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from 'date-fns'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // 認証チェックを一時的に無効化
    // const session = await auth()
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: '認証が必要です' },
    //     { status: 401 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // month, week, day, year
    const storeId = searchParams.get('storeId')
    const currentDateStr = searchParams.get('currentDate')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // currentDateを基準にした期間計算
    const baseDate = currentDateStr ? new Date(currentDateStr) : new Date()
    
    let dateFilter = {}

    // 期間フィルタの設定（currentDate基準）
    switch (period) {
      case 'day': {
        const dayStart = startOfDay(baseDate)
        const dayEnd = endOfDay(baseDate)
        dateFilter = {
          date: {
            gte: dayStart,
            lte: dayEnd
          }
        }
        break
      }
      case 'week': {
        const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }) // 月曜日開始
        const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 })
        dateFilter = {
          date: {
            gte: weekStart,
            lte: weekEnd
          }
        }
        break
      }
      case 'month': {
        const monthStart = startOfMonth(baseDate)
        const monthEnd = endOfMonth(baseDate)
        dateFilter = {
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        }
        break
      }
      case 'year': {
        const yearStart = startOfYear(baseDate)
        const yearEnd = endOfYear(baseDate)
        dateFilter = {
          date: {
            gte: yearStart,
            lte: yearEnd
          }
        }
        break
      }
      default:
        if (startDate && endDate) {
          dateFilter = {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        }
    }

    // 店舗フィルタ
    const storeFilter = storeId ? { store_id: parseInt(storeId) } : {}

    // 売上データの取得
    const salesData = await prisma.salesRecord.findMany({
      where: {
        ...dateFilter,
        ...storeFilter
      },
      include: {
        store: true,
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // レジクローズデータの取得
    const registerCloseData = await prisma.registerClose.findMany({
      where: {
        ...dateFilter,
        ...storeFilter
      },
      include: {
        store: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    // 商品データの取得
    const productsData = await prisma.products.findMany({
      where: {
        ...storeFilter,
        status: 'active'
      },
      include: {
        stores: true,
        category: true
      }
    })

    // カテゴリデータの取得
    const categoriesData = await prisma.categories.findMany({
      where: {
        status: 'active'
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    })

    // --- 前期（前年比・前月比・前週比）期間の計算 ---
    let prevDateFilter = {}
    switch (period) {
      case 'day': {
        const prevDay = subDays(baseDate, 1)
        const prevDayStart = startOfDay(prevDay)
        const prevDayEnd = endOfDay(prevDay)
        prevDateFilter = {
          date: {
            gte: prevDayStart,
            lte: prevDayEnd
          }
        }
        break
      }
      case 'week': {
        const prevWeek = subWeeks(baseDate, 1)
        const prevWeekStart = startOfWeek(prevWeek, { weekStartsOn: 1 })
        const prevWeekEnd = endOfWeek(prevWeek, { weekStartsOn: 1 })
        prevDateFilter = {
          date: {
            gte: prevWeekStart,
            lte: prevWeekEnd
          }
        }
        break
      }
      case 'month': {
        const prevMonth = subMonths(baseDate, 1)
        const prevMonthStart = startOfMonth(prevMonth)
        const prevMonthEnd = endOfMonth(prevMonth)
        prevDateFilter = {
          date: {
            gte: prevMonthStart,
            lte: prevMonthEnd
          }
        }
        break
      }
      case 'year': {
        const prevYear = subYears(baseDate, 1)
        const prevYearStart = startOfYear(prevYear)
        const prevYearEnd = endOfYear(prevYear)
        prevDateFilter = {
          date: {
            gte: prevYearStart,
            lte: prevYearEnd
          }
        }
        break
      }
      default: {
        if (startDate && endDate) {
          // 前期の計算は省略
        }
      }
    }

    // --- 前期データの取得 ---
    const prevSalesData = await prisma.salesRecord.findMany({
      where: {
        ...prevDateFilter,
        ...storeFilter
      }
    })
    const prevRegisterCloseData = await prisma.registerClose.findMany({
      where: {
        ...prevDateFilter,
        ...storeFilter
      }
    })

    // --- 分析データの計算 ---
    const analysis = calculateAnalytics(salesData, registerCloseData, productsData, categoriesData, prevSalesData, prevRegisterCloseData)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('売上分析の取得に失敗しました:', error)
    return NextResponse.json(
      { error: '売上分析の取得に失敗しました' },
      { status: 500 }
    )
  }
}

function calculateAnalytics(salesData: any[], registerCloseData: any[], productsData: any[], categoriesData: any[], prevSalesData: any[], prevRegisterCloseData: any[]) {
  if (salesData.length === 0 && registerCloseData.length === 0) {
    return {
      totalCustomers: 0,
      averageCustomerValue: 0,
      totalSales: 0,
      purchaseRate: 100,
      productComposition: [],
      dailySales: [],
      categorySales: [],
      registerCloseSummary: {
        totalCustomers: 0,
        totalSales: 0,
        averageCustomerValue: 0,
        maleCount: 0,
        femaleCount: 0,
        unspecifiedCount: 0,
        paymentMethods: {
          cash: 0,
          credit: 0,
          point: 0,
          electronicMoney: 0
        }
      },
      comparison: {
        salesRecordCustomers: 0,
        registerCloseCustomers: 0,
        difference: 0
      }
    }
  }

  // SalesRecordからの分析
  const salesRecordAnalysis = analyzeSalesRecords(salesData)
  const prevSalesRecordAnalysis = analyzeSalesRecords(prevSalesData)
  // RegisterCloseからの分析
  const registerCloseAnalysis = analyzeRegisterClose(registerCloseData)
  const prevRegisterCloseAnalysis = analyzeRegisterClose(prevRegisterCloseData)
  // 商品・カテゴリ分析
  const productCategoryAnalysis = analyzeProductsAndCategories(salesData, productsData, categoriesData)

  // 統合分析
  const totalCustomers = Math.max(salesRecordAnalysis.totalCustomers, registerCloseAnalysis.totalCustomers)
  const totalSales = Math.max(salesRecordAnalysis.totalSales, registerCloseAnalysis.totalSales)
  const averageCustomerValue = totalCustomers > 0 ? totalSales / totalCustomers : 0

  // 前期値
  const prevTotalCustomers = Math.max(prevSalesRecordAnalysis.totalCustomers, prevRegisterCloseAnalysis.totalCustomers)
  const prevTotalSales = Math.max(prevSalesRecordAnalysis.totalSales, prevRegisterCloseAnalysis.totalSales)
  const prevAverageCustomerValue = prevTotalCustomers > 0 ? prevTotalSales / prevTotalCustomers : 0

  // 差分・比率
  const diff = {
    totalCustomers: totalCustomers - prevTotalCustomers,
    totalSales: totalSales - prevTotalSales,
    averageCustomerValue: Math.round(averageCustomerValue - prevAverageCustomerValue)
  }
  const percent = {
    totalCustomers: prevTotalCustomers > 0 ? ((totalCustomers - prevTotalCustomers) / prevTotalCustomers) * 100 : 0,
    totalSales: prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : 0,
    averageCustomerValue: prevAverageCustomerValue > 0 ? ((averageCustomerValue - prevAverageCustomerValue) / prevAverageCustomerValue) * 100 : 0
  }

  return {
    totalCustomers,
    averageCustomerValue: Math.round(averageCustomerValue),
    totalSales: Math.round(totalSales),
    purchaseRate: 100,
    productComposition: productCategoryAnalysis.productComposition,
    dailySales: productCategoryAnalysis.dailySales,
    categorySales: productCategoryAnalysis.categorySales,
    registerCloseSummary: registerCloseAnalysis,
    comparison: {
      salesRecordCustomers: salesRecordAnalysis.totalCustomers,
      registerCloseCustomers: registerCloseAnalysis.totalCustomers,
      difference: registerCloseAnalysis.totalCustomers - salesRecordAnalysis.totalCustomers
    },
    comparisonDetail: {
      prev: {
        totalCustomers: prevTotalCustomers,
        totalSales: prevTotalSales,
        averageCustomerValue: Math.round(prevAverageCustomerValue)
      },
      diff,
      percent
    }
  }
}

function analyzeSalesRecords(salesData: any[]) {
  if (salesData.length === 0) {
    return {
      totalCustomers: 0,
      totalSales: 0,
      averageCustomerValue: 0
    }
  }

  // 来店客数（ユニークな日付の数）
  const uniqueDates = new Set(salesData.map(record => record.date.toISOString().split('T')[0]))
  const totalCustomers = uniqueDates.size

  // 売上総額
  const totalSales = salesData.reduce((sum, record) => {
    return sum + parseFloat(record.sales_amount.toString())
  }, 0)

  // 平均客単価
  const averageCustomerValue = totalCustomers > 0 ? totalSales / totalCustomers : 0

  return {
    totalCustomers,
    totalSales: Math.round(totalSales),
    averageCustomerValue: Math.round(averageCustomerValue)
  }
}

function analyzeRegisterClose(registerCloseData: any[]) {
  if (registerCloseData.length === 0) {
    return {
      totalCustomers: 0,
      totalSales: 0,
      averageCustomerValue: 0,
      maleCount: 0,
      femaleCount: 0,
      unspecifiedCount: 0,
      paymentMethods: {
        cash: 0,
        credit: 0,
        point: 0,
        electronicMoney: 0
      }
    }
  }

  const totalCustomers = registerCloseData.reduce((sum, record) => sum + record.customer_count, 0)
  const totalSales = registerCloseData.reduce((sum, record) => sum + parseFloat(record.total_sales.toString()), 0)
  const averageCustomerValue = totalCustomers > 0 ? totalSales / totalCustomers : 0

  const maleCount = registerCloseData.reduce((sum, record) => sum + record.male_count, 0)
  const femaleCount = registerCloseData.reduce((sum, record) => sum + record.female_count, 0)
  const unspecifiedCount = registerCloseData.reduce((sum, record) => sum + record.unspecified_count, 0)

  const paymentMethods = {
    cash: registerCloseData.reduce((sum, record) => sum + parseFloat(record.cash_amount.toString()), 0),
    credit: registerCloseData.reduce((sum, record) => sum + parseFloat(record.credit_amount.toString()), 0),
    point: registerCloseData.reduce((sum, record) => sum + parseFloat(record.point_amount.toString()), 0),
    electronicMoney: registerCloseData.reduce((sum, record) => sum + parseFloat(record.electronic_money_amount.toString()), 0)
  }

  return {
    totalCustomers,
    totalSales: Math.round(totalSales),
    averageCustomerValue: Math.round(averageCustomerValue),
    maleCount,
    femaleCount,
    unspecifiedCount,
    paymentMethods
  }
}

function analyzeProductsAndCategories(salesData: any[], productsData: any[], categoriesData: any[]) {
  // 商品構成比
  const productSales = salesData.reduce((acc, record) => {
    const productName = record.product.name
    if (!acc[productName]) {
      acc[productName] = 0
    }
    acc[productName] += parseFloat(record.sales_amount.toString())
    return acc
  }, {})

  const totalSales = salesData.reduce((sum, record) => {
    return sum + parseFloat(record.sales_amount.toString())
  }, 0)

  const productComposition = Object.entries(productSales)
    .map(([name, sales]) => ({
      name,
      sales: sales as number,
      percentage: totalSales > 0 ? ((sales as number) / totalSales) * 100 : 0
    }))
    .sort((a, b) => b.sales - a.sales)

  // 日別売上
  const dailySales = salesData.reduce((acc, record) => {
    const date = record.date.toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = 0
    }
    acc[date] += parseFloat(record.sales_amount.toString())
    return acc
  }, {})

  const dailySalesArray = Object.entries(dailySales)
    .map(([date, sales]) => ({
      date,
      sales: sales as number
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // カテゴリ別売上
  const categorySales = salesData.reduce((acc, record) => {
    const categoryName = record.product.category?.name || '未分類'
    if (!acc[categoryName]) {
      acc[categoryName] = 0
    }
    acc[categoryName] += parseFloat(record.sales_amount.toString())
    return acc
  }, {})

  const categorySalesArray = Object.entries(categorySales)
    .map(([name, sales]) => ({
      name,
      sales: sales as number,
      percentage: totalSales > 0 ? ((sales as number) / totalSales) * 100 : 0
    }))
    .sort((a, b) => b.sales - a.sales)

  return {
    productComposition,
    dailySales: dailySalesArray,
    categorySales: categorySalesArray
  }
} 