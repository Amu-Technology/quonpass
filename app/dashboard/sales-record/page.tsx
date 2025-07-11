'use client'; // Client Component としてマーク

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner'; // トースト通知
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // 店舗フィルタ用
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconUpload, IconSearch } from "@tabler/icons-react"

interface SalesRecord {
  id: number;
  date: string;                   // ISO 8601形式の文字列
  quantity: number;
  unit_price: number | string;    // Decimal型は文字列として返される可能性がある
  sales_amount: number | string;  // Decimal型は文字列として返される可能性がある
  store_id: number;
  customer_attribute?: string;
  store: {
    name: string;
  };
  product: {
    name: string;
  };
}

interface Store {
  id: number;
  name: string;
}

export default function SalesRecordPage() {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all'); // デフォルト値を'all'に変更
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchSalesRecords = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStoreId && selectedStoreId !== 'all') params.append('storeId', selectedStoreId);

      const response = await fetch(`/api/sales-records?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales records');
      }
      const data = await response.json();
      setSalesRecords(data);
      toast.success('売上データを更新しました。');
    } catch (error) {
      console.error('Error fetching sales records:', error);
      toast.error('売上データの取得に失敗しました。');
    }
  }, [selectedStoreId]);

  useEffect(() => {
    fetchSalesRecords(); // 初回ロード時にデータを取得
  }, [fetchSalesRecords]); // フィルター条件が変わったら再取得

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

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('storeId', selectedStoreId);

    try {
      const response = await fetch('/api/upload-sales-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'CSVファイルが正常にアップロードされました。');
        setFile(null); // ファイル選択をリセット
        fetchSalesRecords(); // データ再取得
      } else {
        toast.error(result.error || 'CSVファイルのアップロードに失敗しました。', {
          description: result.details || '不明なエラーが発生しました。',
        });
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((err: { row: Record<string, unknown>, message: string }) => {
            console.error(`Error in row ${JSON.stringify(err.row)}: ${err.message}`);
          });
          toast.warning(`一部の行でエラーが発生しました。詳細はコンソールを確認してください (${result.errors.length}件)。`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('ネットワークエラーまたはサーバーエラーが発生しました。');
    } finally {
      setUploading(false);
    }
  };

  const fetchStores = async () => {
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
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const filteredSalesRecords = salesRecords.filter((record) =>
    record.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.date.includes(searchTerm)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">売上実績管理</h1>

      <Card>
        <CardHeader>
          <CardTitle>CSVアップロード</CardTitle>
          <CardDescription>売上データをCSVファイルで一括登録</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="store-select">店舗</Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="店舗を選択" />
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
            <div className="flex-1">
              <Label htmlFor="file">CSVファイル</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleUpload} disabled={!file || uploading}>
                <IconUpload className="h-4 w-4 mr-2" />
                {uploading ? "アップロード中..." : "アップロード"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>売上記録一覧</CardTitle>
          <CardDescription>登録されている売上記録の一覧</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search">検索</Label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="店舗名、商品名または日付で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="store-filter">店舗</Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger className="w-32">
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

          <div className="space-y-2">
            {filteredSalesRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{record.store.name || "未設定"}</h3>
                    <Badge variant="outline">{formatDate(record.date)}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{record.product.name || "未設定"}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>数量: {record.quantity}</span>
                    <span>単価: {formatCurrency(Number(record.unit_price))}</span>
                    {record.customer_attribute && (
                      <span>顧客属性: {record.customer_attribute}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(Number(record.sales_amount))}</div>
                </div>
              </div>
            ))}
          </div>

          {filteredSalesRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              売上記録が見つかりません
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}