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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "../../../../hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  created_at: string | null;
  updated_at: string | null;
  item: {
    name: string;
    unit: string;
  };
}

interface Order {
  id: number;
  store_id: number;
  user_id: string | null;
  other_delivery_address: string | null;
  holiday: string | null;
  request_message: string | null;
  total_amount: number;
  status: "active" | "inactive" | "archived";
  order_at: string | null;
  updated_at: string | null;
  stores: {
    name: string;
  };
  users: {
    name: string | null;
    email: string;
  } | null;
  orderItem: OrderItem[];
}

interface Store {
  id: number;
  name: string;
}

// Item interface is not used in this component

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast, toasts, dismiss } = useToast();

  // フィルター状態
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, storesResponse] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/stores"),
        ]);

        if (ordersResponse.ok && storesResponse.ok) {
          const ordersData = await ordersResponse.json();
          const storesData = await storesResponse.json();

          setOrders(ordersData);
          setStores(storesData);
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

  // 発注フィルタリング
  useEffect(() => {
    let filtered = orders;

    // 店舗でフィルタリング
    if (selectedStore !== "all") {
      filtered = filtered.filter(
        (order) => order.store_id === parseInt(selectedStore),
      );
    }

    // ステータスでフィルタリング
    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // 日付範囲でフィルタリング
    if (startDate) {
      filtered = filtered.filter((order) => {
        if (!order.order_at) return false;
        return new Date(order.order_at) >= new Date(startDate);
      });
    }

    if (endDate) {
      filtered = filtered.filter((order) => {
        if (!order.order_at) return false;
        return new Date(order.order_at) <= new Date(endDate);
      });
    }

    setFilteredOrders(filtered);
  }, [orders, selectedStore, selectedStatus, startDate, endDate]);

  // 発注詳細を開く
  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  // 発注を削除
  const deleteOrder = async (orderId: number) => {
    if (!confirm("この発注を削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "発注が正常に削除されました",
        });
        // 発注リストを更新
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "発注の削除に失敗しました");
      }
    } catch (error) {
      console.error("発注の削除に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "発注の削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  // ステータスを更新
  const updateOrderStatus = async (
    orderId: number,
    newStatus: "active" | "inactive" | "archived",
  ) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "発注ステータスが更新されました",
        });
        // 発注リストを更新
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order,
          ),
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "発注の更新に失敗しました");
      }
    } catch (error) {
      console.error("発注の更新に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "発注の更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ステータスの日本語表示
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "アクティブ";
      case "inactive":
        return "非アクティブ";
      case "archived":
        return "アーカイブ";
      default:
        return status;
    }
  };

  // ステータスの色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
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
        <h1 className="text-3xl font-bold">発注履歴</h1>
        <p className="text-gray-600">過去の発注を閲覧・編集できます</p>
      </div>

      {/* フィルター */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
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
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">ステータス</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのステータス</SelectItem>
                  <SelectItem value="active">アクティブ</SelectItem>
                  <SelectItem value="inactive">非アクティブ</SelectItem>
                  <SelectItem value="archived">アーカイブ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">開始日</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">終了日</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 発注一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>発注一覧 ({filteredOrders.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              発注が見つかりません
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">発注 #{order.id}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>店舗: {order.stores.name}</div>
                        <div>
                          発注日:{" "}
                          {order.order_at
                            ? format(
                                new Date(order.order_at),
                                "yyyy年MM月dd日",
                                { locale: ja },
                              )
                            : "未設定"}
                        </div>
                        <div>
                          合計金額: ¥{order.total_amount.toLocaleString()}
                        </div>
                        <div>商品数: {order.orderItem.length}種類</div>
                        {order.users && (
                          <div>
                            発注者: {order.users.name || order.users.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openOrderDetail(order)}
                      >
                        詳細
                      </Button>
                      <Select
                        value={order.status}
                        onValueChange={(
                          value: "active" | "inactive" | "archived",
                        ) => updateOrderStatus(order.id, value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">アクティブ</SelectItem>
                          <SelectItem value="inactive">非アクティブ</SelectItem>
                          <SelectItem value="archived">アーカイブ</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteOrder(order.id)}
                        disabled={isSubmitting}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 発注詳細ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>発注詳細 #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div>
                <h3 className="font-medium mb-3">基本情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">店舗</Label>
                    <div>{selectedOrder.stores.name}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">発注日</Label>
                    <div>
                      {selectedOrder.order_at
                        ? format(
                            new Date(selectedOrder.order_at),
                            "yyyy年MM月dd日 HH:mm",
                            { locale: ja },
                          )
                        : "未設定"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">ステータス</Label>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusLabel(selectedOrder.status)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">合計金額</Label>
                    <div className="font-medium">
                      ¥{selectedOrder.total_amount.toLocaleString()}
                    </div>
                  </div>
                  {selectedOrder.users && (
                    <div>
                      <Label className="text-sm text-gray-600">発注者</Label>
                      <div>
                        {selectedOrder.users.name || selectedOrder.users.email}
                      </div>
                    </div>
                  )}
                  {selectedOrder.holiday && (
                    <div>
                      <Label className="text-sm text-gray-600">曜日</Label>
                      <div>{selectedOrder.holiday}</div>
                    </div>
                  )}
                </div>
                {selectedOrder.request_message && (
                  <div className="mt-4">
                    <Label className="text-sm text-gray-600">備考</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      {selectedOrder.request_message}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* 発注明細 */}
              <div>
                <h3 className="font-medium mb-3">発注明細</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItem.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.item.name}</div>
                        <div className="text-sm text-gray-600">
                          単価: ¥{item.unit_price.toLocaleString()} /{" "}
                          {item.item.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {item.quantity} {item.item.unit}
                        </div>
                        <div className="text-sm text-gray-600">
                          ¥{(item.quantity * item.unit_price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
