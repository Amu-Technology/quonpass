'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { 
  IconUsers, 
  IconChartBar, 
  IconShoppingCart, 
  IconBuildingStore,
  IconTarget,
  IconSettings,
  IconLogout
} from '@tabler/icons-react';



export default function DashboardPage() {
  const { data: session } = useSession();

  const quickActions = [
    {
      icon: IconUsers,
      title: "ユーザー管理",
      description: "ユーザーの登録・編集・削除",
      href: "/dashboard/users"
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
      title: "発注登録",
      description: "発注の登録",
      href: "/dashboard/orders"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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




    </div>
  );
}
