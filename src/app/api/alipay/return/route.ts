import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (orderId) {
    return NextResponse.redirect(new URL(`/order/${orderId}?pay=success`, request.url))
  }

  return NextResponse.redirect(new URL('/user', request.url))
}
