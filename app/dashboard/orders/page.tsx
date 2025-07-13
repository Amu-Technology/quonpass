"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "../../../hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";

interface Item {
  id: number;
  type: "食材" | "商品" | "資材" | "特殊";
  name: string;
  unit: string;
  minimum_order_quantity: string;
  price: number;
}

interface Recipe {
  id: number;
  item_id: number;
  inspection_standard: number;
  inspection_unit: string;
  manufacturable_quantity: number;
  manufacturable_unit: string;
  manufacturing_cost_per_piece: number | null;
  packaging_cost_per_piece: number | null;
  product_cost_per_piece: number | null;
  created_at: string;
  updated_at: string;
  item: {
    name: string;
    type: string;
  };
  recipeItems: Array<{
    quantity: number;
    item: {
      id: number;
      name: string;
      unit: string;
      type: "食材" | "商品" | "資材" | "特殊";
      minimum_order_quantity: string;
      price: number;
    };
  }>;
}

interface OrderItem {
  item: Item;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Store {
  id: number;
  name: string;
}

export default function OrdersPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recipeSearchTerm, setRecipeSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedRecipeType, setSelectedRecipeType] = useState<string>("all");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast, toasts, dismiss } = useToast();

  // レシピ数量の状態
  const [recipeQuantities, setRecipeQuantities] = useState<{ [key: number]: number }>({});

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsResponse, recipesResponse, storesResponse] = await Promise.all([
          fetch("/api/items"),
          fetch("/api/recipes"),
          fetch("/api/stores"),
        ]);

        if (itemsResponse.ok && recipesResponse.ok && storesResponse.ok) {
          const itemsData = await itemsResponse.json();
          const recipesData = await recipesResponse.json();
          const storesData = await storesResponse.json();
          setItems(itemsData);
          setRecipes(recipesData);
          setStores(storesData);

          // デフォルトで最初の店舗を選択
          if (storesData.length > 0) {
            setSelectedStore(storesData[0].id);
          }
        }
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
        toast({
          title: "エラー",
          description: "データの取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // 商品フィルタリング
  useEffect(() => {
    let filtered = items;

    // タイプでフィルタリング
    if (selectedType !== "all") {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    // 検索語でフィルタリング
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredItems(filtered);
  }, [items, selectedType, searchTerm]);

  // レシピフィルタリング
  useEffect(() => {
    let filtered = recipes;

    // レシピ名でフィルタリング
    if (recipeSearchTerm) {
      filtered = filtered.filter((recipe) =>
        recipe.item.name.toLowerCase().includes(recipeSearchTerm.toLowerCase()) ||
        // 材料名でも検索可能にする
        recipe.recipeItems.some((recipeItem) =>
          recipeItem.item.name.toLowerCase().includes(recipeSearchTerm.toLowerCase())
        )
      );
    }

    // 商品タイプでフィルタリング
    if (selectedRecipeType !== "all") {
      filtered = filtered.filter((recipe) => recipe.item.type === selectedRecipeType);
    }

    setFilteredRecipes(filtered);
  }, [recipes, recipeSearchTerm, selectedRecipeType]);

  // 商品を注文に追加
  const addToOrder = (item: Item) => {
    const existingItem = orderItems.find(
      (orderItem) => orderItem.item.id === item.id,
    );

    if (existingItem) {
      toast({
        title: "注意",
        description: "この商品は既に注文リストに含まれています",
        variant: "destructive",
      });
      return;
    }

    const minQuantity = parseInt(item.minimum_order_quantity) || 1;
    const newOrderItem: OrderItem = {
      item,
      quantity: minQuantity,
      unit_price: item.price,
      total_price: item.price * minQuantity,
    };

    setOrderItems([...orderItems, newOrderItem]);
  };

  // 注文数量を更新
  const updateQuantity = (itemId: number, quantity: number) => {
    setOrderItems((prev) =>
      prev.map((orderItem) => {
        if (orderItem.item.id === itemId) {
          const minQuantity =
            parseInt(orderItem.item.minimum_order_quantity) || 1;
          const validQuantity = Math.max(quantity, minQuantity);
          return {
            ...orderItem,
            quantity: validQuantity,
            total_price: orderItem.unit_price * validQuantity,
          };
        }
        return orderItem;
      }),
    );
  };

  // 商品を注文から削除
  const removeFromOrder = (itemId: number) => {
    setOrderItems((prev) =>
      prev.filter((orderItem) => orderItem.item.id !== itemId),
    );
  };

  // レシピ数量を更新
  const updateRecipeQuantity = (recipeId: number, quantity: number) => {
    setRecipeQuantities(prev => ({
      ...prev,
      [recipeId]: Math.max(1, quantity)
    }));
  };

  // レシピから発注
  const addRecipeToOrder = (recipe: Recipe) => {
    const quantity = recipeQuantities[recipe.id] || 1;
    
    // レシピの材料を注文リストに追加
    const newOrderItems: OrderItem[] = [];
    
    for (const recipeItem of recipe.recipeItems) {
      const material = recipeItem.item;
      const requiredQuantity = recipeItem.quantity * quantity;
      
      // 既存の注文アイテムをチェック
      const existingItem = orderItems.find(
        (orderItem) => orderItem.item.id === material.id,
      );

      if (existingItem) {
        // 既存アイテムの数量を更新
        const newQuantity = existingItem.quantity + requiredQuantity;
        const minQuantity = parseInt(material.minimum_order_quantity) || 1;
        const validQuantity = Math.max(newQuantity, minQuantity);
        
        setOrderItems(prev => prev.map(orderItem => 
          orderItem.item.id === material.id 
            ? {
                ...orderItem,
                quantity: validQuantity,
                total_price: orderItem.unit_price * validQuantity,
              }
            : orderItem
        ));
      } else {
        // 新しいアイテムを追加
        const minQuantity = parseInt(material.minimum_order_quantity) || 1;
        const validQuantity = Math.max(requiredQuantity, minQuantity);
        
        newOrderItems.push({
          item: material,
          quantity: validQuantity,
          unit_price: material.price,
          total_price: material.price * validQuantity,
        });
      }
    }

    if (newOrderItems.length > 0) {
      setOrderItems(prev => [...prev, ...newOrderItems]);
    }

    toast({
      title: "成功",
      description: `${recipe.item.name}の材料を注文リストに追加しました`,
    });
  };

  // 合計金額計算
  const totalAmount = orderItems.reduce(
    (sum, orderItem) => sum + orderItem.total_price,
    0,
  );

  // 発注送信
  const submitOrder = async () => {
    if (!selectedStore) {
      toast({
        title: "エラー",
        description: "店舗を選択してください",
        variant: "destructive",
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "エラー",
        description: "注文商品を選択してください",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        store_id: selectedStore,
        total_amount: Number(totalAmount),
        status: "active" as const,
        order_items: orderItems.map((orderItem) => ({
          item_id: orderItem.item.id,
          quantity: orderItem.quantity,
          unit_price: Number(orderItem.unit_price),
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "発注が正常に作成されました",
        });
        setOrderItems([]);
        setRecipeQuantities({});
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "発注の作成に失敗しました");
      }
    } catch (error) {
      console.error("発注の作成に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "発注の作成に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold">発注管理</h1>
            <p className="text-gray-600">本部への商品発注を行います</p>
          </div>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard/orders/history")}
          >
            発注履歴を見る
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側: 商品選択エリア */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="items">商品選択</TabsTrigger>
              <TabsTrigger value="recipes">レシピから発注</TabsTrigger>
            </TabsList>

            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle>商品選択</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* フィルター */}
                  <div className="mb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="store">店舗</Label>
                        <Select
                          value={selectedStore?.toString() || ""}
                          onValueChange={(value) =>
                            setSelectedStore(parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="店舗を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem
                                key={store.id}
                                value={store.id.toString()}
                              >
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="type">商品タイプ</Label>
                        <Select
                          value={selectedType}
                          onValueChange={setSelectedType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="タイプを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">すべて</SelectItem>
                            <SelectItem value="食材">食材</SelectItem>
                            <SelectItem value="商品">商品</SelectItem>
                            <SelectItem value="資材">資材</SelectItem>
                            <SelectItem value="特殊">特殊</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="search">商品名検索</Label>
                        <Input
                          id="search"
                          placeholder="商品名を入力..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* 商品リスト */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredItems.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        商品が見つかりません
                      </div>
                    ) : (
                      filteredItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{item.name}</h3>
                              <Badge variant="outline">{item.type}</Badge>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span>単価: ¥{item.price.toLocaleString()}</span>
                              <span className="mx-2">•</span>
                              <span>単位: {item.unit}</span>
                              <span className="mx-2">•</span>
                              <span>最低ロット: {item.minimum_order_quantity}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToOrder(item)}
                            disabled={orderItems.some(
                              (orderItem) => orderItem.item.id === item.id,
                            )}
                          >
                            追加
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recipes">
              <Card>
                <CardHeader>
                  <CardTitle>レシピから発注</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* レシピフィルター */}
                  <div className="mb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="store">店舗</Label>
                        <Select
                          value={selectedStore?.toString() || ""}
                          onValueChange={(value) =>
                            setSelectedStore(parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="店舗を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem
                                key={store.id}
                                value={store.id.toString()}
                              >
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="recipe-type">商品タイプ</Label>
                        <Select
                          value={selectedRecipeType}
                          onValueChange={setSelectedRecipeType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="タイプを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">すべて</SelectItem>
                            <SelectItem value="食材">食材</SelectItem>
                            <SelectItem value="商品">商品</SelectItem>
                            <SelectItem value="資材">資材</SelectItem>
                            <SelectItem value="特殊">特殊</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="recipe-search">レシピ・材料名検索</Label>
                        <Input
                          id="recipe-search"
                          placeholder="レシピ名または材料名を入力..."
                          value={recipeSearchTerm}
                          onChange={(e) => setRecipeSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* レシピリスト */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredRecipes.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        レシピが見つかりません
                      </div>
                    ) : (
                      filteredRecipes.map((recipe) => (
                        <div
                          key={recipe.id}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{recipe.item.name}</h3>
                                <Badge variant="outline">レシピID: {recipe.id}</Badge>
                                <Badge variant="secondary">{recipe.item.type}</Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>検査基準: {recipe.inspection_standard}{recipe.inspection_unit}</div>
                                <div>製造可能: {recipe.manufacturable_quantity}{recipe.manufacturable_unit}</div>
                                <div className="mt-2 pt-2 border-t">
                                  <div className="font-medium mb-1">使用食材:</div>
                                  {recipe.recipeItems.map((item, index) => (
                                    <div key={index} className="text-xs">
                                      • {item.item.name}: {item.quantity}{item.item.unit}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`recipe-quantity-${recipe.id}`} className="text-sm">
                              製造数量:
                            </Label>
                            <Input
                              id={`recipe-quantity-${recipe.id}`}
                              type="number"
                              min="1"
                              value={recipeQuantities[recipe.id] || 1}
                              onChange={(e) =>
                                updateRecipeQuantity(recipe.id, parseInt(e.target.value) || 1)
                              }
                              className="w-20"
                            />
                            <span className="text-sm text-gray-600">
                              {recipe.manufacturable_unit}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => addRecipeToOrder(recipe)}
                              className="ml-auto"
                            >
                              材料を追加
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 右側: 注文確認エリア */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>注文確認</CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  注文商品がありません
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((orderItem) => (
                    <div
                      key={orderItem.item.id}
                      className="border rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{orderItem.item.name}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            <span>
                              単価: ¥{orderItem.unit_price.toLocaleString()}
                            </span>
                            <span className="mx-2">•</span>
                            <span>単位: {orderItem.item.unit}</span>
                          </div>
                          <div className="text-xs text-orange-600 mt-1">
                            最低ロット: {orderItem.item.minimum_order_quantity}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromOrder(orderItem.item.id)}
                        >
                          削除
                        </Button>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Label
                          htmlFor={`quantity-${orderItem.item.id}`}
                          className="text-sm"
                        >
                          数量:
                        </Label>
                        <Input
                          id={`quantity-${orderItem.item.id}`}
                          type="number"
                          min={
                            parseInt(orderItem.item.minimum_order_quantity) || 1
                          }
                          value={orderItem.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              orderItem.item.id,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-gray-600">
                          {orderItem.item.unit}
                        </span>
                        <span className="ml-auto font-medium">
                          ¥{orderItem.total_price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>合計金額:</span>
                    <span>¥{totalAmount.toLocaleString()}</span>
                  </div>

                  <Button
                    onClick={submitOrder}
                    disabled={isSubmitting || orderItems.length === 0}
                    className="w-full"
                  >
                    {isSubmitting ? "送信中..." : "発注を送信"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
