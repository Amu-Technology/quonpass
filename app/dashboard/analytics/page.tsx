"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconChartBar, IconUsers, IconCurrencyYen, IconTrendingUp, IconGenderMale, IconGenderFemale, IconCreditCard, IconCash, IconQrcode, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { subDays, subWeeks, subMonths, subYears, addDays, addWeeks, addMonths, addYears, format } from 'date-fns'

interface AnalyticsData {
  totalCustomers: number
  averageCustomerValue: number
  totalSales: number
  purchaseRate: number
  productComposition: Array<{
    name: string
    sales: number
    percentage: number
  }>
  dailySales: Array<{
    date: string
    sales: number
  }>
  categorySales: Array<{
    name: string
    sales: number
    percentage: number
  }>
  registerCloseSummary: {
    totalCustomers: number
    totalSales: number
    averageCustomerValue: number
    maleCount: number
    femaleCount: number
    unspecifiedCount: number
    paymentMethods: {
      cash: number
      credit: number
      point: number
      electronicMoney: number
    }
  }
  comparison: {
    salesRecordCustomers: number
    registerCloseCustomers: number
    difference: number
  }
  comparisonDetail: {
    percent: {
      totalCustomers: number
      averageCustomerValue: number
      totalSales: number
    }
    diff: {
      totalCustomers: number
      averageCustomerValue: number
      totalSales: number
    }
  }
}

