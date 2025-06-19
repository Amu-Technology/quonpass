'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  stock: number;
  status: string;
  category?: {
    name: string;
    code: string;
  };
}

interface Category {
  id: number;
  code: string;
  name: string;
  level: number;
  parent?: {
    name: string;
  };
}

interface Store {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

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

  // カテゴリリストの取得
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('カテゴリ情報の取得に失敗しました。');
      }
    }
    fetchCategories();
  }, []);

  // 商品データの取得
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStoreId && selectedStoreId !== 'all') {
        params.append('storeId', selectedStoreId);
      }
      if (selectedCategoryId && selectedCategoryId !== 'all') {
        params.append('categoryId', selectedCategoryId);
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      toast.success('商品データを更新しました。');
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('商品データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedStoreId, selectedCategoryId]);

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
      const response = await fetch('/api/upload-products-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'CSVファイルが正常にアップロードされました。');
        setFile(null);
        fetchProducts();
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
    <div className="container mx-auto py-10">ç
      <h1 className="text-3xl font-bold mb-6">商品管理</h1>

      {/* CSVアップロードセクション */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>商品一覧CSVアップロード</CardTitle>
          <CardDescription>
            CSVファイルをアップロードする前に、下記で店舗を選択してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            <div>
              <Label htmlFor="categoryFilter">カテゴリ</Label>
              <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId}>
                <SelectTrigger id="categoryFilter">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全てのカテゴリ</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={fetchProducts} disabled={loading}>
            {loading ? 'フィルタリング中...' : 'フィルタを適用'}
          </Button>
        </CardContent>
      </Card>

      {/* 商品データテーブル表示セクション */}
      <Card>
        <CardHeader>
          <CardTitle>商品一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>データをロード中...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>商品名</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead className="text-right">価格</TableHead>
                    <TableHead className="text-right">在庫</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>説明</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">{product.id}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          {product.category ? (
                            <div>
                              <div>{product.category.name}</div>
                              <div className="text-xs text-gray-500">{product.category.code}</div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">¥{Number(product.price).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{product.stock}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status === 'active' ? '有効' : '無効'}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {product.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500">
                        表示する商品データがありません。
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