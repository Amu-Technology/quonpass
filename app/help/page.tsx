'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  IconUsers, 
  IconChartBar, 
  IconShoppingCart, 
  IconBuildingStore, 
  IconTarget, 
  IconTrendingUp,
  IconFileUpload,
  IconSettings,
  IconQuestionMark,
  IconArrowRight,
  IconCheck,
  IconAlertTriangle
} from '@tabler/icons-react';

export default function HelpPage() {
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
              <Badge variant="outline" className="text-blue-600">
                <IconQuestionMark className="w-4 h-4 mr-1" />
                ヘルプ
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* メインヒーローセクション */}
        <section className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <IconQuestionMark className="w-4 h-4 mr-1" />
            操作方法ガイド
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            QuonPassの使い方
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            QuonPassは、小売業・飲食業向けの包括的なCRMシステムです。
            このガイドでは、各機能の操作方法を詳しく説明します。
          </p>
        </section>

        {/* 機能概要 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            主要機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* 詳細操作方法 */}
        <Tabs defaultValue="getting-started" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="getting-started">はじめに</TabsTrigger>
            <TabsTrigger value="analytics">売上分析</TabsTrigger>
            <TabsTrigger value="products">商品管理</TabsTrigger>
            <TabsTrigger value="targets">目標管理</TabsTrigger>
            <TabsTrigger value="data-import">データ移行</TabsTrigger>
            <TabsTrigger value="troubleshooting">トラブルシューティング</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconSettings className="w-6 h-6 text-blue-600" />
                  <span>はじめに</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">1. アカウント作成・ログイン</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Googleアカウントでログイン</p>
                        <p className="text-gray-600">ホームページの「Googleでサインイン」ボタンをクリックして、Googleアカウントでログインします。</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <span className="text-blue-600 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <p className="font-medium">ダッシュボードにアクセス</p>
                        <p className="text-gray-600">ログイン後、自動的にダッシュボードにリダイレクトされます。</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">2. 初期設定</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                        <IconCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">店舗情報の登録</p>
                        <p className="text-gray-600">「店舗管理」から店舗情報を登録します。</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                        <IconCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">商品・カテゴリの設定</p>
                        <p className="text-gray-600">「商品管理」から商品とカテゴリを登録します。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconChartBar className="w-6 h-6 text-blue-600" />
                  <span>売上分析</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">売上分析の操作方法</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">📊 分析画面へのアクセス</h4>
                      <p className="text-blue-800">ダッシュボード → 「売上分析」をクリック</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">期間選択</h4>
                        <ul className="text-sm space-y-1">
                          <li>• 日別：特定の日の売上</li>
                          <li>• 週別：週単位の売上</li>
                          <li>• 月別：月単位の売上</li>
                          <li>• 年別：年単位の売上</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">店舗フィルター</h4>
                        <ul className="text-sm space-y-1">
                          <li>• 全店舗：全体の売上</li>
                          <li>• 特定店舗：選択した店舗のみ</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">📈 表示される指標</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">• 総売上</p>
                          <p className="text-green-700">選択期間の売上総額</p>
                        </div>
                        <div>
                          <p className="font-medium">• 総顧客数</p>
                          <p className="text-green-700">来店した顧客数</p>
                        </div>
                        <div>
                          <p className="font-medium">• 平均客単価</p>
                          <p className="text-green-700">顧客1人あたりの平均購入額</p>
                        </div>
                        <div>
                          <p className="font-medium">• 購買率</p>
                          <p className="text-green-700">来店客の購入率</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconShoppingCart className="w-6 h-6 text-blue-600" />
                  <span>商品管理</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">商品管理の操作方法</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">🛍️ 商品登録</h4>
                      <div className="space-y-2">
                        <p className="text-blue-800">1. 「商品管理」→「新規作成」をクリック</p>
                        <p className="text-blue-800">2. 商品名、価格、カテゴリを入力</p>
                        <p className="text-blue-800">3. 「作成」ボタンをクリック</p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">📁 カテゴリ管理</h4>
                      <div className="space-y-2">
                        <p className="text-green-800">• カテゴリを作成して商品を分類</p>
                        <p className="text-green-800">• 階層構造で管理可能（例：食品→飲料→コーヒー）</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">📊 在庫管理</h4>
                      <div className="space-y-2">
                        <p className="text-yellow-800">• 商品ごとの在庫数を管理</p>
                        <p className="text-yellow-800">• 在庫アラートの設定</p>
                        <p className="text-yellow-800">• 発注点の管理</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">商品タイプ</h4>
                        <ul className="text-sm space-y-1">
                          <li>• 食材：調理用の原材料</li>
                          <li>• 商品：販売用の商品</li>
                          <li>• 資材：包装材など</li>
                          <li>• 特殊：その他のアイテム</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">単位設定</h4>
                        <ul className="text-sm space-y-1">
                          <li>• g, kg：重量</li>
                          <li>• 個, 袋, 本：個数</li>
                          <li>• 枚, 巻：枚数</li>
                          <li>• その他：適切な単位</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="targets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconTarget className="w-6 h-6 text-blue-600" />
                  <span>目標管理</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">目標管理の操作方法</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">🎯 年間目標の設定</h4>
                      <div className="space-y-2">
                        <p className="text-blue-800">1. 「売上目標管理」→「目標作成」タブ</p>
                        <p className="text-blue-800">2. 年、店舗、売上目標、客数目標を設定</p>
                        <p className="text-blue-800">3. 「年間目標を作成」をクリック</p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">📅 月間目標の設定</h4>
                      <div className="space-y-2">
                        <p className="text-green-800">1. 年間目標を選択</p>
                        <p className="text-green-800">2. 月別の割り当て率を調整</p>
                        <p className="text-green-800">3. 「12ヶ月分の月間目標を作成」をクリック</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">進捗確認</h4>
                        <ul className="text-sm space-y-1">
                          <li>• 実績 vs 目標の比較</li>
                          <li>• 進捗率の表示</li>
                          <li>• 達成率の可視化</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">分析機能</h4>
                        <ul className="text-sm space-y-1">
                          <li>• 過去データとの比較</li>
                          <li>• 月別・年別の推移</li>
                          <li>• 店舗別の分析</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-import">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconFileUpload className="w-6 h-6 text-blue-600" />
                  <span>データ移行・インポート</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">CSVファイルでのデータインポート</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">📁 商品データのインポート</h4>
                      <div className="space-y-2">
                        <p className="text-blue-800">1. 「商品管理」→「CSVアップロード」をクリック</p>
                        <p className="text-blue-800">2. CSVファイルを選択</p>
                        <p className="text-blue-800">3. アップロードを実行</p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">📊 売上データのインポート</h4>
                      <div className="space-y-2">
                        <p className="text-green-800">1. 「売上記録」→「CSVアップロード」をクリック</p>
                        <p className="text-green-800">2. 売上CSVファイルを選択</p>
                        <p className="text-green-800">3. 店舗IDを指定してアップロード</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">CSV形式</h4>
                        <ul className="text-sm space-y-1">
                          <li>• 商品名（必須）</li>
                          <li>• 価格（必須）</li>
                          <li>• カテゴリ（任意）</li>
                          <li>• 在庫数（任意）</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">注意事項</h4>
                        <ul className="text-sm space-y-1">
                          <li>• UTF-8エンコーディング</li>
                          <li>• カンマ区切り（CSV）</li>
                          <li>• ヘッダー行を含む</li>
                          <li>• 最大10MBまで</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">⚠️ エラー処理</h4>
                      <div className="space-y-2">
                        <p className="text-yellow-800">• エラーが発生した行は詳細が表示されます</p>
                        <p className="text-yellow-800">• 成功したデータは正常にインポートされます</p>
                        <p className="text-yellow-800">• エラーログを確認して修正してください</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="troubleshooting">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconAlertTriangle className="w-6 h-6 text-blue-600" />
                  <span>トラブルシューティング</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">よくある問題と解決方法</h3>
                  
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-red-600 mb-2">🔐 ログインできない</h4>
                      <div className="space-y-2">
                        <p className="text-sm">• Googleアカウントが正しく設定されているか確認</p>
                        <p className="text-sm">• ブラウザのキャッシュをクリア</p>
                        <p className="text-sm">• 別のブラウザで試す</p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-orange-600 mb-2">📊 データが表示されない</h4>
                      <div className="space-y-2">
                        <p className="text-sm">• 期間設定を確認</p>
                        <p className="text-sm">• 店舗フィルターを確認</p>
                        <p className="text-sm">• データが正しく登録されているか確認</p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-600 mb-2">📁 CSVアップロードエラー</h4>
                      <div className="space-y-2">
                        <p className="text-sm">• ファイル形式がCSVか確認</p>
                        <p className="text-sm">• エンコーディングがUTF-8か確認</p>
                        <p className="text-sm">• 必須項目が入力されているか確認</p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-blue-600 mb-2">⚡ パフォーマンスが遅い</h4>
                      <div className="space-y-2">
                        <p className="text-sm">• 大量データの場合は期間を絞る</p>
                        <p className="text-sm">• ブラウザを最新版に更新</p>
                        <p className="text-sm">• 他のタブを閉じる</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">📞 サポート</h4>
                      <div className="space-y-2">
                        <p className="text-blue-800">• 問題が解決しない場合は、お問い合わせください</p>
                        <p className="text-blue-800">• エラーメッセージのスクリーンショットを添付</p>
                        <p className="text-blue-800">• 操作手順を詳細に記載</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* クイックスタートガイド */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconArrowRight className="w-6 h-6 text-green-600" />
                <span>クイックスタートガイド</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">ログイン</h3>
                  <p className="text-sm text-gray-600">Googleアカウントでログイン</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">初期設定</h3>
                  <p className="text-sm text-gray-600">店舗・商品情報を登録</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">データ分析</h3>
                  <p className="text-sm text-gray-600">売上分析・目標管理を開始</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">
            QuonPass - ビジネスの成長を加速させるCRMプラットフォーム
          </p>
          <p className="text-gray-500 text-sm mt-2">
            &copy; 2025 QuonPass. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 