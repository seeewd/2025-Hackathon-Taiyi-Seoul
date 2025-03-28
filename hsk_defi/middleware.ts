import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 조건: /borrow로 접근하는데 쿠키에 wallet이 없는 경우만 리디렉션
  if (pathname.startsWith('/borrow')) {
    const wallet = req.cookies.get('wallet')?.value

    if (!wallet) {
      const verifyUrl = req.nextUrl.clone()
      verifyUrl.pathname = '/verify-borrow'
      return NextResponse.redirect(verifyUrl)
    }
  }

  return NextResponse.next()
}
