'use client';

import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  IconUsers, 
  IconChartBar, 
  IconShoppingCart, 
  IconBuildingStore, 
  IconTarget, 
  IconTrendingUp,
  IconShield,
  IconBolt,
  IconCheck
} from '@tabler/icons-react';

export default function HomePage() {
  const { data: session } = useSession();

  const features = [
    {
      icon: IconUsers,
      title: "顧客管理",
      description: "顧客情報の一元管理で、関係性を深め、リピート率を向上させます"
    },
    {
      icon: IconChartBar,
      title: "売上分析",
      description: "リアルタイムの売上データ分析で、ビジネスの成長を可視化します"
    },
    {
      icon: IconShoppingCart,
      title: "商品管理",
      description: "在庫管理から発注まで、商品ライフサイクルを効率的に管理します"
    },
    {
      icon: IconBuildingStore,
      title: "店舗管理",
      description: "複数店舗の統合管理で、全体のパフォーマンスを最適化します"
    },
    {
      icon: IconTarget,
      title: "目標設定",
      description: "年間・月間・週間の売上目標を設定し、進捗を追跡します"
    },
    {
      icon: IconTrendingUp,
      title: "レポート機能",
      description: "詳細なレポートで、データドリブンな意思決定をサポートします"
    }
  ];

  const benefits = [
    "売上向上のためのデータ分析",
    "顧客満足度の向上",
    "業務効率の大幅改善",
    "リアルタイムでの情報共有",
    "セキュアなデータ管理",
    "24時間365日の利用可能"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <IconUsers className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">QuonPass</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <Button asChild>
                  <a href="/dashboard">ダッシュボードへ</a>
                </Button>
              ) : (
                <Button onClick={() => signIn('google')}>
                  Googleでサインイン
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* メインヒーローセクション */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <IconBolt className="w-4 h-4 mr-1" />
            最新のCRMソリューション
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ビジネスの成長を
            <span className="text-blue-600">加速させる</span>
            <br />
            CRMプラットフォーム
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            QuonPassは、小売業・飲食業向けの包括的なCRMシステムです。
            顧客管理、売上分析、商品管理を統合し、データドリブンな経営を実現します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Button size="lg" asChild>
                <a href="/dashboard">ダッシュボードを開く</a>
              </Button>
            ) : (
              <Button size="lg" onClick={() => signIn('google')}>
                無料で始める
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <a href="#features">機能を見る</a>
            </Button>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              豊富な機能でビジネスをサポート
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              必要な機能をすべて統合し、シンプルで使いやすいインターフェースを提供します
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* メリットセクション */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                QuonPassを選ぶ理由
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <IconCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <div className="text-center">
                <IconShield className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">セキュリティ重視</h3>
                <p className="text-blue-100">
                  最新のセキュリティ技術を採用し、お客様の大切なデータを安全に保護します。
                  GDPR準拠で、プライバシーも完全に保護されます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            今すぐ始めませんか？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            無料トライアルで、QuonPassの可能性を体験してください。
            30日間の無料期間で、すべての機能をお試しいただけます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Button size="lg" variant="secondary" asChild>
                <a href="/dashboard">ダッシュボードへ</a>
              </Button>
            ) : (
              <Button size="lg" variant="secondary" onClick={() => signIn('google')}>
                無料トライアル開始
              </Button>
            )}
            <Button size="lg" variant="outline" className="text-black border-white hover:bg-white hover:text-blue-600">
              お問い合わせ
            </Button>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <IconUsers className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">QuonPass</h3>
              </div>
              <p className="text-gray-400">
                ビジネスの成長を加速させるCRMプラットフォーム
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">ヘルプセンター</a></li>
                <li><a href="#" className="hover:text-white">お問い合わせ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">会社</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">会社概要</a></li>
                <li><a href="/privacy" className="hover:text-white">プライバシーポリシー</a></li>
                <li><a href="/terms" className="hover:text-white">利用規約</a></li>
                <li><a href="/cookies" className="hover:text-white">Cookieポリシー</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Quonpass. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
