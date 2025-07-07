"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { IconChartBar, IconUsers, IconCurrencyYen, IconTrendingUp } from "@tabler/icons-react"

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
}

interface Store {
  id: number
  name: string
}

export default function ProductsSalesPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedStore, setSelectedStore] = useState("all")
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        storeId: selectedStore,
      })
      const response = await fetch(`/api/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod, selectedStore])

  useEffect(() => {
    fetchStores()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores")
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error("Failed to fetch stores:", error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">データを読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-10 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">商品別実績</h1>
          <p className="text-muted-foreground">
            売上実績から詳細な分析データを確認できます
          </p>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">期間:</span>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">日次</SelectItem>
              <SelectItem value="week">週次</SelectItem>
              <SelectItem value="month">月次</SelectItem>
              <SelectItem value="year">年次</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">店舗:</span>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-40">
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
            <CardTitle className="text-sm font-medium">総顧客数</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.totalCustomers.toLocaleString()}人
            </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総売上</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.totalSales || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">購入率</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.purchaseRate.toFixed(1) || "0.0"}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細分析 */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">商品構成比</TabsTrigger>
          <TabsTrigger value="categories">カテゴリ別売上</TabsTrigger>
          <TabsTrigger value="daily">日別売上推移</TabsTrigger>
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
              <div className="space-y-4">
                {analyticsData?.productComposition.slice(0, 10).map((product, index) => (
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
              <div className="space-y-4">
                {analyticsData?.categorySales.slice(0, 10).map((category, index) => (
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
      </Tabs>
    </div>
  )
} 