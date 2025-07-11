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

interface CreateItemRequest {
  type: "食材" | "商品" | "資材" | "特殊";
  name: string;
  unit: string;
  minimum_order_quantity: string;
  price: number;
}

interface UpdateItemRequest {
  type?: "食材" | "商品" | "資材" | "特殊";
  name?: string;
  unit?: string;
  minimum_order_quantity?: string;
  price?: number;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast, toasts, dismiss } = useToast();

  // フィルター状態
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // フォーム状態
  const [formData, setFormData] = useState<CreateItemRequest>({
    type: "商品",
    name: "",
    unit: "個",
    minimum_order_quantity: "1",
    price: 0,
  });

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("商品データの取得に失敗しました:", error);
      toast({
        title: "エラー",
        description: "商品データの取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // データ取得
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [items, selectedType, searchTerm]);

  // 商品作成
  const createItem = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "商品が正常に作成されました",
        });
        setIsCreateDialogOpen(false);
        setFormData({
          type: "商品",
          name: "",
          unit: "個",
          minimum_order_quantity: "1",
          price: 0,
        });
        fetchItems();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "商品の作成に失敗しました");
      }
    } catch (error) {
      console.error("商品の作成に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "商品の作成に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 商品更新
  const updateItem = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);

    try {
      const updateData: UpdateItemRequest = {};
      if (formData.type !== selectedItem.type) updateData.type = formData.type;
      if (formData.name !== selectedItem.name) updateData.name = formData.name;
      if (formData.unit !== selectedItem.unit) updateData.unit = formData.unit;
      if (
        formData.minimum_order_quantity !== selectedItem.minimum_order_quantity
      ) {
        updateData.minimum_order_quantity = formData.minimum_order_quantity;
      }
      if (formData.price !== selectedItem.price)
        updateData.price = formData.price;

      const response = await fetch(`/api/items/${selectedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "商品が正常に更新されました",
        });
        setIsEditDialogOpen(false);
        fetchItems();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "商品の更新に失敗しました");
      }
    } catch (error) {
      console.error("商品の更新に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "商品の更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 商品削除
  const deleteItem = async (itemId: number) => {
    if (!confirm("この商品を削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "商品が正常に削除されました",
        });
        fetchItems();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "商品の削除に失敗しました");
      }
    } catch (error) {
      console.error("商品の削除に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "商品の削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  // 商品編集ダイアログを開く
  const openEditDialog = (item: Item) => {
    setSelectedItem(item);
    setFormData({
      type: item.type,
      name: item.name,
      unit: item.unit,
      minimum_order_quantity: item.minimum_order_quantity,
      price: item.price,
    });
    setIsEditDialogOpen(true);
  };

  // CSVファイルアップロード
  const handleCsvUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-items-csv", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "成功",
          description:
            result.message || "CSVファイルが正常にアップロードされました",
        });
        fetchItems();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "CSVファイルのアップロードに失敗しました"
        );
      }
    } catch (error) {
      console.error("CSVファイルのアップロードに失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "CSVファイルのアップロードに失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  // タイプの日本語表示
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "食材":
        return "食材";
      case "商品":
        return "商品";
      case "資材":
        return "資材";
      case "特殊":
        return "特殊";
      default:
        return type;
    }
  };

  // タイプの色
  const getTypeColor = (type: string) => {
    switch (type) {
      case "食材":
        return "bg-green-100 text-green-800";
      case "商品":
        return "bg-blue-100 text-blue-800";
      case "資材":
        return "bg-yellow-100 text-yellow-800";
      case "特殊":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            <h1 className="text-3xl font-bold">商品管理</h1>
            <p className="text-gray-600">商品の登録・編集・削除を行います</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              新規作成
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Button variant="outline" disabled={isUploading}>
                {isUploading ? "アップロード中..." : "CSVアップロード"}
              </Button>
            </div>
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
              <Label htmlFor="type">商品タイプ</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのタイプ</SelectItem>
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
        </CardContent>
      </Card>

      {/* 商品一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>商品一覧 ({filteredItems.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              商品が見つかりません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge className={getTypeColor(item.type)}>
                          {getTypeLabel(item.type)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>単価: ¥{item.price.toLocaleString()}</div>
                        <div>単位: {item.unit}</div>
                        <div>最低ロット: {item.minimum_order_quantity}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(item)}
                    >
                      編集
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteItem(item.id)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 商品作成ダイアログ */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>商品作成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">商品タイプ</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "食材" | "商品" | "資材" | "特殊") =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="食材">食材</SelectItem>
                  <SelectItem value="商品">商品</SelectItem>
                  <SelectItem value="資材">資材</SelectItem>
                  <SelectItem value="特殊">特殊</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">商品名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="商品名を入力"
              />
            </div>
            <div>
              <Label htmlFor="unit">単位</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, unit: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="袋">袋</SelectItem>
                  <SelectItem value="本">本</SelectItem>
                  <SelectItem value="枚">枚</SelectItem>
                  <SelectItem value="巻">巻</SelectItem>
                  <SelectItem value="個">個</SelectItem>
                  <SelectItem value="冊">冊</SelectItem>
                  <SelectItem value="式">式</SelectItem>
                  <SelectItem value="束">束</SelectItem>
                  <SelectItem value="台">台</SelectItem>
                  <SelectItem value="箱">箱</SelectItem>
                  <SelectItem value="粒">粒</SelectItem>
                  <SelectItem value="ケース">ケース</SelectItem>
                  <SelectItem value="セット">セット</SelectItem>
                  <SelectItem value="バルク">バルク</SelectItem>
                  <SelectItem value="ロット">ロット</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="minimum_order_quantity">最低ロット</Label>
              <Input
                id="minimum_order_quantity"
                value={formData.minimum_order_quantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minimum_order_quantity: e.target.value,
                  }))
                }
                placeholder="最低ロットを入力"
              />
            </div>
            <div>
              <Label htmlFor="price">単価</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="単価を入力"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                onClick={createItem}
                disabled={isSubmitting || !formData.name || formData.price <= 0}
              >
                {isSubmitting ? "作成中..." : "作成"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 商品編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>商品編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-type">商品タイプ</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "食材" | "商品" | "資材" | "特殊") =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="食材">食材</SelectItem>
                  <SelectItem value="商品">商品</SelectItem>
                  <SelectItem value="資材">資材</SelectItem>
                  <SelectItem value="特殊">特殊</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-name">商品名</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="商品名を入力"
              />
            </div>
            <div>
              <Label htmlFor="edit-unit">単位</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, unit: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="袋">袋</SelectItem>
                  <SelectItem value="本">本</SelectItem>
                  <SelectItem value="枚">枚</SelectItem>
                  <SelectItem value="巻">巻</SelectItem>
                  <SelectItem value="個">個</SelectItem>
                  <SelectItem value="冊">冊</SelectItem>
                  <SelectItem value="式">式</SelectItem>
                  <SelectItem value="束">束</SelectItem>
                  <SelectItem value="台">台</SelectItem>
                  <SelectItem value="箱">箱</SelectItem>
                  <SelectItem value="粒">粒</SelectItem>
                  <SelectItem value="ケース">ケース</SelectItem>
                  <SelectItem value="セット">セット</SelectItem>
                  <SelectItem value="バルク">バルク</SelectItem>
                  <SelectItem value="ロット">ロット</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-minimum_order_quantity">最低ロット</Label>
              <Input
                id="edit-minimum_order_quantity"
                value={formData.minimum_order_quantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minimum_order_quantity: e.target.value,
                  }))
                }
                placeholder="最低ロットを入力"
              />
            </div>
            <div>
              <Label htmlFor="edit-price">単価</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="単価を入力"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                onClick={updateItem}
                disabled={isSubmitting || !formData.name || formData.price <= 0}
              >
                {isSubmitting ? "更新中..." : "更新"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
