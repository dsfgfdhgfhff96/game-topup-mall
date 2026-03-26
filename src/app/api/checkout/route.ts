import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getProductById } from '@/data/products'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface CheckoutItem {
  productId: string
  specId: string
  quantity: number
  productName: string
  gameName: string
  specLabel: string
  price: number
}

interface CheckoutBody {
  items: CheckoutItem[]
  gameAccount: string
}

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录态
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 })
    }

    // 2. 解析请求体
    const body = await request.json() as CheckoutBody
    const { items, gameAccount } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '购物车为空' }, { status: 400 })
    }
    if (!gameAccount?.trim()) {
      return NextResponse.json({ error: '请填写游戏账号' }, { status: 400 })
    }

    // 3. 验证商品和价格
    let totalPrice = 0
    const validatedItems: CheckoutItem[] = []

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

    // 4. 用 service_role 创建订单
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        total_price: totalPrice,
        game_account: gameAccount.trim(),
        pay_method: 'alipay',
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('创建订单失败:', orderError)
      return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
    }

    // 5. 创建订单明细
    const orderItems = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      game_name: item.gameName,
      spec_id: item.specId,
      spec_label: item.specLabel,
      price: item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('创建订单明细失败:', itemsError)
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
    }

    // 6. 调用支付宝 SDK 创建交易
    try {
      const { getAlipay } = await import('@/lib/alipay')
      const alipay = getAlipay()
      const notifyUrl = process.env.ALIPAY_NOTIFY_URL || 'https://pay.kehuaxi.top/api/alipay/notify'
      const returnUrl = process.env.ALIPAY_RETURN_URL || 'https://www.kehuaxi.top/pay/success'

      // 根据 User-Agent 判断设备类型，选择 PC 或手机网站支付
      const userAgent = request.headers.get('user-agent') || ''
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

      const apiMethod = isMobile ? 'alipay.trade.wap.pay' : 'alipay.trade.page.pay'
      const productCode = isMobile ? 'QUICK_WAP_WAY' : 'FAST_INSTANT_TRADE_PAY'

      const result = await alipay.pageExec(apiMethod, {
        method: 'GET',
        bizContent: {
          out_trade_no: order.order_no,
          total_amount: totalPrice.toFixed(2),
          subject: `极速卡充值订单 ${order.order_no}`,
          product_code: productCode,
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
      return NextResponse.json({
        orderId: order.id,
        orderNo: order.order_no,
        payUrl: null,
        error: '支付宝暂不可用，订单已创建，请稍后在订单页重新支付',
      })
    }
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 })
  }
}
