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
      name: string;
      unit: string;
    };
  }>;
}



interface Item {
  id: number;
  name: string;
  unit: string;
  type: string;
}

interface CreateRecipeRequest {
  item_id: number;
  inspection_standard: number;
  inspection_unit: string;
  manufacturable_quantity: number;
  manufacturable_unit: string;
  manufacturing_cost_per_piece?: number;
  packaging_cost_per_piece?: number;
  product_cost_per_piece?: number;
  recipe_items: Array<{
    item_id: number;
    quantity: number;
  }>;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [csvErrors, setCsvErrors] = useState<{ row: unknown; message: string }[]>([]);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const { toast, toasts, dismiss } = useToast();

  // フィルター状態
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // フォーム状態
  const [formData, setFormData] = useState<CreateRecipeRequest>({
    item_id: 0,
    inspection_standard: 0,
    inspection_unit: "g",
    manufacturable_quantity: 0,
    manufacturable_unit: "個",
    manufacturing_cost_per_piece: undefined,
    packaging_cost_per_piece: undefined,
    product_cost_per_piece: undefined,
    recipe_items: [],
  });

  // レシピアイテムの状態
  const [recipeItems, setRecipeItems] = useState<Array<{ item_id: number; quantity: number }>>([]);

  const fetchRecipes = useCallback(async () => {
    try {
      const response = await fetch("/api/recipes");
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("レシピデータの取得に失敗しました:", error);
      toast({
        title: "エラー",
        description: "レシピデータの取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);



  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("食材データの取得に失敗しました:", error);
    }
  }, []);

  // データ取得
  useEffect(() => {
    fetchRecipes();
    fetchItems();
  }, [fetchRecipes, fetchItems]);

  // レシピフィルタリング
  useEffect(() => {
    let filtered = recipes;

    // 商品でフィルタリング
    if (selectedProduct !== "all") {
      filtered = filtered.filter((recipe) => recipe.item_id === parseInt(selectedProduct));
    }

    // 検索語でフィルタリング
    if (searchTerm) {
      filtered = filtered.filter((recipe) =>
        recipe.item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecipes(filtered);
  }, [recipes, selectedProduct, searchTerm]);

  // レシピ作成
  const createRecipe = async () => {
    setIsSubmitting(true);

    try {
      const requestData = {
        ...formData,
        recipe_items: recipeItems,
      };

      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "レシピが正常に作成されました",
        });
        setIsCreateDialogOpen(false);
        setFormData({
          item_id: 0,
          inspection_standard: 0,
          inspection_unit: "g",
          manufacturable_quantity: 0,
          manufacturable_unit: "個",
          manufacturing_cost_per_piece: undefined,
          packaging_cost_per_piece: undefined,
          product_cost_per_piece: undefined,
          recipe_items: [],
        });
        setRecipeItems([]);
        fetchRecipes();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "レシピの作成に失敗しました");
      }
    } catch (error) {
      console.error("レシピの作成に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "レシピの作成に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  // レシピアイテムの追加
  const addRecipeItem = () => {
    setRecipeItems([...recipeItems, { item_id: 0, quantity: 0 }]);
  };

  // レシピアイテムの削除
  const removeRecipeItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  // レシピアイテムの更新
  const updateRecipeItem = (index: number, field: "item_id" | "quantity", value: number) => {
    const newItems = [...recipeItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setRecipeItems(newItems);
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

      const response = await fetch("/api/upload-recipes-csv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // 成功メッセージを表示
        toast({
          title: "成功",
          description: result.message || "CSVファイルが正常にアップロードされました",
        });

        // エラーがある場合は警告として表示
        if (result.errors && result.errors.length > 0) {
          setCsvErrors(result.errors);
          setIsErrorDialogOpen(true);
          
          toast({
            title: "警告",
            description: `${result.errors.length}件のエラーが発生しました。詳細を確認してください。`,
            variant: "destructive",
          });
        }

        fetchRecipes();
      } else {
        // エラーレスポンスの場合
        const errorMessage = result.error || result.details || "CSVファイルのアップロードに失敗しました";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("CSVファイルのアップロードに失敗しました:", error);
      
      let errorMessage = "CSVファイルのアップロードに失敗しました";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  // 単位の日本語表示
  const getUnitLabel = (unit: string) => {
    const unitLabels: { [key: string]: string } = {
      g: "g",
      kg: "kg",
      袋: "袋",
      本: "本",
      枚: "枚",
      巻: "巻",
      個: "個",
      冊: "冊",
      式: "式",
      束: "束",
      台: "台",
      箱: "箱",
      粒: "粒",
      ケース: "ケース",
      セット: "セット",
      バルク: "バルク",
      ロット: "ロット",
    };
    return unitLabels[unit] || unit;
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
            <h1 className="text-3xl font-bold">レシピ管理</h1>
            <p className="text-gray-600">レシピの登録・編集・削除を行います</p>
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
            <Button
              variant="outline"
              onClick={() => {
                const csvTemplate = `商品番号,商品名,検品基準,誤差枚数,製造可能枚数/型,材料番号,材料,内容量
3038,久遠テリーヌ　　ノアール（スイート）,20g,0枚,28枚,1319,QUONオリジナルコロンビアブレンド54%,450g
3038,久遠テリーヌ　　ノアール（スイート）,20g,0枚,28枚,1028,マロンロワイヤルオレンジキューブ（2.5キロ/袋入）,150g
3038,久遠テリーヌ　　ノアール（スイート）,20g,0枚,28枚,1045,アーモンドスライス60ｇをキャラメリゼ,60g
3038,久遠テリーヌ　　ノアール（スイート）,20g,0枚,28枚,,グラニュー糖,84g
3038,久遠テリーヌ　　ノアール（スイート）,20g,0枚,28枚,1050,ロースト作業,84g
3039,久遠テリーヌ　　レ（ミルク）,20g,0枚,28枚,1320,QUONオリジナルコロンビアブレンド41%,450g
3039,久遠テリーヌ　　レ（ミルク）,20g,0枚,28枚,1046,アーモンドスリーバード,45g`;
                const blob = new Blob([csvTemplate], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'recipes_template.csv';
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              CSVテンプレート
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const response = await fetch('/api/test-data', {
                    method: 'POST'
                  });
                  if (response.ok) {
                    toast({
                      title: "成功",
                      description: "テストデータが作成されました",
                    });
                  } else {
                    throw new Error('テストデータの作成に失敗しました');
                  }
                } catch (error) {
                  console.error('テストデータ作成エラー:', error);
                  toast({
                    title: "エラー",
                    description: "テストデータの作成に失敗しました",
                    variant: "destructive",
                  });
                }
              }}
            >
              テストデータ作成
            </Button>
          </div>
        </div>
      </div>

      {/* CSVヘルプ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>CSVインポートについて</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">CSVファイル形式</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>商品番号:</strong> 商品の番号（任意、商品名で検索する場合は空欄可）</p>
                <p><strong>商品名:</strong> 商品の名前（必須）</p>
                <p><strong>検品基準:</strong> 検品基準（例：20g）</p>
                <p><strong>誤差枚数:</strong> 誤差枚数（例：0枚）</p>
                <p><strong>製造可能枚数/型:</strong> 製造可能枚数（例：28枚）</p>
                <p><strong>材料番号:</strong> 材料の番号（任意、材料名で検索する場合は空欄可）</p>
                <p><strong>材料:</strong> 材料の名前（必須）</p>
                <p><strong>内容量:</strong> 材料の使用量（例：450g）</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">処理ルール</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• 同じ商品名の行は1つのレシピとしてまとめられます</p>
                <p>• 商品名で既存の商品を検索し、見つからない場合は新規作成します</p>
                <p>• 材料名で既存の材料を検索し、見つからない場合は新規作成します</p>
                <p>• 1つの商品に対して複数の材料を設定できます</p>
                <p>• 既存レシピの更新時は、指定されたデータで上書きされます</p>
                <p>• 商品は「商品」タイプ、材料は「食材」タイプとして作成されます</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* フィルター */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item">発注用アイテム</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="発注用アイテムを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての発注用アイテム</SelectItem>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} ({item.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">アイテム名検索</Label>
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

      {/* レシピ一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>レシピ一覧 ({filteredRecipes.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecipes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              レシピが見つかりません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{recipe.item.name}</h3>
                        <Badge variant="outline">レシピID: {recipe.id}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>検査基準: {recipe.inspection_standard}{getUnitLabel(recipe.inspection_unit)}</div>
                        <div>製造可能: {recipe.manufacturable_quantity}{getUnitLabel(recipe.manufacturable_unit)}</div>
                        {recipe.manufacturing_cost_per_piece && (
                          <div>製造原価/枚: ¥{recipe.manufacturing_cost_per_piece.toLocaleString()}</div>
                        )}
                        {recipe.packaging_cost_per_piece && (
                          <div>個包装単価/枚: ¥{recipe.packaging_cost_per_piece.toLocaleString()}</div>
                        )}
                        {recipe.product_cost_per_piece && (
                          <div>商品原価/枚: ¥{recipe.product_cost_per_piece.toLocaleString()}</div>
                        )}
                        <div className="mt-2 pt-2 border-t">
                          <div className="font-medium mb-1">使用食材:</div>
                          {recipe.recipeItems.map((item, index) => (
                            <div key={index} className="text-xs">
                              • {item.item.name}: {item.quantity}{getUnitLabel(item.item.unit)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    作成日: {new Date(recipe.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* レシピ作成ダイアログ */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>レシピ作成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_id">発注用アイテム</Label>
                <Select
                  value={formData.item_id.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, item_id: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="発注用アイテムを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name} ({item.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inspection_standard">検査基準</Label>
                <Input
                  id="inspection_standard"
                  type="number"
                  value={formData.inspection_standard}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      inspection_standard: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="検査基準を入力"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inspection_unit">検査単位</Label>
                <Select
                  value={formData.inspection_unit}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, inspection_unit: value }))
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
                <Label htmlFor="manufacturable_quantity">製造可能数量</Label>
                <Input
                  id="manufacturable_quantity"
                  type="number"
                  value={formData.manufacturable_quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      manufacturable_quantity: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="製造可能数量を入力"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manufacturable_unit">製造可能単位</Label>
                <Select
                  value={formData.manufacturable_unit}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, manufacturable_unit: value }))
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="manufacturing_cost_per_piece">製造原価/枚</Label>
                <Input
                  id="manufacturing_cost_per_piece"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.manufacturing_cost_per_piece || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      manufacturing_cost_per_piece: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  placeholder="製造原価/枚を入力"
                />
              </div>
              <div>
                <Label htmlFor="packaging_cost_per_piece">個包装単価/枚</Label>
                <Input
                  id="packaging_cost_per_piece"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.packaging_cost_per_piece || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      packaging_cost_per_piece: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  placeholder="個包装単価/枚を入力"
                />
              </div>
              <div>
                <Label htmlFor="product_cost_per_piece">商品原価/枚</Label>
                <Input
                  id="product_cost_per_piece"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.product_cost_per_piece || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      product_cost_per_piece: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  placeholder="商品原価/枚を入力"
                />
              </div>
            </div>

            {/* レシピアイテム */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">使用食材</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRecipeItem}>
                  食材を追加
                </Button>
              </div>
              <div className="space-y-3">
                {recipeItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Select
                        value={item.item_id.toString()}
                        onValueChange={(value) =>
                          updateRecipeItem(index, "item_id", parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="食材を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((itemOption) => (
                            <SelectItem key={itemOption.id} value={itemOption.id.toString()}>
                              {itemOption.name} ({getUnitLabel(itemOption.unit)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          updateRecipeItem(index, "quantity", parseInt(e.target.value) || 0)
                        }
                        placeholder="数量"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRecipeItem(index)}
                    >
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                onClick={createRecipe}
                disabled={
                  isSubmitting || 
                  !formData.item_id || 
                  formData.inspection_standard <= 0 || 
                  formData.manufacturable_quantity <= 0 ||
                  recipeItems.length === 0
                }
              >
                {isSubmitting ? "作成中..." : "作成"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSVエラー詳細ダイアログ */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>CSVアップロードエラー詳細</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              {csvErrors.length}件のエラーが発生しました。以下の詳細を確認してください。
            </div>
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <div className="divide-y">
                {csvErrors.map((error, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-red-600 mb-2">
                          エラー {index + 1}
                        </div>
                        <div className="text-sm text-gray-700 mb-2 break-words">
                          {error.message}
                        </div>
                        <div className="text-xs text-gray-500">
                          <strong>データ:</strong>
                          <div className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(error.row, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsErrorDialogOpen(false)}
              >
                閉じる
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 