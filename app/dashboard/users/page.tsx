"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  IconUsers, 
  IconPlus, 
  IconEdit, 
  IconTrash,
  IconBuilding,
  IconShield
} from "@tabler/icons-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  store?: {
    name: string;
  };
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users/all");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("ユーザー一覧の取得に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "管理者";
      case "manager":
        return "マネージャー";
      case "user":
        return "一般ユーザー";
      default:
        return role;
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
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ユーザー管理</h1>
            <p className="text-gray-600">システムユーザーの管理を行います</p>
          </div>
          <Button>
            <IconPlus className="w-4 h-4 mr-2" />
            新規ユーザー追加
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <IconUsers className="w-6 h-6 text-blue-600" />
            <span>ユーザー一覧 ({users.length}件)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              ユーザーが見つかりません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{user.name}</h3>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <IconUsers className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.store && (
                          <div className="flex items-center gap-1">
                            <IconBuilding className="w-4 h-4" />
                            {user.store.name}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <IconShield className="w-4 h-4" />
                          作成日: {new Date(user.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <IconEdit className="w-4 h-4 mr-1" />
                      編集
                    </Button>
                    <Button size="sm" variant="destructive">
                      <IconTrash className="w-4 h-4 mr-1" />
                      削除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 