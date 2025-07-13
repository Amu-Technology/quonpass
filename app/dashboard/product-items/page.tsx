"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "../../../hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { IconLink, IconSearch, IconFilter, IconRefresh } from '@tabler/icons-react';

interface Product {
  id: number;
  name: string;
  price: number;
  status: string;
  stores: {
    name: string;
  };
}

interface Item {
  id: number;
  name: string;
  type: string;
  unit: string;
  price: number;
}

interface ProductItem {
  id: number;
  product_id: number;
  item_id: number;
  product: Product;
  item: Item;
}

export default function ProductItemsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast, toasts, dismiss } = useToast();

  // フィルター状態
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedItemType, setSelectedItemType] = useState<string>("all");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [itemSearchTerm, setItemSearchTerm] = useState("");

  // 関連付け状態を管理
  const [relations, setRelations] = useState<{ [key: string]: boolean }>({});

  // データ取得
  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStore !== "all") {
        params.append("storeId", selectedStore);
      }

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("商品データの取得に失敗しました:", error);
      toast({
        title: "エラー",
        description: "商品データの取得に失敗しました",
        variant: "destructive",
      });
    }
  }, [selectedStore, toast]);

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("アイテムデータの取得に失敗しました:", error);
      toast({
        title: "エラー",
        description: "アイテムデータの取得に失敗しました",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchProductItems = useCallback(async () => {
    try {
      console.log('関連付けデータ取得開始');
      const response = await fetch("/api/product-items");
      console.log('関連付けデータAPIレスポンス:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('関連付けデータ取得成功:', data.length, '件');
        
        // 関連付け状態を初期化
        const relationMap: { [key: string]: boolean } = {};
        data.forEach((relation: ProductItem) => {
          relationMap[`${relation.product_id}-${relation.item_id}`] = true;
        });
        setRelations(relationMap);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('関連付けデータAPIエラー:', errorData);
        setError(errorData.error || '関連付けデータの取得に失敗しました');
        toast({
          title: "エラー",
          description: errorData.error || "関連付けデータの取得に失敗しました",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("関連付けデータの取得に失敗しました:", error);
      const errorMessage = error instanceof Error ? error.message : "関連付けデータの取得に失敗しました";
      setError(errorMessage);
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // データ取得
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchProductItems();
  }, [fetchProductItems]);

  // 関連付けの更新
  const updateRelation = useCallback(async (productId: number, itemId: number, isChecked: boolean) => {
    setIsUpdating(true);

    try {
      if (isChecked) {
        // 関連付けを作成
        const response = await fetch("/api/product-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: productId,
            item_id: itemId,
          }),
        });

        if (response.ok) {
          setRelations(prev => ({
            ...prev,
            [`${productId}-${itemId}`]: true
          }));
          toast({
            title: "成功",
            description: "関連付けが作成されました",
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "関連付けの作成に失敗しました");
        }
      } else {
        // 関連付けを削除
        const response = await fetch("/api/product-items", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: productId,
            item_id: itemId,
          }),
        });

        if (response.ok) {
          setRelations(prev => ({
            ...prev,
            [`${productId}-${itemId}`]: false
          }));
          toast({
            title: "成功",
            description: "関連付けが削除されました",
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "関連付けの削除に失敗しました");
        }
      }
    } catch (error) {
      console.error("関連付けの更新に失敗しました:", error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "関連付けの更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }, [toast]);

  // フィルタリングされたデータ（メモ化）
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (productSearchTerm && !product.name.toLowerCase().includes(productSearchTerm.toLowerCase())) {
        return false;
      }
      // 既に関連付けられている商品は除外
      const hasRelation = Object.keys(relations).some(key => {
        const [productId] = key.split('-');
        return parseInt(productId) === product.id && relations[key];
      });
      return !hasRelation;
    });
  }, [products, productSearchTerm, relations]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (selectedItemType !== "all" && item.type !== selectedItemType) {
        return false;
      }
      if (itemSearchTerm && !item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())) {
        return false;
      }
      // 既に関連付けられているアイテムは除外
      const hasRelation = Object.keys(relations).some(key => {
        const [, itemId] = key.split('-');
        return parseInt(itemId) === item.id && relations[key];
      });
      return !hasRelation;
    });
  }, [items, selectedItemType, itemSearchTerm, relations]);

  // 店舗一覧を取得（重複を除去）
  const stores = useMemo(() => {
    return Array.from(new Set(products.map(p => p.stores.name))).sort();
  }, [products]);

  // アイテムタイプ一覧を取得（重複を除去）
  const itemTypes = useMemo(() => {
    return Array.from(new Set(items.map(i => i.type))).sort();
  }, [items]);

  // 関連付け数を計算（メモ化）
  const relationCount = useMemo(() => {
    return Object.values(relations).filter(Boolean).length;
  }, [relations]);

  // 関連付け率を計算（メモ化）
  const relationRate = useMemo(() => {
    const totalPossible = filteredProducts.length * filteredItems.length;
    return totalPossible > 0 ? Math.round((relationCount / totalPossible) * 100) : 0;
  }, [filteredProducts.length, filteredItems.length, relationCount]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">商品・アイテム関連付け管理</h1>
            <p className="text-gray-600">商品（レジ登録製品）とアイテム（発注用）の関連付けを管理します</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              fetchProducts();
              fetchItems();
              fetchProductItems();
            }}
            disabled={isLoading}
          >
            <IconRefresh className="w-4 h-4 mr-2" />
            更新
          </Button>
        </div>
      </div>

      {/* フィルター */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <IconFilter className="w-5 h-5" />
            <span>フィルター</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="store">店舗</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="店舗を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての店舗</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store} value={store}>
                      {store}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="itemType">アイテムタイプ</Label>
              <Select value={selectedItemType} onValueChange={setSelectedItemType}>
                <SelectTrigger>
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのタイプ</SelectItem>
                  {itemTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="productSearch">商品名検索</Label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="productSearch"
                  placeholder="商品名を入力..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="itemSearch">アイテム名検索</Label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="itemSearch"
                  placeholder="アイテム名を入力..."
                  value={itemSearchTerm}
                  onChange={(e) => setItemSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 統計情報 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>統計情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-900">総商品数</div>
              <div className="text-2xl font-bold text-blue-900">{filteredProducts.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-900">総アイテム数</div>
              <div className="text-2xl font-bold text-green-900">{filteredItems.length}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-900">関連付け数</div>
              <div className="text-2xl font-bold text-purple-900">{relationCount}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-orange-900">関連付け率</div>
              <div className="text-2xl font-bold text-orange-900">{relationRate}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 商品・アイテム一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 商品テーブル */}
        <Card>
          <CardHeader>
            <CardTitle>商品（レジ登録製品）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">商品名</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">店舗</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">価格</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">状態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {product.stores.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        ¥{product.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status === 'active' ? '有効' : '無効'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* アイテムテーブル */}
        <Card>
          <CardHeader>
            <CardTitle>アイテム（発注用）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">アイテム名</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">タイプ</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">単位</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">価格</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="outline">{item.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        ¥{item.price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 関連付け済み一覧 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <IconLink className="w-5 h-5" />
            <span>関連付け済み一覧</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
                         const relatedPairs = Object.entries(relations)
               .filter(([, isRelated]) => isRelated)
               .map(([key]) => {
                 const [productId, itemId] = key.split('-').map(Number);
                 const product = products.find(p => p.id === productId);
                 const item = items.find(i => i.id === itemId);
                 return { product, item };
               })
               .filter(pair => pair.product && pair.item);

            if (relatedPairs.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500">
                  関連付け済みの商品・アイテムがありません
                </div>
              );
            }

            return (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  既に関連付けられている商品・アイテムの組み合わせです。
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedPairs.map(({ product, item }) => (
                    <div key={`${product?.id}-${item?.id}`} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-green-900">{product?.name}</div>
                          <div className="text-xs text-green-700">{product?.stores.name}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateRelation(product!.id, item!.id, false)}
                          disabled={isUpdating}
                        >
                          解除
                        </Button>
                      </div>
                      <div className="text-sm text-green-800">
                        <span className="font-medium">→</span> {item?.name} ({item?.type})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* 新規関連付け管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <IconLink className="w-5 h-5" />
            <span>新規関連付け管理</span>
            {isUpdating && (
              <Badge variant="secondary">更新中...</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 || filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filteredProducts.length === 0 && filteredItems.length === 0
                ? "関連付け可能な商品とアイテムがありません"
                : filteredProducts.length === 0
                ? "関連付け可能な商品がありません"
                : "関連付け可能なアイテムがありません"}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                商品とアイテムの関連付けを設定してください。チェックボックスをクリックして関連付けを作成・削除できます。
              </div>
              
                                            {/* 関連付け管理テーブル */}
               <div className="border rounded-lg overflow-x-auto">
                 <table className="w-full">
                   <thead className="bg-gray-50">
                     <tr>
                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[200px]">
                         商品名
                       </th>
                       {filteredItems.slice(0, 20).map((item) => (
                         <th key={item.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900 min-w-[120px]">
                           <div className="text-xs font-medium">{item.name}</div>
                           <div className="text-xs text-gray-500">{item.type}</div>
                         </th>
                       ))}
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200">
                     {filteredProducts.slice(0, 50).map((product) => (
                       <tr key={product.id} className="hover:bg-gray-50">
                         <td className="px-4 py-3 text-sm font-medium text-gray-900">
                           <div className="font-medium">{product.name}</div>
                           <div className="text-xs text-gray-500">{product.stores.name}</div>
                         </td>
                         {filteredItems.slice(0, 20).map((item) => {
                           const relationKey = `${product.id}-${item.id}`;
                           const isRelated = relations[relationKey] || false;
                           
                           return (
                             <td key={item.id} className="px-4 py-3 text-center">
                               <Checkbox
                                 checked={isRelated}
                                 onCheckedChange={(checked) => {
                                   updateRelation(product.id, item.id, checked as boolean);
                                 }}
                                 disabled={isUpdating}
                                 className="mx-auto"
                               />
                             </td>
                           );
                         })}
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               
               {/* 表示件数情報 */}
               <div className="mt-4 text-center text-sm text-gray-500">
                 {filteredProducts.length > 50 && (
                   <div className="mb-2">
                     商品: {filteredProducts.length}件中 50件を表示
                   </div>
                 )}
                 {filteredItems.length > 20 && (
                   <div>
                     アイテム: {filteredItems.length}件中 20件を表示
                   </div>
                 )}
                 {(filteredProducts.length > 50 || filteredItems.length > 20) && (
                   <div className="mt-2 text-xs">
                     フィルターを使用して特定の商品・アイテムを絞り込んでください。
                   </div>
                 )}
               </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 