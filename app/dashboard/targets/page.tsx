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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "../../../hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";

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

export default function TargetsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [annualTargets, setAnnualTargets] = useState<AnnualTarget[]>([]);
  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>([]);

  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [isCreateAnnualDialogOpen, setIsCreateAnnualDialogOpen] = useState(false);
  const [isCreateMonthlyDialogOpen, setIsCreateMonthlyDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast, toasts, dismiss } = useToast();

  // フォーム状態
  const [annualFormData, setAnnualFormData] = useState<CreateAnnualTargetRequest>({
    year: new Date().getFullYear(),
    store_id: 0,
    target_sales_amount: 0,
    target_customer_count: 0,
    target_total_items_sold: 0,
  });

  const [monthlyFormData, setMonthlyFormData] = useState<CreateMonthlyTargetRequest>({
    annual_target_id: 0,
    month: 1,
    allocation_percentage: 0.1,
    target_sales_amount: 0,
    target_customer_count: 0,
    target_total_items_sold: 0,
  });

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
      const response = await fetch("/api/targets/monthly");
      if (response.ok) {
        const data = await response.json();
        setMonthlyTargets(data);
      }
    } catch (error) {
      console.error("月間目標の取得に失敗しました:", error);
    }
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
        setIsCreateAnnualDialogOpen(false);
        setAnnualFormData({
          year: new Date().getFullYear(),
          store_id: 0,
          target_sales_amount: 0,
          target_customer_count: 0,
          target_total_items_sold: 0,
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

  // 月間目標作成
  const createMonthlyTarget = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/targets/monthly", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(monthlyFormData),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "月間目標が正常に作成されました",
        });
        setIsCreateMonthlyDialogOpen(false);
        setMonthlyFormData({
          annual_target_id: 0,
          month: 1,
          allocation_percentage: 0.1,
          target_sales_amount: 0,
          target_customer_count: 0,
          target_total_items_sold: 0,
        });
        fetchMonthlyTargets();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "月間目標の作成に失敗しました");
      }
    } catch (error) {
      console.error("月間目標の作成に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "月間目標の作成に失敗しました",
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateAnnualDialogOpen(true)}
            >
              年間目標作成
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCreateMonthlyDialogOpen(true)}
            >
              月間目標作成
            </Button>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="year">年</Label>
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
          </div>
        </CardContent>
      </Card>

      {/* 目標一覧 */}
      <Tabs defaultValue="annual" className="space-y-6">
        <TabsList>
          <TabsTrigger value="annual">年間目標</TabsTrigger>
          <TabsTrigger value="monthly">月間目標</TabsTrigger>
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
                  {monthlyTargets.map((target) => (
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
                            <div>割合: {(target.allocation_percentage * 100).toFixed(1)}%</div>
                            {target.target_total_items_sold && (
                              <div>売上点数目標: {target.target_total_items_sold.toLocaleString()}点</div>
                            )}
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
      </Tabs>

      {/* 年間目標作成ダイアログ */}
      <Dialog open={isCreateAnnualDialogOpen} onOpenChange={setIsCreateAnnualDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>年間目標作成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
                value={annualFormData.target_total_items_sold || 0}
                onChange={(e) =>
                  setAnnualFormData((prev) => ({
                    ...prev,
                    target_total_items_sold: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="売上点数目標を入力"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateAnnualDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                onClick={createAnnualTarget}
                disabled={isSubmitting || !annualFormData.store_id || annualFormData.target_sales_amount <= 0}
              >
                {isSubmitting ? "作成中..." : "作成"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 月間目標作成ダイアログ */}
      <Dialog open={isCreateMonthlyDialogOpen} onOpenChange={setIsCreateMonthlyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>月間目標作成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="annual_target_id">年間目標</Label>
              <Select
                value={monthlyFormData.annual_target_id.toString()}
                onValueChange={(value) =>
                  setMonthlyFormData((prev) => ({ ...prev, annual_target_id: parseInt(value) }))
                }
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
            <div>
              <Label htmlFor="month">月</Label>
              <Select
                value={monthlyFormData.month.toString()}
                onValueChange={(value) =>
                  setMonthlyFormData((prev) => ({ ...prev, month: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthLabel(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="allocation_percentage">年間目標からの割合</Label>
              <Input
                id="allocation_percentage"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={monthlyFormData.allocation_percentage}
                onChange={(e) =>
                  setMonthlyFormData((prev) => ({
                    ...prev,
                    allocation_percentage: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="割合を入力（例: 0.1）"
              />
            </div>
            <div>
              <Label htmlFor="monthly_target_sales_amount">売上目標</Label>
              <Input
                id="monthly_target_sales_amount"
                type="number"
                value={monthlyFormData.target_sales_amount}
                onChange={(e) =>
                  setMonthlyFormData((prev) => ({
                    ...prev,
                    target_sales_amount: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="売上目標を入力"
              />
            </div>
            <div>
              <Label htmlFor="monthly_target_customer_count">客数目標</Label>
              <Input
                id="monthly_target_customer_count"
                type="number"
                value={monthlyFormData.target_customer_count}
                onChange={(e) =>
                  setMonthlyFormData((prev) => ({
                    ...prev,
                    target_customer_count: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="客数目標を入力"
              />
            </div>
            <div>
              <Label htmlFor="monthly_target_total_items_sold">売上点数目標（任意）</Label>
              <Input
                id="monthly_target_total_items_sold"
                type="number"
                value={monthlyFormData.target_total_items_sold || 0}
                onChange={(e) =>
                  setMonthlyFormData((prev) => ({
                    ...prev,
                    target_total_items_sold: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="売上点数目標を入力"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateMonthlyDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                onClick={createMonthlyTarget}
                disabled={isSubmitting || !monthlyFormData.annual_target_id || monthlyFormData.target_sales_amount <= 0}
              >
                {isSubmitting ? "作成中..." : "作成"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 