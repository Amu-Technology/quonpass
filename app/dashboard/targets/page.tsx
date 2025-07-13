"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "../../../hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { IconTrendingUp, IconChartBar, IconCalendar, IconTarget } from '@tabler/icons-react';
import { format } from 'date-fns';

interface Store {
  id: number;
  name: string;
}

interface AnnualTarget {
  id: number;
  year: number;
  store_id: number;
  target_sales_amount: number;
  target_customer_count: number;
  target_total_items_sold?: number;
  created_at: string;
  updated_at: string;
  store: {
    name: string;
  };
  monthly_targets: MonthlyTarget[];
}

interface MonthlyTarget {
  id: number;
  annual_target_id: number;
  month: number;
  allocation_percentage: number;
  target_sales_amount: number;
  target_customer_count: number;
  target_total_items_sold?: number;
  created_at: string;
  updated_at: string;
  annual_target: {
    year: number;
    store: {
      name: string;
    };
  };
  weekly_targets: WeeklyTarget[];
}

interface WeeklyTarget {
  id: number;
  monthly_target_id: number;
  start_date: string;
  end_date: string;
  target_sales_amount: number;
  target_customer_count: number;
  target_total_items_sold?: number;
  created_at: string;
  updated_at: string;
  daily_targets: DailyTarget[];
}

interface DailyTarget {
  id: number;
  weekly_target_id: number;
  date: string;
  target_sales_amount: number;
  target_customer_count: number;
  target_total_items_sold?: number;
  created_at: string;
  updated_at: string;
}

interface CreateAnnualTargetRequest {
  year: number;
  store_id: number;
  target_sales_amount: number;
  target_customer_count: number;
  target_total_items_sold?: number;
}

interface CreateMonthlyTargetRequest {
  annual_target_id: number;
  month: number;
  allocation_percentage: number;
  target_sales_amount: number;
  target_customer_count: number;
  target_total_items_sold?: number;
}

interface SalesAnalytics {
  totalCustomers: number;
  averageCustomerValue: number;
  totalSales: number;
  purchaseRate: number;
  productComposition: Array<{
    name: string;
    sales: number;
    percentage: number;
  }>;
  dailySales: Array<{
    date: string;
    sales: number;
  }>;
  categorySales: Array<{
    name: string;
    sales: number;
    percentage: number;
  }>;
  registerCloseSummary: {
    totalCustomers: number;
    totalSales: number;
    averageCustomerValue: number;
    maleCount: number;
    femaleCount: number;
    unspecifiedCount: number;
    paymentMethods: {
      cash: number;
      credit: number;
      point: number;
      electronicMoney: number;
    };
  };
  comparison: {
    salesRecordCustomers: number;
    registerCloseCustomers: number;
    difference: number;
  };
  comparisonDetail?: {
    prev: {
      totalCustomers: number;
      totalSales: number;
      averageCustomerValue: number;
    };
    diff: {
      totalCustomers: number;
      totalSales: number;
      averageCustomerValue: number;
    };
    percent: {
      totalCustomers: number;
      totalSales: number;
      averageCustomerValue: number;
    };
  };
}

interface MonthlyAllocation {
  month: number;
  allocation_percentage: number;
  target_sales_amount: number;
  target_customer_count: number;
  target_total_items_sold?: number;
}

