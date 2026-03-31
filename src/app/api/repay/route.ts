import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const repayBodySchema = z.object({
  orderId: z.string().uuid('无效的订单 ID'),
})

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录态
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 })
    }

    // 2. 解析请求体
    const rawBody = await request.json()
    const parseResult = repayBodySchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0]?.message || '参数错误' }, { status: 400 })
    }
    const { orderId } = parseResult.data

    // 3. 查询订单（使用 service_role 确保能读取）
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_no, total_price, status, user_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }

    // 4. 验证订单归属和状态
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: '无权操作此订单' }, { status: 403 })
    }

    if (order.status !== 'pending_payment') {
      return NextResponse.json({ error: '该订单状态不允许支付' }, { status: 400 })
    }

    // 5. 调用支付宝 SDK 重新生成支付链接
    const { getAlipay } = await import('@/lib/alipay')
    const alipay = getAlipay()
    const notifyUrl = process.env.ALIPAY_NOTIFY_URL || 'https://pay.kehuaxi.top/api/alipay/notify'
    const returnUrl = process.env.ALIPAY_RETURN_URL || 'https://www.kehuaxi.top/pay/success'

    const totalPrice = Number(order.total_price)
    const result = await alipay.pageExec('alipay.trade.wap.pay', {
      method: 'GET',
      bizContent: {
        out_trade_no: order.order_no,
        total_amount: totalPrice.toFixed(2),
        subject: `极速卡充值订单 ${order.order_no}`,
        product_code: 'QUICK_WAP_WAY',
      },
      notify_url: notifyUrl,
      return_url: `${returnUrl}?orderId=${order.id}`,
    })

    return NextResponse.json({
      orderId: order.id,
      orderNo: order.order_no,
      totalPrice,
      payUrl: result as string,
    })
  } catch (err) {
    console.error('Repay error:', err)
    return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 })
  }
}
