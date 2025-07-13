'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { UserForm } from '@/components/UserForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import data from "./data.json";
import { 
  IconUsers, 
  IconChartBar, 
  IconShoppingCart, 
  IconBuildingStore,
  IconTarget,
  IconSettings,
  IconLogout
} from '@tabler/icons-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  store_id: number | null;
  created_at: Date | null;
  stores: {
    name: string;
  } | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/all');
      if (!response.ok) {
        throw new Error('ユーザー一覧の取得に失敗しました');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleRegister = () => {
    setSelectedUser(undefined);
    setIsFormOpen(true);
  };

  const quickActions = [
    {
      icon: IconUsers,
      title: "ユーザー管理",
      description: "ユーザーの登録・編集・削除",
      href: "#users"
    },
    {
      icon: IconChartBar,
      title: "売上分析",
      description: "売上データの分析とレポート",
      href: "/dashboard/analytics"
    },
    {
      icon: IconShoppingCart,
      title: "商品管理",
      description: "商品の登録・在庫管理",
      href: "/dashboard/products"
    },
    {
      icon: IconBuildingStore,
      title: "店舗管理",
      description: "店舗情報の管理",
      href: "/dashboard/stores"
    },
    {
      icon: IconTarget,
      title: "目標設定",
      description: "売上目標の設定と管理",
      href: "/dashboard/targets"
    },
    {
      icon: IconSettings,
      title: "設定",
      description: "システム設定",
      href: "#settings"
    }
  ];

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* ヘッダー */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">ダッシュボード</h1>
            <p className="text-gray-600">
              ようこそ、{session?.user?.name}さん！
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => signOut()}>
              <IconLogout className="w-4 h-4 mr-2" />
              サインアウト
            </Button>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>よく使用する機能に素早くアクセス</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  asChild
                >
                  <a href={action.href}>
                    <action.icon className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <Tabs defaultValue="overview" className="px-4 lg:px-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="users">ユーザー管理</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SectionCards />
          <div>
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ユーザー管理</CardTitle>
                  <CardDescription>システムユーザーの管理</CardDescription>
                </div>
                <Button onClick={handleRegister} className="bg-green-500 hover:bg-green-600">
                  新規登録
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : error ? (
                <div className="text-red-500 py-8">{error}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          名前
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          メールアドレス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          役割
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          店舗
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          登録日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.name || '未設定'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">
                              {user.role || '未設定'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.stores?.name || '未設定'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString('ja-JP')
                              : '未設定'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              編集
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>売上分析</CardTitle>
              <CardDescription>詳細な売上データの分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                売上分析機能は <a href="/dashboard/analytics" className="text-blue-600 hover:underline">分析ページ</a> でご利用いただけます
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchUsers}
        user={selectedUser}
      />
    </div>
  );
}