export default function TargetsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [annualTargets, setAnnualTargets] = useState<AnnualTarget[]>([]);
  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>([]);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [historicalSales, setHistoricalSales] = useState<{
    yearly: { [key: number]: number };
    monthly: { [key: number]: { [key: number]: number } };
  }>({ yearly: {}, monthly: {} });

  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(format(new Date(), 'yyyy'));
  const [selectedAnalysisYear, setSelectedAnalysisYear] = useState<string>((new Date().getFullYear() - 1).toString());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const { toast, toasts, dismiss } = useToast();

  // フォーム状態
  const [annualFormData, setAnnualFormData] = useState<CreateAnnualTargetRequest>({
    year: new Date().getFullYear(),
    store_id: 0,
    target_sales_amount: 0,
    target_customer_count: 0,
    target_total_items_sold: undefined,
  });

  const [monthlyFormData, setMonthlyFormData] = useState<CreateMonthlyTargetRequest>({
    annual_target_id: 0,
    month: 1,
    allocation_percentage: 0.1,
    target_sales_amount: 0,
    target_customer_count: 0,
    target_total_items_sold: undefined,
  });

  // 月別割り当てデータ
  const [monthlyAllocations, setMonthlyAllocations] = useState<MonthlyAllocation[]>([]);
  const [selectedAnnualTarget, setSelectedAnnualTarget] = useState<AnnualTarget | null>(null);

  // 月ごとの実績取得
  const [monthlyActuals, setMonthlyActuals] = useState<{ [key: number]: { sales: number; customers: number } }>({});

  // 店舗一覧を取得
  const fetchStores = useCallback(async () => {
    try {
      const response = await fetch("/api/stores");
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (error) {
      console.error("店舗データの取得に失敗しました:", error);
    }
  }, []);

  // 年間目標を取得
  const fetchAnnualTargets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStore !== "all") {
        params.append("storeId", selectedStore);
      }
      if (selectedYear) {
        params.append("year", selectedYear);
      }

      const response = await fetch(`/api/targets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnnualTargets(data);
      }
    } catch (error) {
      console.error("年間目標の取得に失敗しました:", error);
      toast({
        title: "エラー",
        description: "年間目標の取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedStore, selectedYear, toast]);

  // 月間目標を取得
  const fetchMonthlyTargets = useCallback(async () => {
    try {
      console.log("=== 月間目標取得開始 ===");
      const response = await fetch("/api/targets/monthly");
      console.log("月間目標APIレスポンスステータス:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("月間目標データ:", data);
        console.log("月間目標データ件数:", data.length);
        setMonthlyTargets(data);
      } else {
        console.error("月間目標APIエラー:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("月間目標の取得に失敗しました:", error);
    }
  }, []);

  // 月間目標が更新された後に実績データを取得
  useEffect(() => {
    console.log("=== 実績データ取得useEffect実行 ===");
    console.log("monthlyTargets.length:", monthlyTargets.length);
    console.log("selectedYear:", selectedYear);
    console.log("selectedStore:", selectedStore);
    console.log("条件チェック:", {
      monthlyTargetsLength: monthlyTargets.length > 0,
      selectedYearExists: !!selectedYear,
      condition: monthlyTargets.length > 0 && selectedYear
    });
    
    if (monthlyTargets.length > 0 && selectedYear) {
      console.log("月間目標更新後、実績データを取得");
      // fetchMonthlyActualsを直接呼び出し
      const fetchData = async () => {
        if (!selectedYear) {
          console.log("月別実績取得をスキップ: 年が選択されていません", { selectedYear });
          return;
        }
        
        console.log("=== 月別実績取得開始 ===");
        console.log("選択された店舗:", selectedStore);
        console.log("選択された年:", selectedYear);
        
        const actuals: { [key: number]: { sales: number; customers: number } } = {};
        
        for (let month = 1; month <= 12; month++) {
          console.log(`\n--- ${month}月の処理開始 ---`);
          
          // analyticsページと同じ方法でパラメータを構築
          const params = new URLSearchParams({
            period: "month",
            currentDate: `${selectedYear}-${month.toString().padStart(2, "0")}-15`,
          });
          
          // 店舗が選択されている場合のみstoreIdを追加
          if (selectedStore && selectedStore !== "all") {
            params.append("storeId", selectedStore);
          }
          
          // 2025年6月のデータが存在することを確認済み
          if (selectedYear === "2025" && month === 6) {
            console.log("2025年6月のデータが存在することを確認済み");
          }
        
          console.log(`${month}月のAPI呼び出し:`, `/api/analytics?${params}`);
          console.log(`${month}月のパラメータ詳細:`, {
            period: "month",
            currentDate: `${selectedYear}-${month.toString().padStart(2, "0")}-15`,
            storeId: selectedStore !== "all" ? selectedStore : "全店舗"
          });
          
          try {
            const res = await fetch(`/api/analytics?${params}`);
            console.log(`${month}月のレスポンスステータス:`, res.status);
            console.log(`${month}月のレスポンスヘッダー:`, Object.fromEntries(res.headers.entries()));
            
            if (res.ok) {
              const data = await res.json();
              console.log(`${month}月のAPIレスポンスデータ:`, data);
              console.log(`${month}月のtotalSales:`, data.totalSales);
              console.log(`${month}月のtotalCustomers:`, data.totalCustomers);
              
              actuals[month] = {
                sales: data.totalSales || 0,
                customers: data.totalCustomers || 0
              };
              
              console.log(`${month}月の設定された実績データ:`, actuals[month]);
            } else {
              console.error(`${month}月のAPIエラー:`, res.status, res.statusText);
              try {
                const errorText = await res.text();
                console.error(`${month}月のエラー詳細:`, errorText);
              } catch (e) {
                console.error(`${month}月のエラーレスポンス読み取り失敗:`, e);
              }
              actuals[month] = { sales: 0, customers: 0 };
            }
          } catch (error) {
            console.error(`${month}月のネットワークエラー:`, error);
            actuals[month] = { sales: 0, customers: 0 };
          }
          
          console.log(`${month}月の処理完了`);
        }
        
        console.log("\n=== 最終的な月別実績データ ===");
        console.log("actuals:", actuals);
        console.log("actualsのキー:", Object.keys(actuals));
        console.log("actualsの値:", Object.values(actuals));
        console.log("actualsのキー数:", Object.keys(actuals).length);
        console.log("actualsの値の合計:", Object.values(actuals).reduce((sum, data) => sum + data.sales + data.customers, 0));
        
        setMonthlyActuals(actuals);
        console.log("=== 月別実績取得完了 ===");
        console.log("setMonthlyActuals実行後の状態確認用ログ");
        
        // 状態更新の確認
        setTimeout(() => {
          console.log("=== 状態更新確認（1秒後） ===");
          console.log("monthlyActualsの状態:", monthlyActuals);
          console.log("monthlyActualsのキー数:", Object.keys(monthlyActuals).length);
          console.log("actualsとmonthlyActualsの比較:", {
            actualsKeys: Object.keys(actuals),
            monthlyActualsKeys: Object.keys(monthlyActuals),
            isEqual: JSON.stringify(actuals) === JSON.stringify(monthlyActuals)
          });
        }, 1000);
      };
      
      fetchData();
    } else {
      console.log("実績データ取得の条件を満たしていません");
    }
  }, [monthlyTargets.length, selectedStore, selectedYear]);

  // 売上分析データを取得
  const fetchSalesAnalytics = useCallback(async () => {
    if (!selectedAnalysisYear) return;
    
    setIsLoadingAnalytics(true);
    try {
      const params = new URLSearchParams({
        period: 'year',
        currentDate: `${selectedAnalysisYear}-12-31`,
      });
      
      if (selectedStore !== "all") {
        params.append("storeId", selectedStore);
      }

      const response = await fetch(`/api/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSalesAnalytics(data);
      }
    } catch (error) {
      console.error("売上分析データの取得に失敗しました:", error);
      toast({
        title: "エラー",
        description: "売上分析データの取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [selectedAnalysisYear, selectedStore, toast]);

  // 過去の売上データを取得
  const fetchHistoricalSales = useCallback(async () => {
    try {
      const currentYear = new Date().getFullYear();
      const yearlyData: { [key: number]: number } = {};
      const monthlyData: { [key: number]: { [key: number]: number } } = {};

      // 過去3年分 + 現在年（2025年）のデータを取得
      for (let year = currentYear - 3; year <= currentYear; year++) {
        const params = new URLSearchParams({
          period: 'year',
          currentDate: `${year}-12-31`,
        });
        
        if (selectedStore !== "all") {
          params.append("storeId", selectedStore);
        }

        const response = await fetch(`/api/analytics?${params}`);
        if (response.ok) {
          const data = await response.json();
          yearlyData[year] = data.totalSales || 0;
          
          // 月別データも取得
          monthlyData[year] = {};
          for (let month = 1; month <= 12; month++) {
            const monthParams = new URLSearchParams({
              period: 'month',
              currentDate: `${year}-${month.toString().padStart(2, '0')}-01`,
            });
            
            if (selectedStore !== "all") {
              monthParams.append("storeId", selectedStore);
            }

            const monthResponse = await fetch(`/api/analytics?${monthParams}`);
            if (monthResponse.ok) {
              const monthData = await monthResponse.json();
              monthlyData[year][month] = monthData.totalSales || 0;
            }
          }
        }
      }

      setHistoricalSales({ yearly: yearlyData, monthly: monthlyData });
    } catch (error) {
      console.error("過去の売上データの取得に失敗しました:", error);
    }
  }, [selectedStore]);

  // 月別割り当ての初期化
  const initializeMonthlyAllocations = useCallback((annualTarget: AnnualTarget) => {
    const allocations: MonthlyAllocation[] = [];
    const defaultAllocation = 1 / 12; // 12ヶ月で均等分配

    for (let month = 1; month <= 12; month++) {
      allocations.push({
        month,
        allocation_percentage: defaultAllocation,
        target_sales_amount: Math.round(annualTarget.target_sales_amount * defaultAllocation),
        target_customer_count: Math.round(annualTarget.target_customer_count * defaultAllocation),
        target_total_items_sold: annualTarget.target_total_items_sold && annualTarget.target_total_items_sold > 0
          ? Math.round(annualTarget.target_total_items_sold * defaultAllocation)
          : undefined,
      });
    }
    setMonthlyAllocations(allocations);
  }, []);

  // データ取得
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    fetchAnnualTargets();
  }, [fetchAnnualTargets]);

  useEffect(() => {
    fetchMonthlyTargets();
  }, [fetchMonthlyTargets]);

  useEffect(() => {
    fetchSalesAnalytics();
  }, [fetchSalesAnalytics]);

  useEffect(() => {
    fetchHistoricalSales();
  }, [fetchHistoricalSales]);

  // 年間目標が選択された時の処理
  const handleAnnualTargetChange = (annualTargetId: number) => {
    const target = annualTargets.find(t => t.id === annualTargetId);
    if (target) {
      setSelectedAnnualTarget(target);
      setMonthlyFormData(prev => ({ ...prev, annual_target_id: annualTargetId }));
      initializeMonthlyAllocations(target);
    }
  };

  // 月別割り当ての更新
  const updateMonthlyAllocation = (month: number, allocation_percentage: number) => {
    if (!selectedAnnualTarget) return;

    const newAllocations = monthlyAllocations.map(allocation => {
      if (allocation.month === month) {
        return {
          ...allocation,
          allocation_percentage,
          target_sales_amount: Math.round(selectedAnnualTarget.target_sales_amount * allocation_percentage),
          target_customer_count: Math.round(selectedAnnualTarget.target_customer_count * allocation_percentage),
          target_total_items_sold: selectedAnnualTarget.target_total_items_sold 
            ? Math.round(selectedAnnualTarget.target_total_items_sold * allocation_percentage)
            : undefined,
        };
      }
      return allocation;
    });

    setMonthlyAllocations(newAllocations);
  };

  // 全月の割り当てを一括更新
  const updateAllMonthlyAllocations = (allocations: number[]) => {
    if (!selectedAnnualTarget) return;

    const newAllocations: MonthlyAllocation[] = allocations.map((allocation_percentage, index) => ({
      month: index + 1,
      allocation_percentage,
      target_sales_amount: Math.round(selectedAnnualTarget.target_sales_amount * allocation_percentage),
      target_customer_count: Math.round(selectedAnnualTarget.target_customer_count * allocation_percentage),
      target_total_items_sold: selectedAnnualTarget.target_total_items_sold 
        ? Math.round(selectedAnnualTarget.target_total_items_sold * allocation_percentage)
        : undefined,
    }));

    setMonthlyAllocations(newAllocations);
  };

  // 月間目標一括作成
  const createAllMonthlyTargets = async () => {
    if (!selectedAnnualTarget || monthlyAllocations.length === 0) return;

    setIsSubmitting(true);

    try {
      const promises = monthlyAllocations.map(async (allocation) => {
        const requestBody: {
          annual_target_id: number;
          month: number;
          allocation_percentage: number;
          target_sales_amount: number;
          target_customer_count: number;
          target_total_items_sold?: number;
        } = {
          annual_target_id: selectedAnnualTarget.id,
          month: allocation.month,
          allocation_percentage: allocation.allocation_percentage,
          target_sales_amount: allocation.target_sales_amount,
          target_customer_count: allocation.target_customer_count,
        };
        
        // target_total_items_soldがundefinedでなく、かつ0より大きい場合のみ追加
        if (allocation.target_total_items_sold !== undefined && allocation.target_total_items_sold > 0) {
          requestBody.target_total_items_sold = allocation.target_total_items_sold;
        }

        try {
          console.log(`${allocation.month}月の月間目標作成リクエスト:`, requestBody);
          
          const response = await fetch("/api/targets/monthly", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch {
              errorData = { error: 'レスポンスの解析に失敗', rawResponse: await response.text() };
            }
            
            console.error(`${allocation.month}月の月間目標作成エラー - ステータス:`, response.status);
            console.error(`${allocation.month}月の月間目標作成エラー - ステータステキスト:`, response.statusText);
            console.error(`${allocation.month}月の月間目標作成エラー - エラーデータ:`, errorData);
            console.error(`${allocation.month}月の月間目標作成エラー - リクエストボディ:`, requestBody);
            console.error(`${allocation.month}月の月間目標作成エラー - レスポンスヘッダー:`, Object.fromEntries(response.headers.entries()));
          }

          return response;
        } catch (error) {
          console.error(`${allocation.month}月の月間目標作成でネットワークエラー:`, error);
          throw error;
        }
      });

      const responses = await Promise.all(promises);
      const errorResponses = responses.filter(response => !response.ok);
      
      if (errorResponses.length > 0) {
        // エラーの詳細を取得
        const errorDetails = await Promise.all(
          errorResponses.map(async (response) => {
            try {
              const errorData = await response.json();
              return {
                status: response.status,
                error: errorData.error || '不明なエラー',
                details: errorData.details || null
              };
            } catch {
              return {
                status: response.status,
                error: 'レスポンスの解析に失敗',
                details: null
              };
            }
          })
        );
        
        console.error('月間目標作成エラー詳細:', errorDetails);
        throw new Error(`一部の月間目標の作成に失敗しました: ${errorDetails.map(e => e.error).join(', ')}`);
      }

      toast({
        title: "成功",
        description: "12ヶ月分の月間目標が正常に作成されました",
      });

      // フォームをリセット
      setSelectedAnnualTarget(null);
      setMonthlyAllocations([]);
              setMonthlyFormData({
          annual_target_id: 0,
          month: 1,
          allocation_percentage: 0.1,
          target_sales_amount: 0,
          target_customer_count: 0,
          target_total_items_sold: undefined,
        });

      fetchMonthlyTargets();
    } catch (error) {
      console.error("月間目標の一括作成に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "月間目標の一括作成に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 年間目標作成
  const createAnnualTarget = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(annualFormData),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "年間目標が正常に作成されました",
        });
        setAnnualFormData({
          year: new Date().getFullYear(),
          store_id: 0,
          target_sales_amount: 0,
          target_customer_count: 0,
          target_total_items_sold: undefined,
        });
        fetchAnnualTargets();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "年間目標の作成に失敗しました");
      }
    } catch (error) {
      console.error("年間目標の作成に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "年間目標の作成に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  // 月の日本語表示
  const getMonthLabel = (month: number) => {
    const months = [
      "1月", "2月", "3月", "4月", "5月", "6月",
      "7月", "8月", "9月", "10月", "11月", "12月"
    ];
    return months[month - 1] || month.toString();
  };

  // 進捗率のバッジ色を取得
  const getProgressBadgeColor = (progress: number) => {
    if (progress >= 100) return "bg-green-100 text-green-800";
    if (progress >= 80) return "bg-yellow-100 text-yellow-800";
    if (progress >= 60) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };



  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">売上目標管理</h1>
            <p className="text-gray-600">年間、月間、週間、日別の売上目標を設定・管理します</p>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="store">店舗</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="店舗を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての店舗</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">目標年</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="年を選択" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="analysisYear">分析年</Label>
              <Select value={selectedAnalysisYear} onValueChange={setSelectedAnalysisYear}>
                <SelectTrigger>
                  <SelectValue placeholder="分析年を選択" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 4 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 売上分析セクション */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <IconChartBar className="w-6 h-6 text-blue-600" />
            <span>売上分析（{selectedAnalysisYear}年）</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAnalytics ? (
            <div className="text-center py-8">分析データを読み込み中...</div>
          ) : salesAnalytics ? (
            <div className="space-y-6">
              {/* 主要指標 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <IconTrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">総売上</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    ¥{salesAnalytics.totalSales.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <IconTarget className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">総顧客数</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {salesAnalytics.totalCustomers.toLocaleString()}人
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <IconCalendar className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">平均客単価</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    ¥{salesAnalytics.averageCustomerValue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <IconChartBar className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-orange-900">購買率</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    {salesAnalytics.purchaseRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* 過去4年比較 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">過去4年の売上推移</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(historicalSales.yearly).map(([year, sales]) => {
                    const currentYear = parseInt(year);
                    const previousYear = currentYear - 1;
                    const previousSales = historicalSales.yearly[previousYear] || 0;
                    const yearOverYear = previousSales > 0 ? ((sales - previousSales) / previousSales) * 100 : 0;
                    
                    return (
                      <div key={year} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900">{year}年</h4>
                        <p className="text-xl font-bold text-gray-900">
                          ¥{sales.toLocaleString()}
                        </p>
                        {previousSales > 0 && (
                          <p className={`text-sm ${yearOverYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            前年比: {yearOverYear >= 0 ? '+' : ''}{yearOverYear.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 月別売上 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">月別売上（{selectedAnalysisYear}年）</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                    const monthSales = historicalSales.monthly[parseInt(selectedAnalysisYear)]?.[month] || 0;
                    const yearlySales = historicalSales.yearly[parseInt(selectedAnalysisYear)] || 0;
                    const percentage = yearlySales > 0 ? (monthSales / yearlySales) * 100 : 0;
                    return (
                      <div key={month} className="bg-gray-50 p-3 rounded-lg text-center">
                        <h4 className="font-medium text-gray-900">{month}月</h4>
                        <p className="text-lg font-bold text-gray-900">
                          ¥{monthSales.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 比較分析 */}
              {salesAnalytics.comparisonDetail && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">前年比較</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">売上</h4>
                      <p className="text-xl font-bold text-blue-900">
                        ¥{salesAnalytics.comparisonDetail.diff.totalSales.toLocaleString()}
                      </p>
                      <p className={`text-sm ${salesAnalytics.comparisonDetail.percent.totalSales >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {salesAnalytics.comparisonDetail.percent.totalSales >= 0 ? '+' : ''}{salesAnalytics.comparisonDetail.percent.totalSales.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900">顧客数</h4>
                      <p className="text-xl font-bold text-green-900">
                        {salesAnalytics.comparisonDetail.diff.totalCustomers.toLocaleString()}人
                      </p>
                      <p className={`text-sm ${salesAnalytics.comparisonDetail.percent.totalCustomers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {salesAnalytics.comparisonDetail.percent.totalCustomers >= 0 ? '+' : ''}{salesAnalytics.comparisonDetail.percent.totalCustomers.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900">平均客単価</h4>
                      <p className="text-xl font-bold text-purple-900">
                        ¥{salesAnalytics.comparisonDetail.diff.averageCustomerValue.toLocaleString()}
                      </p>
                      <p className={`text-sm ${salesAnalytics.comparisonDetail.percent.averageCustomerValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {salesAnalytics.comparisonDetail.percent.averageCustomerValue >= 0 ? '+' : ''}{salesAnalytics.comparisonDetail.percent.averageCustomerValue.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              分析データがありません
            </div>
          )}
        </CardContent>
      </Card>

      {/* 目標一覧と作成 */}
      <Tabs defaultValue="annual" className="space-y-6">
        <TabsList>
          <TabsTrigger value="annual">年間目標</TabsTrigger>
          <TabsTrigger value="monthly">月間目標</TabsTrigger>
          <TabsTrigger value="create">目標作成</TabsTrigger>
        </TabsList>

        <TabsContent value="annual">
          <Card>
            <CardHeader>
              <CardTitle>年間目標一覧 ({annualTargets.length}件)</CardTitle>
            </CardHeader>
            <CardContent>
              {annualTargets.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  年間目標が見つかりません
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {annualTargets.map((target) => (
                    <div
                      key={target.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{target.year}年</h3>
                            <Badge variant="outline">{target.store.name}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>売上目標: ¥{target.target_sales_amount.toLocaleString()}</div>
                            <div>客数目標: {target.target_customer_count.toLocaleString()}人</div>
                            {target.target_total_items_sold && (
                              <div>売上点数目標: {target.target_total_items_sold.toLocaleString()}点</div>
                            )}
                            {/* 進捗率表示 */}
                            <div className="mt-2 pt-2 border-t">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">進捗率</span>
                                <Badge className={getProgressBadgeColor(85)}>
                                  85%
                                </Badge>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: '85%' }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        作成日: {new Date(target.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>月間目標一覧 ({monthlyTargets.length}件)</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTargets.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  月間目標が見つかりません
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthlyTargets.map((target) => {
                    const actual = monthlyActuals[target.month] || { sales: 0, customers: 0 };
                    console.log(`=== ${target.month}月の月間目標表示 ===`);
                    console.log(`${target.month}月の実績データ:`, actual);
                    console.log(`${target.month}月のmonthlyActuals全体:`, monthlyActuals);
                    console.log(`${target.month}月のtarget:`, target);
                    console.log(`monthlyActualsのキー:`, Object.keys(monthlyActuals));
                    console.log(`monthlyActualsの値:`, Object.values(monthlyActuals));
                    console.log(`monthlyActualsのキー数:`, Object.keys(monthlyActuals).length);
                    
                    const salesProgress = target.target_sales_amount > 0 ? (actual.sales / target.target_sales_amount) * 100 : 0;
                    const customerProgress = target.target_customer_count > 0 ? (actual.customers / target.target_customer_count) * 100 : 0;
                    
                    // 客単価の計算
                    const targetAverageCustomerValue = target.target_customer_count > 0 ? target.target_sales_amount / target.target_customer_count : 0;
                    const actualAverageCustomerValue = actual.customers > 0 ? actual.sales / actual.customers : 0;
                    const averageCustomerValueProgress = targetAverageCustomerValue > 0 ? (actualAverageCustomerValue / targetAverageCustomerValue) * 100 : 0;
                    
                    console.log(`${target.month}月の進捗計算:`, {
                      targetSales: target.target_sales_amount,
                      actualSales: actual.sales,
                      salesProgress,
                      targetCustomers: target.target_customer_count,
                      actualCustomers: actual.customers,
                      customerProgress,
                      targetAverageCustomerValue,
                      actualAverageCustomerValue,
                      averageCustomerValueProgress
                    });
                    
                    return (
                      <div
                        key={target.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{getMonthLabel(target.month)}</h3>
                              <Badge variant="outline">{target.annual_target.store.name}</Badge>
                              <Badge variant="secondary">{target.annual_target.year}年</Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>売上目標: ¥{target.target_sales_amount.toLocaleString()}</div>
                              <div>客数目標: {target.target_customer_count.toLocaleString()}人</div>
                              <div>客単価目標: ¥{targetAverageCustomerValue.toLocaleString()}</div>
                              <div>割合: {(target.allocation_percentage * 100).toFixed(1)}%</div>
                              {target.target_total_items_sold && (
                                <div>売上点数目標: {target.target_total_items_sold.toLocaleString()}点</div>
                              )}
                              <div>実績売上: <span className="font-bold">¥{actual.sales.toLocaleString()}</span></div>
                              <div>実績客数: <span className="font-bold">{actual.customers.toLocaleString()}人</span></div>
                              <div>実績客単価: <span className="font-bold">¥{actualAverageCustomerValue.toLocaleString()}</span></div>
                              {Object.keys(monthlyActuals).length === 0 && (
                                <div className="text-xs text-orange-600">
                                  実績データを取得中...
                                </div>
                              )}
                              {Object.keys(monthlyActuals).length > 0 && actual.sales === 0 && actual.customers === 0 && (
                                <div className="text-xs text-gray-500">
                                  この月の実績データはありません
                                </div>
                              )}
                            </div>
                            {/* 進捗率表示 */}
                            <div className="mt-2 pt-2 border-t space-y-2">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">売上进捗率</span>
                                  <Badge className={getProgressBadgeColor(salesProgress)}>
                                    {salesProgress.toFixed(1)}%
                                  </Badge>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${Math.min(salesProgress, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">客数進捗率</span>
                                  <Badge className={getProgressBadgeColor(customerProgress)}>
                                    {customerProgress.toFixed(1)}%
                                  </Badge>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${Math.min(customerProgress, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">客単価進捗率</span>
                                  <Badge className={getProgressBadgeColor(averageCustomerValueProgress)}>
                                    {averageCustomerValueProgress.toFixed(1)}%
                                  </Badge>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-purple-600 h-2 rounded-full" 
                                    style={{ width: `${Math.min(averageCustomerValueProgress, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          作成日: {new Date(target.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 年間目標作成 */}
            <Card>
              <CardHeader>
                <CardTitle>年間目標作成</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">年</Label>
                      <Select
                        value={annualFormData.year.toString()}
                        onValueChange={(value) =>
                          setAnnualFormData((prev) => ({ ...prev, year: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}年
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="store">店舗</Label>
                      <Select
                        value={annualFormData.store_id.toString()}
                        onValueChange={(value) =>
                          setAnnualFormData((prev) => ({ ...prev, store_id: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="店舗を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id.toString()}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 過去の売上データを参考にした目標設定 */}
                  {historicalSales.yearly && Object.keys(historicalSales.yearly).length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">過去の売上データ（参考）</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        {Object.entries(historicalSales.yearly).map(([year, sales]) => (
                          <div key={year} className="text-sm">
                            <span className="font-medium">{year}年:</span> ¥{sales.toLocaleString()}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const lastYearSales = historicalSales.yearly[annualFormData.year - 1] || 0;
                            setAnnualFormData((prev) => ({
                              ...prev,
                              target_sales_amount: Math.round(lastYearSales * 1.05), // 5%増
                            }));
                          }}
                        >
                          前年比+5%で設定
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const lastYearSales = historicalSales.yearly[annualFormData.year - 1] || 0;
                            setAnnualFormData((prev) => ({
                              ...prev,
                              target_sales_amount: Math.round(lastYearSales * 1.1), // 10%増
                            }));
                          }}
                        >
                          前年比+10%で設定
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const lastYearSales = historicalSales.yearly[annualFormData.year - 1] || 0;
                            setAnnualFormData((prev) => ({
                              ...prev,
                              target_sales_amount: Math.round(lastYearSales * 1.15), // 15%増
                            }));
                          }}
                        >
                          前年比+15%で設定
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="target_sales_amount">売上目標</Label>
                      <Input
                        id="target_sales_amount"
                        type="number"
                        value={annualFormData.target_sales_amount}
                        onChange={(e) =>
                          setAnnualFormData((prev) => ({
                            ...prev,
                            target_sales_amount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="売上目標を入力"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target_customer_count">客数目標</Label>
                      <Input
                        id="target_customer_count"
                        type="number"
                        value={annualFormData.target_customer_count}
                        onChange={(e) =>
                          setAnnualFormData((prev) => ({
                            ...prev,
                            target_customer_count: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="客数目標を入力"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target_total_items_sold">売上点数目標（任意）</Label>
                      <Input
                        id="target_total_items_sold"
                        type="number"
                        value={annualFormData.target_total_items_sold || ''}
                        onChange={(e) =>
                          setAnnualFormData((prev) => ({
                            ...prev,
                            target_total_items_sold: e.target.value ? parseInt(e.target.value) : undefined,
                          }))
                        }
                        placeholder="売上点数目標を入力（任意）"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={createAnnualTarget}
                    disabled={isSubmitting || !annualFormData.store_id || annualFormData.target_sales_amount <= 0}
                    className="w-full"
                  >
                    {isSubmitting ? "作成中..." : "年間目標を作成"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 月間目標作成 */}
            <Card>
              <CardHeader>
                <CardTitle>月間目標作成</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="annual_target_id">年間目標</Label>
                    <Select
                      value={monthlyFormData.annual_target_id.toString()}
                      onValueChange={(value) => handleAnnualTargetChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="年間目標を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {annualTargets.map((target) => (
                          <SelectItem key={target.id} value={target.id.toString()}>
                            {target.year}年 - {target.store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAnnualTarget && (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">選択された年間目標</h3>
                        <div className="text-sm space-y-1">
                          <div>売上目標: ¥{selectedAnnualTarget.target_sales_amount.toLocaleString()}</div>
                          <div>客数目標: {selectedAnnualTarget.target_customer_count.toLocaleString()}人</div>
                          {selectedAnnualTarget.target_total_items_sold && (
                            <div>売上点数目標: {selectedAnnualTarget.target_total_items_sold.toLocaleString()}点</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-medium">月別割り当て設定</Label>
                        <div className="mt-3 space-y-3">
                          {monthlyAllocations.map((allocation) => (
                            <div key={allocation.month} className="flex items-center space-x-4">
                              <div className="w-16 text-sm font-medium">
                                {getMonthLabel(allocation.month)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                                                     <input
                                     type="range"
                                     min="0"
                                     max="0.3"
                                     step="0.01"
                                     value={allocation.allocation_percentage}
                                     onChange={(e) => updateMonthlyAllocation(allocation.month, parseFloat(e.target.value))}
                                     className="flex-1"
                                   />
                                  <span className="text-sm w-16 text-right">
                                    {(allocation.allocation_percentage * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  売上: ¥{allocation.target_sales_amount.toLocaleString()} | 
                                  客数: {allocation.target_customer_count.toLocaleString()}人
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3">クイック設定</h3>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // 均等分配
                              const equalAllocation = 1 / 12;
                              const allocations = Array(12).fill(equalAllocation);
                              updateAllMonthlyAllocations(allocations);
                            }}
                          >
                            均等分配
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // 前年データに基づく分配（historicalSales.monthlyを使用）
                              const previousYear = selectedAnnualTarget.year - 1;
                              if (historicalSales.monthly[previousYear]) {
                                const yearlyTotal = historicalSales.yearly[previousYear] || 1;
                                const allocations = Array.from({ length: 12 }, (_, i) => {
                                  const monthSales = historicalSales.monthly[previousYear][i + 1] || 0;
                                  return monthSales / yearlyTotal;
                                });
                                updateAllMonthlyAllocations(allocations);
                              } else {
                                toast({
                                  title: "警告",
                                  description: `${previousYear}年のデータが見つかりません`,
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            前年データベース
                          </Button>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">合計割合</div>
                            <div className="text-sm text-gray-600">
                              {(monthlyAllocations.reduce((sum, a) => sum + a.allocation_percentage, 0) * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">目標値</div>
                            <div className="text-sm text-gray-600">100.0%</div>
                          </div>
                        </div>
                        {Math.abs(monthlyAllocations.reduce((sum, a) => sum + a.allocation_percentage, 0) - 1) > 0.01 && (
                          <div className="text-red-600 text-sm mt-2">
                            ⚠️ 合計が100%になるように調整してください
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={createAllMonthlyTargets}
                        disabled={
                          isSubmitting || 
                          monthlyAllocations.length === 0 ||
                          Math.abs(monthlyAllocations.reduce((sum, a) => sum + a.allocation_percentage, 0) - 1) > 0.01
                        }
                        className="w-full"
                      >
                        {isSubmitting ? "作成中..." : "12ヶ月分の月間目標を作成"}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 