'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconArrowLeft, IconShield, IconEye, IconLock, IconUsers, IconDatabase, IconGlobe } from '@tabler/icons-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <IconArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <IconShield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">プライバシーポリシー</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 更新日 */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <IconEye className="w-4 h-4" />
                <span>最終更新日: 2025年1月15日</span>
              </div>
            </CardContent>
          </Card>

          {/* 概要 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconShield className="w-6 h-6 text-blue-600" />
                <span>概要</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                QuonPass（以下「当社」）は、お客様のプライバシーを尊重し、個人情報の保護を最優先に考えています。
                本プライバシーポリシーは、当社が提供するCRMプラットフォーム（以下「本サービス」）において、
                お客様の個人情報をどのように収集、使用、保護するかについて説明します。
              </p>
              <p>
                本サービスをご利用いただく前に、本プライバシーポリシーを必ずお読みください。
                本サービスをご利用いただくことで、本プライバシーポリシーに同意したものとみなされます。
              </p>
            </CardContent>
          </Card>

          {/* 収集する情報 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconDatabase className="w-6 h-6 text-blue-600" />
                <span>収集する情報</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">1. お客様が直接提供する情報</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>アカウント情報:</strong> 氏名、メールアドレス、Googleアカウント情報</li>
                  <li><strong>店舗情報:</strong> 店舗名、住所、電話番号、業種</li>
                  <li><strong>商品情報:</strong> 商品名、価格、在庫数、カテゴリ</li>
                  <li><strong>売上データ:</strong> 売上金額、売上数量、顧客数、支払い方法</li>
                  <li><strong>レジクローズデータ:</strong> 顧客属性（性別）、支払い方法別売上</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2. 自動的に収集される情報</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>ログ情報:</strong> IPアドレス、ブラウザ情報、アクセス日時、ページビュー</li>
                  <li><strong>デバイス情報:</strong> デバイス種類、OS、画面解像度</li>
                  <li><strong>Cookie:</strong> セッション管理、ユーザー設定の保存</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3. 第三者から取得する情報</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Google認証:</strong> Googleアカウントの基本情報（メールアドレス、氏名）</li>
                  <li><strong>分析サービス:</strong> Google Analytics等の利用統計情報</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 情報の使用目的 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconUsers className="w-6 h-6 text-blue-600" />
                <span>情報の使用目的</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>当社は、収集した情報を以下の目的で使用します：</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>本サービスの提供・運営</li>
                <li>お客様のアカウント管理・認証</li>
                <li>売上分析・レポートの生成</li>
                <li>商品管理・在庫管理の支援</li>
                <li>顧客管理・マーケティング支援</li>
                <li>カスタマーサポートの提供</li>
                <li>セキュリティの確保・不正アクセスの防止</li>
                <li>サービスの改善・新機能の開発</li>
                <li>法的義務の履行</li>
                <li>お客様への通知・連絡</li>
              </ul>
            </CardContent>
          </Card>

          {/* 情報の共有 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconGlobe className="w-6 h-6 text-blue-600" />
                <span>情報の共有・開示</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>当社は、以下の場合を除き、お客様の個人情報を第三者に提供しません：</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>お客様の同意がある場合</strong></li>
                <li><strong>法令に基づく場合:</strong> 裁判所の命令、捜査機関からの要請等</li>
                <li><strong>当社の権利・財産・安全を保護する必要がある場合</strong></li>
                <li><strong>緊急時:</strong> お客様や第三者の生命・身体・財産を保護する必要がある場合</li>
                <li><strong>事業譲渡:</strong> 合併、会社分割、事業譲渡等により事業が承継される場合</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                なお、統計情報や匿名化された情報については、個人を特定できない形で第三者に提供する場合があります。
              </p>
            </CardContent>
          </Card>

          {/* データの保存・削除 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconLock className="w-6 h-6 text-blue-600" />
                <span>データの保存・削除</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">データの保存期間</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>アカウント情報:</strong> アカウント削除まで</li>
                  <li><strong>売上データ:</strong> 7年間（税法上の保存義務）</li>
                  <li><strong>ログ情報:</strong> 1年間</li>
                  <li><strong>Cookie:</strong> 最大2年間</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">データの削除</h3>
                <p className="text-gray-700">
                  お客様は、アカウント設定からデータの削除を要求できます。
                  削除要求を受けた場合、当社は合理的な期間内に該当データを削除します。
                  ただし、法的義務により保存が必要なデータについては、保存期間満了まで保持します。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* セキュリティ */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconShield className="w-6 h-6 text-blue-600" />
                <span>セキュリティ対策</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>当社は、お客様の個人情報を保護するため、以下のセキュリティ対策を実施しています：</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>SSL暗号化通信の使用</li>
                <li>アクセス制御・認証機能の実装</li>
                <li>定期的なセキュリティ監査の実施</li>
                <li>従業員へのプライバシー教育の実施</li>
                <li>データセンターの物理的セキュリティ確保</li>
                <li>バックアップ・復旧体制の整備</li>
              </ul>
            </CardContent>
          </Card>

          {/* お客様の権利 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconUsers className="w-6 h-6 text-blue-600" />
                <span>お客様の権利</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>お客様は、以下の権利を有します：</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>アクセス権:</strong> ご自身の個人情報の確認</li>
                <li><strong>訂正権:</strong> 不正確な個人情報の訂正</li>
                <li><strong>削除権:</strong> 個人情報の削除要求</li>
                <li><strong>利用停止権:</strong> 個人情報の利用停止要求</li>
                <li><strong>データポータビリティ:</strong> 個人情報の移転要求</li>
                <li><strong>異議申立て権:</strong> 処理に対する異議申立て</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                これらの権利の行使については、アカウント設定またはお問い合わせフォームからご連絡ください。
              </p>
            </CardContent>
          </Card>

          {/* Cookie */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconEye className="w-6 h-6 text-blue-600" />
                <span>Cookieの使用</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>当社は、以下の目的でCookieを使用しています：</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>セッション管理:</strong> ログイン状態の維持</li>
                <li><strong>ユーザー設定:</strong> 言語設定、テーマ設定等の保存</li>
                <li><strong>分析:</strong> サービス利用状況の分析</li>
                <li><strong>セキュリティ:</strong> 不正アクセスの検知</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                ブラウザの設定によりCookieを無効にすることも可能ですが、
                その場合、本サービスの一部機能が正常に動作しない可能性があります。
              </p>
            </CardContent>
          </Card>

          {/* 第三者サービス */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconGlobe className="w-6 h-6 text-blue-600" />
                <span>第三者サービス</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>当社は、以下の第三者サービスを利用しています：</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Google Analytics:</strong> ウェブサイト分析</li>
                <li><strong>Google OAuth:</strong> 認証サービス</li>
                <li><strong>Vercel:</strong> ホスティングサービス</li>
                <li><strong>Prisma:</strong> データベース管理</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                これらの第三者サービスは、それぞれ独自のプライバシーポリシーを有しています。
                詳細については、各サービスのプライバシーポリシーをご確認ください。
              </p>
            </CardContent>
          </Card>

          {/* 国際的なデータ転送 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconGlobe className="w-6 h-6 text-blue-600" />
                <span>国際的なデータ転送</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                当社は、本サービスの提供にあたり、データを日本国外のサーバーに転送する場合があります。
                国際的なデータ転送を行う場合、当社は適切な保護措置を講じます。
              </p>
              <p className="text-sm text-gray-600">
                現在、データは主に日本のデータセンターで処理されていますが、
                一部の分析サービスについては米国等の海外サーバーを使用する場合があります。
              </p>
            </CardContent>
          </Card>

          {/* 未成年者の利用 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconUsers className="w-6 h-6 text-blue-600" />
                <span>未成年者の利用</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                本サービスは、主にビジネス用途を想定しており、18歳未満の方の利用は想定していません。
                18歳未満の方が本サービスを利用する場合は、保護者の同意を得てからご利用ください。
              </p>
              <p className="text-sm text-gray-600">
                保護者の同意なく18歳未満の方から個人情報を収集したことが判明した場合、
                当社は速やかに該当情報を削除します。
              </p>
            </CardContent>
          </Card>

          {/* プライバシーポリシーの変更 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconShield className="w-6 h-6 text-blue-600" />
                <span>プライバシーポリシーの変更</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                当社は、必要に応じて本プライバシーポリシーを変更する場合があります。
                重要な変更がある場合は、本サービス内での通知またはメールによりお知らせします。
              </p>
              <p className="text-sm text-gray-600">
                変更後のプライバシーポリシーは、本ページに掲載された時点から効力を生じます。
                変更後も本サービスを継続してご利用いただくことで、変更に同意したものとみなされます。
              </p>
            </CardContent>
          </Card>

          {/* お問い合わせ */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconUsers className="w-6 h-6 text-blue-600" />
                <span>お問い合わせ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                本プライバシーポリシーに関するご質問やご意見がございましたら、
                以下の方法でお気軽にお問い合わせください。
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">QuonPass プライバシー担当</h4>
                <p className="text-sm text-gray-700">
                  メール: privacy@quonpass.com<br />
                  受付時間: 平日 9:00-18:00（土日祝日除く）
                </p>
              </div>
              <p className="text-sm text-gray-600">
                お問い合わせの際は、お客様の身元確認のため、登録されているメールアドレスからの送信をお願いします。
              </p>
            </CardContent>
          </Card>

          {/* 戻るボタン */}
          <div className="text-center">
            <Button asChild>
              <Link href="/">
                <IconArrowLeft className="w-4 h-4 mr-2" />
                ホームに戻る
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 