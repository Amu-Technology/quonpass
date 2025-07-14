import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth(async (req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")
  const isStaticFile = req.nextUrl.pathname.startsWith("/_next") || 
                      req.nextUrl.pathname.startsWith("/favicon.ico") ||
                      req.nextUrl.pathname.startsWith("/public")
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isHomePage = req.nextUrl.pathname === "/"
  
  // 認証不要な公開ページ
  const isPublicPage = req.nextUrl.pathname === "/privacy" ||
                      req.nextUrl.pathname === "/terms" ||
                      req.nextUrl.pathname === "/cookies" ||
                      req.nextUrl.pathname === "/erd" ||
                      req.nextUrl.pathname === "/api-docs" ||
                      req.nextUrl.pathname === "/api/docs" ||
                      req.nextUrl.pathname === "/help"

  // APIルートと静的ファイルは常に許可
  if (isApiRoute || isStaticFile) {
    return NextResponse.next()
  }

  // 認証ページの処理
  if (isAuthPage) {
    if (isLoggedIn) {
      // 認証済みユーザーが認証ページにアクセスした場合はダッシュボードにリダイレクト
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }
    return NextResponse.next()
  }

  // 公開ページは常に許可
  if (isPublicPage) {
    return NextResponse.next()
  }

  // ダッシュボードへのアクセス制御
  if (isDashboard) {
    if (!isLoggedIn) {
      // 未認証ユーザーがダッシュボードにアクセスした場合はホームページにリダイレクト
      return NextResponse.redirect(new URL("/", req.nextUrl))
    }

    try {
      const session = await auth()
      if (!session?.user?.email) {
        return NextResponse.redirect(new URL("/", req.nextUrl))
      }

      // ユーザー情報の確認
      const response = await fetch(`${req.nextUrl.origin}/api/users?email=${session.user.email}`)
      if (!response.ok) {
        console.error("ユーザー情報の取得に失敗しました")
        return NextResponse.redirect(new URL("/", req.nextUrl))
      }

      const user = await response.json()
      if (!user) {
        console.error("ユーザーが見つかりません")
        return NextResponse.redirect(new URL("/", req.nextUrl))
      }
    } catch (error) {
      console.error("ユーザー情報の取得に失敗しました:", error)
      return NextResponse.redirect(new URL("/", req.nextUrl))
    }
  }

  // ホームページの処理
  if (isHomePage) {
    if (isLoggedIn) {
      // 認証済みユーザーがホームページにアクセスした場合はダッシュボードにリダイレクト
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }
    // 未認証ユーザーはホームページを表示
    return NextResponse.next()
  }

  // その他のページの処理
  if (!isLoggedIn) {
    // 未認証ユーザーはホームページにリダイレクト
    const redirectUrl = new URL("/", req.nextUrl)
    if (req.nextUrl.pathname !== "/") {
      redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    }
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
