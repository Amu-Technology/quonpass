'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconArrowLeft, IconFileText, IconShield, IconUsers, IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
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
                  <IconFileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">利用規約</h1>
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
                <IconFileText className="w-4 h-4" />
                <span>最終更新日: 2025年1月15日</span>
              </div>
            </CardContent>
          </Card>

          {/* 概要 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconFileText className="w-6 h-6 text-blue-600" />
                <span>概要</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                本利用規約（以下「本規約」）は、QuonPass（以下「当社」）が提供するCRMプラットフォーム（以下「本サービス」）の利用条件を定めるものです。
                お客様は、本サービスをご利用いただく前に、本規約を必ずお読みください。
              </p>
              <p>
                本サービスをご利用いただくことで、本規約に同意したものとみなされます。
                本規約に同意いただけない場合は、本サービスのご利用をお控えください。
              </p>
            </CardContent>
          </Card>

          {/* 定義 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconFileText className="w-6 h-6 text-blue-600" />
                <span>定義</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">1. 「本サービス」</h3>
                  <p className="text-gray-700">当社が提供するCRMプラットフォーム（QuonPass）を指します。</p>
                </div>
                <div>
                  <h3 className="font-semibold">2. 「お客様」</h3>
                  <p className="text-gray-700">本サービスを利用する個人または法人を指します。</p>
                </div>
                <div>
                  <h3 className="font-semibold">3. 「コンテンツ」</h3>
                  <p className="text-gray-700">本サービスを通じて投稿、送信、または表示される情報、データ、ファイル等を指します。</p>
                </div>
                <div>
                  <h3 className="font-semibold">4. 「アカウント」</h3>
                  <p className="text-gray-700">本サービスの利用に必要な登録情報を指します。</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 利用登録 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconUsers className="w-6 h-6 text-blue-600" />
                <span>利用登録</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">1. 登録要件</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>本サービスの利用を希望する方は、本規約に同意の上、当社の定める方法により利用登録を行う必要があります。</li>
                    <li>利用登録は、お客様ご自身が行うものとし、登録内容に虚偽の記載があった場合、当社は登録を無効とすることができます。</li>
                    <li>18歳未満の方が利用登録を行う場合は、保護者の同意を得てから行ってください。</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">2. アカウントの管理</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>お客様は、アカウント情報を適切に管理し、第三者に利用させないものとします。</li>
                    <li>アカウント情報の管理不備、第三者の使用等によって生じた損害について、当社は一切の責任を負いません。</li>
                    <li>アカウント情報が第三者に使用された可能性がある場合は、直ちに当社に通知してください。</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 利用料金 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconFileText className="w-6 h-6 text-blue-600" />
                <span>利用料金</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">1. 料金体系</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>本サービスの利用料金は、当社が別途定める料金体系に従います。</li>
                    <li>料金体系の変更がある場合は、事前にお客様に通知します。</li>
                    <li>無料プランと有料プランがございます。詳細は料金ページをご確認ください。</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">2. 支払い方法</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>有料プランの利用料金は、当社が指定する方法により支払っていただきます。</li>
                    <li>支払いが遅滞した場合、当社はサービスの提供を停止することができます。</li>
                    <li>返金については、当社の返金ポリシーに従います。</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 禁止事項 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconAlertTriangle className="w-6 h-6 text-red-600" />
                <span>禁止事項</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>お客様は、本サービスの利用にあたり、以下の行為を行ってはなりません：</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-red-600">法令違反行為</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>法令または公序良俗に違反する行為</li>
                    <li>犯罪行為に関連する行為</li>
                    <li>当社、本サービスの他の利用者、または第三者の権利を侵害する行為</li>
                    <li>当社、本サービスの他の利用者、または第三者に損害を与える行為</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-red-600">システム妨害行為</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>本サービスの運営を妨害する行為</li>
                    <li>サーバーやネットワークに負荷をかける行為</li>
                    <li>不正アクセスを試みる行為</li>
                    <li>他の利用者に迷惑をかける行為</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-red-600">不適切なコンテンツ</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>暴力的、性的、差別的な内容</li>
                    <li>虚偽または誤解を招く情報</li>
                    <li>第三者の個人情報を無断で公開する行為</li>
                    <li>スパム、チェーンメール等の送信</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-red-600">その他の禁止行為</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>アカウントの譲渡、売買</li>
                    <li>本サービスの逆工程、解析</li>
                    <li>当社の事前の書面による同意なく、本サービスを商業目的で利用する行為</li>
                    <li>その他、当社が不適切と判断する行為</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 本サービスの提供 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconCheck className="w-6 h-6 text-blue-600" />
                <span>本サービスの提供</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">1. サービスの内容</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>当社は、お客様に対し、本規約に従って本サービスを提供します。</li>
                    <li>本サービスの内容は、当社の判断により変更される場合があります。</li>
                    <li>本サービスの利用可能時間は、24時間365日を原則としますが、メンテナンス等により利用できない時間帯があります。</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">2. サービスの停止</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>当社は、以下の場合に本サービスの全部または一部を停止することができます：</li>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600">
                      <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                      <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                      <li>その他、当社が本サービスの提供が困難と判断した場合</li>
                    </ul>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 知的財産権 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconShield className="w-6 h-6 text-blue-600" />
                <span>知的財産権</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">1. 当社の権利</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>本サービスに関する知的財産権は、当社または当社にライセンスを許諾している者に帰属します。</li>
                    <li>お客様は、本サービスを利用する権利を有するのみで、本サービスに関する知的財産権を取得するものではありません。</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">2. お客様の権利</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>お客様が本サービスに投稿したコンテンツに関する知的財産権は、お客様に帰属します。</li>
                    <li>お客様は、当社に対し、投稿したコンテンツを本サービスで利用する権利を許諾したものとみなします。</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 免責事項 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconX className="w-6 h-6 text-red-600" />
                <span>免責事項</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">1. サービスの品質</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>当社は、本サービスがお客様の特定の目的に適合すること、期待する機能・商品的価値・正確性・有用性を有すること、お客様による本サービスの利用が適法な権利を有する第三者によって承認されていることについて、明示または黙示を問わず何ら保証するものではありません。</li>
                    <li>当社は、本サービスに起因してお客様に生じたあらゆる損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">2. データの損失</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>当社は、お客様が本サービスに保存したデータの消失、破損、改ざん等について、一切の責任を負いません。</li>
                    <li>お客様は、重要なデータについては、適切にバックアップを取るものとします。</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">3. 第三者サービス</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>本サービスは、第三者が提供するサービスと連携する場合があります。</li>
                    <li>第三者サービスの利用により生じた問題について、当社は一切の責任を負いません。</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 利用規約の変更 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconFileText className="w-6 h-6 text-blue-600" />
                <span>利用規約の変更</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                当社は、必要に応じて本規約を変更することができます。
                重要な変更がある場合は、本サービス内での通知またはメールによりお知らせします。
              </p>
              <p className="text-sm text-gray-600">
                変更後の利用規約は、本ページに掲載された時点から効力を生じます。
                変更後も本サービスを継続してご利用いただくことで、変更に同意したものとみなされます。
              </p>
            </CardContent>
          </Card>

          {/* 準拠法・管轄裁判所 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconFileText className="w-6 h-6 text-blue-600" />
                <span>準拠法・管轄裁判所</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">1. 準拠法</h3>
                  <p className="text-gray-700">本規約の解釈にあたっては、日本法を準拠法とします。</p>
                </div>
                <div>
                  <h3 className="font-semibold">2. 管轄裁判所</h3>
                  <p className="text-gray-700">本規約に関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
                </div>
              </div>
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
                本利用規約に関するご質問やご意見がございましたら、
                以下の方法でお気軽にお問い合わせください。
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">QuonPass カスタマーサポート</h4>
                <p className="text-sm text-gray-700">
                  メール: support@quonpass.com<br />
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