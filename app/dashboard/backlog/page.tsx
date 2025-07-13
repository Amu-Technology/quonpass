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
import { IconPlus, IconEdit, IconTrash, IconGitBranch, IconGitCommit } from "@tabler/icons-react";

interface BacklogItem {
  id: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "review" | "done";
  assignee?: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  tags: string[];
  git_branch?: string;
  git_commit?: string;
  created_at: string;
  updated_at: string;
}

interface CreateBacklogItemRequest {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "review" | "done";
  assignee?: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  tags: string[];
  git_branch?: string;
  git_commit?: string;
}

export default function BacklogPage() {
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<BacklogItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast, toasts, dismiss } = useToast();

  // フィルター状態
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // フォーム状態
  const [formData, setFormData] = useState<CreateBacklogItemRequest>({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    assignee: "",
    estimated_hours: undefined,
    actual_hours: undefined,
    due_date: "",
    tags: [],
    git_branch: "",
    git_commit: "",
  });

  const fetchBacklogItems = useCallback(async () => {
    try {
      const response = await fetch("/api/backlog");
      if (response.ok) {
        const data = await response.json();
        setBacklogItems(data);
      }
    } catch (error) {
      console.error("バックログデータの取得に失敗しました:", error);
      toast({
        title: "エラー",
        description: "バックログデータの取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // データ取得
  useEffect(() => {
    fetchBacklogItems();
  }, [fetchBacklogItems]);

  // バックログフィルタリング
  useEffect(() => {
    let filtered = backlogItems;

    // ステータスでフィルタリング
    if (selectedStatus !== "all") {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    // 優先度でフィルタリング
    if (selectedPriority !== "all") {
      filtered = filtered.filter((item) => item.priority === selectedPriority);
    }

    // 検索語でフィルタリング
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  }, [backlogItems, selectedStatus, selectedPriority, searchTerm]);

  // バックログ作成
  const createBacklogItem = async () => {
    setIsSubmitting(true);

    try {
      const requestData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim() !== ""),
        estimated_hours: formData.estimated_hours || undefined,
        actual_hours: formData.actual_hours || undefined,
        due_date: formData.due_date || undefined,
        git_branch: formData.git_branch || undefined,
        git_commit: formData.git_commit || undefined,
      };

      const response = await fetch("/api/backlog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "バックログアイテムが正常に作成されました",
        });
        setIsCreateDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
          assignee: "",
          estimated_hours: undefined,
          actual_hours: undefined,
          due_date: "",
          tags: [],
          git_branch: "",
          git_commit: "",
        });
        fetchBacklogItems();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "バックログアイテムの作成に失敗しました");
      }
    } catch (error) {
      console.error("バックログアイテムの作成に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "バックログアイテムの作成に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // バックログ更新
  const updateBacklogItem = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);

    try {
      const requestData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim() !== ""),
        estimated_hours: formData.estimated_hours || undefined,
        actual_hours: formData.actual_hours || undefined,
        due_date: formData.due_date || undefined,
        git_branch: formData.git_branch || undefined,
        git_commit: formData.git_commit || undefined,
      };

      const response = await fetch(`/api/backlog/${selectedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "バックログアイテムが正常に更新されました",
        });
        setIsEditDialogOpen(false);
        fetchBacklogItems();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "バックログアイテムの更新に失敗しました");
      }
    } catch (error) {
      console.error("バックログアイテムの更新に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "バックログアイテムの更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // バックログ削除
  const deleteBacklogItem = async (itemId: number) => {
    if (!confirm("このバックログアイテムを削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/backlog/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "バックログアイテムが正常に削除されました",
        });
        fetchBacklogItems();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "バックログアイテムの削除に失敗しました");
      }
    } catch (error) {
      console.error("バックログアイテムの削除に失敗しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "バックログアイテムの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  // バックログ編集ダイアログを開く
  const openEditDialog = (item: BacklogItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      priority: item.priority,
      status: item.status,
      assignee: item.assignee || "",
      estimated_hours: item.estimated_hours,
      actual_hours: item.actual_hours,
      due_date: item.due_date || "",
      tags: item.tags,
      git_branch: item.git_branch || "",
      git_commit: item.git_commit || "",
    });
    setIsEditDialogOpen(true);
  };

  // タグの追加
  const addTag = () => {
    const newTag = prompt("新しいタグを入力してください:");
    if (newTag && newTag.trim()) {
      setFormData((prev: CreateBacklogItemRequest) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
    }
  };

  // タグの削除
  const removeTag = (index: number) => {
    setFormData((prev: CreateBacklogItemRequest) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
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
            <h1 className="text-3xl font-bold">バックログ管理</h1>
            <p className="text-gray-600">タスクの作成・編集・削除・ステータス管理を行います</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <IconPlus className="w-4 h-4 mr-2" />
            新規作成
          </Button>
        </div>
      </div>

      {/* フィルター */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status">ステータス</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのステータス</SelectItem>
                  <SelectItem value="todo">未着手</SelectItem>
                  <SelectItem value="in_progress">進行中</SelectItem>
                  <SelectItem value="review">レビュー</SelectItem>
                  <SelectItem value="done">完了</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">優先度</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="優先度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての優先度</SelectItem>
                  <SelectItem value="urgent">緊急</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">検索</Label>
              <Input
                id="search"
                placeholder="タイトル、説明、担当者、タグで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* バックログ一覧 */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">すべて ({filteredItems.length})</TabsTrigger>
          <TabsTrigger value="todo">未着手 ({filteredItems.filter(item => item.status === "todo").length})</TabsTrigger>
          <TabsTrigger value="in_progress">進行中 ({filteredItems.filter(item => item.status === "in_progress").length})</TabsTrigger>
          <TabsTrigger value="review">レビュー ({filteredItems.filter(item => item.status === "review").length})</TabsTrigger>
          <TabsTrigger value="done">完了 ({filteredItems.filter(item => item.status === "done").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <BacklogList items={filteredItems} onEdit={openEditDialog} onDelete={deleteBacklogItem} />
        </TabsContent>
        <TabsContent value="todo">
          <BacklogList items={filteredItems.filter(item => item.status === "todo")} onEdit={openEditDialog} onDelete={deleteBacklogItem} />
        </TabsContent>
        <TabsContent value="in_progress">
          <BacklogList items={filteredItems.filter(item => item.status === "in_progress")} onEdit={openEditDialog} onDelete={deleteBacklogItem} />
        </TabsContent>
        <TabsContent value="review">
          <BacklogList items={filteredItems.filter(item => item.status === "review")} onEdit={openEditDialog} onDelete={deleteBacklogItem} />
        </TabsContent>
        <TabsContent value="done">
          <BacklogList items={filteredItems.filter(item => item.status === "done")} onEdit={openEditDialog} onDelete={deleteBacklogItem} />
        </TabsContent>
      </Tabs>

      {/* バックログ作成ダイアログ */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>バックログアイテム作成</DialogTitle>
          </DialogHeader>
          <BacklogForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={createBacklogItem}
            isSubmitting={isSubmitting}
            addTag={addTag}
            removeTag={removeTag}
          />
        </DialogContent>
      </Dialog>

      {/* バックログ編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>バックログアイテム編集</DialogTitle>
          </DialogHeader>
          <BacklogForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={updateBacklogItem}
            isSubmitting={isSubmitting}
            addTag={addTag}
            removeTag={removeTag}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// バックログリストコンポーネント
function BacklogList({ 
  items, 
  onEdit, 
  onDelete 
}: { 
  items: BacklogItem[]; 
  onEdit: (item: BacklogItem) => void; 
  onDelete: (id: number) => void; 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.length === 0 ? (
        <div className="col-span-full text-center text-gray-500 py-8">
          バックログアイテムが見つかりません
        </div>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-2">{item.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`bg-${item.priority.toLowerCase()}-100 text-${item.priority.toLowerCase()}-800`}>
                      {item.priority}
                    </Badge>
                    <Badge className={`bg-${item.status.toLowerCase()}-100 text-${item.status.toLowerCase()}-800`}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(item)}
                  >
                    <IconEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    <IconTrash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {item.description && (
                  <p className="text-sm text-gray-600">{item.description}</p>
                )}
                
                {item.assignee && (
                  <div className="text-sm">
                    <span className="font-medium">担当者:</span> {item.assignee}
                  </div>
                )}

                {(item.estimated_hours || item.actual_hours) && (
                  <div className="text-sm">
                    <span className="font-medium">工数:</span>
                    {item.estimated_hours && ` 見積: ${item.estimated_hours}h`}
                    {item.actual_hours && ` 実績: ${item.actual_hours}h`}
                  </div>
                )}

                {item.due_date && (
                  <div className="text-sm">
                    <span className="font-medium">期限:</span> {new Date(item.due_date).toLocaleDateString('ja-JP')}
                  </div>
                )}

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {(item.git_branch || item.git_commit) && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {item.git_branch && (
                      <div className="flex items-center gap-1">
                        <IconGitBranch className="w-3 h-3" />
                        {item.git_branch}
                      </div>
                    )}
                    {item.git_commit && (
                      <div className="flex items-center gap-1">
                        <IconGitCommit className="w-3 h-3" />
                        {item.git_commit.substring(0, 7)}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  作成日: {new Date(item.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// バックログフォームコンポーネント
function BacklogForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  addTag,
  removeTag,
}: {
  formData: CreateBacklogItemRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateBacklogItemRequest>>;
  onSubmit: () => void;
  isSubmitting: boolean;
  addTag: () => void;
  removeTag: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">タイトル *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev: CreateBacklogItemRequest) => ({ ...prev, title: e.target.value }))
          }
          placeholder="タスクのタイトルを入力"
        />
      </div>

      <div>
        <Label htmlFor="description">説明</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev: CreateBacklogItemRequest) => ({ ...prev, description: e.target.value }))
          }
          placeholder="タスクの詳細説明を入力"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">優先度</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
              setFormData((prev: CreateBacklogItemRequest) => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">低</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="high">高</SelectItem>
              <SelectItem value="urgent">緊急</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">ステータス</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "todo" | "in_progress" | "review" | "done") =>
              setFormData((prev: CreateBacklogItemRequest) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">未着手</SelectItem>
              <SelectItem value="in_progress">進行中</SelectItem>
              <SelectItem value="review">レビュー</SelectItem>
              <SelectItem value="done">完了</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="assignee">担当者</Label>
        <Input
          id="assignee"
          value={formData.assignee}
          onChange={(e) =>
            setFormData((prev: CreateBacklogItemRequest) => ({ ...prev, assignee: e.target.value }))
          }
          placeholder="担当者名を入力"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="estimated_hours">見積工数 (時間)</Label>
          <Input
            id="estimated_hours"
            type="number"
            min="0"
            step="0.5"
            value={formData.estimated_hours || ""}
            onChange={(e) =>
              setFormData((prev: CreateBacklogItemRequest) => ({
                ...prev,
                estimated_hours: e.target.value ? parseFloat(e.target.value) : undefined,
              }))
            }
            placeholder="見積工数を入力"
          />
        </div>

        <div>
          <Label htmlFor="actual_hours">実績工数 (時間)</Label>
          <Input
            id="actual_hours"
            type="number"
            min="0"
            step="0.5"
            value={formData.actual_hours || ""}
            onChange={(e) =>
              setFormData((prev: CreateBacklogItemRequest) => ({
                ...prev,
                actual_hours: e.target.value ? parseFloat(e.target.value) : undefined,
              }))
            }
            placeholder="実績工数を入力"
          />
        </div>

        <div>
          <Label htmlFor="due_date">期限</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) =>
              setFormData((prev: CreateBacklogItemRequest) => ({ ...prev, due_date: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="git_branch">Gitブランチ</Label>
          <Input
            id="git_branch"
            value={formData.git_branch}
            onChange={(e) =>
              setFormData((prev: CreateBacklogItemRequest) => ({ ...prev, git_branch: e.target.value }))
            }
            placeholder="feature/backlog-management"
          />
        </div>

        <div>
          <Label htmlFor="git_commit">Gitコミット</Label>
          <Input
            id="git_commit"
            value={formData.git_commit}
            onChange={(e) =>
              setFormData((prev: CreateBacklogItemRequest) => ({ ...prev, git_commit: e.target.value }))
            }
            placeholder="コミットハッシュ"
          />
        </div>
      </div>

      <div>
        <Label>タグ</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addTag}>
          タグを追加
        </Button>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !formData.title}
        >
          {isSubmitting ? "送信中..." : "保存"}
        </Button>
      </div>
    </div>
  );
} 