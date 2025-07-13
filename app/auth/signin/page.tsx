import { LoginForm } from "@/components/login-form"
import { IconUsers } from '@tabler/icons-react'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <IconUsers className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">QuonPass</span>
        </div>
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ログイン</h1>
          <p className="text-gray-600">CRMプラットフォームにアクセス</p>
        </div>
        <LoginForm />
        <div className="text-center text-sm text-gray-500">
          <p>アカウントをお持ちでない場合は</p>
          <Link href="/" className="text-blue-600 hover:underline">
            ホームページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}