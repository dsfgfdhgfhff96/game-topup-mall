import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  // 兼容旧的 return_url，重定向到新的支付成功页
  if (orderId) {
    return NextResponse.redirect(new URL(`/pay/success?orderId=${orderId}`, request.url))
  }

  return NextResponse.redirect(new URL('/user', request.url))
}