interface Store {
  id: number
  name: string
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedStore, setSelectedStore] = useState("all")
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStores()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod, selectedStore, currentDate])

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores")
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error("店舗データの取得に失敗しました:", error)
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedStore !== "all" && { storeId: selectedStore }),
        currentDate: currentDate
      })

      const response = await fetch(`/api/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("分析データの取得に失敗しました:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY"
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric"
    })
  }

  // 前期比ラベル
  const getComparisonLabel = () => {
    switch (selectedPeriod) {
      case 'year':
        return '前年比';
      case 'month':
        return '前月比';
      case 'week':
        return '前週比';
      default:
        return '前期比';
    }
  };
  // パーセント表示
  const formatPercent = (value: number) => {
    const sign = value > 0 ? '+' : value < 0 ? '' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // 差額表示
  const formatDiff = (value: number, unit: string = '') => {
    const sign = value > 0 ? '+' : value < 0 ? '' : '';
    return `${sign}${value.toLocaleString()}${unit}`;
  };

  // 前の期間に移動
  const goToPreviousPeriod = () => {
    const currentDateObj = new Date(currentDate)
    let newDate: Date
    switch (selectedPeriod) {
      case 'day':
        newDate = subDays(currentDateObj, 1)
        break
      case 'week':
        newDate = subWeeks(currentDateObj, 1)
        break
      case 'month':
        newDate = subMonths(currentDateObj, 1)
        break
      case 'year':
        newDate = subYears(currentDateObj, 1)
        break
      default:
        newDate = subMonths(currentDateObj, 1)
    }
    setCurrentDate(format(newDate, 'yyyy-MM-dd'))
  }

  // 次の期間に移動
  const goToNextPeriod = () => {
    const currentDateObj = new Date(currentDate)
    let newDate: Date
    switch (selectedPeriod) {
      case 'day':
        newDate = addDays(currentDateObj, 1)
        break
      case 'week':
        newDate = addWeeks(currentDateObj, 1)
        break
      case 'month':
        newDate = addMonths(currentDateObj, 1)
        break
      case 'year':
        newDate = addYears(currentDateObj, 1)
        break
      default:
        newDate = addMonths(currentDateObj, 1)
    }
    setCurrentDate(format(newDate, 'yyyy-MM-dd'))
  }

  // 現在の期間を表示
  const getCurrentPeriodLabel = () => {
    const currentDateObj = new Date(currentDate)
    switch (selectedPeriod) {
      case 'day':
        return format(currentDateObj, 'yyyy年M月d日')
      case 'week':
        return format(currentDateObj, 'yyyy年M月d日') + '週'
      case 'month':
        return format(currentDateObj, 'yyyy年M月')
      case 'year':
        return format(currentDateObj, 'yyyy年')
      default:
        return format(currentDateObj, 'yyyy年M月')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">データを読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">売上分析</h1>
          <p className="text-muted-foreground">
            売上実績とレジクローズデータから詳細な分析データを確認できます
          </p>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">期間:</span>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">1日</SelectItem>
              <SelectItem value="week">週間</SelectItem>
              <SelectItem value="month">月間</SelectItem>
              <SelectItem value="year">年間</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPeriod}
            className="h-8 w-8 p-0"
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {getCurrentPeriodLabel()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPeriod}
            className="h-8 w-8 p-0"
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">店舗:</span>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全店舗</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 主要指標 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総客数</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.totalCustomers || 0}人
            </div>
            {analyticsData?.comparisonDetail && (
              <p className={`text-xs ${analyticsData.comparisonDetail.diff.totalCustomers >= 0 ? 'text-green-600' : 'text-red-600'}`}> 
                {getComparisonLabel()} {formatDiff(analyticsData.comparisonDetail.diff.totalCustomers, '人')}（{formatPercent(analyticsData.comparisonDetail.percent.totalCustomers)}）
              </p>
            )}
            {analyticsData?.comparison && (
              <p className="text-xs text-muted-foreground">
                レジ記録: {analyticsData.comparison.registerCloseCustomers}人
                {analyticsData.comparison.difference !== 0 && (
                  <span className={`ml-2 ${analyticsData.comparison.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>({analyticsData.comparison.difference > 0 ? '+' : ''}{analyticsData.comparison.difference}人)</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均客単価</CardTitle>
            <IconCurrencyYen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.averageCustomerValue || 0)}
            </div>
            {analyticsData?.comparisonDetail && (
              <p className={`text-xs ${analyticsData.comparisonDetail.diff.averageCustomerValue >= 0 ? 'text-green-600' : 'text-red-600'}`}> 
                {getComparisonLabel()} {formatDiff(analyticsData.comparisonDetail.diff.averageCustomerValue, '円')}（{formatPercent(analyticsData.comparisonDetail.percent.averageCustomerValue)}）
              </p>
            )}
            {analyticsData?.registerCloseSummary && (
              <p className="text-xs text-muted-foreground">
                レジ記録: {formatCurrency(analyticsData.registerCloseSummary.averageCustomerValue)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">売上総額</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.totalSales || 0)}
            </div>
            {analyticsData?.comparisonDetail && (
              <p className={`text-xs ${analyticsData.comparisonDetail.diff.totalSales >= 0 ? 'text-green-600' : 'text-red-600'}`}> 
                {getComparisonLabel()} {formatDiff(analyticsData.comparisonDetail.diff.totalSales, '円')}（{formatPercent(analyticsData.comparisonDetail.percent.totalSales)}）
              </p>
            )}
            {analyticsData?.registerCloseSummary && (
              <p className="text-xs text-muted-foreground">
                レジ記録: {formatCurrency(analyticsData.registerCloseSummary.totalSales)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">購買率</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.purchaseRate || 100}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* レジクローズ詳細分析 */}
      {analyticsData?.registerCloseSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">男性客数</CardTitle>
              <IconGenderMale className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.registerCloseSummary.maleCount}人
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">女性客数</CardTitle>
              <IconGenderFemale className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {analyticsData.registerCloseSummary.femaleCount}人
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">現金売上</CardTitle>
              <IconCash className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analyticsData.registerCloseSummary.paymentMethods.cash)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">クレジット売上</CardTitle>
              <IconCreditCard className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(analyticsData.registerCloseSummary.paymentMethods.credit)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 詳細分析 */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">商品構成比</TabsTrigger>
          <TabsTrigger value="categories">カテゴリ別売上</TabsTrigger>
          <TabsTrigger value="daily">日別売上推移</TabsTrigger>
          <TabsTrigger value="payment">支払い方法分析</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>商品構成比</CardTitle>
              <CardDescription>
                売上に占める各商品の割合
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 棒グラフ表示 */}
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.productComposition || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={10}
                    />
                    <YAxis 
                      tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}K`}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '売上']}
                      labelFormatter={(label) => label}
                    />
                    <Bar 
                      dataKey="sales" 
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* テーブル表示 */}
              <div className="space-y-4">
                {analyticsData?.productComposition.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(product.sales)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {product.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別売上</CardTitle>
              <CardDescription>
                カテゴリ別の売上構成
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 棒グラフ表示 */}
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.categorySales || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={10}
                    />
                    <YAxis 
                      tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}K`}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '売上']}
                      labelFormatter={(label) => label}
                    />
                    <Bar 
                      dataKey="sales" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* テーブル表示 */}
              <div className="space-y-4">
                {analyticsData?.categorySales.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(category.sales)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>日別売上推移</CardTitle>
              <CardDescription>
                期間中の日別売上推移
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* グラフ表示 */}
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData?.dailySales || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => formatDate(value)}
                      fontSize={12}
                    />
                    <YAxis 
                      tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}K`}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '売上']}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* テーブル表示 */}
              <div className="space-y-4">
                {analyticsData?.dailySales.map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="font-medium">{formatDate(day.date)}</span>
                    <div className="font-medium">
                      {formatCurrency(day.sales)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>支払い方法分析</CardTitle>
              <CardDescription>
                レジクローズデータによる支払い方法別売上
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData?.registerCloseSummary ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconCash className="h-4 w-4 text-green-500" />
                      <span className="font-medium">現金</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {formatCurrency(analyticsData.registerCloseSummary.paymentMethods.cash)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconCreditCard className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">クレジット</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-purple-600">
                        {formatCurrency(analyticsData.registerCloseSummary.paymentMethods.credit)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconQrcode className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">ポイント</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-600">
                        {formatCurrency(analyticsData.registerCloseSummary.paymentMethods.point)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconQrcode className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">電子マネー</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-orange-600">
                        {formatCurrency(analyticsData.registerCloseSummary.paymentMethods.electronicMoney)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">レジクローズデータがありません</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 