// app/dashboard/sales-record/page.tsx

'use client'; // Client Component としてマーク

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner'; // トースト通知
import { format, parseISO } from 'date-fns'; // 日付フォーマット
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // 店舗フィルタ用
import { Label } from '@/components/ui/label';

interface SalesRecord {
  id: number;
  date: string; // ISO 8601形式の文字列
  quantity: number;
  unit_price: number | string; // Decimal型は文字列として返される可能性がある
  sales_amount: number | string; // Decimal型は文字列として返される可能性がある
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
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all'); // デフォルト値を'all'に変更

  // 店舗リストの取得
  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch('/api/stores'); // 既存の店舗APIを利用
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

  // 売上データの取得
  const fetchSalesRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesRecords(); // 初回ロード時にデータを取得
  }, [startDate, endDate, selectedStoreId]); // フィルター条件が変わったら再取得

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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">売上実績管理</h1>

      {/* CSVアップロードセクション */}
      <div className="mb-8 p-6 border rounded-lg shadow-sm bg-white">
        <h2 className="text-2xl font-semibold mb-4">CSVファイルアップロード</h2>
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
      </div>

      {/* フィルタリングセクション */}
      <div className="mb-8 p-6 border rounded-lg shadow-sm bg-white">
        <h2 className="text-2xl font-semibold mb-4">データフィルタリング</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
        <Button onClick={fetchSalesRecords} disabled={loading}>
          {loading ? 'フィルタリング中...' : 'フィルタを適用'}
        </Button>
      </div>

      {/* 売上データテーブル表示セクション */}
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <h2 className="text-2xl font-semibold mb-4">売上実績一覧</h2>
        {loading ? (
          <p>データをロード中...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>店舗</TableHead>
                  <TableHead>商品名</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">単価</TableHead>
                  <TableHead className="text-right">売上</TableHead>
                  <TableHead>顧客属性</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesRecords.length > 0 ? (
                  salesRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(parseISO(record.date), 'yyyy/MM/dd')}</TableCell>
                      <TableCell>{record.store.name}</TableCell>
                      <TableCell>{record.product.name}</TableCell>
                      <TableCell className="text-right">{record.quantity}</TableCell>
                      <TableCell className="text-right">¥{Number(record.unit_price).toFixed(2)}</TableCell>
                      <TableCell className="text-right">¥{Number(record.sales_amount).toFixed(2)}</TableCell>
                      <TableCell>{record.customer_attribute || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      表示する売上データがありません。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}