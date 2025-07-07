'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format, parseISO, startOfYear, endOfYear, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subYears, subMonths, subWeeks } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RegisterClose {
  id: number;
  date: string;
  groups_count: number;
  customer_count: number;
  male_count: number;
  female_count: number;
  unspecified_count: number;
  customer_unit_price: number | string;
  total_items_sold: number;
  total_sales: number | string;
  net_sales: number | string;
  cash_amount: number | string;
  credit_amount: number | string;
  point_amount: number | string;
  electronic_money_amount: number | string;
  store: {
    name: string;
  };
}

interface Store {
  id: number;
  name: string;
}

interface ComparisonData {
  current: {
    totalCustomers: number;
    totalSales: number;
    totalNetSales: number;
    totalCash: number;
    totalCredit: number;
    totalPoint: number;
    totalElectronicMoney: number;
    averageCustomerUnitPrice: number;
  };
  previous: {
    totalCustomers: number;
    totalSales: number;
    totalNetSales: number;
    totalCash: number;
    totalCredit: number;
    totalPoint: number;
    totalElectronicMoney: number;
    averageCustomerUnitPrice: number;
  };
  difference: {
    totalCustomers: number;
    totalSales: number;
    totalNetSales: number;
    totalCash: number;
    totalCredit: number;
    totalPoint: number;
    totalElectronicMoney: number;
    averageCustomerUnitPrice: number;
  };
  percentage: {
    totalCustomers: number;
    totalSales: number;
    totalNetSales: number;
    totalCash: number;
    totalCredit: number;
    totalPoint: number;
    totalElectronicMoney: number;
    averageCustomerUnitPrice: number;
  };
}

type PeriodType = 'year' | 'month' | 'week';

