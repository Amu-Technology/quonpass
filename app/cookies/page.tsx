'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconArrowLeft, IconEye, IconShield, IconDatabase, IconSettings } from '@tabler/icons-react';
import Link from 'next/link';

export default function CookiePolicyPage() {
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
                  <IconEye className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Cookieポリシー</h1>
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
                <IconEye className="w-6 h-6 text-blue-600" />
                <span>概要</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                本Cookieポリシーは、QuonPass（以下「当社」）が提供するCRMプラットフォーム（以下「本サービス」）において、
                Cookieの使用について説明するものです。
              </p>
              <p>
                本サービスをご利用いただくことで、本Cookieポリシーに同意したものとみなされます。
                本Cookieポリシーに同意いただけない場合は、ブラウザの設定でCookieを無効にしてください。
              </p>
            </CardContent>
          </Card>

          {/* Cookieとは */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconDatabase className="w-6 h-6 text-blue-600" />
                <span>Cookieとは</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Cookieは、お客様がウェブサイトを訪問した際に、お客様のデバイス（コンピュータ、スマートフォン、タブレット等）に保存される小さなテキストファイルです。
                Cookieは、ウェブサイトがお客様のデバイスを識別し、お客様の設定やログイン情報を記憶するために使用されます。
              </p>
              <p>
                Cookieには、以下のような情報が含まれる場合があります：
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>ログイン情報（セッションID）</li>
                <li>言語設定やテーマ設定</li>
                <li>ショッピングカートの内容</li>
                <li>ウェブサイトの利用履歴</li>
                <li>広告の表示履歴</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookieの種類 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconSettings className="w-6 h-6 text-blue-600" />
                <span>Cookieの種類</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">1. 必須Cookie（Essential Cookies）</h3>
                <p className="text-gray-700 mb-2">
                  本サービスの基本的な機能を提供するために必要なCookieです。これらのCookieが無効になると、本サービスが正常に動作しません。
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">使用目的：</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>セッション管理（ログイン状態の維持）</li>
                    <li>セキュリティ機能（不正アクセスの防止）</li>
                    <li>基本的なユーザー設定の保存</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>保存期間：</strong> セッション終了時まで、または最大24時間
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2. 機能Cookie（Functional Cookies）</h3>
                <p className="text-gray-700 mb-2">
                  お客様の利便性を向上させるためのCookieです。これらのCookieにより、お客様の設定や選択が記憶されます。
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">使用目的：</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>言語設定の保存</li>
                    <li>テーマ設定の保存</li>
                    <li>フォーム入力内容の一時保存</li>
                    <li>ユーザーインターフェースの設定</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>保存期間：</strong> 最大1年間
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3. 分析Cookie（Analytics Cookies）</h3>
                <p className="text-gray-700 mb-2">
                  本サービスの利用状況を分析し、サービス改善に役立てるためのCookieです。
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">使用目的：</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>ページビューの計測</li>
                    <li>ユーザーの行動分析</li>
                    <li>サービスの利用統計</li>
                    <li>パフォーマンスの監視</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>保存期間：</strong> 最大2年間
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">4. マーケティングCookie（Marketing Cookies）</h3>
                <p className="text-gray-700 mb-2">
                  お客様により関連性の高い広告を表示するためのCookieです。
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">使用目的：</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>広告の表示履歴の追跡</li>
                    <li>ターゲティング広告の配信</li>
                    <li>広告効果の測定</li>
                    <li>リマーケティング広告の配信</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>保存期間：</strong> 最大2年間
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 第三者Cookie */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconShield className="w-6 h-6 text-blue-600" />
                <span>第三者Cookie</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                当社は、以下の第三者サービスを利用しており、これらのサービスが独自のCookieを設定する場合があります：
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Google Analytics</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    ウェブサイトの利用状況を分析するために使用されます。
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>_ga: ユーザー識別用（2年間保存）</li>
                    <li>_gid: セッション識別用（24時間保存）</li>
                    <li>_gat: リクエスト制限用（1分間保存）</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Google OAuth</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    認証サービスを提供するために使用されます。
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>各種認証関連Cookie</li>
                    <li>セッション管理用Cookie</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Vercel</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    ホスティングサービスを提供するために使用されます。
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>パフォーマンス監視用Cookie</li>
                    <li>セキュリティ関連Cookie</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                これらの第三者サービスは、それぞれ独自のプライバシーポリシーを有しています。
                詳細については、各サービスのプライバシーポリシーをご確認ください。
              </p>
            </CardContent>
          </Card>

          {/* Cookieの管理 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconSettings className="w-6 h-6 text-blue-600" />
                <span>Cookieの管理</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">ブラウザ設定による管理</h3>
                  <p className="text-gray-700 mb-3">
                    お客様は、ブラウザの設定によりCookieの使用を制御できます。
                    ただし、必須Cookieを無効にした場合、本サービスの一部機能が正常に動作しない可能性があります。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2">Chrome</h4>
                      <p className="text-sm text-gray-700">
                        設定 → プライバシーとセキュリティ → Cookieとその他のサイトデータ
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2">Firefox</h4>
                      <p className="text-sm text-gray-700">
                        設定 → プライバシーとセキュリティ → Cookieとサイトデータ
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2">Safari</h4>
                      <p className="text-sm text-gray-700">
                        環境設定 → プライバシー → Cookieとウェブサイトデータ
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2">Edge</h4>
                      <p className="text-sm text-gray-700">
                        設定 → Cookieとサイトのアクセス許可 → Cookie
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Cookieの削除</h3>
                  <p className="text-gray-700">
                    お客様は、いつでもブラウザの設定からCookieを削除できます。
                    Cookieを削除すると、保存されていた設定やログイン情報が失われます。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Do Not Track（DNT）</h3>
                  <p className="text-gray-700">
                    お客様のブラウザでDo Not Track機能が有効になっている場合、
                    当社は分析CookieやマーケティングCookieの設定を制限します。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookieの更新 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconEye className="w-6 h-6 text-blue-600" />
                <span>Cookieポリシーの更新</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                当社は、必要に応じて本Cookieポリシーを更新する場合があります。
                重要な変更がある場合は、本サービス内での通知またはメールによりお知らせします。
              </p>
              <p className="text-sm text-gray-600">
                更新後のCookieポリシーは、本ページに掲載された時点から効力を生じます。
                更新後も本サービスを継続してご利用いただくことで、更新に同意したものとみなされます。
              </p>
            </CardContent>
          </Card>

          {/* お問い合わせ */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconShield className="w-6 h-6 text-blue-600" />
                <span>お問い合わせ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                本Cookieポリシーに関するご質問やご意見がございましたら、
                以下の方法でお気軽にお問い合わせください。
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">QuonPass プライバシー担当</h4>
                <p className="text-sm text-gray-700">
                  メール: privacy@quonpass.com<br />
                  受付時間: 平日 9:00-18:00（土日祝日除く）
                </p>
              </div>
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