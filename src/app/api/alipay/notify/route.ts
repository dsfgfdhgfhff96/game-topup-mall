import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const params = Object.fromEntries(new URLSearchParams(body))

    // 1. 验签
    try {
      const { getAlipay } = await import('@/lib/alipay')
      const alipay = getAlipay()
      const signValid = alipay.checkNotifySign(params)
      if (!signValid) {
        console.error('支付宝回调验签失败')
        return new NextResponse('fail', { status: 200 })
      }
    } catch (err) {
      console.error('验签异常:', err)
      return new NextResponse('fail', { status: 200 })
    }

    const tradeStatus = params.trade_status
    const outTradeNo = params.out_trade_no
    const totalAmount = params.total_amount
    const tradeNo = params.trade_no
    const buyerId = params.buyer_id || null
    const buyerLogonId = params.buyer_logon_id || null

    // 只处理交易成功的通知
    if (tradeStatus !== 'TRADE_SUCCESS' && tradeStatus !== 'TRADE_FINISHED') {
      return new NextResponse('success', { status: 200 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 2. 黑名单校验（支付宝 UID）
    if (buyerId) {
      const { data: blocked } = await supabaseAdmin
        .from('payment_blacklist')
        .select('id')
        .eq('type', 'alipay_uid')
        .eq('value', buyerId)
        .maybeSingle()

      if (blocked) {
        console.error('黑名单命中:', { buyerId, outTradeNo })
        // 记录买家信息到订单，标记为 blocked
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'blocked',
            alipay_trade_no: tradeNo,
            alipay_buyer_id: buyerId,
            alipay_buyer_logon_id: buyerLogonId,
          })
          .eq('order_no', outTradeNo)
          .eq('status', 'pending_payment')
        // 返回 success 避免支付宝重试，后续人工处理退款
        return new NextResponse('success', { status: 200 })
      }
    }

    // 3. 查询订单
    const { data: order, error: queryError } = await supabaseAdmin
      .from('orders')
      .select('id, order_no, total_price, status')
      .eq('order_no', outTradeNo)
      .single()

    if (queryError || !order) {
      console.error('订单不存在:', outTradeNo)
      return new NextResponse('fail', { status: 200 })
    }

    // 3. 幂等检查：非 pending_payment 直接返回 success
    if (order.status !== 'pending_payment') {
      return new NextResponse('success', { status: 200 })
    }

    // 4. 核对金额
    if (Math.abs(Number(order.total_price) - Number(totalAmount)) > 0.01) {
      console.error('金额不匹配:', { order: order.total_price, notify: totalAmount })
      return new NextResponse('fail', { status: 200 })
    }

    // 5. 更新订单状态为 paid（乐观锁：仅 pending_payment 状态才更新，防止并发重复处理）
    const paidAt = params.gmt_payment || new Date().toISOString()
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        alipay_trade_no: tradeNo,
        alipay_buyer_id: buyerId,
        alipay_buyer_logon_id: buyerLogonId,
        paid_at: paidAt,
      })
      .eq('id', order.id)
      .eq('status', 'pending_payment')
      .select('id')

    if (updateError) {
      console.error('更新订单状态失败:', updateError)
      return new NextResponse('fail', { status: 200 })
    }

    // 乐观锁：无匹配行说明已被其他请求处理
    if (!updated || updated.length === 0) {
      return new NextResponse('success', { status: 200 })
    }

    return new NextResponse('success', { status: 200 })
  } catch (err) {
    console.error('Alipay notify error:', err)
    return new NextResponse('fail', { status: 200 })
  }
}