export default function RegisterClosePage() {
  const [registerCloses, setRegisterCloses] = useState<RegisterClose[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  // 店舗リストの取得
  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch('/api/stores');
        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }
        const data = await response.json();
        setStores(data);
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('店舗情報の取得に失敗しました。');
      }
    }
    fetchStores();
  }, []);

  // 期間に基づいて日付を設定
  const setPeriodDates = (type: PeriodType) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (type) {
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 }); // 月曜日開始
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  // 期間タイプが変更された時の処理
  useEffect(() => {
    setPeriodDates(periodType);
  }, [periodType]);

  // レジクローズデータの取得
  const fetchRegisterCloses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedStoreId && selectedStoreId !== 'all') params.append('storeId', selectedStoreId);

      const response = await fetch(`/api/register-closes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch register closes');
      }
      const data = await response.json();
      setRegisterCloses(data);

      // 比較データを取得
      await fetchComparisonData(startDate, endDate, selectedStoreId);
      
      toast.success('レジクローズデータを更新しました。');
    } catch (error) {
      console.error('Error fetching register closes:', error);
      toast.error('レジクローズデータの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // 比較データの取得
  const fetchComparisonData = async (currentStartDate: string, currentEndDate: string, storeId: string) => {
    try {
      const currentStart = new Date(currentStartDate);
      const currentEnd = new Date(currentEndDate);
      
      let previousStart: Date;
      let previousEnd: Date;

      switch (periodType) {
        case 'year':
          previousStart = subYears(currentStart, 1);
          previousEnd = subYears(currentEnd, 1);
          break;
        case 'month':
          previousStart = subMonths(currentStart, 1);
          previousEnd = subMonths(currentEnd, 1);
          break;
        case 'week':
          previousStart = subWeeks(currentStart, 1);
          previousEnd = subWeeks(currentEnd, 1);
          break;
      }

      const params = new URLSearchParams();
      params.append('startDate', format(previousStart, 'yyyy-MM-dd'));
      params.append('endDate', format(previousEnd, 'yyyy-MM-dd'));
      if (storeId && storeId !== 'all') params.append('storeId', storeId);

      const response = await fetch(`/api/register-closes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      const previousData = await response.json();

      // 現在のデータと前期間のデータを比較
      const currentSummary = calculateSummary(registerCloses);
      const previousSummary = calculateSummary(previousData);

      if (currentSummary && previousSummary) {
        const comparison: ComparisonData = {
          current: currentSummary,
          previous: previousSummary,
          difference: {
            totalCustomers: currentSummary.totalCustomers - previousSummary.totalCustomers,
            totalSales: currentSummary.totalSales - previousSummary.totalSales,
            totalNetSales: currentSummary.totalNetSales - previousSummary.totalNetSales,
            totalCash: currentSummary.totalCash - previousSummary.totalCash,
            totalCredit: currentSummary.totalCredit - previousSummary.totalCredit,
            totalPoint: currentSummary.totalPoint - previousSummary.totalPoint,
            totalElectronicMoney: currentSummary.totalElectronicMoney - previousSummary.totalElectronicMoney,
            averageCustomerUnitPrice: currentSummary.averageCustomerUnitPrice - previousSummary.averageCustomerUnitPrice,
          },
          percentage: {
            totalCustomers: previousSummary.totalCustomers > 0 ? ((currentSummary.totalCustomers - previousSummary.totalCustomers) / previousSummary.totalCustomers) * 100 : 0,
            totalSales: previousSummary.totalSales > 0 ? ((currentSummary.totalSales - previousSummary.totalSales) / previousSummary.totalSales) * 100 : 0,
            totalNetSales: previousSummary.totalNetSales > 0 ? ((currentSummary.totalNetSales - previousSummary.totalNetSales) / previousSummary.totalNetSales) * 100 : 0,
            totalCash: previousSummary.totalCash > 0 ? ((currentSummary.totalCash - previousSummary.totalCash) / previousSummary.totalCash) * 100 : 0,
            totalCredit: previousSummary.totalCredit > 0 ? ((currentSummary.totalCredit - previousSummary.totalCredit) / previousSummary.totalCredit) * 100 : 0,
            totalPoint: previousSummary.totalPoint > 0 ? ((currentSummary.totalPoint - previousSummary.totalPoint) / previousSummary.totalPoint) * 100 : 0,
            totalElectronicMoney: previousSummary.totalElectronicMoney > 0 ? ((currentSummary.totalElectronicMoney - previousSummary.totalElectronicMoney) / previousSummary.totalElectronicMoney) * 100 : 0,
            averageCustomerUnitPrice: previousSummary.averageCustomerUnitPrice > 0 ? ((currentSummary.averageCustomerUnitPrice - previousSummary.averageCustomerUnitPrice) / previousSummary.averageCustomerUnitPrice) * 100 : 0,
          },
        };
        setComparisonData(comparison);
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchRegisterCloses();
    }
  }, [startDate, endDate, selectedStoreId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('CSVファイルを選択してください。');
      return;
    }

    if (selectedStoreId === 'all') {
      toast.error('店舗を選択してください。');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('storeId', selectedStoreId);

    try {
      const response = await fetch('/api/upload-register-close-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'CSVファイルが正常にアップロードされました。');
        setFile(null);
        fetchRegisterCloses();
      } else {
        toast.error(result.error || 'CSVファイルのアップロードに失敗しました。', {
          description: result.details || '不明なエラーが発生しました。',
        });
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((err: { row: any, message: string }) => {
            console.error(`Error in row ${JSON.stringify(err.row)}: ${err.message}`);
          });
          toast.warning(`一部の行でエラーが発生しました。詳細はコンソールを確認してください (${result.errors.length}件)。`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('ネットワークエラーまたはサーバーエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  // サマリー計算
  const calculateSummary = (data: RegisterClose[]) => {
    if (data.length === 0) return null;

    const summary = data.reduce((acc, record) => {
      acc.totalCustomers += record.customer_count;
      acc.totalSales += Number(record.total_sales);
      acc.totalNetSales += Number(record.net_sales);
      acc.totalCash += Number(record.cash_amount);
      acc.totalCredit += Number(record.credit_amount);
      acc.totalPoint += Number(record.point_amount);
      acc.totalElectronicMoney += Number(record.electronic_money_amount);
      return acc;
    }, {
      totalCustomers: 0,
      totalSales: 0,
      totalNetSales: 0,
      totalCash: 0,
      totalCredit: 0,
      totalPoint: 0,
      totalElectronicMoney: 0,
    });

    return {
      ...summary,
      averageCustomerUnitPrice: summary.totalCustomers > 0 ? summary.totalSales / summary.totalCustomers : 0,
    };
  };

  const summary = calculateSummary(registerCloses);

  const getPeriodLabel = () => {
    switch (periodType) {
      case 'year':
        return '前年比';
      case 'month':
        return '前月比';
      case 'week':
        return '前週比';
    }
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const formatDifference = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toLocaleString()}`;
  };

  return (
    <div className="container mx-10 py-10 space-y-6">
      <h1 className="text-3xl font-bold mb-6">レジ記録一覧</h1>

      {/* CSVアップロードセクション */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>CSVファイルアップロード</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              CSVファイルをアップロードする前に、下記のフィルタリングセクションで店舗を選択してください。
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-xs" />
            <Button onClick={handleUpload} disabled={loading || !file || selectedStoreId === 'all'}>
              {loading ? 'アップロード中...' : 'アップロードしてインポート'}
            </Button>
          </div>
          {file && <p className="mt-2 text-sm text-gray-600">選択中のファイル: {file.name}</p>}
          {selectedStoreId === 'all' && (
            <p className="mt-2 text-sm text-red-600">※ CSVアップロードには店舗の選択が必要です</p>
          )}
        </CardContent>
      </Card>

      {/* フィルタリングセクション */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>データフィルタリング</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="periodType">期間</Label>
              <Select onValueChange={(value: PeriodType) => setPeriodType(value)} value={periodType}>
                <SelectTrigger id="periodType">
                  <SelectValue placeholder="期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">年間</SelectItem>
                  <SelectItem value="month">月間</SelectItem>
                  <SelectItem value="week">週間</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">開始日</Label>
              <Input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endDate">終了日</Label>
              <Input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="storeFilter">店舗</Label>
              <Select onValueChange={setSelectedStoreId} value={selectedStoreId}>
                <SelectTrigger id="storeFilter">
                  <SelectValue placeholder="店舗を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ての店舗</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={String(store.id)}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={fetchRegisterCloses} disabled={loading}>
            {loading ? 'フィルタリング中...' : 'フィルタを適用'}
          </Button>
        </CardContent>
      </Card>

      {/* サマリーセクション */}
      {summary && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>サマリー</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current">現在期間</TabsTrigger>
                <TabsTrigger value="comparison">{getPeriodLabel()}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">総客数</p>
                    <p className="text-2xl font-bold">{summary.totalCustomers.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">総売上</p>
                    <p className="text-2xl font-bold">¥{summary.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">純売上</p>
                    <p className="text-2xl font-bold">¥{summary.totalNetSales.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">平均客単価</p>
                    <p className="text-2xl font-bold">¥{summary.averageCustomerUnitPrice.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">現金</p>
                    <p className="text-lg font-semibold">¥{summary.totalCash.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">クレジット</p>
                    <p className="text-lg font-semibold">¥{summary.totalCredit.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">ポイント</p>
                    <p className="text-lg font-semibold">¥{summary.totalPoint.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">電子マネー</p>
                    <p className="text-lg font-semibold">¥{summary.totalElectronicMoney.toLocaleString()}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="comparison">
                {comparisonData ? (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">総客数</p>
                        <p className="text-2xl font-bold">{comparisonData.current.totalCustomers.toLocaleString()}</p>
                        <p className={`text-sm ${comparisonData.difference.totalCustomers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatDifference(comparisonData.difference.totalCustomers)} ({formatPercentage(comparisonData.percentage.totalCustomers)})
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">総売上</p>
                        <p className="text-2xl font-bold">¥{comparisonData.current.totalSales.toLocaleString()}</p>
                        <p className={`text-sm ${comparisonData.difference.totalSales >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatDifference(comparisonData.difference.totalSales)} ({formatPercentage(comparisonData.percentage.totalSales)})
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">純売上</p>
                        <p className="text-2xl font-bold">¥{comparisonData.current.totalNetSales.toLocaleString()}</p>
                        <p className={`text-sm ${comparisonData.difference.totalNetSales >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatDifference(comparisonData.difference.totalNetSales)} ({formatPercentage(comparisonData.percentage.totalNetSales)})
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">平均客単価</p>
                        <p className="text-2xl font-bold">¥{comparisonData.current.averageCustomerUnitPrice.toLocaleString()}</p>
                        <p className={`text-sm ${comparisonData.difference.averageCustomerUnitPrice >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatDifference(comparisonData.difference.averageCustomerUnitPrice)} ({formatPercentage(comparisonData.percentage.averageCustomerUnitPrice)})
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">現金</p>
                        <p className="text-lg font-semibold">¥{comparisonData.current.totalCash.toLocaleString()}</p>
                        <p className={`text-sm ${comparisonData.difference.totalCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatDifference(comparisonData.difference.totalCash)} ({formatPercentage(comparisonData.percentage.totalCash)})
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">クレジット</p>
                        <p className="text-lg font-semibold">¥{comparisonData.current.totalCredit.toLocaleString()}</p>
                        <p className={`text-sm ${comparisonData.difference.totalCredit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatDifference(comparisonData.difference.totalCredit)} ({formatPercentage(comparisonData.percentage.totalCredit)})
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">ポイント</p>
                        <p className="text-lg font-semibold">¥{comparisonData.current.totalPoint.toLocaleString()}</p>
                        <p className={`text-sm ${comparisonData.difference.totalPoint >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatDifference(comparisonData.difference.totalPoint)} ({formatPercentage(comparisonData.percentage.totalPoint)})
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">電子マネー</p>
                        <p className="text-lg font-semibold">¥{comparisonData.current.totalElectronicMoney.toLocaleString()}</p>
                        <p className={`text-sm ${comparisonData.difference.totalElectronicMoney >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatDifference(comparisonData.difference.totalElectronicMoney)} ({formatPercentage(comparisonData.percentage.totalElectronicMoney)})
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">比較データがありません</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* レジクローズデータテーブル表示セクション */}
      <Card>
        <CardHeader>
          <CardTitle>レジクローズデータ一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>データをロード中...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>店舗</TableHead>
                    <TableHead className="text-right">組数</TableHead>
                    <TableHead className="text-right">客数</TableHead>
                    <TableHead className="text-right">客単価</TableHead>
                    <TableHead className="text-right">総売上点数</TableHead>
                    <TableHead className="text-right">売上</TableHead>
                    <TableHead className="text-right">純売上</TableHead>
                    <TableHead className="text-right">現金</TableHead>
                    <TableHead className="text-right">クレジット</TableHead>
                    <TableHead className="text-right">ポイント</TableHead>
                    <TableHead className="text-right">電子マネー</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registerCloses.length > 0 ? (
                    registerCloses.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(parseISO(record.date), 'yyyy/MM/dd')}</TableCell>
                        <TableCell>{record.store.name}</TableCell>
                        <TableCell className="text-right">{record.groups_count}</TableCell>
                        <TableCell className="text-right">{record.customer_count}</TableCell>
                        <TableCell className="text-right">¥{Number(record.customer_unit_price).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{record.total_items_sold}</TableCell>
                        <TableCell className="text-right">¥{Number(record.total_sales).toLocaleString()}</TableCell>
                        <TableCell className="text-right">¥{Number(record.net_sales).toLocaleString()}</TableCell>
                        <TableCell className="text-right">¥{Number(record.cash_amount).toLocaleString()}</TableCell>
                        <TableCell className="text-right">¥{Number(record.credit_amount).toLocaleString()}</TableCell>
                        <TableCell className="text-right">¥{Number(record.point_amount).toLocaleString()}</TableCell>
                        <TableCell className="text-right">¥{Number(record.electronic_money_amount).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center text-gray-500">
                        表示するレジクローズデータがありません。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 