import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { getProductById } from '@/data/products'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  specId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  productName: z.string(),
  gameName: z.string(),
  specLabel: z.string(),
  price: z.number().min(0),
})

const checkoutBodySchema = z.object({
  items: z.array(checkoutItemSchema).min(1, '购物车为空'),
  gameAccount: z.string().min(1, '请填写游戏账号').max(100),
})

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录态（使用 anon key，依赖 token 本身的权限，不绕过 RLS）
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

    // 2. 解析并校验请求体
    const rawBody = await request.json()
    const parseResult = checkoutBodySchema.safeParse(rawBody)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || '请求参数错误'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }
    const { items, gameAccount } = parseResult.data

    // 3. 验证商品和价格
    let totalPrice = 0
    const validatedItems: z.infer<typeof checkoutItemSchema>[] = []

    for (const item of items) {
      const product = getProductById(item.productId)
      if (!product) {
        return NextResponse.json({ error: `商品不存在：${item.productId}` }, { status: 400 })
      }
      const spec = product.specs.find((s) => s.id === item.specId)
      if (!spec) {
        return NextResponse.json({ error: `规格不存在：${item.specId}` }, { status: 400 })
      }
      if (Math.abs(spec.price - item.price) > 0.01) {
        return NextResponse.json({ error: `商品价格不匹配：${product.name}` }, { status: 400 })
      }
      totalPrice += spec.price * item.quantity
      validatedItems.push({
        ...item,
        price: spec.price,
        productName: product.name,
        gameName: product.gameName,
        specLabel: spec.label,
      })
    }

    totalPrice = Math.round(totalPrice * 100) / 100

    // 4. 提取客户端 IP
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // 5. 用 service_role 创建订单和明细（通过 RPC 在事务中完成，保证原子性）
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const orderItems = validatedItems.map((item) => ({
      product_id: item.productId,
      product_name: item.productName,
      game_name: item.gameName,
      spec_id: item.specId,
      spec_label: item.specLabel,
      price: item.price,
      quantity: item.quantity,
    }))

    const { data: order, error: orderError } = await supabaseAdmin.rpc(
      'create_order_with_items',
      {
        p_user_id: user.id,
        p_total_price: totalPrice,
        p_game_account: gameAccount.trim(),
        p_pay_method: 'alipay',
        p_client_ip: clientIp,
        p_items: orderItems,
      }
    )

    if (orderError || !order) {
      console.error('创建订单失败:', orderError)
      return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
    }

    // 5. 调用支付宝 SDK 创建交易
    try {
      const { getAlipay } = await import('@/lib/alipay')
      const alipay = getAlipay()
      const notifyUrl = process.env.ALIPAY_NOTIFY_URL || 'https://pay.kehuaxi.top/api/alipay/notify'
      const returnUrl = process.env.ALIPAY_RETURN_URL || 'https://www.kehuaxi.top/pay/success'

      // 统一使用手机网站支付（wap.pay），PC 端由前端生成二维码扫码支付
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
        payUrl: result as string,
      })
    } catch (alipayError) {
      console.error('支付宝创建交易失败:', alipayError)
      return NextResponse.json(
        {
          orderId: order.id,
          orderNo: order.order_no,
          payUrl: null,
          error: '支付宝暂不可用，订单已创建，请稍后在订单页重新支付',
        },
        { status: 202 },
      )
    }
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 })
  }
}
