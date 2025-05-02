import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")
  const isStaticFile = req.nextUrl.pathname.startsWith("/_next") || 
                      req.nextUrl.pathname.startsWith("/favicon.ico")

  if (isApiRoute || isStaticFile) {
    return NextResponse.next()
  }

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const redirectUrl = new URL("/auth/signin", req.nextUrl)
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
