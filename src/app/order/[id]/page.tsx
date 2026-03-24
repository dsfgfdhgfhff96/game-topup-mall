'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types'

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: '待支付',
  paid: '已支付',
  completed: '已完成',
  refund_requested: '退款申请中',
  refunded: '已退款',
  cancelled: '已取消',
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending_payment: 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30',
  paid: 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30',
  completed: 'bg-accent-green/20 text-accent-green border border-accent-green/30',
  refund_requested: 'bg-accent-red/20 text-accent-red border border-accent-red/30',
  refunded: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const { showToast } = useToast()

  const orderId = params.id as string
  const paySuccess = searchParams.get('pay') === 'success'

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single()

    if (!error && data) {
      setOrder({
        ...data,
        total_price: Number(data.total_price),
        items: data.items?.map((i: Record<string, unknown>) => ({ ...i, price: Number(i.price) })),
      } as Order)
    }
    setLoading(false)
  }, [orderId])

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      fetchOrder()
    } else if (!authLoading && !isLoggedIn) {
      setLoading(false)
    }
  }, [authLoading, isLoggedIn, fetchOrder])

  // 支付成功提示
  useEffect(() => {
    if (paySuccess && order) {
      showToast('支付成功！卡密已发放到订单中', 'success')
    }
  }, [paySuccess, order, showToast])

  async function copyToClipboard(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(index)
      showToast('已复制到剪贴板', 'success')
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch {
      showToast('复制失败，请手动复制', 'error')
    }
  }

  if (authLoading || loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 flex justify-center">
        <span className="inline-block w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
      </main>
    )
  }

  if (!isLoggedIn) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-text-primary text-lg">请先登录查看订单</p>
        <Link href="/user">
          <Button variant="primary">去登录</Button>
        </Link>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-text-muted text-lg">订单不存在或无权查看</p>
        <Link href="/user">
          <Button variant="secondary">返回用户中心</Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 space-y-2">
        <Link
          href="/user"
          className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          <span>&larr;</span>
          <span>返回用户中心</span>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">订单详情</h1>
      </div>

      {/* 支付成功提示 */}
      {paySuccess && (
        <div className="mb-6 bg-accent-green/10 border border-accent-green/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center shrink-0">
            <span className="text-accent-green text-xl">&#10003;</span>
          </div>
          <div>
            <p className="text-accent-green font-semibold">支付成功</p>
            <p className="text-sm text-text-muted">卡密已自动发放，请查看下方信息</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* 订单基本信息 */}
        <section className="bg-bg-card rounded-xl p-4 space-y-3">
          <h2 className="text-base font-semibold text-text-primary">订单信息</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-text-muted">订单号</p>
              <p className="text-text-primary font-medium">{order.order_no}</p>
            </div>
            <div>
              <p className="text-text-muted">订单状态</p>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${STATUS_STYLES[order.status] ?? ''}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <div>
              <p className="text-text-muted">下单时间</p>
              <p className="text-text-primary">{new Date(order.created_at).toLocaleString('zh-CN')}</p>
            </div>
            <div>
              <p className="text-text-muted">支付方式</p>
              <p className="text-text-primary">支付宝</p>
            </div>
            <div>
              <p className="text-text-muted">充值账号</p>
              <p className="text-text-primary">{order.game_account}</p>
            </div>
            {order.alipay_trade_no && (
              <div>
                <p className="text-text-muted">支付宝交易号</p>
                <p className="text-text-primary text-xs">{order.alipay_trade_no}</p>
              </div>
            )}
          </div>
        </section>

        {/* 商品明细 */}
        <section className="bg-bg-card rounded-xl p-4">
          <h2 className="text-base font-semibold text-text-primary mb-4">商品明细</h2>
          <div className="divide-y divide-border-default">
            {order.items?.map((item, idx) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-medium text-sm">{item.product_name}</p>
                    <p className="text-text-muted text-xs">
                      {item.game_name} &middot; {item.spec_label} &times;{item.quantity}
                    </p>
                  </div>
                  <span className="text-text-primary font-medium text-sm ml-4">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>

                {/* 卡密信息 */}
                {item.card_code && (
                  <div className="mt-2 bg-bg-secondary rounded-lg p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-text-muted">卡密</p>
                      <p className="text-sm text-accent-green font-mono break-all">
                        {item.card_code}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.card_code!, idx)}
                      className="shrink-0 px-3 py-1 text-xs rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 transition-colors"
                    >
                      {copiedIdx === idx ? '已复制' : '复制'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 总计 */}
          <div className="flex justify-end border-t border-border-default pt-3 mt-3">
            <p className="text-sm text-text-secondary">
              订单总额：
              <span className="text-accent-gold font-semibold text-lg ml-1">
                {formatPrice(order.total_price)}
              </span>
            </p>
          </div>
        </section>

        {/* 退款信息 */}
        {order.refund_reason && (
          <section className="bg-bg-card rounded-xl p-4 space-y-2">
            <h2 className="text-base font-semibold text-text-primary">退款信息</h2>
            <p className="text-sm text-text-secondary">退款原因：{order.refund_reason}</p>
          </section>
        )}

        {/* 卡密不足提示 */}
        {order.status === 'paid' && (
          <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-4">
            <p className="text-sm text-accent-gold">
              订单处理中，卡密将在稍后自动发放，请耐心等候
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
